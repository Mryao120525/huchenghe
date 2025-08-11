<template>
  <el-dialog
    v-model="dialogVisible"
    title="模型信息"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      
      <el-form-item label="上传人员" prop="uploader">
        <el-input v-model="form.uploader" />
      </el-form-item>
      
      <el-form-item label="上传时间" prop="uploadTime">
        <el-input v-model="form.uploadTime" disabled />
      </el-form-item>
      
      <el-form-item label="模型版本" prop="version">
        <el-input v-model="form.version" />
      </el-form-item>
      
      <el-form-item label="模型类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择模型类型" style="width: 100%">
          <el-option label="石刻" value="石刻" />
          <el-option label="石碑" value="石碑" />
          <el-option label="雕塑" value="雕塑" />
          <el-option label="造像" value="造像" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';

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

const dialogVisible = ref(false);
const formRef = ref();

// 表单数据
const form = reactive({
  name: '',
  uploader: '',
  uploadTime: '',
  version: '1.0',
  type: '其他'
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  uploader: [
    { required: true, message: '请输入上传人员', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入模型版本', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ]
};

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 初始化表单数据
    form.name = props.fileName.replace(/\.[^/.]+$/, ""); // 去掉文件扩展名
    form.uploader = ''; // 需要用户填写
    form.uploadTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    form.version = '1.0';
    form.type = '其他';
  }
});

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  emit('update:visible', false);
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate((valid) => {
      if (valid) {
        emit('confirm', { ...form });
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>