// router/index.js
// 配置前端页面路由，管理不同页面的跳转。
import { createRouter, createWebHashHistory } from 'vue-router';

import ModelList from '../views/ModelList.vue';
import ModelDetail from '../views/ModelDetail.vue';
import Admin from '../views/Admin.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/models',
    name: 'ModelList',
    component: ModelList
  },
  {
    path: '/model/:id',
    name: 'ModelDetail',
    component: ModelDetail
  },
  // 先写更具体的子路由
  {
    path: '/admin/用户管理',
    name: 'UserAdmin',
    component: () => import('../views/UserAdmin.vue')
  },
  // 再写父级路由
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;