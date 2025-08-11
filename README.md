# 护橙河三维模型管理系统

护橙河三维模型管理系统是一个前后端分离的 Web 应用，用于管理和展示各类三维模型。系统提供了模型的上传、浏览、筛选和详细查看功能，并支持管理员对用户和模型进行管理。

## 项目结构

```
huchenghe/
├── huchenghe-frontend/     # 前端项目目录
│   ├── src/                # 前端源代码
│   │   ├── assets/         # 静态资源文件
│   │   ├── components/     # 可复用组件
│   │   ├── router/         # 路由配置
│   │   ├── views/          # 页面组件
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── public/             # 公共静态资源
│   └── package.json        # 前端依赖配置
├── huchenghe-backend/      # 后端项目目录
│   ├── routes/             # API 路由定义
│   ├── db.js               # 数据库连接配置
│   ├── index.js            # 后端服务入口
│   └── package.json        # 后端依赖配置
└── README.md               # 项目说明文档
```

## 技术栈

### 前端技术
- Vue 3 (Composition API)
- Element Plus UI 组件库
- Vite 构建工具
- Axios HTTP 客户端
- Three.js 三维图形库

### 后端技术
- Node.js 运行环境
- Express.js Web 应用框架
- MySQL 数据库
- mysql2 数据库驱动

## 功能特性

### 用户管理
- 用户登录认证
- 管理员功能：用户列表查看、添加、编辑和删除

### 模型管理
- 模型列表展示（支持分页）
- 模型筛选（按名称、类型）
- 模型详情查看
- 模型上传、编辑和删除（管理员功能）

### 三维模型展示
- 基于 Three.js 的三维模型渲染
- 支持多种模型格式（OBJ、STL、GLTF等）

## 环境要求

- Node.js >= 14.x
- npm 或 yarn 包管理器
- MySQL 数据库

## 安装与运行

### 前端运行
```bash
# 进入前端目录
cd huchanghe-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端运行
```bash
# 进入后端目录
cd huchenghe-backend

# 安装依赖
npm install

# 启动服务
node index.js
```

## 数据库配置

系统使用 MySQL 数据库，需要在 `huchenghe-backend/db.js` 中配置数据库连接信息：

```javascript
const pool = mysql.createPool({
  host: 'localhost',        // 数据库主机地址
  user: 'root',             // 数据库用户名
  password: '***',    // 数据库密码
  database: '*****',    // 数据库名称
  waitForConnections: true, // 是否等待连接
  connectionLimit: 10,      // 连接池最大连接数
  queueLimit: 0             // 排队等待连接的最大请求数
});
```

## API 接口

### 模型相关接口
- `GET /api/models` - 获取模型列表（支持筛选和分页）
- `GET /api/models/count` - 获取模型总数
- `GET /api/models/:id` - 获取模型详情
- `POST /api/models` - 上传新模型
- `PUT /api/models/:id` - 更新模型信息
- `DELETE /api/models/:id` - 删除模型

### 用户相关接口
- `POST /api/login` - 用户登录
- `GET /api/users` - 获取用户列表（管理员）
- `POST /api/users` - 添加用户（管理员）
- `PUT /api/users/:id` - 更新用户信息（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）

## 开发规范

### 前端规范
- 使用 Vue 3 Composition API
- 组件化开发模式
- 路由采用动态导入实现懒加载

### 后端规范
- 遵循 RESTful API 设计原则
- 使用 Express.js 路由模块化设计
- 数据库操作使用 mysql2 的 Promise 形式
- 接口路径统一以 `/api` 为前缀

## 安全注意事项

1. 当前登录验证使用明文密码比较，生产环境中应使用加密密码
2. 缺少身份验证中间件，建议添加 JWT 或 Session 验证机制
3. 应该添加输入验证和参数校验，防止 SQL 注入等攻击
4. 文件上传功能需要添加安全检查，防止恶意文件上传