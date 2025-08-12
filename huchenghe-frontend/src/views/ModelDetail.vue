<!--
ModelDetail.vue
三维模型管理系统的模型详情页，展示单个模型的详细信息。
-->

<template>
  <el-container>
    <el-header class="detail-header">
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; height: 100%;">
        <el-button type="info" @click="goBack">返回模型列表</el-button>
        <span class="detail-title-text">
          模型详情 - {{ modelDetail ? modelDetail.name : '' }}
        </span>
        <el-button type="primary" @click="downloadModel" :disabled="!modelDetail || !modelDetail.model_path">下载模型</el-button>
      </div>
    </el-header>
    <el-main style="display: flex; gap: 20px; position: relative;">
      <div class="side-tab-single">
        <span>网格</span>
      </div>
      <div style="flex-basis: 70%; flex-shrink: 1; flex-grow: 1; min-width: 400px; max-width: 1000px; display: flex; flex-direction: column;">
        <div id="three-container" style="width: 100%; height: 600px; border: 1px solid #ccc; background-color: #f5f5f5;"></div>
      </div>
      <div style="flex-basis: 30%; flex-shrink: 0; flex-grow: 0; min-width: 200px; max-width: 600px; display: flex; flex-direction: column; gap: 20px;">
        <div style="height: 600px; display: flex; flex-direction: column; gap: 20px;">
          <el-card style="flex: 1 1 0; min-height: 0;">
            <template #header>
              <div class="card-header">
                <span>模型属性</span>
              </div>
            </template>
            <div v-if="modelDetail">
              <p><strong>ID:</strong> {{ modelDetail.id }}</p>
              <p><strong>模型名称:</strong> {{ modelDetail.name }}</p>
              <p><strong>类别:</strong> {{ modelDetail.category }}</p>
              <p><strong>区域:</strong> {{ modelDetail.area }}</p>
              <p><strong>主址:</strong> {{ modelDetail.address }}</p>
              <p><strong>数量:</strong> {{ modelDetail.quantity }}</p>
              <p><strong>图片路径:</strong> {{ modelDetail.image_path }}</p>
              <p><strong>渲染图路径:</strong> {{ modelDetail.render_path }}</p>
              <p><strong>模型文件路径:</strong> {{ modelDetail.model_path }}</p>
              <p><strong>创建时间:</strong> {{ modelDetail.create_time }}</p>
              <p><strong>更新时间:</strong> {{ modelDetail.update_time }}</p>
            </div>
            <div v-else>
              <p>未找到该模型信息</p>
            </div>
          </el-card>
          <el-card style="flex: 1 1 0; min-height: 0;">
            <template #header>
              <div class="card-header">
                <span>版本历史</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item timestamp="2023-01-01" placement="top">
                <p>v1.0 - 用户A上传</p>
              </el-timeline-item>
              <el-timeline-item timestamp="2023-01-05" placement="top">
                <p>v1.1 - 用户B更新</p>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>
      </div>
    </el-main>
  </el-container>
</template>


<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
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



let renderer, scene, camera, animationId, controls;
let loadedModel = ref(null);
let transformControls = null;
let handleResize;

const getApiOrigin = () => {
  const base = api.defaults.baseURL || '';
  return base.replace(/\/?api\/?$/, '');
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
        object.scale.set(0.1, 0.1, 0.1);
        scene.add(object);
        loadedModel.value = object;
        renderer.domElement.addEventListener('pointermove', onModelHover);
        renderer.domElement.addEventListener('pointerdown', onModelClick);
      },
      undefined,
      (error) => {
        console.error('FBX 加载失败', error);
      }
    );
  } else {
    console.warn('暂未支持的模型格式:', ext, fullUrl);
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
  const axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);
  // 网格地面
  const gridHelper = new THREE.GridHelper(10, 20);
  scene.add(gridHelper);
  // 灯光
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // 拉取后端模型详情，并按 model_path 加载三维模型
  try {
    loading.value = true;
    const id = route.params.id;
    const resp = await modelAPI.getModelById(id);
    modelDetail.value = resp.data;
    loadThreeModel(modelDetail.value?.model_path);
  } catch (e) {
    console.error('获取模型详情失败:', e);
    errorMsg.value = '获取模型详情失败';
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
</script>

<style scoped>
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
.side-tab-single {
  position: absolute;
  left: -60px;
  top: 40px;
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #545c64;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  z-index: 10;
}
.side-tab-single:hover {
  background: #4f8cff;
  color: #fff;
}
</style>