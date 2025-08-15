// API配置文件
// 根据环境自动选择正确的API地址

// 获取当前域名
const getCurrentDomain = () => {
  return window.location.hostname;
};

// 获取当前协议
const getCurrentProtocol = () => {
  return window.location.protocol;
};

// 获取当前端口
const getCurrentPort = () => {
  return window.location.port;
};

// 判断是否为本地开发环境
const isLocalDevelopment = () => {
  const hostname = getCurrentDomain();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
};

// 判断是否为公网环境
const isPublicNetwork = () => {
  const hostname = getCurrentDomain();
  return !isLocalDevelopment() && hostname !== 'localhost' && hostname !== '127.0.0.1';
};

// 获取API基础URL
export const getApiBaseURL = () => {
  const protocol = getCurrentProtocol();
  const hostname = getCurrentDomain();
  const port = getCurrentPort();
  
  // 如果是本地开发环境
  if (isLocalDevelopment()) {
    // 如果前端运行在5173端口，后端API在3000端口
    if (port === '5173' || port === '3000') {
      return 'http://localhost:3000/api';
    }
    // 如果前端运行在其他端口，使用当前域名+3000端口
    return `${protocol}//${hostname}:3000/api`;
  }
  
  // 如果是云服务器环境
  if (hostname === '114.67.238.92') {
    return 'http://114.67.238.92/api';
  }
  
  // 如果是公网环境
  if (isPublicNetwork()) {
    // 使用当前域名，假设后端API在同一域名下
    return `${protocol}//${hostname}/api`;
  }
  
  // 默认情况
  return 'http://localhost:3000/api';
};

// 获取WebSocket URL（如果需要）
export const getWebSocketURL = () => {
  const protocol = getCurrentProtocol() === 'https:' ? 'wss:' : 'ws:';
  const hostname = getCurrentDomain();
  
  if (isLocalDevelopment()) {
    return `${protocol}//${hostname}:3000`;
  }
  
  if (isPublicNetwork()) {
    return `${protocol}//${hostname}:3000`;
  }
  
  return 'ws://localhost:3000';
};

// 环境信息
export const getEnvironmentInfo = () => {
  return {
    isLocalDevelopment: isLocalDevelopment(),
    isPublicNetwork: isPublicNetwork(),
    currentDomain: getCurrentDomain(),
    currentProtocol: getCurrentProtocol(),
    currentPort: getCurrentPort(),
    apiBaseURL: getApiBaseURL(),
    webSocketURL: getWebSocketURL()
  };
};

// 导出配置
export default {
  getApiBaseURL,
  getWebSocketURL,
  getEnvironmentInfo
};
