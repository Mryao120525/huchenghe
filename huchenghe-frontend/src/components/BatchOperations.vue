<template>
  <div class="batch-operations">
    <!-- 批量操作工具栏 -->
    <div v-if="selectedItems.length > 0" class="batch-toolbar">
      <div class="batch-info">
        <el-icon><Select /></el-icon>
        <span>已选择 {{ selectedItems.length }} 项</span>
      </div>
      
      <div class="batch-actions">
        <el-button 
          type="danger" 
          size="small" 
          @click="handleBatchDelete"
          :loading="isDeleting"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        
        <el-button 
          type="success" 
          size="small" 
          @click="handleBatchExport"
          :loading="isExporting"
        >
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        
        <el-button 
          type="primary" 
          size="small" 
          @click="handleBatchDownload"
          :loading="isDownloading"
        >
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
        
        <el-button 
          size="small" 
          @click="clearSelection"
        >
          <el-icon><Close /></el-icon>
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 批量删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认批量删除"
      width="400px"
    >
      <div class="delete-confirm">
        <el-icon class="warning-icon" color="#E6A23C"><Warning /></el-icon>
        <p>确定要删除选中的 {{ selectedItems.length }} 个模型吗？</p>
        <p class="warning-text">此操作不可恢复！</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button 
            type="danger" 
            @click="confirmBatchDelete"
            :loading="isDeleting"
          >
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出选项对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出选项"
      width="500px"
    >
      <el-form :model="exportOptions" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportOptions.format">
            <el-radio label="excel">Excel (.xlsx)</el-radio>
            <el-radio label="csv">CSV (.csv)</el-radio>
            <el-radio label="json">JSON (.json)</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="导出字段">
          <el-checkbox-group v-model="exportOptions.fields">
            <el-checkbox label="id">ID</el-checkbox>
            <el-checkbox label="name">模型名称</el-checkbox>
            <el-checkbox label="category">类别</el-checkbox>
            <el-checkbox label="area">区域</el-checkbox>
            <el-checkbox label="address">主址</el-checkbox>
            <el-checkbox label="quantity">数量</el-checkbox>
            <el-checkbox label="create_time">创建时间</el-checkbox>
            <el-checkbox label="remark">备注</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="文件名">
          <el-input 
            v-model="exportOptions.filename" 
            placeholder="请输入导出文件名"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmBatchExport"
            :loading="isExporting"
          >
            开始导出
          </el-button>
        </span>
      </template>
         </el-dialog>

     <!-- 下载选项对话框 -->
     <el-dialog
       v-model="downloadDialogVisible"
       title="下载选项"
       width="500px"
     >
       <el-form :model="downloadOptions" label-width="100px">
         <el-form-item label="下载方式">
           <el-radio-group v-model="downloadOptions.method">
             <el-radio label="individual">单独下载</el-radio>
             <el-radio label="zip">打包下载</el-radio>
           </el-radio-group>
         </el-form-item>
         
         <el-form-item label="文件类型">
           <el-checkbox-group v-model="downloadOptions.fileTypes">
             <el-checkbox label="model">模型文件</el-checkbox>
             <el-checkbox label="image">图片文件</el-checkbox>
             <el-checkbox label="render">渲染图</el-checkbox>
           </el-checkbox-group>
         </el-form-item>
         
         <el-form-item v-if="downloadOptions.method === 'zip'" label="ZIP文件名">
           <el-input 
             v-model="downloadOptions.zipName" 
             placeholder="请输入ZIP文件名"
           />
         </el-form-item>
         
         <el-form-item label="文件命名">
           <el-radio-group v-model="downloadOptions.naming">
             <el-radio label="original">使用原名</el-radio>
             <el-radio label="prefix">添加前缀</el-radio>
             <el-radio label="suffix">添加后缀</el-radio>
           </el-radio-group>
         </el-form-item>
         
         <el-form-item v-if="downloadOptions.naming === 'prefix'" label="前缀">
           <el-input v-model="downloadOptions.prefix" placeholder="请输入前缀" />
         </el-form-item>
         
         <el-form-item v-if="downloadOptions.naming === 'suffix'" label="后缀">
           <el-input v-model="downloadOptions.suffix" placeholder="请输入后缀" />
         </el-form-item>
       </el-form>
       
       <template #footer>
         <span class="dialog-footer">
           <el-button @click="downloadDialogVisible = false">取消</el-button>
           <el-button 
             type="primary" 
             @click="confirmBatchDownload"
             :loading="isDownloading"
           >
             开始下载
           </el-button>
         </span>
       </template>
     </el-dialog>
   </div>
 </template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Select, Delete, Download, Close, Warning } from '@element-plus/icons-vue';

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['batch-delete', 'batch-export', 'batch-download', 'clear-selection']);

// 响应式数据
const deleteDialogVisible = ref(false);
const exportDialogVisible = ref(false);
const downloadDialogVisible = ref(false);
const isDeleting = ref(false);
const isExporting = ref(false);
const isDownloading = ref(false);

// 导出选项
const exportOptions = reactive({
  format: 'excel',
  fields: ['id', 'name', 'category', 'area', 'address', 'quantity', 'create_time'],
  filename: `模型数据_${new Date().toISOString().slice(0, 10)}`
});

// 下载选项
const downloadOptions = reactive({
  method: 'individual',
  fileTypes: ['model'],
  zipName: `模型文件_${new Date().toISOString().slice(0, 10)}.zip`,
  naming: 'original',
  prefix: '',
  suffix: ''
});

// 批量删除
const handleBatchDelete = () => {
  if (props.selectedItems.length === 0) {
    ElMessage.warning('请先选择要删除的项目');
    return;
  }
  deleteDialogVisible.value = true;
};

// 确认批量删除
const confirmBatchDelete = async () => {
  isDeleting.value = true;
  try {
    await emit('batch-delete', props.selectedItems);
    deleteDialogVisible.value = false;
    ElMessage.success('批量删除成功');
  } catch (error) {
    ElMessage.error('批量删除失败: ' + error.message);
  } finally {
    isDeleting.value = false;
  }
};

// 批量导出
const handleBatchExport = () => {
  if (props.selectedItems.length === 0) {
    ElMessage.warning('请先选择要导出的项目');
    return;
  }
  exportDialogVisible.value = true;
};

// 确认批量导出
const confirmBatchExport = async () => {
  isExporting.value = true;
  try {
    await emit('batch-export', {
      items: props.selectedItems,
      options: { ...exportOptions }
    });
    exportDialogVisible.value = false;
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  } finally {
    isExporting.value = false;
  }
};

// 批量下载
const handleBatchDownload = () => {
  if (props.selectedItems.length === 0) {
    ElMessage.warning('请先选择要下载的项目');
    return;
  }
  downloadDialogVisible.value = true;
};

// 确认批量下载
const confirmBatchDownload = async () => {
  isDownloading.value = true;
  try {
    await emit('batch-download', {
      items: props.selectedItems,
      options: { ...downloadOptions }
    });
    downloadDialogVisible.value = false;
    ElMessage.success('下载成功');
  } catch (error) {
    ElMessage.error('下载失败: ' + error.message);
  } finally {
    isDownloading.value = false;
  }
};

// 清除选择
const clearSelection = () => {
  emit('clear-selection');
};
</script>

<style scoped>
.batch-operations {
  width: 100%;
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.delete-confirm {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-text {
  color: #f56c6c;
  font-weight: 500;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-toolbar {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .batch-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
