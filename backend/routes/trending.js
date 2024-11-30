// backend/routes/trending.js
const express = require('express');
const router = express.Router();
const fetchTrending = require('../utils/fetchTrending');
const pool = require('../db'); // 引入数据库连接

router.get('/', async (req, res) => {
  try {
    // 从数据库中获取数据
    const [rows] = await pool.query('SELECT * FROM repositories ORDER BY stars DESC');

    if (rows.length > 0) {
      // 检查数据是否新鲜（例如，是否在24小时内更新）
      const lastUpdated = new Date(rows[0].last_updated);
      const now = new Date();
      const diffTime = Math.abs(now - lastUpdated);
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours < 24) {
        // 数据是新鲜的，格式化并返回数据
        const formattedRepos = rows.map(formatRepo);
        res.json(formattedRepos);
        return;
      }
    }

    // 数据不存在或已过期，获取新数据
    const trendingRepos = await fetchTrending();

    // 清空旧数据
    await pool.query('DELETE FROM repositories');

    // 插入新数据
    const insertPromises = trendingRepos.map(async (repo) => {
      const {
        name,
        url,
        kind,
        applicationField,
        techStack,
        description,
        stars,
        language,
      } = repo;

      const {
        frontend,
        backend,
        database,
      } = techStack;

      let frontend_language = null;
      let frontend_framework = null;
      let backend_language = null;
      let backend_framework = null;
      let database_type = database;

      if (typeof frontend === 'object') {
        frontend_language = frontend.language;
        frontend_framework = frontend.framework;
      } else {
        frontend_language = frontend;
      }

      if (typeof backend === 'object') {
        backend_language = backend.language;
        backend_framework = backend.framework;
      } else {
        backend_language = backend;
      }

      await pool.query(
        `INSERT INTO repositories 
        (name, url, kind, applicationField, frontend_language, frontend_framework, backend_language, backend_framework, database_type, description, stars, language, last_updated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, url, kind, applicationField, frontend_language, frontend_framework, backend_language, backend_framework, database_type, description, stars, language, new Date()]
      );
    });

    await Promise.all(insertPromises);

    // 获取并返回新数据
    const [newRows] = await pool.query('SELECT * FROM repositories ORDER BY stars DESC');
    const formattedRepos = newRows.map(formatRepo);
    res.json(formattedRepos);

  } catch (error) {
    console.error('Error fetching trending repositories:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

const formatRepo = (row) => {
  const {
    id,
    name,
    url,
    kind,
    applicationField,
    frontend_language,
    frontend_framework,
    backend_language,
    backend_framework,
    database_type,
    description,
    stars,
    language,
    last_updated,
  } = row;

  let frontend = frontend_language;
  if (frontend_language && frontend_framework) {
    frontend = {
      language: frontend_language,
      framework: frontend_framework,
    };
  }

  let backend = backend_language;
  if (backend_language && backend_framework) {
    backend = {
      language: backend_language,
      framework: backend_framework,
    };
  }

  const techStack = {
    frontend,
    backend,
    database: database_type,
  };

  return {
    id,
    name,
    url,
    kind,
    applicationField,
    techStack,
    description,
    stars,
    language,
    last_updated,
  };
};

module.exports = router;
