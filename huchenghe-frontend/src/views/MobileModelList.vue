<template>
  <MobileLayout>
    <el-container class="model-system-container">
      <!-- 顶部标题 -->
      <el-header class="header-title">
        <span>护橙河三维模型管理系统</span>
      </el-header>
      
      <el-main>
        <!-- 筛选区 -->
        <div class="filter-bar hc-panel">
          <div class="filter-row">
            <span class="filter-label">模型名称：</span>
            <el-input 
              v-model="filterName" 
              placeholder="输入名称搜索" 
              class="filter-item"
              clearable
            />
          </div>
          
          <div class="filter-row">
            <span class="filter-label">类别：</span>
            <el-select 
              v-model="filterType" 
              placeholder="选择类别" 
              class="filter-item"
            >
              <el-option label="全部" value="all" />
              <el-option label="石刻" value="石刻" />
              <el-option label="石碑" value="石碑" />
              <el-option label="雕塑" value="雕塑" />
              <el-option label="造像" value="造像" />
              <el-option label="其他" value="其他" />
            </el-select>
          </div>
          
          <div class="upload-btn">
            <el-button type="success" @click="uploadDialogVisible = true" class="upload-button">
              📤 上传模型
            </el-button>
            <el-button type="warning" @click="batchUploadDialogVisible = true" class="upload-button">
              📦 批量上传
            </el-button>
          </div>
        </div>
        
        <!-- 模型卡片列表 -->
        <div class="model-cards">
          <div 
            v-for="model in paginatedModels" 
            :key="model.id" 
            class="model-card mobile-card"
            @click="viewModelDetail(model.id)"
          >
            <div class="card-header">
              <h3 class="model-name">{{ model.name }}</h3>
              <el-tag :type="getTypeColor(model.type)" size="small">
                {{ model.type }}
              </el-tag>
            </div>
            
            <div class="card-content">
              <div class="info-row">
                <span class="label">ID:</span>
                <span class="value">{{ model.id }}</span>
              </div>
              <div class="info-row">
                <span class="label">区域:</span>
                <span class="value">{{ model.area || '未设置' }}</span>
              </div>
              <div class="info-row">
                <span class="label">主址:</span>
                <span class="value">{{ model.mainSite || '未设置' }}</span>
              </div>
            </div>
            
            <div class="card-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click.stop="viewModelDetail(model.id)"
              >
                查看详情
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                @click.stop="downloadModel(model)"
              >
                下载
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredModels.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无模型数据</p>
          <el-button type="primary" @click="uploadDialogVisible = true">
            上传第一个模型
          </el-button>
        </div>
        
        <!-- 分页 -->
        <div v-if="filteredModels.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredModels.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
        
        <!-- 模型上传对话框 -->
        <ModelUploadDialog 
          v-model:visible="uploadDialogVisible"
          @confirm="handleUploadConfirm"
        />
        
        <!-- 批量上传对话框 -->
        <BatchUploadDialog
          v-model:visible="batchUploadDialogVisible"
          @batch-upload-complete="handleBatchUploadComplete"
        />
      </el-main>
    </el-container>
  </MobileLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MobileLayout from '../components/MobileLayout.vue'
import ModelUploadDialog from '../components/ModelUploadDialog.vue'
import BatchUploadDialog from '../components/BatchUploadDialog.vue'
import { modelAPI } from '../api/index.js'

const router = useRouter()

// 响应式数据
const models = ref([])
const filterName = ref('')
const filterType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const uploadDialogVisible = ref(false)
const batchUploadDialogVisible = ref(false)
const loading = ref(false)

// 计算属性
const filteredModels = computed(() => {
  let result = models.value
  
  if (filterName.value) {
    result = result.filter(model => 
      model.name.toLowerCase().includes(filterName.value.toLowerCase())
    )
  }
  
  if (filterType.value !== 'all') {
    result = result.filter(model => model.type === filterType.value)
  }
  
  return result
})

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredModels.value.slice(start, end)
})

// 方法
const loadModels = async () => {
  loading.value = true
  try {
    const response = await modelAPI.getModels()
    models.value = response.data || response || []
  } catch (error) {
    console.error('加载模型失败:', error)
    ElMessage.error('加载模型失败')
  } finally {
    loading.value = false
  }
}

const viewModelDetail = (id) => {
  router.push(`/model/${id}`)
}

const downloadModel = async (model) => {
  try {
    // 仅前端演示：直接下载一个占位文件
    const blob = new Blob([`模型占位文件: ${model.name}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${model.name}.txt`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已开始下载')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

const handleUploadConfirm = () => {
  uploadDialogVisible.value = false
  loadModels()
  ElMessage.success('模型上传成功')
}

const handleBatchUploadComplete = () => {
  batchUploadDialogVisible.value = false
  loadModels()
  ElMessage.success('批量上传完成')
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getTypeColor = (type) => {
  const colorMap = {
    '石刻': 'primary',
    '石碑': 'success',
    '雕塑': 'warning',
    '造像': 'info',
    '其他': 'default'
  }
  return colorMap[type] || 'default'
}

// 监听筛选条件变化
watch([filterName, filterType], () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.model-system-container {
  min-height: 100vh;
}

.header-title {
  background: var(--hc-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  padding: 12px;
}

.filter-bar {
  margin-bottom: 16px;
  padding: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.filter-label {
  min-width: 80px;
  font-weight: 500;
  color: var(--hc-text);
}

.filter-item {
  flex: 1;
}

.upload-btn {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.upload-button {
  flex: 1;
}

.model-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.model-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--hc-text);
}

.card-content {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.label {
  color: var(--hc-subtext);
  font-weight: 500;
}

.value {
  color: var(--hc-text);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .el-button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--hc-subtext);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .model-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .filter-row {
    margin-bottom: 16px;
  }
  
  .upload-btn {
    margin-top: 16px;
  }
}
</style>
