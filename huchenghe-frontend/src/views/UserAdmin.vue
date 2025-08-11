<!--
UserAdmin.vue
管理员-用户管理页面，支持用户的增删改查。
-->
<template>
  <el-container class="user-admin-container">
    <el-header class="user-admin-header">
      <span>用户管理</span>
    </el-header>
    <el-main>
      <el-card>
        <template #header>
          <span>用户列表</span>
        </template>
        <el-table :data="userList" border style="width: 100%; margin-bottom: 16px;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="140" />
          <el-table-column prop="role" label="角色" width="120" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" type="primary">编辑</el-button>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="success">添加用户</el-button>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
// 模拟用户数据
const userList = [
  { id: 1, username: 'admin', role: '超级管理员', email: 'admin@example.com' },
  { id: 2, username: 'user1', role: '普通用户', email: 'user1@example.com' },
  { id: 3, username: 'user2', role: '普通用户', email: 'user2@example.com' },
];
</script>

<style scoped>
.user-admin-container {
  min-height: 100vh;
  background: #f7f8fa;
}
.user-admin-header {
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
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
