/*
  addSampleData.js
  用于向数据库添加示例数据的脚本
*/

const pool = require('./db');

// 添加示例数据的函数
async function addSampleData() {
  try {
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
  } catch (error) {
    console.error('添加示例数据时出错:', error);
  }
}

// 如果直接运行此脚本，则执行添加数据操作
if (require.main === module) {
  addSampleData();
}

module.exports = addSampleData;