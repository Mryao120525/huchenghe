/*
  migrateModelsTable.js
  数据库迁移脚本，用于更新models表结构以匹配新的字段需求
*/

const pool = require('./db');

async function migrateModelsTable() {
  try {
    console.log('开始更新models表结构...');
    
    // 检查现有表结构
    const [existingColumns] = await pool.execute('DESCRIBE models');
    console.log('当前表结构:', existingColumns.map(col => col.Field));
    
    // 检查是否已经应用了新结构
    const hasNewStructure = existingColumns.some(col => col.Field === 'category');
    
    if (hasNewStructure) {
      console.log('表结构已经是最新版本，无需更新');
      return;
    }
    
    // 重命名旧表
    console.log('重命名旧表...');
    await pool.execute('RENAME TABLE models TO models_old');
    
    // 创建新表
    console.log('创建新表...');
    const createTableSQL = `
      CREATE TABLE models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        area VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        imagePath VARCHAR(500) NOT NULL,
        renderPath VARCHAR(500) NOT NULL,
        modelPath VARCHAR(500) NOT NULL,
        remark TEXT,
        createTime DATETIME NOT NULL,
        updateTime DATETIME NOT NULL,
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_area (area),
        INDEX idx_model_code (model_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await pool.execute(createTableSQL);
    console.log('新表创建成功');
    
    // 迁移旧数据（如果有）
    const [oldRows] = await pool.execute('SELECT * FROM models_old');
    if (oldRows.length > 0) {
      console.log(`迁移 ${oldRows.length} 条旧数据...`);
      
      // 将旧数据迁移到新表结构
      for (const row of oldRows) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const modelCode = 'MIGRATED_' + Date.now() + '_' + Math.round(Math.random() * 1000);
        await pool.execute(
          `INSERT INTO models (model_code, name, category, area, address, quantity, imagePath, renderPath, modelPath, remark, createTime, updateTime) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            modelCode,
            row.name || '未命名模型',
            row.type || '其他',
            '未指定',
            '未指定',
            1,
            row.path || '',
            '',
            row.path || '',
            '',
            now,
            now
          ]
        );
      }
      console.log('数据迁移完成');
    } else {
      console.log('没有旧数据需要迁移');
    }
    
    // 删除旧表（可选，建议先保留以备恢复）
    // await pool.execute('DROP TABLE models_old');
    // console.log('旧表已删除');
    
    console.log('models表结构更新完成！');
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  } finally {
    // 关闭连接池
    pool.end();
  }
}

// 执行迁移
if (require.main === module) {
  migrateModelsTable();
}

module.exports = migrateModelsTable;