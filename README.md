# 护橙河三维模型管理系统

## 项目简介

护橙河三维模型管理系统是一个基于Vue 3 + Node.js + MySQL的现代化三维模型管理平台，专为文化遗产保护和展示而设计。系统支持多种3D模型格式的上传、存储、管理和展示，提供直观的用户界面和强大的后台管理功能。

## 技术栈

### 前端技术
- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3组件库
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP客户端
- **Vite** - 现代化构建工具

### 后端技术
- **Node.js** - JavaScript运行时环境
- **Express.js** - Web应用框架
- **MySQL** - 关系型数据库
- **Multer** - 文件上传中间件
- **bcryptjs** - 密码加密

## 功能特性

### 用户管理
- 用户登录认证
- 角色权限管理（管理员/普通用户）
- 用户信息管理

### 模型管理
- 支持多种3D模型格式（FBX、OBJ、STL、GLTF、GLB等）
- 模型文件上传和存储
- 模型信息管理（名称、类别、区域、地址等）
- 模型预览和渲染图管理
- 模型搜索和筛选
- 分页显示

### 文件存储
- 支持NAS网络存储
- 本地备份存储
- 大文件上传支持（最大500MB）
- 文件访问和下载

## 项目结构

```
huchenghe/
├── huchenghe-frontend/          # 前端项目
│   ├── src/
│   │   ├── api/                 # API接口
│   │   ├── components/          # Vue组件
│   │   ├── router/              # 路由配置
│   │   ├── views/               # 页面视图
│   │   ├── App.vue              # 根组件
│   │   └── main.js              # 入口文件
│   ├── public/                  # 静态资源
│   ├── package.json             # 前端依赖
│   └── vite.config.js           # Vite配置
├── huchenghe-backend/           # 后端项目
│   ├── routes/                  # 路由模块
│   │   ├── loginRoutes.js       # 登录路由
│   │   ├── modelRoutes.js       # 模型路由
│   │   └── userRoutes.js        # 用户路由
│   ├── db.js                    # 数据库连接
│   ├── index.js                 # 服务器入口
│   ├── package.json             # 后端依赖
│   └── uploads/                 # 文件上传目录
├── README.md                    # 项目说明
└── package.json                 # 根项目配置
```

## 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **MySQL** >= 8.0.0
- **npm** >= 8.0.0

### 1. 克隆项目

```bash
git clone <repository-url>
cd huchenghe
```

### 2. 数据库配置

#### 2.1 创建数据库

```sql
CREATE DATABASE huchenghe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.2 配置数据库连接

编辑 `huchenghe-backend/db.js` 文件，修改数据库连接信息：

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'huchenghe',
  // ... 其他配置
});
```

#### 2.3 初始化数据库表

```bash
cd huchenghe-backend
node initDatabase.js
```

### 3. 后端服务配置

#### 3.1 安装依赖

```bash
cd huchenghe-backend
npm install
```

#### 3.2 环境变量配置（可选）

创建 `.env` 文件：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=huchenghe
PORT=3000
```

#### 3.3 启动后端服务

```bash
node index.js
```

后端服务将在 `http://localhost:3000` 启动

### 4. 前端服务配置

#### 4.1 安装依赖

```bash
cd huchenghe-frontend
npm install
```

#### 4.2 配置API地址

编辑 `src/api/index.js` 文件，确认API基础URL：

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});
```

#### 4.3 启动前端服务

```bash
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## 使用指南

### 1. 系统登录

1. 打开浏览器访问 `http://localhost:5173`
2. 使用默认管理员账号登录：
   - **用户名**：`admin`
   - **密码**：`123456`

### 2. 模型管理

#### 2.1 上传模型

1. 点击"上传模型"按钮
2. 选择3D模型文件（支持FBX、OBJ、STL等格式）
3. 填写模型信息：
   - 模型名称
   - 类别（石刻、石碑、雕塑、造像、其他）
   - 区域（A区、B区等）
   - 地址
   - 数量
   - 备注
4. 点击确认上传

#### 2.2 查看模型列表

- 支持按名称搜索
- 支持按类别筛选
- 支持分页浏览
- 显示模型详细信息

#### 2.3 编辑模型

1. 在模型列表中点击"编辑"按钮
2. 修改模型信息
3. 保存更改

#### 2.4 删除模型

1. 在模型列表中点击"删除"按钮
2. 确认删除操作

### 3. 用户管理（管理员功能）

#### 3.1 添加用户

1. 进入用户管理页面
2. 点击"添加用户"
3. 填写用户信息：
   - 用户名
   - 手机号（用于登录）
   - 角色（管理员/普通用户）
   - 邮箱
4. 默认密码为 `123456`

#### 3.2 编辑用户

1. 在用户列表中点击"编辑"
2. 修改用户信息
3. 保存更改

#### 3.3 删除用户

1. 在用户列表中点击"删除"
2. 确认删除操作

## 配置说明

### 文件存储配置

系统支持两种文件存储方式：

#### 1. NAS网络存储（推荐）

编辑 `huchenghe-backend/routes/modelRoutes.js`：

```javascript
const uploadDir = '\\\\192.168.0.49\\宝可橙科技\\_02项目文件\\_01FBX模型文件';
```

#### 2. 本地存储

如果NAS不可用，系统会自动使用本地 `uploads` 目录作为备份。

