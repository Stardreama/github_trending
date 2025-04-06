// backend/db.js
const mysql = require('mysql2/promise');

// 配置数据库连接
const pool = mysql.createPool({
  host: '',
  user: '',     // 请替换为您的 MySQL 用户名
  password: '', // 请替换为您的 MySQL 密码
  database: '',     // 数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
