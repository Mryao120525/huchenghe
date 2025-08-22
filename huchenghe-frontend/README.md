# 护橙河三维模型管理系统前端

## 项目简介
护橙河三维模型管理系统是一个基于Vue3 + Vite + Three.js的现代化Web应用，支持3D模型的上传、管理、预览和下载。

## 技术栈
- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 4
- **UI组件库**: Element Plus
- **3D渲染**: Three.js
- **路由管理**: Vue Router 4
- **样式**: CSS3 + 响应式设计

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境启动
```bash
# 标准启动
npm run dev

# 清理缓存后启动（推荐）
npm run dev:clean

# 指定端口启动
npm run start
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 开发说明

### 缓存问题解决
如果在开发过程中遇到页面更新不及时的问题，请尝试以下解决方案：

1. **清理Vite缓存**
   ```bash
   npm run clean
   npm run dev:clean
   ```

2. **浏览器操作**
   - 按 `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac) 强制刷新
   - 打开开发者工具，右键刷新按钮选择"清空缓存并硬性重新加载"
   - 在开发者工具中禁用缓存（Network标签页勾选"Disable cache"）

3. **清除浏览器数据**
   - 清除浏览器的缓存和Cookie
   - 使用无痕模式测试

### 热更新配置
项目已配置Vite热更新，修改代码后页面会自动刷新。如果热更新不工作：

1. 检查控制台是否有错误信息
2. 确认Vite开发服务器正常运行
3. 尝试重启开发服务器

### 文件结构
```
src/
├── api/          # API接口
├── assets/       # 静态资源
├── components/   # 公共组件
├── router/       # 路由配置
├── utils/        # 工具函数
├── views/        # 页面组件
├── App.vue       # 根组件
├── main.js       # 入口文件
└── style.css     # 全局样式
```

## 功能特性

- 🎨 现代化UI设计，支持响应式布局
- 📱 移动端适配，提供移动端专用界面
- 🎯 3D模型预览，支持多种格式
- 🔧 丰富的模型控制功能（视角、灯光、材质等）
- 📊 模型信息管理，支持版本历史
- 🚀 快速文件上传和下载
- 🔐 用户认证和权限管理

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License