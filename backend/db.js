// backend/db.js
const mysql = require('mysql2/promise');

// 配置数据库连接
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // 请替换为您的 MySQL 用户名
  password: '20050127a', // 请替换为您的 MySQL 密码
  database: 'github_trending',     // 数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
