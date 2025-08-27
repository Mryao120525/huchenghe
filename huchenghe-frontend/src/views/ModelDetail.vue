<!--
ModelDetail.vue
三维模型管理系统的模型详情页，展示单个模型的详细信息。

## 页面结构
- **主容器 (`.main-container`)**: 整个页面的布局容器。
  - **页面头部 (`.detail-header`)**: 包含返回按钮、页面标题和下载模型按钮。
  - **主要内容区域 (`.detail-main`)**: 包含左侧版本历史面板、中间3D模型显示区域和右侧信息面板。
    - **左侧版本历史面板 (`.version-panel`)**: 展示模型的版本历史记录，并提供添加新记录的按钮。
      - **版本历史列表 (`.version-content`)**: 使用 `el-timeline` 展示详细的版本记录。
    - **中间3D模型显示区域 (`.model-viewer-section`)**: 包含3D模型预览区域和3D控制工具栏。
      - **3D模型预览容器 (`.model-viewer-container`)**: 实际渲染3D模型的区域 (`#three-container`)。
      - **3D控制工具栏 (`.threejs-controls-container`)**: 包含多个控制组，用于操作3D场景和模型。
        - **场景控制 (`.control-group.scene-controls`)**: 控制网格、坐标轴、材质的显示/隐藏。
        - **模型操作 (`.control-group.model-controls`)**: 重置视角、切换线框模式。
        - **贴图控制 (`.control-group.texture-controls`)**: 增强/减弱贴图强度、显示/隐藏贴图。
        - **灯光控制 (`.control-group.light-controls`)**: 开启/关闭环境光、调整主光源和环境光强度。
    - **右侧信息面板 (`.info-panel`)**: 展示模型的详细属性信息。
      - **模型属性列表 (`.model-info`)**: 以键值对形式展示模型名称、ID、区域、主址、数量、创建时间、更新时间等。
  - **版本记录添加对话框 (`<el-dialog>`)**: 用于添加新的版本记录的表单。
-->