### 文件大小限制

默认文件大小限制为500MB，可在 `modelRoutes.js` 中修改：

```javascript
limits: {
  fileSize: 500 * 1024 * 1024 // 500MB
}
```

### 支持的模型格式

- **FBX** (.fbx)
- **OBJ** (.obj)
- **STL** (.stl)
- **GLTF/GLB** (.gltf, .glb)
- **DAE** (.dae)
- **PLY** (.ply)
- **3DS** (.3ds)
- **MAX** (.max)
- **BLEND** (.blend)
- 以及其他常见3D格式

## 数据库设计

### 用户表 (user)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| username | varchar(50) | 用户名 |
| phone | varchar(20) | 手机号，唯一 |
| password | varchar(255) | 密码（支持明文和bcrypt） |
| role | varchar(20) | 角色（admin/user） |
| email | varchar(100) | 邮箱 |
| create_time | timestamp | 创建时间 |
| update_time | timestamp | 更新时间 |

### 模型表 (models)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| model_code | varchar(50) | 模型编码，唯一 |
| name | varchar(100) | 模型名称 |
| category | varchar(50) | 类别 |
| area | varchar(50) | 区域 |
| address | varchar(200) | 地址 |
| quantity | int | 数量 |
| image_path | varchar(500) | 图片路径 |
| render_path | varchar(500) | 渲染图路径 |
| model_path | varchar(500) | 模型文件路径 |
| remark | text | 备注 |
| create_time | timestamp | 创建时间 |
| update_time | timestamp | 更新时间 |

## API接口文档

### 认证接口

#### 用户登录
- **URL**: `POST /api/auth/login`
- **参数**: 
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **返回**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
  ```

### 模型接口

#### 获取模型列表
- **URL**: `GET /api/models`
- **参数**: 
  - `name`: 模型名称（可选）
  - `type`: 模型类型（可选）
  - `page`: 页码（可选，默认1）
  - `pageSize`: 每页数量（可选，默认10）

#### 上传模型
- **URL**: `POST /api/models/upload`
- **参数**: FormData格式
  - `modelFile`: 模型文件
  - `name`: 模型名称
  - `category`: 类别
  - `area`: 区域
  - `address`: 地址
  - `quantity`: 数量
  - `remark`: 备注

#### 更新模型
- **URL**: `PUT /api/models/:id`
- **参数**: JSON格式的模型信息

#### 删除模型
- **URL**: `DELETE /api/models/:id`

### 用户管理接口

#### 获取用户列表
- **URL**: `GET /api/users`

#### 添加用户
- **URL**: `POST /api/users`
- **参数**:
  ```json
  {
    "username": "用户名",
    "phone": "手机号",
    "role": "角色",
    "email": "邮箱"
  }
  ```

## 安全说明

### 密码安全
- 系统支持明文密码和bcrypt加密密码
- 建议在生产环境中使用bcrypt加密
- 默认管理员密码为明文，建议首次登录后修改

### 文件安全
- 支持的文件格式经过严格验证
- 文件大小有明确限制
- 文件存储路径可配置

### 权限控制
- 基于角色的权限管理
- 管理员可进行所有操作
- 普通用户只能查看模型列表

## 部署说明

### 生产环境部署

#### 1. 环境准备
- 安装Node.js和MySQL
- 配置防火墙和安全组
- 准备SSL证书（推荐）

#### 2. 数据库配置
- 创建生产数据库
- 配置数据库用户和权限
- 运行数据库初始化脚本

#### 3. 后端部署
```bash
cd huchenghe-backend
npm install --production
npm install pm2 -g
pm2 start index.js --name "huchenghe-backend"
```

#### 4. 前端部署
```bash
cd huchenghe-frontend
npm install
npm run build
# 将dist目录部署到Web服务器
```

#### 5. 反向代理配置（Nginx示例）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
- 检查数据库服务是否启动
- 验证数据库连接信息
- 确认数据库用户权限

#### 2. 文件上传失败
- 检查文件大小是否超限
- 确认文件格式是否支持
- 验证存储路径权限

#### 3. 前端无法访问后端
- 检查后端服务是否启动
- 确认API地址配置
- 检查CORS配置

#### 4. PowerShell执行策略错误
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 日志查看

#### 后端日志
```bash
# 查看PM2日志
pm2 logs huchenghe-backend

# 查看实时日志
pm2 logs huchenghe-backend --lines 100
```

#### 前端日志
- 打开浏览器开发者工具
- 查看Console和Network标签页

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue 3 Composition API规范
- 使用async/await处理异步操作

### 添加新功能
1. 在后端添加新的路由和控制器
2. 在前端添加对应的API调用
3. 创建新的Vue组件和页面
4. 更新路由配置

### 数据库迁移
1. 创建新的SQL脚本
2. 在`initDatabase.js`中添加新的表创建语句
3. 运行迁移脚本

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 贡献指南

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 联系方式

- 项目维护者：[维护者姓名]
- 邮箱：[邮箱地址]
- 项目地址：[GitHub地址]

## 更新日志

### v1.0.0 (2024-08-14)
- 初始版本发布
- 支持基本的模型管理功能
- 实现用户认证和权限管理
- 支持多种3D模型格式
- 集成NAS存储支持

---

**注意**：本文档会随着项目的发展持续更新，请定期查看最新版本。