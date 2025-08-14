<!--
StorageManagement.vue
存储空间管理页面，提供存储空间监控、文件管理、空间清理等功能。

## 功能描述
该页面用于管理系统存储空间，包括：
1. 存储空间概览：显示总空间、已用空间、可用空间
2. 文件类型统计：按文件类型统计存储使用情况
3. 文件管理：查看、搜索、删除文件
4. 空间清理：清理临时文件、重复文件、过期文件
5. 存储设置：配置存储路径、清理策略等

## 页面结构
1. 存储空间概览卡片
2. 文件类型统计图表
3. 文件管理表格
4. 空间清理工具
5. 存储设置面板
-->

<template>
  <el-container class="storage-management-container">
    <el-header class="header-title">
      <span>存储空间管理</span>
    </el-header>
    
    <el-main>
      <!-- 存储空间概览 -->
      <div class="storage-overview hc-panel">
        <div class="panel-header">
          <h3>存储空间概览</h3>
          <el-button type="primary" size="small" @click="refreshStorageInfo">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="storage-cards">
          <el-card class="storage-card">
            <div class="card-content">
              <div class="card-icon total">
                <el-icon><Folder /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">总存储空间</div>
                <div class="card-value">{{ formatFileSize(storageInfo.totalSpace) }}</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="storage-card">
            <div class="card-content">
              <div class="card-icon used">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">已用空间</div>
                <div class="card-value">{{ formatFileSize(storageInfo.usedSpace) }}</div>
                <div class="card-percentage">{{ storageInfo.usagePercentage }}%</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="storage-card">
            <div class="card-content">
              <div class="card-icon available">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">可用空间</div>
                <div class="card-value">{{ formatFileSize(storageInfo.availableSpace) }}</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="storage-card">
            <div class="card-content">
              <div class="card-icon files">
                <el-icon><Files /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">文件总数</div>
                <div class="card-value">{{ storageInfo.totalFiles }}</div>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 存储空间进度条 -->
        <div class="storage-progress">
          <div class="progress-header">
            <span>存储空间使用情况</span>
            <span>{{ storageInfo.usagePercentage }}%</span>
          </div>
          <el-progress 
            :percentage="storageInfo.usagePercentage" 
            :color="getProgressColor(storageInfo.usagePercentage)"
            :stroke-width="12"
          />
        </div>
      </div>
      
      <!-- 文件管理 -->
      <div class="file-management hc-panel">
        <div class="panel-header">
          <h3>文件管理</h3>
          <div class="header-actions">
            <el-input
              v-model="fileSearchKeyword"
              placeholder="搜索文件名"
              style="width: 200px; margin-right: 10px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="fileTypeFilter" placeholder="文件类型" style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="all" />
              <el-option label="模型文件" value="model" />
              <el-option label="图片文件" value="image" />
              <el-option label="文档文件" value="document" />
              <el-option label="其他文件" value="other" />
            </el-select>
            <el-button type="danger" size="small" @click="handleBatchDeleteFiles">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>
        </div>
        
        <el-table
          :data="filteredFiles"
          style="width: 100%"
          @selection-change="handleFileSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="file-name">
                <el-icon class="file-icon">
                  <Document v-if="row.type === 'document'" />
                  <Picture v-else-if="row.type === 'image'" />
                  <Box v-else-if="row.type === 'model'" />
                  <Document v-else />
                </el-icon>
                {{ row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getFileTypeTag(row.type)">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路径" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleDownloadFile(row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteFile(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalFiles"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      
      <!-- 空间清理 -->
      <div class="storage-cleanup hc-panel">
        <div class="panel-header">
          <h3>空间清理</h3>
          <el-button type="warning" size="small" @click="handleQuickCleanup">
            <el-icon><Delete /></el-icon>
            快速清理
          </el-button>
        </div>
        
        <div class="cleanup-options">
          <el-card class="cleanup-option">
            <div class="option-header">
              <el-checkbox v-model="cleanupOptions.tempFiles">清理临时文件</el-checkbox>
              <el-tag type="warning">{{ cleanupStats.tempFiles }} 个文件</el-tag>
            </div>
            <div class="option-description">
              清理系统生成的临时文件和缓存文件
            </div>
            <div class="option-size">预计释放: {{ formatFileSize(cleanupStats.tempFilesSize) }}</div>
          </el-card>
          
          <el-card class="cleanup-option">
            <div class="option-header">
              <el-checkbox v-model="cleanupOptions.duplicateFiles">清理重复文件</el-checkbox>
              <el-tag type="danger">{{ cleanupStats.duplicateFiles }} 个文件</el-tag>
            </div>
            <div class="option-description">
              清理内容相同但文件名不同的重复文件
            </div>
            <div class="option-size">预计释放: {{ formatFileSize(cleanupStats.duplicateFilesSize) }}</div>
          </el-card>
          
          <el-card class="cleanup-option">
            <div class="option-header">
              <el-checkbox v-model="cleanupOptions.oldFiles">清理过期文件</el-checkbox>
              <el-tag type="info">{{ cleanupStats.oldFiles }} 个文件</el-tag>
            </div>
            <div class="option-description">
              清理超过指定时间的旧文件
            </div>
            <div class="option-size">预计释放: {{ formatFileSize(cleanupStats.oldFilesSize) }}</div>
          </el-card>
          
          <el-card class="cleanup-option">
            <div class="option-header">
              <el-checkbox v-model="cleanupOptions.emptyFolders">清理空文件夹</el-checkbox>
              <el-tag type="success">{{ cleanupStats.emptyFolders }} 个文件夹</el-tag>
            </div>
            <div class="option-description">
              清理不包含任何文件的空文件夹
            </div>
            <div class="option-size">预计释放: {{ formatFileSize(cleanupStats.emptyFoldersSize) }}</div>
          </el-card>
        </div>
        
        <div class="cleanup-actions">
          <el-button type="primary" @click="handleStartCleanup" :loading="isCleaning">
            <el-icon><Delete /></el-icon>
            开始清理
          </el-button>
          <el-button @click="handleScanCleanup">
            <el-icon><Search /></el-icon>
            重新扫描
          </el-button>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, Folder, Document, CircleCheck, Files, 
  Search, Delete, Download, Picture, Box 
} from '@element-plus/icons-vue';
import { 
  getStorageInfo, 
  getFileList, 
  deleteFile, 
  batchDeleteFiles, 
  downloadFile,
  scanCleanupFiles,
  executeCleanup,
  quickCleanup
} from '@/api/storageAPI';

// 存储空间信息
const storageInfo = reactive({
  totalSpace: 0,
  usedSpace: 0,
  availableSpace: 0,
  usagePercentage: 0,
  totalFiles: 0
});

// 文件管理
const fileSearchKeyword = ref('');
const fileTypeFilter = ref('all');
const currentPage = ref(1);
const pageSize = ref(20);
const totalFiles = ref(0);
const selectedFiles = ref([]);

// 文件列表
const files = ref([]);

// 清理选项
const cleanupOptions = reactive({
  tempFiles: true,
  duplicateFiles: false,
  oldFiles: false,
  emptyFolders: true
});

const cleanupStats = reactive({
  tempFiles: 0,
  tempFilesSize: 0,
  duplicateFiles: 0,
  duplicateFilesSize: 0,
  oldFiles: 0,
  oldFilesSize: 0,
  emptyFolders: 0,
  emptyFoldersSize: 0
});

const isCleaning = ref(false);

// 计算属性
const filteredFiles = computed(() => {
  let filtered = files.value;
  
  if (fileSearchKeyword.value) {
    filtered = filtered.filter(file => 
      file.name.toLowerCase().includes(fileSearchKeyword.value.toLowerCase())
    );
  }
  
  if (fileTypeFilter.value !== 'all') {
    filtered = filtered.filter(file => file.type === fileTypeFilter.value);
  }
  
  return filtered;
});

// 方法
const refreshStorageInfo = async () => {
  try {
    const response = await getStorageInfo();
    if (response.success) {
      Object.assign(storageInfo, response.data);
      ElMessage.success('存储信息已刷新');
    } else {
      ElMessage.error(response.message || '刷新存储信息失败');
    }
  } catch (error) {
    console.error('刷新存储信息失败:', error);
    ElMessage.error('刷新存储信息失败');
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN');
};

const getProgressColor = (percentage) => {
  if (percentage < 70) return '#67C23A';
  if (percentage < 90) return '#E6A23C';
  return '#F56C6C';
};

const getFileTypeTag = (type) => {
  const tagMap = {
    model: 'primary',
    image: 'success',
    document: 'warning',
    other: 'info'
  };
  return tagMap[type] || 'info';
};

const handleFileSelectionChange = (selection) => {
  selectedFiles.value = selection;
};

const handleBatchDeleteFiles = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要删除的文件');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const filePaths = selectedFiles.value.map(file => file.path);
    const response = await batchDeleteFiles(filePaths);
    
    if (response.success) {
      ElMessage.success(response.message || `成功删除 ${response.data.totalDeleted} 个文件`);
      selectedFiles.value = [];
      await loadFiles();
    } else {
      ElMessage.error(response.message || '删除文件失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除文件失败:', error);
      ElMessage.error('删除文件失败');
    }
  }
};

const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await deleteFile(file.id, { filePath: file.path });
    
    if (response.success) {
      ElMessage.success('文件删除成功');
      await loadFiles();
    } else {
      ElMessage.error(response.message || '删除文件失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error);
      ElMessage.error('删除文件失败');
    }
  }
};

const handleDownloadFile = async (file) => {
  try {
    const response = await downloadFile(file.id, { filePath: file.path });
    // 处理文件下载
    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success(`开始下载文件: ${file.name}`);
  } catch (error) {
    console.error('下载文件失败:', error);
    ElMessage.error('下载文件失败');
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadFiles();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadFiles();
};

const handleQuickCleanup = async () => {
  try {
    await ElMessageBox.confirm(
      '快速清理将删除临时文件和空文件夹，确定继续吗？',
      '快速清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    isCleaning.value = true;
    const response = await quickCleanup();
    
    if (response.success) {
      ElMessage.success('快速清理完成');
      await refreshStorageInfo();
    } else {
      ElMessage.error(response.message || '清理失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('快速清理失败:', error);
      ElMessage.error('清理失败');
    }
  } finally {
    isCleaning.value = false;
  }
};

const handleStartCleanup = async () => {
  const selectedOptions = Object.entries(cleanupOptions)
    .filter(([key, value]) => value)
    .map(([key]) => key);
  
  if (selectedOptions.length === 0) {
    ElMessage.warning('请选择要清理的项目');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要开始清理选中的项目吗？此操作不可恢复。',
      '开始清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    isCleaning.value = true;
    const response = await executeCleanup(cleanupOptions);
    
    if (response.success) {
      ElMessage.success('清理完成');
      await refreshStorageInfo();
    } else {
      ElMessage.error(response.message || '清理失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理失败:', error);
      ElMessage.error('清理失败');
    }
  } finally {
    isCleaning.value = false;
  }
};

const handleScanCleanup = async () => {
  try {
    ElMessage.info('正在扫描可清理的文件...');
    const response = await scanCleanupFiles();
    
    if (response.success) {
      Object.assign(cleanupStats, response.data);
      ElMessage.success('扫描完成');
    } else {
      ElMessage.error(response.message || '扫描失败');
    }
  } catch (error) {
    console.error('扫描失败:', error);
    ElMessage.error('扫描失败');
  }
};

const loadFiles = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: fileSearchKeyword.value,
      type: fileTypeFilter.value
    };
    
    const response = await getFileList(params);
    if (response.success) {
      files.value = response.data.files;
      totalFiles.value = response.data.total;
    } else {
      ElMessage.error(response.message || '加载文件列表失败');
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
    ElMessage.error('加载文件列表失败');
  }
};

// 生命周期
onMounted(async () => {
  await Promise.all([
    refreshStorageInfo(),
    loadFiles(),
    handleScanCleanup()
  ]);
});
</script>

<style scoped>
.storage-management-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header-title {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.hc-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 存储空间概览 */
.storage-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.storage-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.card-icon.total { background-color: #409eff; }
.card-icon.used { background-color: #e6a23c; }
.card-icon.available { background-color: #67c23a; }
.card-icon.files { background-color: #909399; }

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.card-percentage {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.storage-progress {
  margin-top: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

/* 文件管理 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 空间清理 */
.cleanup-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.cleanup-option {
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.cleanup-option:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.option-description {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.option-size {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.cleanup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .storage-cards {
    grid-template-columns: 1fr;
  }
  
  .cleanup-options {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