<template>
  <el-container class="main-container">
    <!-- 页面头部 -->
    <el-header class="detail-header">
      <div class="header-content">
        <el-button type="info" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回模型列表
        </el-button>
        <h1 class="detail-title-text">
          模型详情 - {{ modelDetail ? modelDetail.name : '' }}
        </h1>
        <el-button type="primary" @click="downloadModel" :disabled="!modelDetail || !modelDetail.model_path" class="download-btn">
          <el-icon><Download /></el-icon>
          下载模型
        </el-button>
      </div>
    </el-header>

    <el-main class="detail-main">
      <!-- 主要内容区域 -->
      <div class="content-wrapper">
                <!-- 左侧版本历史面板 -->
        <div class="version-panel">
          <!-- 版本历史 -->
          <div class="info-section">
            <div class="section-header">
              <h3 class="section-title">版本历史</h3>
              <el-button type="primary" size="small" @click="showVersionDialog = true">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>
            <div class="version-content" v-if="versionHistory && versionHistory.length > 0">
              <el-timeline>
                <el-timeline-item 
                  v-for="(record, index) in versionHistory" 
                  :key="index"
                  :timestamp="formatTimestamp(record.timestamp)" 
                  placement="top"
                  :type="getTimelineItemType(record.action)"
                  size="large"
                >
                  <div class="version-record">
                    <div class="version-header">
                      <span class="version-number">v{{ record.version }}</span>
                      <el-tag :type="getTagType(record.action)" size="small">
                        {{ getActionText(record.action) }}
                      </el-tag>
                    </div>
                    <div class="version-details">
                      <p class="operator">
                        <el-icon><User /></el-icon>
                        操作人: {{ record.operator }}
                      </p>
                      <p class="description">{{ record.description }}</p>
                      <div v-if="record.changes && record.changes.length > 0" class="changes-list">
                        <p class="changes-title">修改内容:</p>
                        <ul>
                          <li v-for="(change, changeIndex) in record.changes" :key="changeIndex">
                            <span class="change-field">{{ change.field }}:</span>
                            <span class="change-old">{{ change.oldValue }}</span>
                            <span class="change-arrow">→</span>
                            <span class="change-new">{{ change.newValue }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div v-else class="no-data">
              <el-empty description="暂无版本记录" />
            </div>
          </div>
        </div>

        <!-- 中间3D模型显示区域 -->
        <div class="model-viewer-section">
          <div class="viewer-header">
            <h3 class="section-title">3D模型预览</h3>
            <div class="viewer-actions">
              <el-button size="small" @click="resetScene" type="info">
                <el-icon><Refresh /></el-icon>
                重置场景
              </el-button>
              <el-button size="small" @click="fitModel" type="success">
                <el-icon><FullScreen /></el-icon>
                适应模型
              </el-button>
            </div>
          </div>
          
          <div class="model-viewer-container">
            <div id="three-container" class="three-container"></div>
          </div>
          
          <!-- 3D控制工具栏 -->
          <div class="threejs-controls-container">
            <!-- 场景控制 -->
            <div class="control-group scene-controls">
              <h4 class="control-title">场景控制</h4>
              <div class="control-buttons">
                <el-button
                  :type="showGrid ? 'success' : 'default'"
                  size="small"
                  @click="() => { showGrid = !showGrid; toggleGrid(showGrid); }"
                  :icon="Grid"
                  :title="showGrid ? '隐藏网格' : '显示网格'"
                >
                  {{ showGrid ? '隐藏网格' : '显示网格' }}
                </el-button>
                <el-button
                  :type="showAxes ? 'warning' : 'default'"
                  size="small"
                  @click="() => { showAxes = !showAxes; toggleAxes(showAxes); }"
                  :icon="Position"
                  :title="showAxes ? '隐藏坐标轴' : '显示坐标轴'"
                >
                  {{ showAxes ? '隐藏坐标轴' : '显示坐标轴' }}
                </el-button>
                <el-button
                  :type="showMaterial ? 'info' : 'default'"
                  size="small"
                  @click="() => { showMaterial = !showMaterial; toggleMaterial(showMaterial); }"
                  :icon="Picture"
                  :title="showMaterial ? '隐藏材质' : '显示材质'"
                >
                  {{ showMaterial ? '隐藏材质' : '显示材质' }}
                </el-button>
              </div>
            </div>
            
            <div class="control-group model-controls">
              <h4 class="control-title">模型操作</h4>
              <div class="control-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="resetCamera"
                  :icon="Refresh"
                  title="重置视角"
                >
                  重置视角
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  @click="toggleWireframeMode"
                  :icon="Grid"
                  :title="showWireframe ? '切换至实体模式' : '切换至线框模式'"
                >
                  {{ showWireframe ? '实体模式' : '线框模式' }}
                </el-button>
              </div>
            </div>
            
            <div class="control-group texture-controls">
              <h4 class="control-title">贴图控制</h4>
              <div class="control-buttons">
                <el-button
                  type="info"
                  size="small"
                  @click="increaseTexture"
                  :icon="Plus"
                  title="增强贴图"
                >
                  增强贴图
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="decreaseTexture"
                  :icon="Minus"
                  title="减弱贴图"
                >
                  减弱贴图
                </el-button>
                <el-button
                  :type="showTexture ? 'danger' : 'default'"
                  size="small"
                  @click="() => { showTexture = !showTexture; toggleTexture(showTexture); }"
                  :icon="Picture"
                  :title="showTexture ? '隐藏贴图' : '显示贴图'"
                >
                  {{ showTexture ? '隐藏贴图' : '显示贴图' }}
                </el-button>
              </div>
            </div>

            <div class="control-group light-controls">
              <h4 class="control-title">灯光控制</h4>
              <div class="light-control-content">
                <el-button
                  :type="showAmbientLight ? 'primary' : 'default'"
                  size="small"
                  @click="toggleAmbientLight(!showAmbientLight)"
                  :icon="Picture"
                  :title="showAmbientLight ? '关闭环境光' : '开启环境光'"
                >
                  环境光
                </el-button>
                <div class="light-slider-wrapper">
                  <span class="light-label">主光源</span>
                  <el-slider
                    v-model="mainLightIntensity"
                    :min="0"
                    :max="10"
                    :step="0.1"
                    @change="updateMainLight"
                    :show-tooltip="false"
                    class="light-slider"
                  />
                </div>
                <div class="light-slider-wrapper">
                  <span class="light-label">环境光</span>
                  <el-slider
                    v-model="ambientLightIntensity"
                    :min="0"
                    :max="10"
                    :step="0.1"
                    @change="updateAmbientLight"
                    :show-tooltip="false"
                    class="light-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧信息面板 -->
        <div class="info-panel">
          <!-- 模型属性 -->
          <div class="info-section">
            <div class="section-header">
              <h3 class="section-title">模型属性</h3>
              <el-tag type="primary" size="small">{{ modelDetail ? modelDetail.category : '' }}</el-tag>
            </div>
            <div class="model-info" v-if="modelDetail">
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">模型名称</span>
                  <span class="info-value">{{ modelDetail.name }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">模型ID</span>
                  <span class="info-value">{{ modelDetail.id }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">所属区域</span>
                  <span class="info-value">{{ modelDetail.area }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">主址位置</span>
                  <span class="info-value">{{ modelDetail.address }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">数量</span>
                  <span class="info-value">{{ modelDetail.quantity }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{ formatDate(modelDetail.create_time) }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-content">
                  <span class="info-label">更新时间</span>
                  <span class="info-value">{{ formatDate(modelDetail.update_time) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <el-empty description="未找到该模型信息" />
            </div>
          </div>
        </div>
      </div>
    </el-main>
    
    <!-- 版本记录添加对话框 -->
    <el-dialog 
      v-model="showVersionDialog" 
      title="添加版本记录" 
      width="600px"
      :before-close="handleVersionDialogClose"
      class="version-dialog"
    >
      <el-form :model="newVersionForm" :rules="versionFormRules" ref="versionFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="newVersionForm.version" placeholder="请输入版本号，如：1.2.3" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作类型" prop="action">
              <el-select v-model="newVersionForm.action" placeholder="请选择操作类型" style="width: 100%;">
                <el-option label="创建" value="create" />
                <el-option label="更新" value="update" />
                <el-option label="修改" value="modify" />
                <el-option label="上传" value="upload" />
                <el-option label="删除" value="delete" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="newVersionForm.operator" placeholder="请输入操作人姓名" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="newVersionForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入版本更新描述"
          />
        </el-form-item>
        <el-form-item label="修改内容">
          <div v-for="(change, index) in newVersionForm.changes" :key="index" class="change-item">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input v-model="change.field" placeholder="字段名" />
              </el-col>
              <el-col :span="6">
                <el-input v-model="change.oldValue" placeholder="原值" />
              </el-col>
              <el-col :span="6">
                <el-input v-model="change.newValue" placeholder="新值" />
              </el-col>
              <el-col :span="6">
                <el-button type="danger" size="small" @click="removeChange(index)" :icon="Delete">删除</el-button>
              </el-col>
            </el-row>
          </div>
          <el-button type="primary" size="small" @click="addChange" :icon="Plus">添加修改项</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showVersionDialog = false">取消</el-button>
          <el-button type="primary" @click="submitVersionRecord">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, 
  FullScreen, 
  Grid, 
  Plus, 
  Minus, 
  Picture, 
  Delete, 
  Position,
  ArrowLeft,
  Download,
  User
} from '@element-plus/icons-vue';
import { modelAPI } from '../api/index.js';
import api from '../api/index.js';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const router = useRouter();
const route = useRoute();

// 返回模型列表
const goBack = () => {
  router.go(-1);
};

const modelDetail = ref(null);
const loading = ref(false);
const errorMsg = ref('');

// 版本历史数据
const versionHistory = ref([]);

// 控制面板状态
const isControlPanelCollapsed = ref(false);
const showTexture = ref(true);
const showWireframe = ref(false);
const showMaterial = ref(true);
const sceneBrightness = ref(1.0);
const showAmbientLight = ref(true);
const showAxes = ref(true);
const showGrid = ref(true);

// 新增的灯光控制变量
const mainLightIntensity = ref(1.0);
const ambientLightIntensity = ref(0.3);

// 版本管理相关
const showVersionDialog = ref(false);
const versionFormRef = ref(null);
const newVersionForm = ref({
  version: '',
  action: '',
  operator: '',
  description: '',
  changes: []
});

const versionFormRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  operator: [
    { required: true, message: '请输入操作人', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
};

let renderer, scene, camera, animationId, controls, transformControls;
let loadedModel = ref(null);
let handleResize;
let resizeObserver = null; // 用于监听容器大小变化的 ResizeObserver

// 场景对象引用
let axesHelper = null;
let gridHelper = null;
let directionalLight = null;
let ambientLight = null;

// 贴图强度控制
let textureIntensity = ref(1.0);

// 事件监听器引用，用于管理事件监听器
let modelHoverListener = null;
let modelClickListener = null;

// 节流变量，用于优化性能
let hoverThrottleTimer = null;
let lastHoverTime = 0;

const getApiOrigin = () => {
  const base = api.defaults.baseURL || '';
  console.log('API baseURL:', base);
  
  // 移除 /api 后缀，获取基础域名
  const origin = base.replace(/\/?api\/?$/, '');
  console.log('API origin:', origin);
  
  return origin;
};

// 控制面板折叠/展开
const toggleControlPanel = () => {
  isControlPanelCollapsed.value = !isControlPanelCollapsed.value;
};

// 自动缩放和居中函数
const fitCameraToObject = (object, offset = 1.25, controls = null) => {
  const box = new THREE.Box3();
  box.setFromObject(object);
  
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // 获取最大尺寸
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  
  // 应用偏移
  cameraZ *= offset;
  
  // 设置相机位置
  camera.position.set(center.x, center.y, center.z + cameraZ);
  camera.lookAt(center);
  
  // 更新控制器
  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
  
  // 设置相机近远平面
  const minZ = box.min.z;
  const maxZ = box.max.z;
  camera.near = 0.1;
  camera.far = Math.max(1000, cameraZ * 10);
  camera.updateProjectionMatrix();
};

// 工具栏功能方法
const resetCamera = () => {
  if (!loadedModel.value) return;
  fitCameraToObject(loadedModel.value, 1.5, controls);
  ElMessage.success('视角已重置');
};

const fitModel = () => {
  if (!loadedModel.value) return;
  fitCameraToObject(loadedModel.value, 1.2, controls);
  ElMessage.success('模型已适应视图');
};

const toggleWireframeMode = () => {
  showWireframe.value = !showWireframe.value;
  toggleWireframe(showWireframe.value);
  ElMessage.success(showWireframe.value ? '已切换到线框模式' : '已切换到实体模式');
};

const increaseTexture = () => {
  if (!loadedModel.value) return;
  textureIntensity.value = Math.min(2.0, textureIntensity.value + 0.1);
  updateTextureIntensity();
  ElMessage.success(`贴图强度: ${textureIntensity.value.toFixed(1)}`);
};

const decreaseTexture = () => {
  if (!loadedModel.value) return;
  textureIntensity.value = Math.max(0.1, textureIntensity.value - 0.1);
  updateTextureIntensity();
  ElMessage.success(`贴图强度: ${textureIntensity.value.toFixed(1)}`);
};

const updateTextureIntensity = () => {
  if (!loadedModel.value) return;
  loadedModel.value.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          if (mat.map) {
            mat.map.intensity = textureIntensity.value;
            mat.needsUpdate = true;
          }
        });
      } else {
        if (child.material.map) {
          child.material.map.intensity = textureIntensity.value;
          child.material.needsUpdate = true;
        }
      }
    }
  });
};

const updateMainLight = (value) => {
  if (directionalLight) {
    directionalLight.intensity = value;
  }
};

const updateAmbientLight = (value) => {
  if (ambientLight) {
    ambientLight.intensity = value;
  }
};

// 控制面板功能
const toggleTexture = (value) => {
  if (!loadedModel.value) return;
  loadedModel.value.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          mat.map = value ? mat.userData._originalMap : null;
          mat.needsUpdate = true;
        });
      } else {
        child.material.map = value ? child.material.userData._originalMap : null;
        child.material.needsUpdate = true;
      }
    }
  });
};

