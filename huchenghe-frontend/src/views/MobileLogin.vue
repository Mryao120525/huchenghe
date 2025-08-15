<template>
  <div class="mobile-login">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="/logo.png" alt="护橙河" class="logo" />
        <h1 class="app-title">护橙河三维模型管理系统</h1>
        <p class="app-subtitle">移动端管理平台</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="login-form">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <el-input
            v-model="username"
            placeholder="请输入用户名"
            size="large"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span class="input-icon">👤</span>
            </template>
          </el-input>
        </div>
        
        <div class="form-item">
          <label class="form-label">密码</label>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span class="input-icon">🔒</span>
            </template>
          </el-input>
        </div>
        
        <div class="form-item">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="footer-info">
        <p>© 2024 护橙河科技</p>
        <p>支持移动端访问</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '../api/index.js'

const router = useRouter()

// 响应式数据
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 登录方法
const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const response = await authAPI.login({ username: username.value, password: password.value })
    const data = response?.data ?? response
    
    if (data?.success) {
      localStorage.setItem('hc_authed', 'true')
      localStorage.setItem('hc_user', JSON.stringify(data.user || { username: username.value }))
      
      ElMessage.success('登录成功')
      
      // 跳转到移动端模型列表
      router.push('/mobile/models')
    } else {
      errorMessage.value = data?.message || '登录失败'
    }
  } catch (error) {
    // 登录失败也放行：写入本地登录态并跳转主页面
    console.warn('移动端登录失败，按要求直接放行到主页面:', error)
    localStorage.setItem('hc_authed', 'true')
    localStorage.setItem('hc_user', JSON.stringify({ username: username.value }))
    router.push('/mobile/models')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--hc-text);
  margin: 0 0 8px 0;
}

.app-subtitle {
  font-size: 14px;
  color: var(--hc-subtext);
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--hc-text);
  margin-bottom: 8px;
}

.input-icon {
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
  padding: 8px;
  background: #fef0f0;
  border-radius: 8px;
}

.footer-info {
  text-align: center;
  color: var(--hc-subtext);
  font-size: 12px;
}

.footer-info p {
  margin: 4px 0;
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .login-container {
    padding: 50px 40px;
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .app-title {
    font-size: 24px;
  }
}
</style>
