/*
  createUnifiedTable.js
  创建统一的数据库表结构
*/

const pool = require('./db');

async function createUnifiedTable() {
  try {
    console.log('开始创建统一的数据库表结构...\n');
    
    // 删除旧表（如果存在）
    console.log('1. 删除旧表...');
    try {
      await pool.execute('DROP TABLE IF EXISTS models');
      console.log('旧表已删除');
    } catch (error) {
      console.log('删除旧表时出错:', error.message);
    }
    
    // 创建新表，使用统一的字段名和数据类型
    console.log('\n2. 创建新表...');
    const createTableSQL = `
      CREATE TABLE models (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        model_code VARCHAR(100) UNIQUE NOT NULL COMMENT '模型编码',
        name VARCHAR(255) NOT NULL COMMENT '模型名称',
        category VARCHAR(100) NOT NULL DEFAULT '其他' COMMENT '模型类别',
        area VARCHAR(100) NOT NULL DEFAULT '未指定' COMMENT '区域',
        address VARCHAR(255) NOT NULL DEFAULT '未指定' COMMENT '主址',
        quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
        image_path VARCHAR(500) NULL COMMENT '图片路径',
        render_path VARCHAR(500) NULL COMMENT '渲染图路径',
        model_path VARCHAR(500) NOT NULL COMMENT '模型文件路径',
        remark TEXT NULL COMMENT '备注',
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_area (area),
        INDEX idx_model_code (model_code),
        INDEX idx_create_time (create_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维模型信息表'
    `;
    
    await pool.execute(createTableSQL);
    console.log('新表创建成功');
    
    // 检查表结构
    console.log('\n3. 检查表结构...');
    const [columns] = await pool.execute('DESCRIBE models');
    console.log('表字段结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''} ${col.Comment ? `COMMENT '${col.Comment}'` : ''}`);
    });
    
    // 插入示例数据
    console.log('\n4. 插入示例数据...');
    const sampleData = [
      {
        model_code: 'SAMPLE_001',
        name: '示例模型1',
        category: '雕塑',
        area: 'A区',
        address: '一楼展厅',
        quantity: 1,
        image_path: '/images/sample1.jpg',
        render_path: '/renders/sample1.png',
        model_path: '/models/sample1.obj',
        remark: '这是一个示例模型'
      },
      {
        model_code: 'SAMPLE_002',
        name: '示例模型2',
        category: '石刻',
        area: 'B区',
        address: '二楼展厅',
        quantity: 2,
        image_path: '/images/sample2.jpg',
        render_path: '/renders/sample2.png',
        model_path: '/models/sample2.fbx',
        remark: '这是另一个示例模型'
      }
    ];
    
    for (const data of sampleData) {
      await pool.execute(
        `INSERT INTO models (model_code, name, category, area, address, quantity, image_path, render_path, model_path, remark) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.model_code, data.name, data.category, data.area, data.address, data.quantity, data.image_path, data.render_path, data.model_path, data.remark]
      );
    }
    console.log('示例数据插入成功');
    
    // 验证数据
    console.log('\n5. 验证数据...');
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM models');
    console.log(`表中共有 ${count[0].count} 条记录`);
    
    const [allData] = await pool.execute('SELECT * FROM models');
    console.log('\n所有数据:');
    allData.forEach((row, index) => {
      console.log(`记录 ${index + 1}:`, row);
    });
    
    console.log('\n统一表结构创建完成！');
    
  } catch (error) {
    console.error('创建表结构时发生错误:', error);
  } finally {
    await pool.end();
  }
}

// 执行创建
if (require.main === module) {
  createUnifiedTable();
}

module.exports = createUnifiedTable;
