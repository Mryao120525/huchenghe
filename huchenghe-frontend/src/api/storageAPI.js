/**
 * 存储空间管理API接口
 * 提供存储空间监控、文件管理、空间清理等功能
 */

import request from './request';

// 存储空间信息
export const getStorageInfo = () => {
  return request({
    url: '/storage/info',
    method: 'get'
  });
};

// 获取文件列表
export const getFileList = (params) => {
  return request({
    url: '/storage/files',
    method: 'get',
    params
  });
};

// 删除文件
export const deleteFile = (fileId) => {
  return request({
    url: `/storage/files/${fileId}`,
    method: 'delete'
  });
};

// 批量删除文件
export const batchDeleteFiles = (fileIds) => {
  return request({
    url: '/storage/files/batch-delete',
    method: 'delete',
    data: { fileIds }
  });
};

// 下载文件
export const downloadFile = (fileId) => {
  return request({
    url: `/storage/files/${fileId}/download`,
    method: 'get',
    responseType: 'blob'
  });
};

// 扫描可清理文件
export const scanCleanupFiles = () => {
  return request({
    url: '/storage/cleanup/scan',
    method: 'get'
  });
};

// 执行清理操作
export const executeCleanup = (options) => {
  return request({
    url: '/storage/cleanup/execute',
    method: 'post',
    data: options
  });
};

// 快速清理
export const quickCleanup = () => {
  return request({
    url: '/storage/cleanup/quick',
    method: 'post'
  });
};

// 获取存储设置
export const getStorageSettings = () => {
  return request({
    url: '/storage/settings',
    method: 'get'
  });
};

// 更新存储设置
export const updateStorageSettings = (settings) => {
  return request({
    url: '/storage/settings',
    method: 'put',
    data: settings
  });
};

// 获取文件类型统计
export const getFileTypeStats = () => {
  return request({
    url: '/storage/stats/file-types',
    method: 'get'
  });
};

// 获取存储使用趋势
export const getStorageTrends = (params) => {
  return request({
    url: '/storage/stats/trends',
    method: 'get',
    params
  });
};
