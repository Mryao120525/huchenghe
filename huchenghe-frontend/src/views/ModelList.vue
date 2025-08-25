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
      <div class="filter-bar hc-panel" style="padding:16px 20px;">
        <span style="margin-right: 4px;">模型名称：</span>
        <el-input v-model="filterName" placeholder="名称" class="filter-item" style="width: 120px;" clearable />
        <span style="margin-right: 4px;">类别：</span>
        <el-select v-model="filterType" placeholder="类别" class="filter-item filter-type" style="width: 120px;">
          <el-option label="全部" value="all" />
          <el-option label="石刻" value="石刻" />
          <el-option label="石碑" value="石碑" />
          <el-option label="雕塑" value="雕塑" />
          <el-option label="造像" value="造像" />
          <el-option label="其他" value="其他" />
        </el-select>
        <span style="margin-right: 4px;">主址：</span>
        <el-select v-model="filterMainSite" placeholder="主址" class="filter-item" style="width: 120px;">
          <el-option v-for="site in mainSites" :key="site" :label="site === 'all' ? '全部' : site" :value="site" />
        </el-select>
        <span style="margin-right: 4px;">区域：</span>
        <el-select v-model="filterArea" placeholder="区域" class="filter-item" style="width: 120px;">
          <el-option v-for="area in areas" :key="area" :label="area === 'all' ? '全部' : area" :value="area" />
        </el-select>
        <div class="upload-btn" style="display: flex; align-items: center; gap: 8px;">
          <el-button type="success" @click="uploadDialogVisible = true">上传模型</el-button>
          <el-button type="warning" @click="batchUploadDialogVisible = true">批量上传</el-button>
        </div>
      </div>
      <el-divider />
      
      <!-- 批量操作工具栏 -->
      <BatchOperations
        :selected-items="selectedItems"
        @batch-delete="handleBatchDelete"
        @batch-export="handleBatchExport"
        @batch-download="handleBatchDownload"
        @clear-selection="clearSelection"
      />

      <!-- 模型上传信息填写弹窗 -->
      <ModelUploadDialog 
        v-model:visible="uploadDialogVisible"
        @confirm="handleUploadConfirm"
      />
      
      <!-- 批量上传对话框 -->
      <BatchUploadDialog
        v-model:visible="batchUploadDialogVisible"
        @batch-upload-complete="handleBatchUploadComplete"
      />
      
      <!-- 批量下载对话框 -->
      <BatchDownload
        v-model:visible="batchDownloadDialogVisible"
        @download-complete="handleDownloadComplete"
        @download-error="handleDownloadError"
      />
      
      <ModelEditDialog
        v-model:visible="editDialogVisible"
        :model="editingModel"
        @confirm="handleEditConfirm"
      />
      
      <!-- 表格区 -->
  <el-table 
    ref="tableRef"
    :data="pagedTableData" 
    class="model-table hc-panel" 
    border 
    stripe 
    highlight-current-row
    @selection-change="handleSelectionChange"
  >
  <el-table-column type="selection" width="55" align="center" />
  <el-table-column prop="id" label="ID" width="60" align="center" header-align="center" />
  <el-table-column prop="name" label="名称" width="120" align="center" header-align="center" />
  <el-table-column prop="category" label="类别" width="80" align="center" header-align="center" />
  <el-table-column prop="area" label="区域" width="80" align="center" header-align="center" />
  <el-table-column prop="address" label="主址" width="120" align="center" header-align="center" />
  <el-table-column prop="quantity" label="数量" width="60" align="center" header-align="center" />
  <el-table-column prop="image_path" label="图片路径" min-width="150" align="center" header-align="center" />
  <el-table-column prop="render_path" label="渲染图路径" min-width="150" align="center" header-align="center" />
  <el-table-column prop="model_path" label="模型文件路径" min-width="180" align="center" header-align="center" />
  <el-table-column prop="create_time" label="创建时间" width="160" align="center" header-align="center" :formatter="formatDate" />
  <el-table-column prop="update_time" label="更新时间" width="160" align="center" header-align="center" :formatter="formatDate" />
  <el-table-column label="操作" width="200" align="center" header-align="center">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.$index, scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
import ModelEditDialog from '../components/ModelEditDialog.vue';
import BatchUploadDialog from '../components/BatchUploadDialog.vue';
import BatchOperations from '../components/BatchOperations.vue';
import BatchDownload from '../components/BatchDownload.vue';
import { exportData } from '../utils/exportUtils';
import { batchDownload, downloadAsZip, generateDownloadFilename } from '../utils/downloadUtils';

// 控制弹窗显示
const uploadDialogVisible = ref(false);
const batchUploadDialogVisible = ref(false);
const batchDownloadDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editingModel = ref(null);

// 批量操作相关
const selectedItems = ref([]);

// 名称筛选
const filterName = ref("");
const filterMainSite = ref("all"); // 默认为 'all'
const filterArea = ref("all");     // 默认为 'all'

