<template>
  <div class="test-connection">
    <h1>后端连接测试</h1>
    <div v-if="loading">正在测试连接...</div>
    <div v-else>
      <div v-if="success" class="success">连接成功！后端服务正常运行。</div>
      <div v-else class="error">连接失败：{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'TestConnection',
  data() {
    return {
      loading: true,
      success: false,
      errorMessage: ''
    };
  },
  async mounted() {
    try {
      const response = await api.get('/');
      if (response.data && response.data.message) {
        this.success = true;
      } else {
        this.errorMessage = '后端响应格式不正确';
      }
    } catch (error) {
      this.errorMessage = error.message || '未知错误';
      console.error('连接测试失败:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.test-connection {
  padding: 20px;
}

.success {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}
</style>