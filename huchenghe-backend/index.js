/*
  index.js
  项目后端服务主入口文件，用于初始化和启动Express应用服务器

  ## 功能描述
  这是后端服务的主入口文件，负责初始化 Express 应用服务器，
  配置中间件，注册路由，并启动服务监听指定端口。

  ## 依赖模块说明
  ### 核心依赖
  - express: Node.js Web 应用框架，用于构建 RESTful API
  - cors: 处理跨域资源共享的中间件
  - body-parser: 解析 HTTP 请求体数据的中间件

  ### 内部模块
  - modelRoutes: 模型相关 API 路由模块
  - loginRoutes: 登录相关 API 路由模块

  ## 中间件配置
  1. cors(): 启用跨域资源共享，允许前端应用访问后端 API
  2. bodyParser.json(): 解析 JSON 格式的请求体数据
  3. bodyParser.urlencoded({ extended: true }): 解析 URL 编码的请求体数据

  ## 路由注册
  - `/api/models`: 挂载模型相关 API 路由
  - `/api`: 挂载登录相关 API 路由

  ## 服务配置
  - 默认监听端口: 3000
  - 启动成功后输出服务运行地址
  - 包含错误处理机制，服务启动失败时输出错误信息
*/

// 引入所需的核心依赖模块
const express = require('express');           // Express框架，用于构建Web应用
const cors = require('cors');                 // CORS中间件，用于处理跨域请求
const bodyParser = require('body-parser');    // Body解析中间件，用于解析请求体
const fs = require('fs');                     // 文件系统模块，用于文件操作
const path = require('path');                 // 路径处理模块

// 引入路由模块
const modelRoutes = require('./routes/modelRoutes'); // 引入模型相关路由模块
const loginRoutes = require('./routes/loginRoutes'); // 引入登录相关路由模块
const userRoutes = require('./routes/userRoutes'); // 引入用户管理路由模块
const storageRoutes = require('./routes/storageRoutes'); // 引入存储空间管理路由模块
const db = require('./db'); // 引入数据库以进行健康检查

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000; // 服务监听端口，默认为3000

// 配置应用中间件
app.use(cors());                    // 启用跨域资源共享
app.use(bodyParser.json({ limit: '50mb' }));         // 解析JSON格式的请求体数据
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // 解析URL编码的请求体数据

// 添加静态文件服务中间件，用于访问上传的文件
// 注意：对于网络路径，express.static可能无法直接处理
// 我们需要自定义中间件来处理NAS上的文件访问
app.use('/uploads', express.static('uploads'));

// 自定义中间件处理NAS文件访问请求
/**
 * 自定义中间件处理NAS文件访问请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 * @description 处理对NAS存储的三维模型文件的访问请求，支持文件下载和流式传输
 *              若NAS路径文件不存在，会尝试从本地uploads目录查找备份
 */
app.use('/nas-files', (req, res) => {
  const filePath = '\\\\192.168.0.49\\宝可橙科技\\_02项目文件\\_01FBX模型文件' + req.path;
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 文件不存在，尝试在本地备份目录查找
      const localPath = path.join(__dirname, 'uploads', req.path);
      fs.access(localPath, fs.constants.F_OK, (localErr) => {
        if (localErr) {
          return res.status(404).json({ message: '文件未找到' });
        }
        res.sendFile(localPath);
      });
    } else {
      // 对于网络路径，我们不能直接使用res.sendFile
      // 需要先将文件读取到内存再发送（适用于中小型文件）
      // 对于大型模型文件，建议使用流式传输
      const fileName = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      
      stream.on('error', (err) => {
        console.error('文件流传输错误:', err);
        res.status(500).json({ message: '文件读取失败' });
      });
    }
  });
});

// 添加请求日志中间件
/**
 * 请求日志中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 * @description 记录所有HTTP请求的时间、方法和路径
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 注册路由
app.use('/api/models', modelRoutes); // 挂载模型相关API路由到/api/models路径下
app.use('/api/auth', loginRoutes); // 挂载登录相关API路由到/api/auth路径下
app.use('/api/users', userRoutes); // 挂载用户管理API路由到/api/users路径下
app.use('/api/storage', storageRoutes); // 挂载存储空间管理API路由到/api/storage路径下

// 添加根路径路由用于健康检查
app.get('/', (req, res) => {
  res.json({ message: '护橙河三维模型管理系统后端服务运行正常' });
});

// 数据库健康检查
app.get('/api/health/db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as ok');
    res.json({ ok: true, result: rows && rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, code: err.code, errno: err.errno, message: err.message });
  }
});

// 添加错误处理中间件
/**
 * 全局错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 * @description 统一处理应用中发生的所有错误，包括Multer文件上传错误
 */
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  // 文件上传错误处理
  if (err instanceof (require('multer').MulterError)) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小超出限制' });
    }
  }
  res.status(500).json({ message: '服务器内部错误', error: err.message, code: err.code });
});

// 404处理
/**
 * 404错误处理中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @description 处理所有未匹配路由的请求，返回404状态和提示信息
 */
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 启动服务器并监听指定端口
const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});

// 捕获未处理的异常与未处理的Promise拒绝，确保错误能被看到
process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
});

module.exports = server;