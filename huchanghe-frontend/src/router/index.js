import { createRouter, createWebHistory } from 'vue-router';
import ModelList from '../views/ModelList.vue';
import ModelDetail from '../views/ModelDetail.vue';

const routes = [
  {
    path: '/',
    name: 'ModelList',
    component: ModelList
  },
  {
    path: '/model/:id',
    name: 'ModelDetail',
    component: ModelDetail
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;