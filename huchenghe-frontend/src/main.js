// main.js
// 前端应用入口文件，初始化 Vue 应用并挂载到页面。
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

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}