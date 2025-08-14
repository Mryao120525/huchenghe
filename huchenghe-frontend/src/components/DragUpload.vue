<template>
  <div class="drag-upload-container">
    <!-- 拖拽区域 -->
    <div
      ref="dropZone"
      class="drop-zone"
      :class="{ 
        'drag-over': isDragOver,
        'drag-enter': isDragEnter,
        'has-files': hasFiles
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <!-- 默认状态 -->
      <div v-if="!hasFiles" class="upload-placeholder">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L12 16M12 2L8 6M12 2L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="upload-text">
          <p class="primary-text">拖拽文件到此处或点击上传</p>
          <p class="secondary-text">支持 FBX、OBJ、STL、GLTF、GLB 等3D模型格式</p>
          <p class="file-size-limit">文件大小限制：500MB</p>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-else class="file-list">
        <div v-for="(file, index) in fileList" :key="index" class="file-item">
          <div class="file-info">
            <div class="file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <div class="file-status">
              <span v-if="file.status === 'pending'" class="status-pending">等待上传</span>
              <span v-else-if="file.status === 'uploading'" class="status-uploading">
                <el-icon class="is-loading"><Loading /></el-icon>
                上传中...
              </span>
              <span v-else-if="file.status === 'success'" class="status-success">
                <el-icon><CircleCheck /></el-icon>
                上传成功
              </span>
              <span v-else-if="file.status === 'error'" class="status-error">
                <el-icon><CircleClose /></el-icon>
                上传失败
              </span>
            </div>
            <div class="file-actions">
              <el-button 
                v-if="file.status === 'pending' || file.status === 'error'"
                type="danger" 
                size="small" 
                circle
                @click.stop="removeFile(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <!-- 上传进度条 -->
          <div v-if="file.status === 'uploading'" class="upload-progress">
            <el-progress 
              :percentage="file.progress || 0" 
              :stroke-width="4"
              :show-text="false"
            />
          </div>
        </div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".fbx,.obj,.stl,.gltf,.glb,.dae,.ply,.3ds,.max,.blend,.mtl,.ase,.ifc,.flt,.wrl,.wrz,.dxf,.dgn,.pdb,.ms3d,.mdl,.md2,.md3,.pk3,.md5,.smd,.vta,.dmx,.bvh,.biovision,.ac,.acc,.ac3d,.mesh,.xml,.osg,.osgt,.osgb,.osg2,.txp,.ive,.logo,.lwo,.lws,.ma,.mb,.abc,.hpb,.scn,.irr,.irrmesh,.q3o,.q3s"
        style="display: none;"
        @change="handleFileSelect"
      />
    </div>

    <!-- 操作按钮 -->
    <div v-if="hasFiles" class="upload-actions">
      <el-button type="primary" @click="startUpload" :loading="isUploading">
        开始上传
      </el-button>
      <el-button @click="clearFiles">
        清空列表
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { ElMessage, ElIcon } from 'element-plus';
import { Loading, CircleCheck, CircleClose, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 500 * 1024 * 1024 // 500MB
  }
});

const emit = defineEmits(['files-selected', 'upload-complete', 'upload-error']);

// 响应式数据
const dropZone = ref(null);
const fileInput = ref(null);
const isDragOver = ref(false);
const isDragEnter = ref(false);
const isUploading = ref(false);
const fileList = ref([]);

// 计算属性
const hasFiles = computed(() => fileList.value.length > 0);

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 验证文件
const validateFile = (file) => {
  // 检查文件大小
  if (file.size > props.maxFileSize) {
    ElMessage.error(`文件 ${file.name} 超过大小限制 (${formatFileSize(props.maxFileSize)})`);
    return false;
  }

  // 检查文件数量
  if (fileList.value.length >= props.maxFiles) {
    ElMessage.error(`最多只能上传 ${props.maxFiles} 个文件`);
    return false;
  }

  // 检查文件类型
  const allowedExtensions = [
    '.fbx', '.obj', '.stl', '.gltf', '.glb', '.dae', '.ply', '.3ds', '.max', '.blend',
    '.mtl', '.ase', '.ifc', '.flt', '.wrl', '.wrz', '.dxf', '.dgn', '.pdb', '.ms3d',
    '.mdl', '.md2', '.md3', '.pk3', '.md5', '.smd', '.vta', '.dmx', '.bvh', '.biovision',
    '.ac', '.acc', '.ac3d', '.mesh', '.xml', '.osg', '.osgt', '.osgb', '.osg2', '.txp',
    '.ive', '.logo', '.lwo', '.lws', '.ma', '.mb', '.abc', '.hpb', '.scn', '.irr',
    '.irrmesh', '.q3o', '.q3s'
  ];
  
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    ElMessage.error(`不支持的文件格式: ${fileExtension}`);
    return false;
  }

  return true;
};

