/**
 * 创建数据库脚本
 * 用于创建护橙河三维模型管理系统的数据库
 */

const mysql = require('mysql2');

// 创建不指定数据库的连接
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Bkc123456'
});

async function createDatabase() {
  try {
    console.log('开始创建数据库...');
    
    // 测试连接
    console.log('测试数据库连接...');
    await connection.promise().execute('SELECT 1');
    console.log('数据库连接成功！');
    
    // 创建数据库
    console.log('创建数据库 huchenghe...');
    await connection.promise().execute('CREATE DATABASE IF NOT EXISTS huchenghe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('数据库 huchenghe 创建成功！');
    
    // 验证数据库是否创建成功
    console.log('验证数据库是否创建成功...');
    const [databases] = await connection.promise().execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'huchenghe');
    
    if (dbExists) {
      console.log('数据库创建验证成功！');
    } else {
      console.log('数据库创建验证失败！');
    }
    
  } catch (error) {
    console.error('创建数据库失败:', error);
    console.error('错误详情:', {
      code: error.code,
      errno: error.errno,
      message: error.message
    });
    process.exit(1);
  } finally {
    // 关闭连接
    console.log('关闭数据库连接...');
    connection.end();
    console.log('数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;
