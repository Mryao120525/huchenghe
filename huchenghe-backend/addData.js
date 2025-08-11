/*
  addData.js
  独立脚本用于测试数据库连接并添加示例数据
*/

const pool = require('./db');

async function addSampleData() {
  console.log('开始连接数据库...');
  
  try {
    // 测试数据库连接
    const [connection] = await pool.execute('SELECT 1');
    console.log('数据库连接成功');
    
    // 插入示例数据
    const sampleModel = {
      name: '示例模型',
      version: 'v1.0',
      format: 'OBJ',
      type: '雕塑',
      path: '/models/sample.obj',
      uploader: '系统管理员'
    };
    
    // 使用当前时间作为上传时间
    const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('正在插入示例数据...');
    // 执行插入操作
    const [result] = await pool.execute(
      'INSERT INTO models (name, version, format, type, path, uploader, uploadTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sampleModel.name, sampleModel.version, sampleModel.format, sampleModel.type, sampleModel.path, sampleModel.uploader, uploadTime]
    );
    
    console.log('示例数据添加成功!');
    console.log('插入的记录ID:', result.insertId);
    
    // 查询并显示刚刚插入的数据
    const [rows] = await pool.execute('SELECT * FROM models WHERE id = ?', [result.insertId]);
    console.log('插入的数据:', rows[0]);
    
    // 关闭连接池
    await pool.end();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 执行函数
addSampleData();