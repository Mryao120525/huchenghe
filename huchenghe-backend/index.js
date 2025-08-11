// index.js
// 项目后端服务主入口文件，用于初始化和启动Express应用服务器

// 引入所需的核心依赖模块
const express = require('express');           // Express框架，用于构建Web应用
const cors = require('cors');                 // CORS中间件，用于处理跨域请求
const bodyParser = require('body-parser');    // Body解析中间件，用于解析请求体

// 引入路由模块
const modelRoutes = require('./routes/modelRoutes'); // 引入模型相关路由模块
const loginRoutes = require('./routes/loginRoutes'); // 引入登录相关路由模块

// 创建Express应用实例
const app = express();
const PORT = 3000; // 服务监听端口，默认为3000

// 配置应用中间件
app.use(cors());                    // 启用跨域资源共享
app.use(bodyParser.json());         // 解析JSON格式的请求体数据
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL编码的请求体数据

// 注册路由
app.use('/api/models', modelRoutes); // 挂载模型相关API路由到/api/models路径下
app.use('/api', loginRoutes); // 挂载登录相关API路由到/api路径下

// 启动服务器并监听指定端口
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});