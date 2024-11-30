// server.js
const express = require("express");
const cors = require("cors");
const trendingRouter = require("./routes/trending");

// 启动定时任务
require("./utils/cron"); // 调整为正确的路径，导入 cron.js

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use("/api/trending", trendingRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
