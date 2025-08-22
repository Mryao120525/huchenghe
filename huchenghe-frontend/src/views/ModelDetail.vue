<!--
ModelDetail.vue
三维模型管理系统的模型详情页，展示单个模型的详细信息。
-->

<template>
  
  <el-container class="main-container">
    <el-header class="detail-header">
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; height: 100%;">
        <el-button type="info" @click="goBack">返回模型列表</el-button>
        <span class="detail-title-text">
          模型详情 - {{ modelDetail ? modelDetail.name : '' }}
        </span>
        <el-button type="primary" @click="downloadModel" :disabled="!modelDetail || !modelDetail.model_path">下载模型</el-button>
      </div>
    </el-header>
    <el-main style="display: flex; gap: 20px; position: relative; padding-top: 8px;">
      <!-- 3D模型显示区域 - 居中显示 -->
      <div class="model-viewer-container">
        <div id="three-container" class="three-container">
          <div class="threejs-controls-container">
          <!-- 场景控制 -->
          <div class="control-group scene-controls">
            <el-button-group>
              <el-button 
                type="primary" 
                size="small" 
                @click="resetScene"
                :icon="Refresh"
                title="重置场景"
              />
              <el-button 
                :type="showGrid ? 'success' : 'default'" 
                size="small" 
                @click="() => { showGrid = !showGrid; toggleGrid(showGrid); }"
                :icon="Grid"
                :title="showGrid ? '隐藏网格' : '显示网格'"
              />
              <el-button 
                :type="showAxes ? 'warning' : 'default'" 
                size="small" 
                @click="() => { showAxes = !showAxes; toggleAxes(showAxes); }"
                :icon="Position"
                :title="showAxes ? '隐藏坐标轴' : '显示坐标轴'"
              />
              <el-button 
                :type="showMaterial ? 'info' : 'default'" 
                size="small" 
                @click="() => { showMaterial = !showMaterial; toggleMaterial(showMaterial); }"
                :icon="Picture"
                :title="showMaterial ? '隐藏材质' : '显示材质'"
              />
            </el-button-group>
          </div>
            <!-- 模型操作 -->
            <div class="control-group model-controls">
              <el-button-group>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="resetCamera"
                  :icon="Refresh"
                  title="重置视角"
                />
                <el-button 
                  type="success" 
                  size="small" 
                  @click="fitModel"
                  :icon="FullScreen"
                  title="适应模型"
                />
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="toggleWireframeMode"
                  :icon="Grid"
                  :title="showWireframe ? '切换至实体模式' : '切换至线框模式'"
                />
              </el-button-group>
            </div>
            
            <!-- 贴图控制 -->
            <div class="control-group texture-controls">
              <el-button-group>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="increaseTexture"
                  :icon="Plus"
                  title="增强贴图"
                />
                <el-button 
                  type="info" 
                  size="small" 
                  @click="decreaseTexture"
                  :icon="Minus"
                  title="减弱贴图"
                />
                <el-button 
                  :type="showTexture ? 'danger' : 'default'" 
                  size="small" 
                  @click="() => { showTexture = !showTexture; toggleTexture(showTexture); }"
                  :icon="Picture"
                  :title="showTexture ? '隐藏贴图' : '显示贴图'"
                />
              </el-button-group>
            </div>
            
            <!-- 灯光控制 -->
            <div class="control-group light-controls">
              <div class="light-toggle">
                <el-tooltip :content="showAmbientLight ? '关闭环境光' : '开启环境光'" placement="top">
                  <el-switch v-model="showAmbientLight" @change="toggleAmbientLight" />
                </el-tooltip>
              </div>
              <div class="light-control-item">
                <el-tooltip content="主光源强度" placement="top">
                  <el-slider 
                    v-model="mainLightIntensity" 
                    :min="0" 
                    :max="10" 
                    :step="0.1"
                    @change="updateMainLight"
                    :show-tooltip="false"
                    height="80px"
                    vertical
                  />
                </el-tooltip>
              </div>
              <div class="light-control-item">
                <el-tooltip content="环境光强度" placement="top">
                  <el-slider 
                    v-model="ambientLightIntensity" 
                    :min="0" 
                    :max="10" 
                    :step="0.1"
                    @change="updateAmbientLight"
                    :show-tooltip="false"
                    height="80px"
                    vertical
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 模型属性 -->
        <div class="info-section">
          <h3 class="section-title">模型属性</h3>
          <div class="model-info" v-if="modelDetail">
            <div class="info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ modelDetail.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">模型名称:</span>
              <span class="info-value">{{ modelDetail.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">类别:</span>
              <span class="info-value">{{ modelDetail.category }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">区域:</span>
              <span class="info-value">{{ modelDetail.area }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">主址:</span>
              <span class="info-value">{{ modelDetail.address }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数量:</span>
              <span class="info-value">{{ modelDetail.quantity }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间:</span>
              <span class="info-value">{{ modelDetail.create_time }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span class="info-value">{{ modelDetail.update_time }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>未找到该模型信息</p>
          </div>
        </div>
        
        <!-- 版本历史 -->
        <div class="info-section">
          <div class="section-header">
            <h3 class="section-title">版本历史</h3>
            <el-button type="primary" size="small" @click="showVersionDialog = true">添加记录</el-button>
          </div>
          <div class="version-content" v-if="versionHistory && versionHistory.length > 0">
            <el-timeline>
              <el-timeline-item 
                v-for="(record, index) in versionHistory" 
                :key="index"
                :timestamp="formatTimestamp(record.timestamp)" 
                placement="top"
                :type="getTimelineItemType(record.action)"
              >
                <div class="version-record">
                  <div class="version-header">
                    <span class="version-number">v{{ record.version }}</span>
                    <span class="action-type" :class="getActionClass(record.action)">
                      {{ getActionText(record.action) }}
                    </span>
                  </div>
                  <div class="version-details">
                    <p class="operator">操作人: {{ record.operator }}</p>
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
            <p>暂无版本记录</p>
          </div>
        </div>
      </div>
    </el-main>
    
    <!-- 版本记录添加对话框 -->
    <el-dialog 
      v-model="showVersionDialog" 
      title="添加版本记录" 
      width="500px"
      :before-close="handleVersionDialogClose"
    >
      <el-form :model="newVersionForm" :rules="versionFormRules" ref="versionFormRef" label-width="100px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="newVersionForm.version" placeholder="请输入版本号，如：1.2.3" />
        </el-form-item>
        <el-form-item label="操作类型" prop="action">
          <el-select v-model="newVersionForm.action" placeholder="请选择操作类型" style="width: 100%;">
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="修改" value="modify" />
            <el-option label="上传" value="upload" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
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
  Position 
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

let renderer, scene, camera, animationId, controls;
let loadedModel = ref(null);
let transformControls = null;
let handleResize;

// 场景对象引用
let axesHelper = null;
let gridHelper = null;
let directionalLight = null;
let ambientLight = null;

// 贴图强度控制
let textureIntensity = ref(1.0);

const getApiOrigin = () => {
  const base = api.defaults.baseURL || '';
  return base.replace(/\/?api\/?$/, '');
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
  if (!path) return;
  const origin = getApiOrigin();
  const fullUrl = path.startsWith('http') ? path : `${origin}${path}`;
  const ext = (fullUrl.split('.').pop() || '').toLowerCase();
  // 仅示例支持 FBX
  if (ext === 'fbx') {
    const loader = new FBXLoader();
    loader.load(
      fullUrl,
      (object) => {
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
        
        scene.add(object);
        loadedModel.value = object;
        
        // 自动缩放和居中
        fitCameraToObject(object, 1.5, controls);
        
        renderer.domElement.addEventListener('pointermove', onModelHover);
        renderer.domElement.addEventListener('pointerdown', onModelClick);
      },
      undefined,
      (error) => {
        console.error('FBX 加载失败', error);
        ElMessage.error('模型加载失败');
      }
    );
  } else {
    console.warn('暂未支持的模型格式:', ext, fullUrl);
    ElMessage.warning('暂不支持该模型格式');
  }
};

onMounted(async () => {
  const container = document.getElementById('three-container');
  if (!container) return;
  // 场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);
  // 相机
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(3, 3, 6);
  camera.lookAt(0, 0, 0);
  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // 监听窗口缩放，动态调整threejs画布和相机
  handleResize = function () {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', handleResize);
  // 轨道控制
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // 坐标轴辅助
  axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);
  // 网格地面
  gridHelper = new THREE.GridHelper(10, 20);
  scene.add(gridHelper);
  // 方向光
  directionalLight = new THREE.DirectionalLight(0xffffff, mainLightIntensity.value);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  // 环境光
  ambientLight = new THREE.AmbientLight(0x404040, ambientLightIntensity.value);
  scene.add(ambientLight);

  // 拉取后端模型详情，并按 model_path 加载三维模型
  try {
    loading.value = true;
    const id = route.params.id;
    const resp = await modelAPI.getModelById(id);
    modelDetail.value = resp.data;
    loadThreeModel(modelDetail.value?.model_path);
    
    // 初始化版本历史
    initVersionHistory();
  } catch (e) {
    console.error('获取模型详情失败:', e);
    errorMsg.value = '获取模型详情失败';
    ElMessage.error('获取模型详情失败');
  } finally {
    loading.value = false;
  }

  // 高亮相关变量
  let lastOutline = null;
  // 鼠标悬停高亮并显示坐标轴
  function onModelHover(event) {
    if (!loadedModel.value) return;
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
      // 显示坐标轴
      if (!transformControls) {
        transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.attach(loadedModel.value);
        scene.add(transformControls);
        transformControls.addEventListener('mouseDown', function () {
          controls.enabled = false;
        });
        transformControls.addEventListener('mouseUp', function () {
          controls.enabled = true;
        });
      }
    } else {
      removeHighlight(loadedModel.value);
      if (transformControls) {
        scene.remove(transformControls);
        transformControls.dispose && transformControls.dispose();
        transformControls = null;
      }
    }
  }

  // 高亮模型边缘
  function highlightModel(model) {
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
  }
  function removeHighlight(model) {
    model.traverse(child => {
      if (child.isMesh && child.userData._origMaterial) {
        child.material = child.userData._origMaterial;
        child.material.needsUpdate = true;
      }
    });
  }

  // 点击模型时无操作，坐标轴已在悬停时出现
  function onModelClick(event) {}

  // 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

onBeforeUnmount(() => {
  if (handleResize) window.removeEventListener('resize', handleResize);
  if (renderer && renderer.domElement) {
    renderer.domElement.remove();
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

const downloadModel = () => {
  if (!modelDetail.value?.model_path) return;
  const origin = getApiOrigin();
  const fullUrl = `${origin}${modelDetail.value.model_path}`;
  window.open(fullUrl, '_blank');
};

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
/* 动态背景样式 */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.bg-circle:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-circle:nth-child(2) {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.bg-circle:nth-child(3) {
  width: 60px;
  height: 60px;
  top: 60%;
  left: 20%;
  animation-delay: 2s;
}

.bg-circle:nth-child(4) {
  width: 100px;
  height: 100px;
  top: 70%;
  right: 10%;
  animation-delay: 3s;
}

.bg-circle:nth-child(5) {
  width: 90px;
  height: 90px;
  top: 40%;
  left: 50%;
  animation-delay: 4s;
}

.bg-circle:nth-child(6) {
  width: 70px;
  height: 70px;
  top: 80%;
  left: 70%;
  animation-delay: 5s;
}

.bg-circle:nth-child(7) {
  width: 110px;
  height: 110px;
  top: 30%;
  right: 30%;
  animation-delay: 6s;
}

.bg-circle:nth-child(8) {
  width: 50px;
  height: 50px;
  top: 90%;
  right: 60%;
  animation-delay: 7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-40px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
    opacity: 0.6;
  }
}

.main-container {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  min-height: 100vh;
}

.detail-header {
  background: linear-gradient(270deg, #4f8cff, #6ee7b7, #fbbf24, #f87171, #4f8cff);
  background-size: 1000% 100%;
  animation: gradientMove 8s ease-in-out infinite;
  height: 72px;
  display: flex;
  align-items: center;
}
.detail-title-text {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  height: 100%;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 0 16px;
  border-radius: 8px;
}
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 侧边控制面板样式 */
.side-control-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  z-index: 10;
  transition: left 0.3s ease-in-out;
}

.side-control-panel.collapsed {
  left: -280px; /* 控制面板折叠时的位置 */
}

.control-toggle {
  position: absolute;
  top: 10px;
  right: -20px; /* 控制面板折叠时的位置 */
  width: 20px;
  height: 40px;
  background-color: #4f8cff;
  border-radius: 0 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 11;
}

.control-toggle .el-icon {
  color: #fff;
  font-size: 18px;
  transition: transform 0.3s ease-in-out;
}

.control-toggle .is-reverse {
  transform: rotate(180deg);
}

.control-content {
  margin-top: 40px; /* 控制面板折叠时的顶部间距 */
}

.control-section {
  margin-bottom: 24px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-item span {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.control-item .el-switch {
  margin-left: 12px;
}

.control-item .el-slider {
  margin-left: 12px;
}

/* 版本历史样式 */

.version-record {
  padding: 8px 0;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.version-number {
  font-weight: bold;
  color: #409eff;
  font-size: 14px;
}

.action-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.action-create {
  background-color: #e1f3d8;
  color: #67c23a;
}

.action-update {
  background-color: #e1f3d8;
  color: #67c23a;
}

.action-delete {
  background-color: #fef0f0;
  color: #f56c6c;
}

.action-upload {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.action-modify {
  background-color: #f0f9ff;
  color: #409eff;
}

.action-default {
  background-color: #f4f4f5;
  color: #909399;
}

.version-details {
  font-size: 13px;
  color: #666;
}

.operator {
  margin: 4px 0;
  font-weight: 500;
}

.description {
  margin: 4px 0;
  color: #333;
}

.changes-list {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.changes-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.changes-list ul {
  margin: 0;
  padding-left: 16px;
}

.changes-list li {
  margin: 2px 0;
  display: flex;
  align-items: center;
  gap: 4px;
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
  font-size: 12px;
}

.change-new {
  color: #67c23a;
  font-weight: 500;
}

/* 3D模型显示区域样式 */
.model-viewer-container {
  flex-basis: 70%;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 400px;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.three-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  position: relative;
}

/* 工具栏样式 */
.model-toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 20px;
  display: flex;
  justify-content: space-around;
  gap: 20px;
  z-index: 10;
}

.toolbar-section {
  flex: 1;
  min-width: 150px;
}

.toolbar-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.toolbar-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.light-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.light-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.light-slider span {
  font-size: 13px;
  color: #666;
}

/* 版本对话框样式 */
.change-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: #fafafa;
}

.change-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 工具栏按钮悬停效果 */
.toolbar-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

/* 控制面板悬停效果 */
.control-toggle:hover {
  background-color: #3a7bd5;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* 右侧信息面板样式 */
.info-panel {
  flex-basis: 30%;
  flex-shrink: 0;
  flex-grow: 0;
  min-width: 320px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px;
}

.info-section {
  flex: 1;
  min-height: 0;
}

.section-title {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 2px solid #4f8cff;
  padding-bottom: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border-left: 3px solid #4f8cff;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  text-align: right;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-content {
  max-height: 280px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .info-panel {
    min-width: 280px;
    max-width: 350px;
  }
}

@media (max-width: 1200px) {
  .side-control-panel {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    margin-bottom: 20px;
    order: -1;
  }
  
  .el-main {
    flex-direction: column !important;
  }

  .model-viewer-container {
    width: 100%;
    min-width: auto;
    max-width: none;
  }

  .three-container {
    width: 100%;
    height: 400px; /* 调整3D模型区域高度 */
  }

  .model-toolbar {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
  }

  .toolbar-section {
    width: 100%;
    text-align: center;
  }

  .toolbar-buttons {
    justify-content: center;
  }

  .light-controls {
    justify-content: center;
  }

  .info-panel {
    width: 100%;
    min-width: auto;
    max-width: none;
    padding: 0 12px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-value {
    text-align: left;
    max-width: none;
  }
  
  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .el-main {
    padding: 8px !important;
  }
  
  .model-viewer-container {
    margin-bottom: 20px;
  }
  
  .info-panel {
    padding: 0 8px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .info-item {
    padding: 6px 8px;
  }
  
  .info-label, .info-value {
    font-size: 13px;
  }
}
</style>