const mainSites = ref([]); // 存储主址列表
const areas = ref([]);     // 存储区域列表

// 处理弹窗确认事件
const handleUploadConfirm = async (modelInfo) => {
  if (!modelInfo.file) {
    ElMessage.error('请先选择要上传的模型文件');
    return;
  }
  
  // 创建FormData对象用于文件上传
  const formData = new FormData();
  formData.append('modelFile', modelInfo.file);
  formData.append('name', modelInfo.name);
  formData.append('category', modelInfo.category);
  formData.append('area', modelInfo.area);
  formData.append('address', modelInfo.address);
  formData.append('quantity', modelInfo.quantity);
  
  // 设置默认路径
  const defaultImagePath = `/images/${modelInfo.name}.jpg`;
  const defaultRenderPath = `/renders/${modelInfo.name}.png`;
  const defaultModelPath = `/models/${modelInfo.fileName}`;
  
  formData.append('image_path', defaultImagePath);
  formData.append('render_path', defaultRenderPath);
  formData.append('model_path', defaultModelPath);
  formData.append('remark', modelInfo.remark);
  
  try {
    // 调用后端API上传文件
    const response = await modelAPI.createModel(formData);
    console.log('文件上传成功:', response.data);
    ElMessage.success(`文件上传成功: ${modelInfo.fileName}`);
    
    // 将新建记录直接插入表格数据，提升即时反馈
    if (response.data && response.data.model) {
      tableData.value = [response.data.model, ...tableData.value];
      total.value = (total.value || 0) + 1;
    } else {
      // 回退：重新拉取列表
      fetchData();
    }
    
    // 上传成功后重置状态
    resetUploadState();
  } catch (error) {
    console.error('文件上传失败:', error);
    // 处理不同的错误响应格式
    let errorMessage = '文件上传失败';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    ElMessage.error(`文件上传失败: ${errorMessage}`);
    // 上传失败也重置状态
    resetUploadState();
  }
};

// 添加重置上传状态的方法
const resetUploadState = () => {
  uploadDialogVisible.value = false;
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection;
};

// 清除选择
const clearSelection = () => {
  selectedItems.value = [];
  // 清除表格选择状态
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
};

// 批量删除
const handleBatchDelete = async (items) => {
  try {
    const ids = items.map(item => item.id);
    await Promise.all(ids.map(id => modelAPI.deleteModel(id)));
    
    ElMessage.success(`成功删除 ${items.length} 个模型`);
    
    // 重新获取数据
    await fetchData();
    
    // 清除选择
    clearSelection();
  } catch (error) {
    console.error('批量删除失败:', error);
    ElMessage.error('批量删除失败: ' + error.message);
  }
};

// 批量导出
const handleBatchExport = async (exportInfo) => {
  try {
    const { items, options } = exportInfo;
    await exportData(items, options);
  } catch (error) {
    console.error('批量导出失败:', error);
    ElMessage.error('批量导出失败: ' + error.message);
  }
};

// 批量下载
const handleBatchDownload = async (downloadInfo) => {
  try {
    const { items, options } = downloadInfo;
    
    // 准备下载文件列表
    const downloadFiles = [];
    
    items.forEach(item => {
      // 根据选择的文件类型添加文件
      if (options.fileTypes.includes('model') && item.model_path) {
        downloadFiles.push({
          url: item.model_path,
          filename: generateDownloadFilename(
            item.model_path.split('/').pop() || `${item.name}.fbx`,
            options.naming === 'prefix' ? options.prefix : '',
            options.naming === 'suffix' ? options.suffix : ''
          ),
          size: 0 // 实际应用中应该从服务器获取文件大小
        });
      }
      
      if (options.fileTypes.includes('image') && item.image_path) {
        downloadFiles.push({
          url: item.image_path,
          filename: generateDownloadFilename(
            item.image_path.split('/').pop() || `${item.name}.jpg`,
            options.naming === 'prefix' ? options.prefix : '',
            options.naming === 'suffix' ? options.suffix : ''
          ),
          size: 0
        });
      }
      
      if (options.fileTypes.includes('render') && item.render_path) {
        downloadFiles.push({
          url: item.render_path,
          filename: generateDownloadFilename(
            item.render_path.split('/').pop() || `${item.name}_render.png`,
            options.naming === 'prefix' ? options.prefix : '',
            options.naming === 'suffix' ? options.suffix : ''
          ),
          size: 0
        });
      }
    });
    
    if (downloadFiles.length === 0) {
      ElMessage.warning('没有找到可下载的文件');
      return;
    }
    
    // 根据下载方式执行下载
    if (options.method === 'zip') {
      // 打包下载
      await downloadAsZip(downloadFiles, options.zipName);
      ElMessage.success('ZIP文件下载完成');
    } else {
      // 单独下载
      batchDownloadDialogVisible.value = true;
      // 这里可以调用实际的批量下载逻辑
      // 目前只是显示对话框
    }
  } catch (error) {
    console.error('批量下载失败:', error);
    ElMessage.error('批量下载失败: ' + error.message);
  }
};

