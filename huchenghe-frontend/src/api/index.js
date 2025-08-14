import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

// 添加请求拦截器，处理文件上传
api.interceptors.request.use(
  (config) => {
    // 如果是FormData，设置合适的Content-Type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const modelAPI = {
  // 获取模型列表
  getModels(params) {
    return api.get('/models', { params });
  },
  
  // 获取模型详情
  getModelById(id) {
    return api.get(`/models/${id}`);
  },
  
  // 获取模型总数
  getModelCount(params) {
    return api.get('/models/count', { params });
  },
  
  // 创建模型（上传文件）
  createModel(formData) {
    return api.post('/models/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 更新模型
  updateModel(id, data) {
    return api.put(`/models/${id}`, data);
  },
  
  // 删除模型
  deleteModel(id) {
    return api.delete(`/models/${id}`);
  }
};

export const authAPI = {
  // 用户登录
  login(credentials) {
    return api.post('/auth/login', credentials);
  }
};

export default api;