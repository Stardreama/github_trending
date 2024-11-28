// backend/utils/fetchTrending.js

const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 根据 https://github.com/trending 抓取热门仓库数据
 */
const fetchTrending = async () => {
  const url = "https://github.com/trending";
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // 模拟浏览器请求
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const repoList = [];

    $("article.Box-row").each((index, element) => {
      if (index >= 13) return false; // 只获取前13个

      const repoElement = $(element).find("h2 a");
      const repoName = repoElement.text().trim().replace(/\s/g, "");
      const repoUrl = "https://github.com" + repoElement.attr("href");

      const description =
        $(element).find("p.col-9").text().trim() || "暂无简介";

      const lang =
        $(element).find('[itemprop="programmingLanguage"]').text().trim() ||
        "未知";

      // 示例分类和应用领域，实际可能需要进一步分析或手动分类
      const categories = ["教程资源", "实用项目"];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      const applicationFields = [
        "Web 开发",
        "移动应用",
        "数据科学",
        "人工智能",
        "工具库",
      ];
      const randomField =
        applicationFields[Math.floor(Math.random() * applicationFields.length)];

      // 示例技术栈，实际需要根据仓库内容分析
      const techStacks = [
        "React",
        "Node.js",
        "Python",
        "Django",
        "Flask",
        "Express",
        "Vue",
        "Angular",
      ];
      const randomTechStack = techStacks.join(", ");

      // 提取 Star 数量
      const starText = $(element).find('a[href$="/stargazers"]').text().trim();
      const stars = parseInt(starText.replace(/,/g, ""), 10) || 0;

      repoList.push({
        name: repoName,
        url: repoUrl,
        category: randomCategory,
        applicationField: randomField,
        techStack: randomTechStack,
        description:
          description.substring(0, 200) +
          (description.length > 200 ? "..." : ""),
        stars, // 新增字段
        language: lang, // 保留编程语言
      });
    });
    return repoList;
  } catch (error) {
    console.error("Error fetching trending repositories:", error);
    throw error;
  }
};

module.exports = fetchTrending;
