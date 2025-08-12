<template>
  <el-dialog v-model="visibleInner" title="编辑模型信息" width="520px" :before-close="onClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
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
      <el-form-item label="图片路径" prop="image_path">
        <el-input v-model="form.image_path" />
      </el-form-item>
      <el-form-item label="渲染图路径" prop="render_path">
        <el-input v-model="form.render_path" />
      </el-form-item>
      <el-form-item label="模型文件路径" prop="model_path">
        <el-input v-model="form.model_path" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  model: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:visible', 'confirm']);

const visibleInner = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
});

const formRef = ref();
const form = reactive({
  id: null,
  name: '',
  category: '其他',
  area: '',
  address: '',
  quantity: 1,
  image_path: '',
  render_path: '',
  model_path: '',
  remark: ''
});

const rules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  area: [{ required: true, message: '请输入区域', trigger: 'blur' }],
  address: [{ required: true, message: '请输入主址', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'change' }]
};

watch(() => props.model, (val) => {
  if (val) {
    form.id = val.id ?? null;
    form.name = val.name ?? '';
    form.category = val.category ?? '其他';
    form.area = val.area ?? '';
    form.address = val.address ?? '';
    form.quantity = val.quantity ?? 1;
    form.image_path = val.image_path ?? '';
    form.render_path = val.render_path ?? '';
    form.model_path = val.model_path ?? '';
    form.remark = val.remark ?? '';
  }
}, { immediate: true, deep: true });

const onClose = () => {
  emit('update:visible', false);
};

const onSubmit = async () => {
  await formRef.value?.validate?.();
  emit('confirm', { ...form });
  onClose();
};
</script>

<style scoped>
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
</style>


