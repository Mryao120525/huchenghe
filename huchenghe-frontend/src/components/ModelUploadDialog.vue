<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传模型"
    width="700px"
    :before-close="handleClose"
  >
    <!-- 拖拽上传区域 -->
    <div class="upload-section">
      <h4>选择模型文件</h4>
      <DragUpload
        ref="dragUploadRef"
        :max-files="1"
        :max-file-size="500 * 1024 * 1024"
        @files-selected="handleFilesSelected"
        @upload-complete="handleUploadComplete"
        @upload-error="handleUploadError"
      />
    </div>

    <!-- 模型信息表单 -->
    <div class="form-section">
      <h4>模型信息</h4>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模型名称" />
        </el-form-item>
        
        <el-form-item label="类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择类别" style="width: 100%">
            <el-option label="石刻" value="石刻" />
            <el-option label="石碑" value="石碑" />
            <el-option label="雕塑" value="雕塑" />
            <el-option label="造像" value="造像" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="区域" prop="area">
          <el-input v-model="form.area" placeholder="请输入区域，如：A区、B区" />
        </el-form-item>
        
        <el-form-item label="主址" prop="address">
          <el-input v-model="form.address" placeholder="请输入主址，如：一楼展厅" />
        </el-form-item>
        
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="9999" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" :rows="3" />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import DragUpload from './DragUpload.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

// 将dialogVisible从ref改为computed双向绑定
const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

const formRef = ref();
const dragUploadRef = ref();
const selectedFile = ref(null);

// 表单数据
const form = reactive({
  name: '',
  category: '其他',
  area: '',
  address: '',
  quantity: 1,
  remark: '',
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择类别', trigger: 'change' }
  ],
  area: [
    { required: true, message: '请输入区域', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入主址', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'change' }
  ]
};

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // 初始化表单数据
    if (props.fileName) {
      form.name = props.fileName.replace(/\.[^/.]+$/, ""); // 去掉文件扩展名
    }
    form.category = '其他';
    form.area = '';
    form.address = '';
    form.quantity = 1;
    form.remark = '';
    selectedFile.value = null;
  }
});

// 处理文件选择
const handleFilesSelected = (files) => {
  if (files.length > 0) {
    selectedFile.value = files[0].file;
    // 如果模型名称为空，使用文件名（去掉扩展名）
    if (!form.name) {
      form.name = files[0].name.replace(/\.[^/.]+$/, "");
    }
  }
};

// 处理上传完成
const handleUploadComplete = (files) => {
  ElMessage.success('文件上传成功');
};

// 处理上传错误
const handleUploadError = (error) => {
  ElMessage.error('文件上传失败: ' + error.message);
};

// 关闭弹窗
const handleClose = () => {
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 清空文件选择
  if (dragUploadRef.value) {
    dragUploadRef.value.clearFiles();
  }
  selectedFile.value = null;
  // 通知父组件关闭
  emit('update:visible', false);
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 检查是否选择了文件
    if (!selectedFile.value) {
      ElMessage.error('请先选择要上传的模型文件');
      return;
    }

    await formRef.value.validate((valid) => {
      if (valid) {
        // 准备提交数据
        const submitData = {
          ...form,
          file: selectedFile.value,
          fileName: selectedFile.value.name
        };
        emit('confirm', submitData);
        handleClose();
      } else {
        ElMessage.error('请填写完整信息');
        return false;
      }
    });
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped>
.upload-section {
  margin-bottom: 24px;
}

.form-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 24px;
}

.upload-section h4,
.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>