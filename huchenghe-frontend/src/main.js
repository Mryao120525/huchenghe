// main.js
// 前端应用入口文件，初始化 Vue 应用并挂载到页面。

// 开发环境禁用缓存
if (import.meta.env.DEV) {
  // 清除可能的缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // 在控制台输出开发环境信息
  console.log('🚀 护橙河三维模型管理系统 - 开发环境');
  console.log('📅 启动时间:', new Date().toLocaleString());
}

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

// 添加全局错误处理
const app = createApp(App);

app.use(ElementPlus);
app.use(router);

app.mount('#app');

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err);
  console.log('Error Info:', info);
};

