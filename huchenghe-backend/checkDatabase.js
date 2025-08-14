/**
 * 检查数据库表结构脚本
 * 用于验证护橙河三维模型管理系统的数据库表结构
 */

const pool = require('./db');

async function checkDatabase() {
  try {
    console.log('开始检查数据库结构...');
    
    // 检查用户表结构
    console.log('\n=== 用户表结构 ===');
    const [userColumns] = await pool.execute('DESCRIBE user');
    console.log('用户表字段:');
    userColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''} ${col.Comment ? `COMMENT '${col.Comment}'` : ''}`);
    });
    
    // 检查用户表数据
    console.log('\n=== 用户表数据 ===');
    const [users] = await pool.execute('SELECT id, username, phone, role, email, create_time FROM user');
    console.log('用户数据:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 用户名: ${user.username}, 手机号: ${user.phone}, 角色: ${user.role}, 邮箱: ${user.email || '无'}, 创建时间: ${user.create_time}`);
    });
    
    // 检查模型表结构
    console.log('\n=== 模型表结构 ===');
    const [modelColumns] = await pool.execute('DESCRIBE models');
    console.log('模型表字段:');
    modelColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''} ${col.Comment ? `COMMENT '${col.Comment}'` : ''}`);
    });
    
    // 检查模型表数据
    console.log('\n=== 模型表数据 ===');
    const [models] = await pool.execute('SELECT id, model_code, name, category, area, address, quantity, create_time FROM models');
    console.log('模型数据:');
    models.forEach(model => {
      console.log(`  ID: ${model.id}, 编码: ${model.model_code}, 名称: ${model.name}, 类别: ${model.category}, 区域: ${model.area || '无'}, 地址: ${model.address || '无'}, 数量: ${model.quantity}, 创建时间: ${model.create_time}`);
    });
    
    console.log('\n数据库结构检查完成！');
    
  } catch (error) {
    console.error('数据库结构检查失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await pool.end();
    console.log('数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;
