/*
  testApi.js
  API接口测试脚本
*/

const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('测试API接口...\n');
    
    // 测试获取模型列表
    console.log('1. 测试获取模型列表...');
    const modelsResponse = await axios.get(`${baseURL}/models`);
    console.log('响应状态:', modelsResponse.status);
    console.log('响应数据:', modelsResponse.data);
    console.log('数据条数:', modelsResponse.data.length);
    
    // 测试获取模型总数
    console.log('\n2. 测试获取模型总数...');
    const countResponse = await axios.get(`${baseURL}/models/count`);
    console.log('响应状态:', countResponse.status);
    console.log('响应数据:', countResponse.data);
    
    // 测试根路径
    console.log('\n3. 测试根路径...');
    const rootResponse = await axios.get('http://localhost:3000/');
    console.log('响应状态:', rootResponse.status);
    console.log('响应数据:', rootResponse.data);
    
  } catch (error) {
    console.error('API测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 执行测试
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
