 
<template>
  <el-container>
    <el-header style="background-color: #545c32; height: 72px; display: flex; align-items: center;">
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; height: 100%;">
        <el-button type="info" @click="goBack">返回模型列表</el-button>
        <span style="color: #fff; font-size: 20px; font-weight: bold; display: flex; align-items: center; height: 100%;">
          模型详情 - {{ modelName }}
        </span>
        <el-button type="primary">下载模型</el-button>
      </div>
    </el-header>

    <el-main style="display: flex; gap: 20px; position: relative;">
      <!-- 左侧操作标签 -->
      <div class="side-tab-single">
        <span>网格</span>
      </div>
  <div id="three-container" style="flex: 3; border: 1px solid #ccc; background-color: #f5f5f5; height: 600px;"></div>
      
      <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>模型属性</span>
            </div>
          </template>

          <div>
            <p><strong>文件名:</strong> 模型-{{ route.params.id }}.fbx</p>
            <p><strong>上传者:</strong> 用户A</p>
            <p><strong>上传时间:</strong> 2023-01-01</p>
          </div>
        </el-card>
        
        <el-card>
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
    </el-main>
  </el-container>
</template>


<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const router = useRouter();
const route = useRoute();

// 本地模拟模型数据
const modelList = [
  { id: '1', name: '战斗机' },
  { id: '2', name: '装甲车' },
  { id: '3', name: '火箭发射器' },
];

const modelName = computed(() => {
  const found = modelList.find(item => String(item.id) === String(route.params.id));
  return found ? found.name : '未命名模型';
});

const goBack = () => {
  router.push('/');
};

let renderer, scene, camera, animationId;


onMounted(() => {
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
  container.appendChild(renderer.domElement);
  // 轨道控制
  const controls = new OrbitControls(camera, renderer.domElement);
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
  // 动画循环
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

onBeforeUnmount(() => {
  if (renderer && renderer.domElement) {
    renderer.domElement.remove();
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
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