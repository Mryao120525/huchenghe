/*
  router/index.js
  配置前端页面路由，管理不同页面的跳转。

  ## 功能描述
  这是前端应用的路由配置文件，使用 Vue Router 管理应用中的路由。
  它定义了所有可访问的页面路径及其对应的组件。

  ## 路由配置说明
  - `/`: 根路径，重定向到模型列表页面
  - `/login`: 登录页面路由
  - `/models`: 模型列表页面路由
  - `/model/:id`: 模型详情页面路由，其中 :id 是动态参数
  - `/admin`: 管理员主页面路由
  - `/admin/用户管理`: 用户管理页面路由

  ## 路由模式
  使用 `createWebHashHistory()` 创建基于哈希的路由历史记录，
  这种模式不需要服务器配置支持，适用于静态文件部署。

  ## 路由懒加载
  Login 和 UserAdmin 页面使用了路由懒加载方式引入组件，
  这有助于减小初始包大小，提高应用加载性能。
*/

import { createRouter, createWebHashHistory } from 'vue-router';

import ModelList from '../views/ModelList.vue';
import ModelDetail from '../views/ModelDetail.vue';
import Admin from '../views/Admin.vue';

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/models',
    name: 'ModelList',
    component: ModelList,
    meta: { requiresAuth: true }
  },
  {
    path: '/model/:id',
    name: 'ModelDetail',
    component: ModelDetail,
    meta: { requiresAuth: true }
  },
  // 先写更具体的子路由
  {
    path: '/admin/用户管理',
    name: 'UserAdmin',
    component: () => import('../views/UserAdmin.vue'),
    meta: { requiresAuth: true }
  },
  // 再写父级路由
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  },
  // 测试连接页面
  {
    path: '/test-connection',
    name: 'TestConnection',
    component: () => import('../views/TestConnection.vue')
  },
  // 存储空间管理页面
  {
    path: '/storage-management',
    name: 'StorageManagement',
    component: () => import('../views/StorageManagement.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 简易路由守卫：基于 localStorage 标记是否登录
router.beforeEach((to, from, next) => {
  const isAuthed = !!localStorage.getItem('hc_authed');
  if (to.meta && to.meta.requiresAuth && !isAuthed) {
    next('/login');
  } else if (to.path === '/login' && isAuthed) {
    next('/models');
  } else {
    next();
  }
});

export default router;