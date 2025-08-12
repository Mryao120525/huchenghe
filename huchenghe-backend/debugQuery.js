/*
  debugQuery.js
  调试SQL查询的脚本
*/

const pool = require('./db');

async function debugQuery() {
  try {
    console.log('开始调试SQL查询...\n');
    
    // 测试1: 最简单的查询
    console.log('1. 测试简单查询...');
    const [simpleResult] = await pool.execute('SELECT * FROM models LIMIT 1');
    console.log('简单查询结果:', simpleResult);
    
    // 测试2: 带字段的查询
    console.log('\n2. 测试带字段的查询...');
    const [fieldResult] = await pool.execute('SELECT id, name, category FROM models LIMIT 1');
    console.log('字段查询结果:', fieldResult);
    
    // 测试3: 检查表结构
    console.log('\n3. 检查表结构...');
    const [columns] = await pool.execute('DESCRIBE models');
    console.log('表字段:', columns.map(col => col.Field));
    
    // 测试4: 检查数据
    console.log('\n4. 检查数据...');
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM models');
    console.log('记录数:', count[0].count);
    
    if (count[0].count > 0) {
      const [allData] = await pool.execute('SELECT * FROM models');
      console.log('所有数据:', allData);
    }
    
  } catch (error) {
    console.error('调试查询失败:', error);
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
  } finally {
    await pool.end();
  }
}

// 执行调试
if (require.main === module) {
  debugQuery();
}

module.exports = debugQuery;