// 添加文件到列表
const addFiles = (files) => {
  Array.from(files).forEach(file => {
    if (validateFile(file)) {
      // 检查是否重复
      const isDuplicate = fileList.value.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (!isDuplicate) {
        fileList.value.push({
          file: file,
          name: file.name,
          size: file.size,
          status: 'pending',
          progress: 0
        });
      } else {
        ElMessage.warning(`文件 ${file.name} 已存在`);
      }
    }
  });
};

// 触发文件选择
const triggerFileInput = () => {
  if (!hasFiles.value) {
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    addFiles(files);
    emit('files-selected', fileList.value);
  }
  // 清空input值，允许重复选择相同文件
  event.target.value = '';
};

// 拖拽事件处理
const handleDragOver = (event) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragEnter = (event) => {
  event.preventDefault();
  isDragEnter.value = true;
  isDragOver.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  // 只有当鼠标真正离开拖拽区域时才设置状态
  if (!dropZone.value.contains(event.relatedTarget)) {
    isDragEnter.value = false;
    isDragOver.value = false;
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragEnter.value = false;
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    addFiles(files);
    emit('files-selected', fileList.value);
  }
};

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1);
  emit('files-selected', fileList.value);
};

// 清空文件列表
const clearFiles = () => {
  fileList.value = [];
  emit('files-selected', fileList.value);
};

// 开始上传
const startUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  isUploading.value = true;
  
  try {
    // 这里可以调用实际的上传逻辑
    // 目前只是模拟上传过程
    for (let i = 0; i < fileList.value.length; i++) {
      const fileItem = fileList.value[i];
      if (fileItem.status === 'pending') {
        fileItem.status = 'uploading';
        
        // 模拟上传进度
        for (let progress = 0; progress <= 100; progress += 10) {
          fileItem.progress = progress;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        fileItem.status = 'success';
      }
    }
    
    ElMessage.success('文件上传完成');
    emit('upload-complete', fileList.value);
  } catch (error) {
    ElMessage.error('上传失败: ' + error.message);
    emit('upload-error', error);
  } finally {
    isUploading.value = false;
  }
};

// 批量上传方法 - 供父组件调用
const uploadFiles = async (uploadCallback) => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件');
    return;
  }

  isUploading.value = true;
  
  try {
    for (let i = 0; i < fileList.value.length; i++) {
      const fileItem = fileList.value[i];
      if (fileItem.status === 'pending') {
        fileItem.status = 'uploading';
        
        // 调用实际的上传回调函数
        if (uploadCallback) {
          await uploadCallback(fileItem.file, (progress) => {
            fileItem.progress = progress;
          });
        }
        
        fileItem.status = 'success';
      }
    }
    
    ElMessage.success(`成功上传 ${fileList.value.length} 个文件`);
    emit('upload-complete', fileList.value);
  } catch (error) {
    ElMessage.error('批量上传失败: ' + error.message);
    emit('upload-error', error);
  } finally {
    isUploading.value = false;
  }
};

// 设置文件上传进度
const setFileProgress = (fileName, progress) => {
  const fileItem = fileList.value.find(item => item.name === fileName);
  if (fileItem) {
    fileItem.progress = progress;
  }
};

// 设置文件状态
const setFileStatus = (fileName, status) => {
  const fileItem = fileList.value.find(item => item.name === fileName);
  if (fileItem) {
    fileItem.status = status;
  }
};

// 暴露方法给父组件
defineExpose({
  clearFiles,
  startUpload,
  uploadFiles,
  setFileProgress,
  setFileStatus,
  fileList
});
</script>

<style scoped>
.drag-upload-container {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.drop-zone:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.drop-zone.drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
  transform: scale(1.02);
}

.drop-zone.drag-enter {
  border-color: #67c23a;
  background-color: #f0f9ff;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
}

.drop-zone.has-files {
  padding: 20px;
  min-height: auto;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #909399;
  font-size: 48px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.primary-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.secondary-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.file-size-limit {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

.file-list {
  width: 100%;
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

.status-uploading {
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

.file-actions {
  flex-shrink: 0;
}

.upload-progress {
  margin-top: 8px;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drop-zone {
    padding: 20px 10px;
  }
  
  .file-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .file-status {
    align-self: flex-end;
  }
}
</style>