const toggleWireframe = (value) => {
  if (!loadedModel.value) return;
  loadedModel.value.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          mat.wireframe = value;
          mat.needsUpdate = true;
        });
      } else {
        child.material.wireframe = value;
        child.material.needsUpdate = true;
      }
    }
  });
};

const toggleMaterial = (value) => {
  if (!loadedModel.value) return;
  loadedModel.value.traverse(child => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => {
          mat.visible = value;
        });
      } else {
        child.material.visible = value;
      }
    }
  });
};

const updateSceneBrightness = (value) => {
  if (directionalLight) {
    directionalLight.intensity = value;
  }
  if (ambientLight) {
    ambientLight.intensity = value * 0.3;
  }
};

const toggleAmbientLight = (value) => {
  if (ambientLight) {
    ambientLight.visible = value;
  }
};

const toggleAxes = (value) => {
  if (axesHelper) {
    axesHelper.visible = value;
  }
};

const toggleGrid = (value) => {
  if (gridHelper) {
    gridHelper.visible = value;
  }
};

// 版本管理方法
const addChange = () => {
  newVersionForm.value.changes.push({
    field: '',
    oldValue: '',
    newValue: ''
  });
};

const removeChange = (index) => {
  newVersionForm.value.changes.splice(index, 1);
};

