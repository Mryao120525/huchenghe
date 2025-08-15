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
          <div class="card-header">
            <span>用户列表</span>
            <el-button type="success" @click="showAddUserDialog">添加用户</el-button>
          </div>
        </template>
        <el-table :data="userList" border style="width: 100%; margin-bottom: 16px;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="140" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
                {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" type="primary" @click="editUser(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>

  <!-- 添加/编辑用户对话框 -->
  <el-dialog v-model="userDialogVisible" :title="editingUser ? '编辑用户' : '添加用户'" width="500px">
    <el-form :model="userForm" :rules="userFormRules" ref="userFormRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="userForm.phone" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="userForm.role" style="width: 100%">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" />
      </el-form-item>
      <el-form-item v-if="!editingUser" label="密码" prop="password">
        <el-input v-model="userForm.password" type="password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const userList = ref([])
const userDialogVisible = ref(false)
const editingUser = ref(null)
const userFormRef = ref()

// 用户表单数据
const userForm = reactive({
  username: '',
  phone: '',
  role: 'user',
  email: '',
  password: ''
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await axios.get('https://api.example.com/v1/users')
    userList.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  }
}

// 显示添加用户对话框
const showAddUserDialog = () => {
  editingUser.value = null
  // 重置表单
  Object.assign(userForm, {
    username: '',
    phone: '',
    role: 'user',
    email: '',
    password: ''
  })
  userDialogVisible.value = true
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = user
  // 填充表单数据
  Object.assign(userForm, {
    username: user.username || '',
    phone: user.phone || '',
    role: user.role || 'user',
    email: user.email || '',
    password: ''
  })
  userDialogVisible.value = true
}

// 保存用户（添加或编辑）
const saveUser = async () => {
  try {
    await userFormRef.value.validate()
    
    if (editingUser.value) {
      // 编辑用户
      console.log('正在更新用户:', {
        id: editingUser.value.id,
        username: userForm.username,
        phone: userForm.phone,
        role: userForm.role,
        email: userForm.email
      });
      
      const response = await axios.put(`https://api.example.com/v1/users/${editingUser.value.id}`, {
        username: userForm.username,
        phone: userForm.phone,
        role: userForm.role,
        email: userForm.email
      })
      ElMessage.success(response.data.message || '用户更新成功')
    } else {
      // 添加用户（包含密码）
      console.log('正在添加用户:', {
        username: userForm.username,
        phone: userForm.phone,
        role: userForm.role,
        email: userForm.email,
        password: userForm.password
      });
      
      const response = await axios.post('https://api.example.com/v1/users', {
        username: userForm.username,
        phone: userForm.phone,
        role: userForm.role,
        email: userForm.email,
        password: userForm.password
      })
      ElMessage.success(response.data.message || '用户添加成功')
    }
    
    userDialogVisible.value = false
    fetchUsers() // 重新获取用户列表
  } catch (error) {
    const errorMessage = error.response?.data?.message || (editingUser.value ? '用户更新失败' : '用户添加失败')
    ElMessage.error(errorMessage)
    console.error('用户保存失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
  }
}

// 删除用户
const deleteUser = (id) => {
  ElMessageBox.confirm('确定要删除这个用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`https://api.example.com/v1/users/${id}`)
      ElMessage.success('用户删除成功')
      fetchUsers() // 重新获取用户列表
    } catch (error) {
      ElMessage.error('用户删除失败')
      console.error(error)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
})
</script>