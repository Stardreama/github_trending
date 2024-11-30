const cron = require("node-cron");
const fetchTrending = require("./fetchTrending"); // 正确导入 fetchTrending
const pool = require("../db"); // 调整为相对路径

// 定义每天 1 点的定时任务
cron.schedule("0 1 * * *", async () => {
  console.log("开始更新 GitHub 每日热点");

  try {
    // 调用 fetchTrending 获取最新的仓库数据
    const trendingRepos = await fetchTrending();

    // 获取数据库连接
    const connection = await pool.getConnection();

    // 清空当前的热点数据
    await connection.query("DELETE FROM repositories");

    // 插入最新的热点数据到数据库
    for (const repo of trendingRepos) {
      const {
        name,
        url,
        description,
        kind,
        applicationField,
        techStack,
        stars,
        language,
      } = repo;

      const [frontendLang, frontendFramework] =
        techStack.frontend === "不需要"
          ? ["不需要", "不需要"]
          : [techStack.frontend.language, techStack.frontend.framework];
      const [backendLang, backendFramework] =
        techStack.backend === "不需要"
          ? ["不需要", "不需要"]
          : [techStack.backend.language, techStack.backend.framework];

      // 插入数据到数据库
      await connection.query(
        "INSERT INTO repositories (name, url, description, kind, application_field, frontend_language, frontend_framework, backend_language, backend_framework, database, stars, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          url,
          description,
          kind,
          applicationField,
          frontendLang,
          frontendFramework,
          backendLang,
          backendFramework,
          techStack.database,
          stars,
          language,
        ]
      );
    }

    // 关闭数据库连接
    connection.release();

    console.log("GitHub 每日热点更新成功");
  } catch (error) {
    console.error("定时任务失败:", error);
  }
});
