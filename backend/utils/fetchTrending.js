// backend/utils/fetchTrending.js

const axios = require("axios");
const cheerio = require("cheerio");
const { OpenAI } = require("openai");
const { SocksProxyAgent } = require("socks-proxy-agent");
const fetch = require("node-fetch");

// 不使用环境变量

// 在此处直接填写您的 OpenAI API 密钥和 GitHub Token
const OPENAI_API_KEY = "";

const GITHUB_TOKEN = "";

// 创建代理代理人
const proxyAgent = new SocksProxyAgent("socks5://127.0.0.1:10808");

// 创建一个使用代理的 fetch 函数
const fetchWithProxy = (url, options = {}) => {
  options.agent = proxyAgent;
  return fetch(url, options);
};

// 初始化 OpenAI 客户端，传入自定义的 fetch 函数
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // 使用直接填写的 API 密钥
  fetch: fetchWithProxy,
});

/**
 * 根据 https://github.com/trending 抓取热门仓库数据
 */
const fetchTrending = async () => {
  const url = "https://github.com/trending";
  try {
    const response = await axios.get(url, {
      httpsAgent: proxyAgent,
      headers: {
        "User-Agent": "Mozilla/5.0", // 模拟浏览器请求
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const repoList = [];

    // 获取前13个仓库
    const repoElements = $("article.Box-row").slice(0, 13);
    for (let index = 0; index < repoElements.length; index++) {
      const element = repoElements[index];

      const repoElement = $(element).find("h2 a");
      const repoNameWithOwner = repoElement.text().trim().replace(/\s/g, "");
      const repoUrl = "https://github.com" + repoElement.attr("href");

      const [owner, repoName] = repoNameWithOwner.split("/");

      const description =
        $(element).find("p.col-9").text().trim() || "暂无简介";

      const lang =
        $(element).find('[itemprop="programmingLanguage"]').text().trim() ||
        "未知";

      const starText = $(element).find('a[href$="/stargazers"]').text().trim();
      const stars = parseInt(starText.replace(/,/g, ""), 10) || 0;

      // 获取仓库的 README 内容
      let readmeContent = "";
      try {
        const readmeResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repoName}/readme`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
              Accept: "application/vnd.github.v3.raw",
              Authorization: `token ${GITHUB_TOKEN}`, // 使用直接填写的 GitHub Token
            },
            httpsAgent: proxyAgent,
          }
        );
        readmeContent = readmeResponse.data;
      } catch (error) {
        console.error(`获取 ${repoName} 的 README 失败:`, error);
        readmeContent = description; // 如果无法获取 README，则使用描述
      }

      // 截断 README 内容，避免超出 OpenAI 的限制
      const maxLength = 3000; // 适当留出空间给模型生成的内容
      if (readmeContent.length > maxLength) {
        readmeContent = readmeContent.substring(0, maxLength);
      }

      // 使用 OpenAI API 来分析应用领域和技术栈
      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "你是一个编程领域的专家，能够根据仓库的 README 内容自动生成合适的项目分类、应用领域，以及前端和后端的技术栈。",
            },
            {
              role: "user",
              content: `以下是一个 GitHub 仓库的 README 内容: """${readmeContent}""". 请根据该内容提供仓库的项目分类（"学习资源" 或 "项目教程" 之一），以及技术栈信息。技术栈中，对于没有的部分，不需要返回。具体要求如下： 
- 项目分类请返回 "学习资源" 或 "项目教程" 之一。
- 如果不需要前端，请返回 "前端": "不需要"。
- 如果需要前端，请返回前端的 "语言" 和 "框架"。
- 如果不需要后端，请返回 "后端": "不需要"。
- 如果需要后端，请返回后端的 "语言" 和 "框架"。
- 数据库如果有，请直接返回数据库类型；如果没有，请返回 "不需要"。

请以 **仅包含** JSON 格式返回，不要添加任何额外的文本或说明。格式如下：

\`\`\`json
{
  "kind":"分类",
  "applicationField": "应用领域",
  "techStack": {
    "frontend": {
      "language": "前端语言",
      "framework": "前端框架"
    },
    "backend": {
      "language": "后端语言",
      "framework": "后端框架"
    },
    "database": "数据库类型"
  }
}
\`\`\``,
            },
          ],
        });

        const content = aiResponse.choices[0].message.content;

        // 提取 JSON 字符串
        let jsonString = content;
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
        } else {
          // 如果没有匹配到，用全内容尝试
          jsonString = content;
        }

        // 解析 OpenAI 的返回内容
        let parsedContent;
        try {
          parsedContent = JSON.parse(jsonString);
        } catch (parseError) {
          console.error("解析 OpenAI 返回内容失败，使用默认值");
          console.error("OpenAI 返回内容:", content);
          parsedContent = {
            kind: "未知",
            applicationField: "未知",
            techStack: {
              frontend: "未知",
              backend: "未知",
              database: "未知",
            },
          };
        }

        const { kind, applicationField, techStack } = parsedContent;

        repoList.push({
          name: `${owner}/${repoName}`,
          url: repoUrl,
          kind: kind || "未知",
          applicationField: applicationField || "未知",
          techStack: {
            frontend: techStack.frontend || "不需要",
            backend: techStack.backend || "不需要",
            database: techStack.database || "不需要",
          },
          description:
            description.substring(0, 200) +
            (description.length > 200 ? "..." : ""),
          stars,
          language: lang,
        });
      } catch (error) {
        console.error("OpenAI API 请求失败:", error);
        repoList.push({
          name: `${owner}/${repoName}`,
          url: repoUrl,
          kind: "未知",
          applicationField: "未知",
          techStack: {
            frontend: "未知",
            backend: "未知",
            database: "未知",
          },
          description:
            description.substring(0, 200) +
            (description.length > 200 ? "..." : ""),
          stars,
          language: lang,
        });
      }
    }

    return repoList;
  } catch (error) {
    console.error("Error fetching trending repositories:", error);
    throw error;
  }
};

module.exports = fetchTrending;
