 
<template>
  <el-container class="model-system-container">
    <!-- 顶部标题 -->
    <el-header class="header-title">
      <span>护橙河三维模型管理系统</span>
    </el-header>
    <el-main>
      <!-- 筛选区 -->
      <div class="filter-bar">
        <el-select placeholder="格式" class="filter-item filter-format" style="width: 90px;">
          <el-option label="全部" value="all" />
          <el-option label="OBJ" value="obj" />
          <el-option label="STL" value="stl" />
          <el-option label="GLTF" value="gltf" />
        </el-select>
        <el-input placeholder="名称" class="filter-item" style="width: 120px;" />
        <el-select v-model="filterType" placeholder="类型" class="filter-item filter-type" style="width: 120px;">
          <el-option label="全部" value="all" />
          <el-option label="石刻" value="石刻" />
          <el-option label="石碑" value="石碑" />
          <el-option label="雕塑" value="雕塑" />
          <el-option label="造像" value="造像" />
        </el-select>
        <el-button type="primary" class="filter-item" style="margin-right: 16px;">筛选</el-button>
        <div class="upload-btn" style="display: flex; align-items: center;">
          <el-button type="success" @click="triggerFileInput">上传模型</el-button>
          <input ref="fileInput" type="file" style="display: none;" @change="handleFileUpload" />
        </div>
      </div>
      <el-divider />
      <!-- 表格区 -->
  <el-table :data="filteredTableData" class="model-table" border>
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
const filteredTableData = computed(() => {
  if (filterType.value === 'all') return tableData;
  return tableData.filter(item => item.type === filterType.value);
});

// 模拟后端返回的数据

const tableData = reactive([
  { id: 1, name: '战斗机', version: 'v1.0', format: 'OBJ', type: '石刻', path: '/models/plane.obj' },
  { id: 2, name: '装甲车', version: 'v2.1', format: 'STL', type: '雕塑', path: '/models/tank.stl' },
  { id: 3, name: '火箭发射器', version: 'v1.5', format: 'GLTF', type: '石碑', path: '/models/rocket.gltf' },
  { id: 4, name: '假山', version: 'v1.5', format: 'GLTF', type: '石碑', path: '/models/rocket.gltf' },
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
  background: #545c64;
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