const handleVersionDialogClose = (done) => {
  ElMessageBox.confirm('确认关闭？未保存的数据将丢失')
    .then(() => {
      resetVersionForm();
      done();
    })
    .catch(() => {});
};

const resetVersionForm = () => {
  newVersionForm.value = {
    version: '',
    action: '',
    operator: '',
    description: '',
    changes: []
  };
  if (versionFormRef.value) {
    versionFormRef.value.resetFields();
  }
};

const submitVersionRecord = async () => {
  if (!versionFormRef.value) return;
  
  try {
    await versionFormRef.value.validate();
    
    // 过滤空的修改项
    const validChanges = newVersionForm.value.changes.filter(
      change => change.field && (change.oldValue || change.newValue)
    );
    
    const newRecord = {
      version: newVersionForm.value.version,
      action: newVersionForm.value.action,
      operator: newVersionForm.value.operator,
      description: newVersionForm.value.description,
      timestamp: new Date().toISOString(),
      changes: validChanges
    };
    
    // 添加到版本历史
    versionHistory.value.unshift(newRecord);
    
    // 关闭对话框并重置表单
    showVersionDialog.value = false;
    resetVersionForm();
    
    ElMessage.success('版本记录添加成功');
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const loadThreeModel = (path) => {
  if (!path) {
    console.warn('模型路径为空，无法加载模型');
    ElMessage.warning('模型路径为空，无法加载模型');
    return;
  }
  
  const origin = getApiOrigin();
  const fullUrl = path.startsWith('http') ? path : `${origin}${path}`;
  console.log('尝试加载模型:', fullUrl);
  
  const ext = (fullUrl.split('.').pop() || '').toLowerCase();
  
  // 检查Three.js场景是否已初始化
  if (!scene || !renderer || !camera) {
    console.error('Three.js场景未初始化，无法加载模型');
    ElMessage.error('3D场景未初始化，请刷新页面重试');
    return;
  }
  
  // 仅示例支持 FBX
  if (ext === 'fbx') {
    const loader = new FBXLoader();
    
    // 显示加载状态
    ElMessage.info('正在加载3D模型...');
    
    loader.load(
      fullUrl,
      (object) => {
        console.log('模型加载成功:', object);
        
        // 保存原始贴图信息
        object.traverse(child => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.map) {
                  mat.userData._originalMap = mat.map;
                }
              });
            } else {
              if (child.material.map) {
                child.material.userData._originalMap = child.material.map;
              }
            }
          }
        });
        
        // 清除之前的模型和TransformControls
        if (loadedModel.value) {
          scene.remove(loadedModel.value);
        }
        // 清除之前的模型
        if (loadedModel.value) {
          scene.remove(loadedModel.value);
        }
        
        scene.add(object);
        loadedModel.value = object;
        
        // 自动缩放和居中
        fitCameraToObject(object, 1.5, controls);
        
        // 验证场景状态
        console.log('模型加载完成，场景状态验证:');
        console.log('- 场景对象数量:', scene.children.length);
        console.log('- 模型已添加到场景:', scene.children.includes(object));
        console.log('- 相机位置:', camera.position);
        console.log('- 控制器目标:', controls.target);
        
        ElMessage.success('3D模型加载成功');
      },
      (progress) => {
        // 加载进度
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log(`模型加载进度: ${percent}%`);
      },
      (error) => {
        console.error('FBX 加载失败:', error);
        console.error('请求的URL:', fullUrl);
        console.error('错误详情:', error.message || error);
        ElMessage.error(`模型加载失败: ${error.message || '未知错误'}`);
      }
    );
  } else {
    console.warn('暂未支持的模型格式:', ext, fullUrl);
    ElMessage.warning(`暂不支持该模型格式: ${ext}`);
  }
};

