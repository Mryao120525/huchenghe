<!--
ModelList.vue
三维模型管理系统的模型列表页，包含筛选、上传、表格展示等功能。

## 功能描述
该页面是三维模型管理系统的主界面，展示所有模型的列表信息，并提供筛选、上传和查看详情功能。

## 页面结构
1. 顶部标题栏：显示系统名称"护橙河三维模型管理系统"
2. 筛选区域：提供模型名称和类型筛选功能
3. 上传按钮：用于触发模型上传功能
4. 表格区域：展示模型列表数据
5. 分页区域：提供分页导航功能

## 主要功能

### 模型筛选
- 名称筛选：支持模糊匹配模型名称
- 类型筛选：支持按类型精确筛选（石刻、石碑、雕塑、造像等）

### 模型上传
- 点击"上传模型"按钮触发文件选择
- 当前为模拟实现，仅显示选择的文件名

### 模型展示
- 以表格形式展示模型信息，包括ID、名称、版本、文件格式、类型、路径等
- 每行提供"详情"按钮，点击可跳转到模型详情页面

### 分页功能
- 支持分页浏览模型列表
- 每页显示10条数据
- 筛选条件变化时自动回到第一页

## 组件依赖
- Element Plus 组件库：使用了 el-container、el-header、el-main、el-input、el-select、el-option、el-button、el-table、el-table-column、el-pagination、el-divider 等组件

## 数据处理
- 使用 Vue 3 Composition API 进行状态管理
- 使用 computed 计算属性处理筛选和分页逻辑
- 使用 watch 监听筛选条件变化，自动重置分页
-->
 
<template>
  <el-container class="model-system-container">
    <!-- 顶部标题 -->
    <el-header class="header-title">
      <span>护橙河三维模型管理系统</span>
    </el-header>
    <el-main>
      <!-- 筛选区 -->
      <div class="filter-bar">
        <span style="margin-right: 4px;">模型名称：</span>
        <el-input v-model="filterName" placeholder="名称" class="filter-item" style="width: 120px;" />
        <span style="margin-right: 4px;">类型：</span>
        <el-select v-model="filterType" placeholder="类型" class="filter-item filter-type" style="width: 120px;">
          <el-option label="全部" value="all" />
          <el-option label="石刻" value="石刻" />
          <el-option label="石碑" value="石碑" />
          <el-option label="雕塑" value="雕塑" />
          <el-option label="造像" value="造像" />
        </el-select>
        <div class="upload-btn" style="display: flex; align-items: center;">
          <el-button type="success" @click="triggerFileInput">上传模型</el-button>
          <input ref="fileInput" type="file" style="display: none;" @change="handleFileUpload" />
        </div>
      </div>
      <el-divider />
      <!-- 表格区 -->
  <el-table :data="pagedTableData" class="model-table" border>
  <el-table-column prop="id" label="ID" width="100" align="center" header-align="center" />
  <el-table-column prop="name" label="模型名称" width="140" align="center" header-align="center" />
  <el-table-column prop="version" label="版本" width="100" align="center" header-align="center" />
  <el-table-column prop="format" label="文件格式" width="120" align="center" header-align="center" />
    <el-table-column prop="type" label="类型" width="120" align="center" header-align="center" />
  <el-table-column prop="path" label="路径" min-width="180" align="center" header-align="center" />
  <el-table-column label="操作" width="120" align="center" header-align="center">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.$index, scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <div style="display: flex; justify-content: center; align-items: center; margin: 24px 0 0 0;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredTableData.length"
          :page-size="pageSize"
          :current-page="currentPage"
          :pager-count="5"
          style="--el-pagination-bg-color: #fff;"
          @current-change="handlePageChange"
        />
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const fileInput = ref(null);
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

// 名称筛选
const filterName = ref("");
// 上传模型文件事件
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 这里可以添加上传逻辑
    alert(`已选择文件：${file.name}`);
  }
};

