// main.js
// 前端应用入口文件，初始化 Vue 应用并挂载到页面。
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(ElementPlus);
app.use(router);

app.mount('#app');