onMounted(async () => {
  try {
    console.log('开始初始化3D场景...');
    
    const container = document.getElementById('three-container');
    if (!container) {
      console.error('找不到three-container元素');
      ElMessage.error('3D容器初始化失败');
      return;
    }
    
    console.log('容器尺寸:', container.clientWidth, 'x', container.clientHeight);
    
    // 初始化Three.js场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // 初始化相机
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(3, 3, 6);
    camera.lookAt(0, 0, 0);
    
    // 初始化渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    console.log('Three.js场景初始化完成');

    // 定义 handleResize 函数
    handleResize = function () {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) {
        console.warn('容器尺寸为0，跳过渲染器和相机更新');
        return;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      console.log('Three.js 渲染器和相机尺寸已更新:', width, 'x', height);
    };

    // 使用 ResizeObserver 监听 three-container 元素的大小变化
    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          console.log('ResizeObserver 触发，容器大小变化');
          handleResize();
        }
      }
    });
    resizeObserver.observe(container);

    // 移除 window.addEventListener('resize', handleResize); 因为 ResizeObserver 更精确
    // window.addEventListener('resize', handleResize);
    
    // 初始化轨道控制
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI;
    
    // 确保OrbitControls不会与TransformControls冲突
    controls.enableKeys = false; // 禁用键盘控制，避免与TransformControls冲突
    
    // 添加坐标轴辅助
    axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    
    // 添加网格地面
    gridHelper = new THREE.GridHelper(10, 20);
    scene.add(gridHelper);
    
    // 添加方向光
    directionalLight = new THREE.DirectionalLight(0xffffff, mainLightIntensity.value);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // 添加环境光
    ambientLight = new THREE.AmbientLight(0x404040, ambientLightIntensity.value);
    scene.add(ambientLight);
    
    console.log('场景元素添加完成');

    // 拉取后端模型详情，并按 model_path 加载三维模型
    try {
      loading.value = true;
      const id = route.params.id;
      console.log('获取模型ID:', id);
      
      const resp = await modelAPI.getModelById(id);
      console.log('模型详情响应:', resp);
      
      modelDetail.value = resp.data;
      console.log('模型详情数据:', modelDetail.value);
      console.log('模型路径:', modelDetail.value?.model_path);
      
      // 检查模型路径
      if (modelDetail.value?.model_path) {
        loadThreeModel(modelDetail.value.model_path);
      } else {
        console.warn('模型路径为空');
        ElMessage.warning('该模型暂无3D文件，将显示默认场景');
        
        // 创建一个简单的立方体作为默认模型
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: 0x4f8cff });
        const cube = new THREE.Mesh(geometry, material);
        
        scene.add(cube);
        loadedModel.value = cube;
        
        // 调整相机位置
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log('默认立方体模型已创建');
      }
      
      // 在模型加载后强制更新一次尺寸，确保初始渲染正确
      handleResize();

      // 初始化版本历史
      initVersionHistory();
    } catch (e) {
      console.error('获取模型详情失败:', e);
      errorMsg.value = '获取模型详情失败';
      ElMessage.error(`获取模型详情失败: ${e.message || '未知错误'}`);
    } finally {
      loading.value = false;
    }
  } catch (error) {
    console.error('3D场景初始化失败:', error);
    ElMessage.error(`3D场景初始化失败: ${error.message || '未知错误'}`);
  }

  // 初始化 TransformControls
  transformControls = new TransformControls(camera, renderer.domElement);
  scene.add(transformControls);
  transformControls.visible = false; // 默认隐藏

  // 当使用TransformControls时，禁用OrbitControls
  transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
  });

  // 添加键盘控制切换模式
  document.addEventListener('keydown', onKeyDown);

  // 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

