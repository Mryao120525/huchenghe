<!--
Admin.vue
管理员界面，支持后续扩展管理功能。
-->
<template>
  <el-container class="admin-container">
    <el-header class="admin-header">
      <span>管理员后台</span>
    </el-header>
    <el-main>
      <el-card>
        <template #header>
          <span>欢迎进入管理员后台</span>
        </template>
        <div>
          <p>常用功能：</p>
          <div class="feature-list">
            <el-card
              v-for="item in adminFeatures"
              :key="item.feature"
              class="feature-card"
              shadow="hover"
              @click="goFeature(item.feature)"
            >
              <div class="feature-title">{{ item.feature }}</div>
              <div class="feature-desc">{{ item.desc }}</div>
            </el-card>
          </div>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const adminFeatures = [
  { feature: '用户管理', desc: '添加、编辑、删除用户账号，分配权限' },
  { feature: '模型审核', desc: '审核用户上传的三维模型，控制发布' },
  { feature: '模型管理', desc: '对所有模型进行增删改查、批量操作' },
  { feature: '存储空间管理', desc: '监控存储空间使用情况，清理文件，管理存储设置' },
  { feature: '系统设置', desc: '平台基础配置、公告、参数设置' },
  { feature: '日志管理', desc: '查看操作日志、系统日志，便于追踪问题' },
  { feature: '数据统计', desc: '查看模型数量、用户活跃度等统计报表' },
  { feature: '权限分配', desc: '为不同用户分配不同的管理权限' },
  { feature: '安全管理', desc: '密码策略、登录安全、异常检测等' },
];
const goFeature = (feature) => {
  // 跳转到对应功能页面（占位页）
  if (feature === '用户管理') {
    router.push('/admin/用户管理');
  } else if (feature === '存储空间管理') {
    router.push('/storage-management');
  } else {
    router.push(`/admin/${encodeURIComponent(feature)}`);
  }
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f7f8fa;
}
.admin-header {
  background: linear-gradient(270deg, #4f8cff, #6ee7b7, #fbbf24, #f87171, #4f8cff);
  background-size: 1000% 100%;
  animation: gradientMove 8s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
/* 功能卡片布局 */
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
}
.feature-card {
  width: 220px;
  min-height: 120px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.feature-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 4px 16px rgba(79,140,255,0.15);
}
.feature-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #4f8cff;
}
.feature-desc {
  font-size: 14px;
  color: #666;
}
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
