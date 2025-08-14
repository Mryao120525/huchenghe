<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量上传模型"
    width="800px"
    :before-close="handleClose"
  >
    <!-- 拖拽上传区域 -->
    <div class="upload-section">
      <h4>选择模型文件</h4>
      <DragUpload
        ref="dragUploadRef"
        :max-files="20"
        :max-file-size="500 * 1024 * 1024"
        @files-selected="handleFilesSelected"
        @upload-complete="handleUploadComplete"
        @upload-error="handleUploadError"
      />
    </div>

    <!-- 批量设置区域 -->
    <div class="batch-settings">
      <h4>批量设置</h4>
      <el-form :model="batchSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认类别">
              <el-select v-model="batchSettings.defaultCategory" placeholder="请选择默认类别" style="width: 100%">
                <el-option label="石刻" value="石刻" />
                <el-option label="石碑" value="石碑" />
                <el-option label="雕塑" value="雕塑" />
                <el-option label="造像" value="造像" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认区域">
              <el-input v-model="batchSettings.defaultArea" placeholder="如：A区、B区" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认主址">
              <el-input v-model="batchSettings.defaultAddress" placeholder="如：一楼展厅" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认数量">
              <el-input-number v-model="batchSettings.defaultQuantity" :min="1" :max="9999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="命名规则">
          <el-radio-group v-model="batchSettings.namingRule">
            <el-radio label="filename">使用文件名</el-radio>
            <el-radio label="prefix">添加前缀</el-radio>
            <el-radio label="suffix">添加后缀</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="batchSettings.namingRule === 'prefix'" label="前缀">
          <el-input v-model="batchSettings.prefix" placeholder="请输入前缀" />
        </el-form-item>
        
        <el-form-item v-if="batchSettings.namingRule === 'suffix'" label="后缀">
          <el-input v-model="batchSettings.suffix" placeholder="请输入后缀" />
        </el-form-item>
        
        <el-form-item label="默认备注">
          <el-input v-model="batchSettings.defaultRemark" type="textarea" :rows="2" placeholder="请输入默认备注信息" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 文件预览区域 -->
    <div v-if="fileList.length > 0" class="file-preview">
      <h4>文件预览 ({{ fileList.length }} 个文件)</h4>
      <el-table :data="fileList" style="width: 100%" max-height="300">
        <el-table-column prop="name" label="文件名" width="200" />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="scope">
            {{ formatFileSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="模型名称" width="150">
          <template #default="scope">
            <el-input 
              v-model="scope.row.modelName" 
              size="small" 
              placeholder="模型名称"
            />
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="100">
          <template #default="scope">
            <el-select v-model="scope.row.category" size="small" style="width: 100%">
              <el-option label="石刻" value="石刻" />
              <el-option label="石碑" value="石碑" />
              <el-option label="雕塑" value="雕塑" />
              <el-option label="造像" value="造像" />
              <el-option label="其他" value="其他" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="区域" width="100">
          <template #default="scope">
            <el-input v-model="scope.row.area" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="address" label="主址" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.address" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" size="small" :min="1" :max="9999" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注">
          <template #default="scope">
            <el-input v-model="scope.row.remark" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleBatchUpload"
          :loading="isUploading"
          :disabled="fileList.length === 0"
        >
          开始批量上传
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import DragUpload from './DragUpload.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'batch-upload-complete']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

const dragUploadRef = ref();
const isUploading = ref(false);
const fileList = ref([]);

// 批量设置
const batchSettings = reactive({
  defaultCategory: '其他',
  defaultArea: '',
  defaultAddress: '',
  defaultQuantity: 1,
  namingRule: 'filename',
  prefix: '',
  suffix: '',
  defaultRemark: ''
});

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 生成模型名称
const generateModelName = (fileName) => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  switch (batchSettings.namingRule) {
    case 'filename':
      return nameWithoutExt;
    case 'prefix':
      return batchSettings.prefix + nameWithoutExt;
    case 'suffix':
      return nameWithoutExt + batchSettings.suffix;
    case 'custom':
      return nameWithoutExt;
    default:
      return nameWithoutExt;
  }
};

// 处理文件选择
const handleFilesSelected = (files) => {
  fileList.value = files.map(file => ({
    file: file.file,
    name: file.name,
    size: file.size,
    modelName: generateModelName(file.name),
    category: batchSettings.defaultCategory,
    area: batchSettings.defaultArea,
    address: batchSettings.defaultAddress,
    quantity: batchSettings.defaultQuantity,
    remark: batchSettings.defaultRemark
  }));
};

// 处理上传完成
const handleUploadComplete = (files) => {
  ElMessage.success('文件选择完成');
};

// 处理上传错误
const handleUploadError = (error) => {
  ElMessage.error('文件处理失败: ' + error.message);
};

// 监听批量设置变化，更新文件列表
watch(batchSettings, () => {
  fileList.value.forEach(file => {
    if (batchSettings.namingRule !== 'custom') {
      file.modelName = generateModelName(file.name);
    }
    if (!file.category || file.category === '其他') {
      file.category = batchSettings.defaultCategory;
    }
    if (!file.area) {
      file.area = batchSettings.defaultArea;
    }
    if (!file.address) {
      file.address = batchSettings.defaultAddress;
    }
    if (!file.quantity || file.quantity === 1) {
      file.quantity = batchSettings.defaultQuantity;
    }
    if (!file.remark) {
      file.remark = batchSettings.defaultRemark;
    }
  });
}, { deep: true });

// 关闭对话框
const handleClose = () => {
  if (dragUploadRef.value) {
    dragUploadRef.value.clearFiles();
  }
  fileList.value = [];
  emit('update:visible', false);
};

// 批量上传
const handleBatchUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  isUploading.value = true;
  
  try {
    // 验证所有文件都有必要的字段
    const invalidFiles = fileList.value.filter(file => 
      !file.modelName || !file.category || !file.area || !file.address
    );
    
    if (invalidFiles.length > 0) {
      ElMessage.error('请完善所有文件的必要信息');
      return;
    }

    // 模拟上传进度
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i];
      
      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        file.progress = progress;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      file.status = 'success';
    }

    // 调用批量上传回调
    await emit('batch-upload-complete', fileList.value);
    handleClose();
  } catch (error) {
    ElMessage.error('批量上传失败: ' + error.message);
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.upload-section,
.batch-settings,
.file-preview {
  margin-bottom: 24px;
}

.upload-section h4,
.batch-settings h4,
.file-preview h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.batch-settings {
  border-top: 1px solid #e4e7ed;
  padding-top: 24px;
}

.file-preview {
  border-top: 1px solid #e4e7ed;
  padding-top: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