onBeforeUnmount(() => {
  // 移除 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  
  // 移除键盘事件监听器
  document.removeEventListener('keydown', onKeyDown);
  
  // 清理节流定时器
  if (hoverThrottleTimer) {
    clearTimeout(hoverThrottleTimer);
    hoverThrottleTimer = null;
  }
  
  if (renderer && renderer.domElement) {
    renderer.domElement.remove();
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // 清理TransformControls
  if (transformControls) {
    transformControls.dispose && transformControls.dispose();
  }
});

const downloadModel = () => {
  if (!modelDetail.value?.model_path) return;
  const origin = getApiOrigin();
  const fullUrl = `${origin}${modelDetail.value.model_path}`;
  window.open(fullUrl, '_blank');
};

// 鼠标悬停高亮并显示坐标轴
const onModelHover = (event) => {
  if (!loadedModel.value || !renderer || !camera) return;
  
  // 节流处理，限制执行频率
  const now = Date.now();
  if (now - lastHoverTime < 50) { // 50ms节流
    if (hoverThrottleTimer) return;
    
    hoverThrottleTimer = setTimeout(() => {
      hoverThrottleTimer = null;
      processHover(event);
    }, 50);
    return;
  }
  
  lastHoverTime = now;
  processHover(event);
};

// 处理悬停逻辑
const processHover = (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(loadedModel.value, true);
  
  if (intersects.length > 0) {
    // 高亮边缘
    highlightModel(loadedModel.value);
    
    // 附加TransformControls并使其可见
    if (loadedModel.value && transformControls) {
      transformControls.attach(loadedModel.value);
      transformControls.setMode('rotate'); // 默认设置为旋转模式
      transformControls.visible = true;
    }
  } else {
    removeHighlight(loadedModel.value);
    // 分离TransformControls并使其不可见
    if (transformControls && transformControls.object) {
      transformControls.detach();
      transformControls.visible = false;
    }
  }
};

// 键盘控制TransformControls模式
const onKeyDown = (event) => {
  if (!transformControls) return;
  
  switch (event.key.toLowerCase()) {
    case 'w':
      transformControls.setMode('translate');
      break;
    case 'e':
      transformControls.setMode('rotate');
      break;
    case 'r':
      transformControls.setMode('scale');
      break;
  }
};

// 获取当前操作模式文本
const getCurrentModeText = () => {
  if (!transformControls) return '';
  
  const mode = transformControls.getMode();
  const modeMap = {
    'translate': '移动',
    'rotate': '旋转',
    'scale': '缩放'
  };
  return modeMap[mode] || mode;
};

// 获取当前操作模式的CSS类
const getCurrentModeClass = () => {
  if (!transformControls) return '';
  
  const mode = transformControls.getMode();
  const classMap = {
    'translate': 'mode-translate',
    'rotate': 'mode-rotate',
    'scale': 'mode-scale'
  };
  return classMap[mode] || '';
};

// 高亮模型边缘
const highlightModel = (model) => {
  model.traverse(child => {
    if (child.isMesh) {
      if (!child.userData._origMaterial) {
        child.userData._origMaterial = child.material;
      }
      // 创建高亮材质
      child.material = child.material.clone();
      child.material.emissive = new THREE.Color(0x4f8cff);
      child.material.emissiveIntensity = 0.6;
      child.material.needsUpdate = true;
    }
  });
};

// 移除高亮
const removeHighlight = (model) => {
  model.traverse(child => {
    if (child.isMesh && child.userData._origMaterial) {
      child.material = child.userData._origMaterial;
      child.material.needsUpdate = true;
    }
  });
};

// 点击模型时无操作，坐标轴已在悬停时出现
const onModelClick = (event) => {};

// 场景重置
const resetScene = () => {
  // 视觉与辅助
  showGrid.value = true;
  toggleGrid(true);
  showAxes.value = true;
  toggleAxes(true);
  showWireframe.value = false;
  toggleWireframe(false);
  showTexture.value = true;
  toggleTexture(true);
  showMaterial.value = true;
  toggleMaterial(true);
  
  // 灯光
  mainLightIntensity.value = 1.0;
  updateMainLight(1.0);
  ambientLightIntensity.value = 0.3;
  updateAmbientLight(0.3);
  if (ambientLight) ambientLight.visible = true;
  showAmbientLight.value = true;
  
  // 相机
  if (loadedModel.value) {
    fitCameraToObject(loadedModel.value, 1.5, controls);
  }
  
  // 清理TransformControls
  if (transformControls) {
    transformControls.detach();
    transformControls.visible = false;
  }
  
  // 确保OrbitControls可用
  if (controls) {
    controls.enabled = true;
  }
  
  ElMessage.success('场景已重置');
};

// 版本历史相关方法
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getActionText = (action) => {
  const actionMap = {
    'create': '创建',
    'update': '更新',
    'delete': '删除',
    'upload': '上传',
    'modify': '修改'
  };
  return actionMap[action] || action;
};

const getTagType = (action) => {
  const typeMap = {
    'create': 'success',
    'update': 'info',
    'delete': 'danger',
    'upload': 'warning',
    'modify': 'primary'
  };
  return typeMap[action] || 'info';
};

const getActionClass = (action) => {
  const classMap = {
    'create': 'action-create',
    'update': 'action-update',
    'delete': 'action-delete',
    'upload': 'action-upload',
    'modify': 'action-modify'
  };
  return classMap[action] || 'action-default';
};

const getTimelineItemType = (action) => {
  const typeMap = {
    'create': 'primary',
    'update': 'success',
    'delete': 'danger',
    'upload': 'warning',
    'modify': 'info'
  };
  return typeMap[action] || 'info';
};

// 初始化版本历史数据
const initVersionHistory = () => {
  // 模拟从后端获取版本历史数据
  const mockHistory = [
    {
      version: '1.3.0',
      action: 'modify',
      operator: '技术员C',
      description: '优化模型材质和贴图',
      timestamp: new Date('2024-01-18T16:45:00').toISOString(),
      changes: [
        {
          field: '材质质量',
          oldValue: '标准',
          newValue: '高清'
        },
        {
          field: '贴图分辨率',
          oldValue: '1024x1024',
          newValue: '2048x2048'
        }
      ]
    },
    {
      version: '1.2.0',
      action: 'update',
      operator: '审核员B',
      description: '更新模型分类和描述',
      timestamp: new Date('2024-01-17T09:15:00').toISOString(),
      changes: [
        {
          field: '类别',
          oldValue: '其他',
          newValue: '宗教雕塑'
        },
        {
          field: '主址',
          oldValue: '',
          newValue: '众生'
        },
        {
          field: '数量',
          oldValue: '0',
          newValue: '1'
        }
      ]
    },
    {
      version: '1.1.0',
      action: 'upload',
      operator: '建模师A',
      description: '上传3D模型文件',
      timestamp: new Date('2024-01-16T14:20:00').toISOString(),
      changes: [
        {
          field: '模型文件',
          oldValue: '无',
          newValue: 'guanyin.fbx'
        },
        {
          field: '渲染图',
          oldValue: '无',
          newValue: 'guanyin_render.png'
        }
      ]
    }
  ];
  // 只显示最新的三条记录
  versionHistory.value = mockHistory.slice(0, 3);
};
</script>

<style scoped>
/* 主容器样式 */
.main-container {
  position: relative;
  z-index: 1;
  background: #f7f8fa; /* 更改为白色背景 */
  min-height: 100vh;
}

/* 页面头部样式 */
.detail-header {
  background: linear-gradient(90deg, #4f8cff, #667eea); /* 蓝色色调渐变 */
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  height: 64px; /* 调整为与ModelList.vue一致的高度 */
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.detail-title-text {
  color: #fff; /* 更改为白色 */
  font-size: 24px; /* 保持与ModelList.vue一致 */
  font-weight: bold; /* 保持与ModelList.vue一致 */
  margin: 0;
  /* 移除背景渐变和文本填充，直接使用白色 */
  /* background: linear-gradient(135deg, #667eea, #764ba2); */
  /* -webkit-background-clip: text; */
  /* -webkit-text-fill-color: transparent; */
  /* background-clip: text; */
  text-shadow: none;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 主要内容区域样式 */
.detail-main {
  padding: 24px;
  background: transparent;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1700px;
  margin: 0 auto;
}

/* 左侧版本历史面板样式 */
.version-panel {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.95); /* 与页面主题风格一致的背景 */
  backdrop-filter: blur(15px); /* 添加模糊效果 */
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  border: 1px solid #4f8cff; /* 添加1像素蓝色边框 */
  overflow: hidden;
  max-height: 800px; /* 恢复到原来的高度 */
  overflow-y: auto;
}

/* 3D模型显示区域样式 */
.model-viewer-section {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
}

.viewer-header .section-title {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.viewer-actions {
  display: flex;
  gap: 12px;
}

.model-viewer-container {
  position: relative;
  padding: 24px;
  border: 2px solid rgba(79, 140, 255, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.model-viewer-container:hover {
  border-color: rgba(79, 140, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(79, 140, 255, 0.15);
}

.three-container {
  width: 100%;
  height: 375px; /* 缩小为原来的四分之三 (500 * 0.75) */
  border: 3px solid #4f8cff;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(79, 140, 255, 0.3), inset 0 0 20px rgba(79, 140, 255, 0.1);
  transition: all 0.3s ease;
}

.three-container:hover {
  border-color: #337ecc;
  box-shadow: 0 0 30px rgba(79, 140, 255, 0.5), inset 0 0 30px rgba(79, 140, 255, 0.15);
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

/* 3D控制工具栏样式 */
.threejs-controls-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 四列布局 */
  gap: 16px; /* 控制组之间的距离 */
  margin-top: 14px; /* 整体向上提高10px */
  padding: 0 24px; /* 保持与模型容器的左右对齐 */
}

.control-group {
  background: rgba(255, 255, 255, 0.95); /* 与页面主题风格一致的背景 */
  backdrop-filter: blur(15px); /* 添加模糊效果 */
  border-radius: 16px; /* 调整圆角与页面其他模块一致 */
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  border: 1px solid #4f8cff; /* 添加蓝色边框 */
  min-width: 200px; /* 恢复最小宽度，以容纳更宽的按钮 */
}

.control-title {
  margin: 0 0 9px 0; /* 缩小为原来的四分之三 (12 * 0.75) */
  color: #333;
  font-size: 10.5px; /* 缩小为原来的四分之三 (14 * 0.75) */
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 6px; /* 缩小为原来的四分之三 (8 * 0.75) */
}

.control-buttons {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 8px;
  padding: 0 16px; /* 增加左右内边距 */
  align-items: center; /* 按钮居中 */
}

.control-buttons .el-button {
  width: 90px; /* 缩小为原来的四分之三 (120 * 0.75) */
  height: 24px; /* 缩小为原来的四分之三 (32 * 0.75) */
  justify-content: center; /* 按钮文本居中 */
  border-radius: 6px; /* 适当缩小圆角 */
  transition: all 0.3s ease;
}

.control-buttons .el-button:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 键盘控制提示样式 */
.keyboard-hints {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.hint-text {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.hint-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-item {
  font-size: 11px;
  color: #999;
  background: rgba(79, 140, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

/* 移除当前模式和键盘控制的样式 */
.current-mode, .keyboard-hints {
  display: none;
}

/* 灯光控制样式 */
.light-control-content {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 8px;
  padding: 0 16px; /* 增加左右内边距 */
}

.light-control-content .el-button {
  width: 100%; /* 按钮占据可用宽度 */
  height: 27px; /* 缩小为原来的四分之三 (36 * 0.75) */
  justify-content: flex-start; /* 按钮文本左对齐 */
  border-radius: 6px; /* 适当缩小圆角 */
  transition: all 0.3s ease;
}

.light-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
  min-width: 150px; /* 确保滑块有足够的空间 */
  background: rgba(79, 140, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
}

.light-slider-wrapper .light-label {
  font-size: 9px; /* 缩小为原来的四分之三 (12 * 0.75) */
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.light-slider {
  width: 100%;
  margin: 0;
}

/* 右侧信息面板样式 */
.info-panel {
  width: 320px;
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 24px; /* 恢复到原来的间距 */
  /* 移除max-height */
}

.info-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #4f8cff; /* 添加1像素蓝色边框 */
  overflow: hidden;
  /* 移除内边距调整 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
}

.section-title {
  margin: 0;
  color: #333;
  font-size: 16px; /* 恢复到原来的大小 */
  font-weight: 600;
}

.model-info {
  padding: 20px; /* 恢复到原来的内边距 */
  display: flex;
  flex-direction: column;
  gap: 12px; /* 恢复到原来的间距 */
}

.info-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px; /* 恢复到原来的内边距 */
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 13px; /* 恢复到原来的大小 */
}

.info-value {
  color: #333;
  font-size: 13px; /* 恢复到原来的大小 */
  font-weight: 500;
  text-align: right;
  max-width: 180px; /* 恢复到原来的宽度 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 版本历史样式 */
.version-content {
  padding: 20px; /* 恢复到原来的内边距 */
  max-height: 600px; /* 恢复到原来的高度 */
  overflow-y: auto;
}

.version-record {
  padding: 6px 0;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.version-number {
  font-weight: 700;
  color: #409eff;
  font-size: 14px; /* 恢复到原来的大小 */
}

.version-details {
  font-size: 12px; /* 恢复到原来的大小 */
  color: #666;
}

.operator {
  margin: 6px 0; /* 恢复到原来的外边距 */
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px; /* 恢复到原来的间距 */
}

.description {
  margin: 6px 0; /* 恢复到原来的外边距 */
  color: #333;
  line-height: 1.4;
}

.changes-list {
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.changes-title {
  font-weight: 600;
  margin-bottom: 6px; /* 恢复到原来的外边距 */
  color: #333;
  font-size: 11px; /* 恢复到原来的大小 */
}

.changes-list ul {
  margin: 0;
  padding-left: 12px;
}

.changes-list li {
  margin: 3px 0; /* 恢复到原来的外边距 */
  display: flex;
  align-items: center;
  gap: 4px; /* 恢复到原来的间距 */
  font-size: 11px; /* 恢复到原来的大小 */
}

.change-field {
  font-weight: 500;
  color: #333;
}

.change-old {
  color: #f56c6c;
  text-decoration: line-through;
}

.change-arrow {
  color: #909399;
  font-size: 10px; /* 恢复到原来的大小 */
}

.change-new {
  color: #67c23a;
  font-weight: 500;
}

/* 版本对话框样式 */
.version-dialog .el-dialog__body {
  padding: 24px;
}

.change-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.change-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 空数据状态样式 */
.no-data {
  padding: 40px 24px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .content-wrapper {
    gap: 24px;
  }
  
  .info-panel {
    flex: 0 0 350px;
  }
  
  .control-group {
    min-width: 180px;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    gap: 24px;
  }
  
  .info-panel {
    flex: none;
    width: 100%;
  }
  
  .control-group {
    min-width: unset; /* 在小屏幕上取消最小宽度限制 */
    width: 100%; /* 占据整列 */
  }
  
  .three-container {
    height: 400px;
  }

  .light-control-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .light-slider-wrapper {
    width: 100%;
  }

  .control-buttons .el-button {
    min-width: unset; /* 在小屏幕上取消最小宽度限制 */
    width: 100%; /* 按钮占据整行 */
  }
}

@media (max-width: 1200px) {
  .threejs-controls-container {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕下变为两列 */
  }
}

@media (max-width: 1200px) {
  .threejs-controls-container {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕下变为两列 */
  }
}

@media (max-width: 768px) {
  .threejs-controls-container {
    grid-template-columns: 1fr; /* 小屏幕下变为单列 */
  }

  .control-buttons .el-button {
    min-width: unset; /* 在小屏幕上取消最小宽度限制 */
    width: 100%; /* 按钮占据整行 */
  }
}

@media (max-width: 768px) {
  .detail-main {
    padding: 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .detail-title-text {
    font-size: 20px;
  }
  
  .content-wrapper {
    flex-direction: column;
    gap: 20px;
  }
  
  .version-panel {
    order: 1;
    width: 100%;
    max-height: 400px;
  }
  
  .model-viewer-section {
    order: 2;
  }
  
  .info-panel {
    order: 3;
    width: 100%;
    flex: none;
  }
  
  .viewer-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .viewer-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .model-viewer-container {
    padding: 16px;
  }
  
  .three-container {
    height: 300px;
  }
  
  .threejs-controls-container {
    flex-direction: column;
    align-items: center;
  }
  
  .control-group {
    width: 100%;
    max-width: 300px;
  }
  
  .section-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .model-info {
    padding: 20px;
  }
  
  .info-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-value {
    text-align: left;
    max-width: none;
  }
  
  .version-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .detail-main {
    padding: 12px;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .back-btn, .download-btn {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .detail-title-text {
    font-size: 18px;
  }
  
  .viewer-header {
    padding: 12px 16px;
  }
  
  .model-viewer-container {
    padding: 12px;
  }
  
  .three-container {
    height: 250px;
  }
  
  .control-group {
    padding: 12px;
  }
  
  .section-header {
    padding: 12px 16px;
  }
  
  .model-info {
    padding: 16px;
  }
  
  .version-content {
    padding: 16px;
  }
}

/* 滚动条样式 */
.version-content::-webkit-scrollbar {
  width: 6px;
}

.version-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.version-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.version-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-section {
  animation: fadeInUp 0.6s ease-out;
}

.info-section:nth-child(2) {
  animation-delay: 0.2s;
}

/* 悬停效果增强 */
.control-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.control-buttons .el-button:active {
  transform: scale(0.95);
}

/* 标签样式优化 */
.el-tag {
  border-radius: 6px;
  font-weight: 500;
}

/* 时间轴样式优化 */
.el-timeline-item__node {
  background-color: #409eff;
}

.el-timeline-item__wrapper {
  padding-left: 20px;
}

.el-timeline-item__timestamp {
  color: #999;
  font-size: 12px; /* 恢复到原来的大小 */
}
</style>