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
- 以表格形式展示模型信息，包括ID、名称、类别、区域、主址等
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
        <span style="margin-right: 4px;">类别：</span>
        <el-select v-model="filterType" placeholder="类别" class="filter-item filter-type" style="width: 120px;">
          <el-option label="全部" value="all" />
          <el-option label="石刻" value="石刻" />
          <el-option label="石碑" value="石碑" />
          <el-option label="雕塑" value="雕塑" />
          <el-option label="造像" value="造像" />
          <el-option label="其他" value="其他" />
        </el-select>
        <div class="upload-btn" style="display: flex; align-items: center;">
          <el-button type="success" @click="triggerFileInput">上传模型</el-button>
          <input 
            ref="fileInput" 
            type="file" 
            style="display: none;" 
            @change="handleFileUpload" 
            accept=".fbx,.obj,.stl,.gltf,.glb,.dae,.ply,.3ds,.max,.blend,.mtl,.ase,.ifc,.flt,.wrl,.wrz,.dxf,.dgn,.pdb,.ms3d,.mdl,.md2,.md3,.pk3,.md5,.smd,.vta,.dmx,.bvh,.biovision,.ac,.acc,.ac3d,.mesh,.xml,.osg,.osgt,.osgb,.osg2,.txp,.ive,.logo,.lwo,.lws,.ma,.mb,.abc,.hpb,.scn,.irr,.irrmesh,.q3o,.q3s" />
        </div>
      </div>
      <el-divider />
      
      <!-- 模型上传信息填写弹窗 -->
      <ModelUploadDialog 
        v-model:visible="uploadDialogVisible"
        :file-name="fileName"
        @confirm="handleUploadConfirm"
      />
      
      <!-- 表格区 -->
  <el-table :data="pagedTableData" class="model-table" border>
  <el-table-column prop="id" label="ID" width="60" align="center" header-align="center" />
  <el-table-column prop="name" label="名称" width="120" align="center" header-align="center" />
  <el-table-column prop="category" label="类别" width="80" align="center" header-align="center" />
  <el-table-column prop="area" label="区域" width="80" align="center" header-align="center" />
  <el-table-column prop="address" label="主址" width="120" align="center" header-align="center" />
  <el-table-column prop="quantity" label="数量" width="60" align="center" header-align="center" />
  <el-table-column prop="imagePath" label="图片路径" min-width="150" align="center" header-align="center" />
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
          :total="total"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { modelAPI } from '../api/index.js';
import ModelUploadDialog from '../components/ModelUploadDialog.vue';

const fileInput = ref(null);
const triggerFileInput = () => {
  // 确保先重置状态再触发点击
  if (fileInput.value) {
    fileInput.value.value = null;
    fileInput.value.click();
  }
};

// 控制弹窗显示
const uploadDialogVisible = ref(false);
const selectedFile = ref(null);
const fileName = ref('');

// 名称筛选
const filterName = ref("");

// 上传模型文件事件
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = file.name;
    // 显示信息填写弹窗
    uploadDialogVisible.value = true;
    // 重置文件输入元素值，允许重复选择相同文件
    event.target.value = null;
  }
};

// 处理弹窗确认事件
const handleUploadConfirm = async (modelInfo) => {
  if (!selectedFile.value) return;
  
  // 创建FormData对象用于文件上传
  const formData = new FormData();
  formData.append('modelFile', selectedFile.value);
  formData.append('name', modelInfo.name);
  formData.append('category', modelInfo.category);
  formData.append('area', modelInfo.area);
  formData.append('address', modelInfo.address);
  formData.append('quantity', modelInfo.quantity);
  formData.append('imagePath', modelInfo.imagePath);
  formData.append('renderPath', modelInfo.renderPath);
  formData.append('modelPath', modelInfo.modelPath);
  formData.append('remark', modelInfo.remark);
  
  try {
    // 调用后端API上传文件
    const response = await modelAPI.createModel(formData);
    console.log('文件上传成功:', response.data);
    ElMessage.success(`文件上传成功: ${selectedFile.value.name}`);
    
    // 重新加载数据
    fetchData();
    
    // 上传成功后重置状态
    resetUploadState();
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error(`文件上传失败: ${error.message}`);
    // 上传失败也重置状态
    resetUploadState();
  }
};

// 添加重置上传状态的方法
const resetUploadState = () => {
  uploadDialogVisible.value = false;
  selectedFile.value = null;
  fileName.value = '';
  // 重置文件输入元素
  if (fileInput.value) {
    fileInput.value.value = null;
  }
};
const router = useRouter();
const filterType = ref('all');

const pageSize = 10;
const currentPage = ref(1);
const total = ref(0);

// 从后端获取数据
const tableData = ref([]);

const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize
    };
    
    if (filterName.value) {
      params.name = filterName.value;
    }
    
    if (filterType.value !== 'all') {
      params.type = filterType.value;
    }
    
    const response = await modelAPI.getModels(params);
    tableData.value = response.data;
    
    // 获取总数用于分页
    const countResponse = await modelAPI.getModelCount({
      name: filterName.value,
      type: filterType.value !== 'all' ? filterType.value : undefined
    });
    total.value = countResponse.data.total;
  } catch (error) {
    console.error('获取模型数据失败:', error);
  }
};

const filteredTableData = computed(() => {
  return tableData.value;
});

// 当筛选条件变化时，自动跳转回第一页
import { watch } from 'vue';
watch([filterType, filterName], () => {
  currentPage.value = 1;
  fetchData();
});

const pagedTableData = computed(() => {
  return filteredTableData.value;
});

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});

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