// 处理下载完成
const handleDownloadComplete = (files) => {
  ElMessage.success(`成功下载 ${files.length} 个文件`);
  batchDownloadDialogVisible.value = false;
};

// 处理下载错误
const handleDownloadError = (error) => {
  ElMessage.error('下载失败: ' + error.message);
  batchDownloadDialogVisible.value = false;
};

// 批量上传完成
const handleBatchUploadComplete = async (files) => {
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        // 创建FormData对象用于文件上传
        const formData = new FormData();
        formData.append('modelFile', file.file);
        formData.append('name', file.modelName);
        formData.append('category', file.category);
        formData.append('area', file.area);
        formData.append('address', file.address);
        formData.append('quantity', file.quantity);
        
        // 设置默认路径
        const defaultImagePath = `/images/${file.modelName}.jpg`;
        const defaultRenderPath = `/renders/${file.modelName}.png`;
        const defaultModelPath = `/models/${file.name}`;
        
        formData.append('image_path', defaultImagePath);
        formData.append('render_path', defaultRenderPath);
        formData.append('model_path', defaultModelPath);
        formData.append('remark', file.remark);
        
        // 调用后端API上传文件
        const response = await modelAPI.createModel(formData);
        successCount++;
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error);
        errorCount++;
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`批量上传完成：成功 ${successCount} 个，失败 ${errorCount} 个`);
      // 重新获取数据
      await fetchData();
    } else {
      ElMessage.error('批量上传失败');
    }
  } catch (error) {
    console.error('批量上传失败:', error);
    ElMessage.error('批量上传失败: ' + error.message);
  }
};
const router = useRouter();
const tableRef = ref(null);
const filterType = ref('all');

const pageSize = 10;
const currentPage = ref(1);
const total = ref(0);

// 从后端获取数据
const tableData = ref([]);

const fetchData = async () => {
  try {
    // 1. 获取所有模型数据（不带分页和筛选），用于提取主址和区域列表
    // 假设 modelAPI.getModels() 在不带参数时返回所有模型数据
    // 1. 获取所有模型数据（不带分页和筛选），用于提取主址和区域列表
    // 假设 modelAPI.getModels() 在不带参数时返回所有模型数据
    // 为了避免重复调用，可以在组件挂载时只调用一次，或者在数据更新后重新提取
    // 这里为了确保下拉列表始终是最新的，每次 fetchData 都重新获取
    const allModelsResponse = await modelAPI.getModels();
    const allModels = allModelsResponse.data || [];
    mainSites.value = extractUniqueValues(allModels, 'address');
    areas.value = extractUniqueValues(allModels, 'area');

    // 2. 根据当前筛选和分页参数获取实际显示的模型数据
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

    if (filterMainSite.value !== 'all') {
      params.mainSite = filterMainSite.value;
    }

    if (filterArea.value !== 'all') {
      params.area = filterArea.value;
    }
    
    const response = await modelAPI.getModels(params);
    tableData.value = response.data;
    
    // 获取总数用于分页
    const countResponse = await modelAPI.getModelCount({
      name: filterName.value,
      type: filterType.value !== 'all' ? filterType.value : undefined,
      mainSite: filterMainSite.value !== 'all' ? filterMainSite.value : undefined,
      area: filterArea.value !== 'all' ? filterArea.value : undefined
    });
    total.value = countResponse.data.total;
  } catch (error) {
    console.error('获取模型数据失败:', error);
  }
};

// 提取唯一值函数
const extractUniqueValues = (data, key) => {
  const values = new Set();
  data.forEach(item => {
    if (item[key]) {
      values.add(item[key]);
    }
  });
  return ['all', ...Array.from(values)]; // 添加 '全部' 选项
};

const filteredTableData = computed(() => {
  return tableData.value;
});

// 当筛选条件变化时，自动跳转回第一页
import { watch } from 'vue';
watch([filterType, filterName, filterMainSite, filterArea], () => {
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

// 轻量时间格式化（yyyy-MM-dd HH:mm）
const formatDate = (row, column, cellValue) => {
  const v = cellValue || row[column.property];
  if (!v) return '';
  try {
    // 支持 Date 或 ISO 字符串
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return v;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return v;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});

// 查看详情的点击事件，会跳转到对应的模型详情页
const handleView = (index, row) => {
  router.push(`/model/${row.id}`);
};

// 打开编辑
const openEdit = (row) => {
  editingModel.value = { ...row };
  editDialogVisible.value = true;
};

// 编辑确认
const handleEditConfirm = async (data) => {
  try {
    await modelAPI.updateModel(data.id, data);
    ElMessage.success('更新成功');
    fetchData();
  } catch (e) {
    ElMessage.error('更新失败');
  }
};

// 删除
const handleDelete = async (row) => {
  try {
    await modelAPI.deleteModel(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e) {
    ElMessage.error('删除失败');
  }
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