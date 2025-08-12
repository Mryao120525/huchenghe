/*
  testSimpleQuery.js
  测试简单查询的脚本
*/

const pool = require('./db');

async function testSimpleQuery() {
  try {
    console.log('测试简单查询...\n');
    
    // 测试1: 使用别名查询
    console.log('1. 测试别名查询...');
    const sql = 'SELECT id, model_code, name, category, region as area, address, quantity, image_url as imagePath, render_url as renderPath, nas_path as modelPath, remark, created_at as createTime, updated_at as updateTime FROM models LIMIT 1';
    console.log('SQL:', sql);
    
    const [result] = await pool.execute(sql);
    console.log('查询结果:', result);
    
  } catch (error) {
    console.error('查询失败:', error);
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
  } finally {
    await pool.end();
  }
}

// 执行测试
if (require.main === module) {
  testSimpleQuery();
}

module.exports = testSimpleQuery;
