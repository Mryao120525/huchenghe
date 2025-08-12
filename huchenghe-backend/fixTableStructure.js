/*
  fixTableStructure.js
  修复数据库表结构，确保字段名与代码匹配
*/

const pool = require('./db');

async function fixTableStructure() {
  try {
    console.log('开始修复数据库表结构...');
    
    // 检查当前表结构
    const [existingColumns] = await pool.execute('DESCRIBE models');
    console.log('当前表结构:', existingColumns.map(col => col.Field));
    
    // 需要添加或修改的字段
    const requiredFields = {
      'area': 'VARCHAR(100) NULL',
      'imagePath': 'VARCHAR(500) NULL',
      'renderPath': 'VARCHAR(500) NULL',
      'modelPath': 'VARCHAR(500) NULL',
      'createTime': 'DATETIME NULL',
      'updateTime': 'DATETIME NULL'
    };
    
    // 字段映射（旧字段名 -> 新字段名）
    const fieldMappings = {
      'region': 'area',
      'image_url': 'imagePath',
      'render_url': 'renderPath',
      'nas_path': 'modelPath',
      'created_at': 'createTime',
      'updated_at': 'updateTime'
    };
    
    // 先重命名字段，避免重复
    for (const [oldName, newName] of Object.entries(fieldMappings)) {
      const oldFieldExists = existingColumns.some(col => col.Field === oldName);
      const newFieldExists = existingColumns.some(col => col.Field === newName);
      
      if (oldFieldExists && !newFieldExists) {
        console.log(`重命名字段: ${oldName} -> ${newName}`);
        await pool.execute(`ALTER TABLE models CHANGE ${oldName} ${newName} ${requiredFields[newName]}`);
      }
    }
    
    // 检查并添加缺失的字段
    for (const [fieldName, fieldType] of Object.entries(requiredFields)) {
      const fieldExists = existingColumns.some(col => col.Field === fieldName);
      if (!fieldExists) {
        console.log(`添加字段: ${fieldName}`);
        await pool.execute(`ALTER TABLE models ADD COLUMN ${fieldName} ${fieldType}`);
      }
    }
    
    // 检查最终表结构
    const [finalColumns] = await pool.execute('DESCRIBE models');
    console.log('\n修复后的表结构:', finalColumns.map(col => col.Field));
    
    // 检查是否有数据
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM models');
    console.log(`\n表中共有 ${count[0].count} 条记录`);
    
    if (count[0].count > 0) {
      const [sample] = await pool.execute('SELECT * FROM models LIMIT 1');
      console.log('\n示例记录:', sample[0]);
    }
    
    console.log('\n表结构修复完成！');
    
  } catch (error) {
    console.error('修复表结构时发生错误:', error);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

// 执行修复
if (require.main === module) {
  fixTableStructure();
}

module.exports = fixTableStructure;
