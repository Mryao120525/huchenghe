<template>
  <div class="mobile-layout">
    <!-- 主内容区域 -->
    <div class="mobile-main">
      <slot></slot>
    </div>
    
    <!-- 底部导航栏 -->
    <div class="mobile-nav">
      <router-link 
        to="/models" 
        class="nav-item"
        :class="{ active: $route.path === '/models' }"
      >
        <div class="nav-icon">📋</div>
        <span>模型列表</span>
      </router-link>
      
      <router-link 
        to="/storage-management" 
        class="nav-item"
        :class="{ active: $route.path === '/storage-management' }"
      >
        <div class="nav-icon">💾</div>
        <span>存储管理</span>
      </router-link>
      
      <router-link 
        to="/admin" 
        class="nav-item"
        :class="{ active: $route.path.startsWith('/admin') }"
      >
        <div class="nav-icon">⚙️</div>
        <span>管理</span>
      </router-link>
      
      <div class="nav-item" @click="handleLogout">
        <div class="nav-icon">🚪</div>
        <span>退出</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('hc_authed')
  localStorage.removeItem('hc_user')
  router.push('/login')
}
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-main {
  flex: 1;
  padding-bottom: 80px;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--hc-card-bg);
  border-top: 1px solid var(--hc-border);
  padding: 8px 0;
  z-index: 1000;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-decoration: none;
  color: var(--hc-subtext);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: var(--hc-primary);
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

/* 桌面端隐藏底部导航 */
@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
  
  .mobile-main {
    padding-bottom: 0;
  }
}
</style>
