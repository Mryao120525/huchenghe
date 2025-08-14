<template>
  <div class="batch-download">
    <!-- 下载进度对话框 -->
    <el-dialog
      v-model="downloadDialogVisible"
      title="批量下载进度"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="!isDownloading"
    >
      <div class="download-progress">
        <div class="overall-progress">
          <div class="progress-header">
            <span>总体进度</span>
            <span>{{ completedCount }}/{{ totalCount }}</span>
          </div>
          <el-progress 
            :percentage="overallProgress" 
            :stroke-width="8"
            :show-text="false"
          />
          <div class="progress-text">{{ overallProgress }}%</div>
        </div>

        <div class="file-list">
          <div 
            v-for="(file, index) in downloadFiles" 
            :key="index"
            class="file-item"
          >
            <div class="file-info">
              <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
              </div>
              <div class="file-status">
                <span v-if="file.status === 'pending'" class="status-pending">等待下载</span>
                <span v-else-if="file.status === 'downloading'" class="status-downloading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  下载中...
                </span>
                <span v-else-if="file.status === 'success'" class="status-success">
                  <el-icon><CircleCheck /></el-icon>
                  下载完成
                </span>
                <span v-else-if="file.status === 'error'" class="status-error">
                  <el-icon><CircleClose /></el-icon>
                  下载失败
                </span>
              </div>
            </div>
            
            <!-- 单个文件进度条 -->
            <div v-if="file.status === 'downloading'" class="file-progress">
              <el-progress 
                :percentage="file.progress || 0" 
                :stroke-width="4"
                :show-text="false"
              />
              <div class="progress-text">{{ file.progress || 0 }}%</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button 
            v-if="!isDownloading" 
            @click="downloadDialogVisible = false"
          >
            关闭
          </el-button>
          <el-button 
            v-if="isDownloading" 
            type="danger" 
            @click="cancelDownload"
          >
            取消下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElIcon } from 'element-plus';
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  files: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'download-complete', 'download-error']);

const downloadDialogVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

const isDownloading = ref(false);
const downloadFiles = ref([]);
const totalCount = ref(0);
const completedCount = ref(0);

// 计算总体进度
const overallProgress = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 开始批量下载
const startBatchDownload = async (files) => {
  downloadFiles.value = files.map(file => ({
    ...file,
    status: 'pending',
    progress: 0
  }));
  
  totalCount.value = files.length;
  completedCount.value = 0;
  isDownloading.value = true;
  downloadDialogVisible.value = true;

  try {
    for (let i = 0; i < downloadFiles.value.length; i++) {
      const file = downloadFiles.value[i];
      file.status = 'downloading';
      
      // 模拟下载进度
      for (let progress = 0; progress <= 100; progress += 10) {
        if (!isDownloading.value) break; // 检查是否取消
        file.progress = progress;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (isDownloading.value) {
        file.status = 'success';
        completedCount.value++;
      }
    }
    
    if (isDownloading.value) {
      ElMessage.success(`成功下载 ${completedCount.value} 个文件`);
      emit('download-complete', downloadFiles.value);
    }
  } catch (error) {
    ElMessage.error('批量下载失败: ' + error.message);
    emit('download-error', error);
  } finally {
    isDownloading.value = false;
  }
};

// 取消下载
const cancelDownload = () => {
  isDownloading.value = false;
  ElMessage.info('下载已取消');
};

// 暴露方法给父组件
defineExpose({
  startBatchDownload
});
</script>

<style scoped>
.batch-download {
  width: 100%;
}

.download-progress {
  max-height: 400px;
  overflow-y: auto;
}

.overall-progress {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.progress-text {
  text-align: center;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background-color: #fff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  color: #409eff;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.status-pending {
  color: #909399;
}

.status-downloading {
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-success {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-error {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-progress {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-progress .progress-text {
  margin: 0;
  min-width: 40px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
