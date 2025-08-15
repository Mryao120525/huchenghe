<template>
  <div class="mobile-test">
    <div class="test-container">
      <h1>📱 移动端测试页面</h1>
      
      <div class="test-section">
        <h3>设备信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">设备类型:</span>
            <span class="value">{{ deviceInfo.isMobile ? '移动设备' : '桌面设备' }}</span>
          </div>
          <div class="info-item">
            <span class="label">操作系统:</span>
            <span class="value">{{ deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : '其他' }}</span>
          </div>
          <div class="info-item">
            <span class="label">屏幕尺寸:</span>
            <span class="value">{{ deviceInfo.screenWidth }} x {{ deviceInfo.screenHeight }}</span>
          </div>
          <div class="info-item">
            <span class="label">微信浏览器:</span>
            <span class="value">{{ deviceInfo.isWeChat ? '是' : '否' }}</span>
          </div>
          <div class="info-item">
            <span class="label">PWA模式:</span>
            <span class="value">{{ deviceInfo.isStandalone ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h3>功能测试</h3>
        <div class="test-buttons">
          <el-button type="primary" @click="testLogin">测试登录</el-button>
          <el-button type="success" @click="testModels">测试模型列表</el-button>
          <el-button type="warning" @click="testUpload">测试上传</el-button>
          <el-button type="info" @click="testDownload">测试下载</el-button>
        </div>
      </div>
      
      <div class="test-section">
        <h3>响应式测试</h3>
        <div class="responsive-test">
          <div class="test-card">
            <h4>卡片1</h4>
            <p>这是一个测试卡片，用于验证响应式布局</p>
          </div>
          <div class="test-card">
            <h4>卡片2</h4>
            <p>移动端应该垂直排列，桌面端应该水平排列</p>
          </div>
          <div class="test-card">
            <h4>卡片3</h4>
            <p>触摸友好的按钮和交互元素</p>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h3>PWA功能</h3>
        <div class="pwa-info">
          <p>如果支持PWA，您可以：</p>
          <ul>
            <li>将应用添加到主屏幕</li>
            <li>离线访问缓存的内容</li>
            <li>接收推送通知</li>
            <li>像原生APP一样使用</li>
          </ul>
          <el-button type="primary" @click="installPWA" v-if="canInstallPWA">
            安装为APP
          </el-button>
        </div>
      </div>
      
      <div class="test-section">
        <h3>导航测试</h3>
        <div class="nav-test">
          <router-link to="/mobile/models" class="nav-link">
            <span class="nav-icon">📋</span>
            <span>模型列表</span>
          </router-link>
          <router-link to="/mobile/login" class="nav-link">
            <span class="nav-icon">🔐</span>
            <span>登录页面</span>
          </router-link>
          <router-link to="/models" class="nav-link">
            <span class="nav-icon">🖥️</span>
            <span>桌面版</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDeviceInfo } from '../utils/deviceDetection.js'

const router = useRouter()
const deviceInfo = ref({})
const canInstallPWA = ref(false)

onMounted(() => {
  deviceInfo.value = getDeviceInfo()
  
  // 检测PWA安装能力
  if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
    canInstallPWA.value = true
  }
})

const testLogin = () => {
  router.push('/mobile/login')
}

const testModels = () => {
  router.push('/mobile/models')
}

const testUpload = () => {
  // 模拟文件上传测试
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.fbx,.obj,.3ds'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      alert(`选择了文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    }
  }
  input.click()
}

const testDownload = () => {
  // 模拟下载测试
  const link = document.createElement('a')
  link.href = 'data:text/plain;charset=utf-8,测试文件内容'
  link.download = 'test.txt'
  link.click()
}

const installPWA = () => {
  // 触发PWA安装
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt()
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了PWA安装')
      }
      window.deferredPrompt = null
    })
  }
}
</script>

<style scoped>
.mobile-test {
  min-height: 100vh;
  background: var(--hc-bg);
  padding: 20px;
}

.test-container {
  max-width: 600px;
  margin: 0 auto;
}

.test-container h1 {
  text-align: center;
  color: var(--hc-text);
  margin-bottom: 30px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.test-section h3 {
  color: var(--hc-text);
  margin-bottom: 16px;
  border-bottom: 2px solid var(--hc-primary);
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--hc-border);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: var(--hc-subtext);
}

.value {
  color: var(--hc-text);
  font-weight: 600;
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-buttons .el-button {
  width: 100%;
  height: 44px;
}

.responsive-test {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-card {
  background: var(--hc-bg);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--hc-border);
}

.test-card h4 {
  margin: 0 0 8px 0;
  color: var(--hc-text);
}

.test-card p {
  margin: 0;
  color: var(--hc-subtext);
  font-size: 14px;
}

.pwa-info ul {
  margin: 12px 0;
  padding-left: 20px;
}

.pwa-info li {
  margin-bottom: 6px;
  color: var(--hc-subtext);
}

.nav-test {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--hc-bg);
  border-radius: 8px;
  text-decoration: none;
  color: var(--hc-text);
  border: 1px solid var(--hc-border);
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: var(--hc-primary);
  color: white;
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .test-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .test-buttons .el-button {
    width: auto;
    flex: 1;
  }
  
  .responsive-test {
    flex-direction: row;
  }
  
  .test-card {
    flex: 1;
  }
  
  .nav-test {
    flex-direction: row;
  }
  
  .nav-link {
    flex: 1;
    justify-content: center;
  }
}
</style>
