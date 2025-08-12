/*
  testDb.js
  数据库连接和表结构测试脚本
*/

const pool = require('./db');

async function testDatabase() {
  try {
    console.log('测试数据库连接...');
    
    // 测试连接
    const [connectionTest] = await pool.execute('SELECT 1 as test');
    console.log('数据库连接成功:', connectionTest);
    
    // 检查表是否存在
    console.log('\n检查数据库表...');
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('现有表:', tables.map(t => Object.values(t)[0]));
    
    // 检查models表结构
    if (tables.some(t => Object.values(t)[0] === 'models')) {
      console.log('\n检查models表结构...');
      const [columns] = await pool.execute('DESCRIBE models');
      console.log('models表字段:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
      });
      
      // 检查是否有数据
      const [count] = await pool.execute('SELECT COUNT(*) as count FROM models');
      console.log(`\nmodels表记录数: ${count[0].count}`);
      
      if (count[0].count > 0) {
        const [sample] = await pool.execute('SELECT * FROM models LIMIT 1');
        console.log('\n示例记录:', sample[0]);
      }
    } else {
      console.log('\nmodels表不存在，需要运行迁移脚本');
    }
    
  } catch (error) {
    console.error('数据库测试失败:', error);
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

// 执行测试
if (require.main === module) {
  testDatabase();
}

module.exports = testDatabase;