const router = useRouter();
const filterType = ref('all');

const pageSize = 10;
const currentPage = ref(1);
const filteredTableData = computed(() => {
  let data = tableData;
  // 类型筛选
  if (filterType.value !== 'all') {
    data = data.filter(item => item.type === filterType.value);
  }
  // 名称筛选（模糊匹配）
  if (filterName.value.trim() !== '') {
    data = data.filter(item => item.name.includes(filterName.value.trim()));
  }
  return data;
});

// 当筛选条件变化时，自动跳转回第一页
import { watch } from 'vue';
watch([filterType, filterName], () => {
  currentPage.value = 1;
});
const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredTableData.value.slice(start, start + pageSize);
});
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 模拟后端返回的数据

const tableData = reactive([
  { id: 1, name: '战斗机', version: 'v1.0', format: 'OBJ', type: '石刻', path: '/models/plane.obj' },
  { id: 2, name: '装甲车', version: 'v2.1', format: 'STL', type: '雕塑', path: '/models/tank.stl' },
  { id: 3, name: '火箭发射器', version: 'v1.5', format: 'GLTF', type: '石碑', path: '/models/rocket.gltf' },
  { id: 4, name: '假山', version: 'v1.5', format: 'GLTF', type: '石碑', path: '/models/rock2.gltf' },
  { id: 5, name: '佛像', version: 'v2.0', format: 'OBJ', type: '造像', path: '/models/buddha.obj' },
  { id: 6, name: '狮子雕塑', version: 'v1.2', format: 'STL', type: '雕塑', path: '/models/lion.stl' },
  { id: 7, name: '石碑A', version: 'v1.0', format: 'GLTF', type: '石碑', path: '/models/steleA.gltf' },
  { id: 8, name: '石碑B', version: 'v1.1', format: 'OBJ', type: '石碑', path: '/models/steleB.obj' },
  { id: 9, name: '石刻龙', version: 'v2.3', format: 'STL', type: '石刻', path: '/models/dragon.stl' },
  { id: 10, name: '石刻虎', version: 'v2.4', format: 'OBJ', type: '石刻', path: '/models/tiger.obj' },
  { id: 11, name: '石刻凤', version: 'v2.5', format: 'GLTF', type: '石刻', path: '/models/phoenix.gltf' },
  { id: 12, name: '雕塑A', version: 'v1.0', format: 'OBJ', type: '雕塑', path: '/models/sculptA.obj' },
  { id: 13, name: '雕塑B', version: 'v1.1', format: 'STL', type: '雕塑', path: '/models/sculptB.stl' },
  { id: 14, name: '造像A', version: 'v1.0', format: 'GLTF', type: '造像', path: '/models/statueA.gltf' },
  { id: 15, name: '造像B', version: 'v1.1', format: 'OBJ', type: '造像', path: '/models/statueB.obj' },
]);

// 查看详情的点击事件，会跳转到对应的模型详情页
const handleView = (index, row) => {
  router.push(`/model/${row.id}`);
};

</script>
<style scoped>
.model-system-container {
  min-height: 100vh;
  background: #f7f8fa;
}
.header-title {
  /* 渐变背景动画 */
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
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0 16px 0;
  padding: 12px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.filter-item {
  min-width: 80px;
  max-width: 140px;
  flex-shrink: 0;
}
.filter-format {
  width: 90px !important;
}
.filter-type {
  width: 120px !important;
}
.upload-btn {
  margin-left: auto;
  margin-right: 0;
}
.upload-btn .el-button {
  margin-right: 0;
}
.model-table {
  text-align: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  border: 1px solid #ebeef5;
  /* 增强分隔线可见性 */
}
.el-table__header th {
  background: #3a4a5a !important;
  color: #fff !important;
  border-bottom: 1px solid #ebeef5 !important;
}
.el-table th, .el-table td {
  border-bottom: 1px solid #ebeef5 !important;
}
</style>