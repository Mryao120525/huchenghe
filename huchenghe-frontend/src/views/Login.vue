<!--
Login.vue
用户登录页面，输入账号和密码，验证通过后跳转到模型列表页。
-->
<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">系统登录</h2>
      <el-form :model="form" class="login-form" @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" placeholder="请输入密码" show-password clearable />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" type="primary" class="login-btn" @click="onLogin" style="width: 100%;">登录</el-button>
        </el-form-item>
        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { authAPI } from '@/api';
import { shouldUseMobileView } from '@/utils/deviceDetection'; // 导入设备检测函数
const router = useRouter();
// 设置默认手机号和密码（可改为空串以防泄露测试账号）
const form = ref({ username: '', password: '' });
const errorMsg = ref('');
const loading = ref(false);

const onLogin = async () => {
  // 基础必填校验
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入账号和密码';
    return;
  }
  try {
    loading.value = true;
    // 调用后端登录接口
    const res = await authAPI.login({
      username: form.value.username,
      password: form.value.password
    });
    if (res.data.success) {
      errorMsg.value = '';
      localStorage.setItem('hc_authed', '1');
      // 根据设备类型进行重定向
      if (shouldUseMobileView()) {
        router.push('/mobile/models');
      } else {
        router.push('/models');
      }
    } else {
      errorMsg.value = res.data.message || '账号或密码错误';
    }
  } catch (e) {
    // 登录失败也直接放行：写入本地登录态并跳转主页面
    console.warn('登录失败，按要求直接放行到主页面:', e)
    localStorage.setItem('hc_authed', '1')
    // 登录失败也根据设备类型进行重定向
    if (shouldUseMobileView()) {
      router.push('/mobile/models');
    } else {
      router.push('/models');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #4f8cff 0%, #6ee7b7 100%);
}
.login-box {
  background: #fff;
  padding: 40px 32px 32px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(79,140,255,0.12);
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #4f8cff;
  margin-bottom: 32px;
  letter-spacing: 2px;
}
.login-form {
  width: 100%;
}
.login-btn {
  font-size: 16px;
  height: 40px;
}
.login-error {
  color: #f87171;
  margin-top: 8px;
  text-align: center;
}
</style>