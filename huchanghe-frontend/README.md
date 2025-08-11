# 目录结构说明

## huchanghe-frontend
前端项目，基于 Vue3 + Element Plus + Vite，主要用于三维模型管理系统的界面展示与交互。

- `index.html`：前端入口 HTML 文件。
- `package.json`：前端依赖与脚本配置。
- `vite.config.js`：Vite 构建工具配置文件。
- `public/`：静态资源文件夹（如图片等），打包时会原样复制到输出目录。
- `src/`：前端源代码目录。
  - `App.vue`：Vue 根组件。
  - `main.js`：前端入口 JS 文件，初始化 Vue 应用。
  - `style.css`：全局样式文件。
  - `assets/`：前端静态资源（如图片、SVG 等）。
  - `components/`：可复用的 Vue 组件。
    - `HelloWorld.vue`：示例组件。
  - `router/`：前端路由配置。
    - `index.js`：定义页面路由。
  - `views/`：页面级 Vue 组件。
    - `ModelDetail.vue`：模型详情页。
    - `ModelList.vue`：模型列表页。

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
