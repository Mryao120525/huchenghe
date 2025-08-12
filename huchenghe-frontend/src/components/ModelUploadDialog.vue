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
    label-width="120px"
    >

<el-form-item label="模型名称" prop="name">
        <el-input v-model="form.name" />
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
        <el-input v-model="form.area" />
      </el-form-item>
      
      <el-form-item label="主址" prop="address">
        <el-input v-model="form.address" />
      </el-form-item>
      
      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" :max="9999" />
      </el-form-item>
      
      <el-form-item label="图片路径" prop="imagePath">
        <el-input v-model="form.imagePath" />
      </el-form-item>
      
      <el-form-item label="渲染图路径" prop="renderPath">
        <el-input v-model="form.renderPath" />
      </el-form-item>
      
      <el-form-item label="模型存储路径" prop="modelPath">
        <el-input v-model="form.modelPath" />
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" />
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
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';
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

// 表单数据 - 移除初始路径赋值，统一在初始化时设置
const form = reactive({
  name: '',
  category: '其他',
  area: '',
  address: '',
  quantity: 1,
  modelPath: '',
  imagePath: '',
  renderPath: '',
  remark: '',
});

// 表单验证规则
const rules = {
  modelPath: [
    { required: true, message: '请输入模型存储路径', trigger: 'blur' }
  ],
  imagePath: [
    { required: true, message: '请输入图片路径', trigger: 'blur' }
  ],
  renderPath: [
    { required: true, message: '请输入渲染图路径', trigger: 'blur' }
  ],
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
  ],
  imagePath: [
    { required: true, message: '请输入图片路径', trigger: 'blur' }
  ],
  renderPath: [
    { required: true, message: '请输入渲染图路径', trigger: 'blur' }
  ],
  modelPath: [
    { required: true, message: '请输入模型存储路径', trigger: 'blur' }
  ],

};

// 监听dialogVisible变化(原为监听props.visible)
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // 初始化表单数据
    form.name = props.fileName.replace(/\.[^/.]+$/, ""); // 去掉文件扩展名
    form.category = '其他';
    form.area = '';
    form.address = '';
    form.quantity = 1;
    form.imagePath = '';
    form.renderPath = '';
    form.modelPath = '';
    form.remark = '';
    form.createTime = new Date();
    form.updateTime = new Date();
  }
});

// 关闭弹窗
const handleClose = () => {
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 通知父组件关闭
  emit('update:visible', false);
  // 清除日期字段（如果不需要可删除）
  delete form.createTime;
  delete form.updateTime;
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate((valid) => {
      if (valid) {
        // 格式化日期时间
        const submitData = {
          ...form,
          createTime: form.createTime ? form.createTime.toISOString().slice(0, 19).replace('T', ' ') : '',
          updateTime: form.updateTime ? form.updateTime.toISOString().slice(0, 19).replace('T', ' ') : ''
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>