/**
 * 数据库初始化脚本
 * 用于创建护橙河三维模型管理系统的数据库表结构
 */

const pool = require('./db');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 直接定义SQL语句
    const sqlStatements = [
      // 创建用户表
      `CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
        \`username\` varchar(50) NOT NULL COMMENT '用户名',
        \`phone\` varchar(20) NOT NULL COMMENT '手机号，用于登录',
        \`password\` varchar(255) NOT NULL COMMENT '密码，支持明文和bcrypt加密',
        \`role\` varchar(20) NOT NULL DEFAULT 'user' COMMENT '用户角色：admin-管理员，user-普通用户',
        \`email\` varchar(100) DEFAULT NULL COMMENT '邮箱地址',
        \`create_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`update_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_phone\` (\`phone\`),
        KEY \`idx_username\` (\`username\`),
        KEY \`idx_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'`,
      
      // 创建模型表
      `CREATE TABLE IF NOT EXISTS \`models\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT '模型ID，主键',
        \`model_code\` varchar(50) NOT NULL COMMENT '模型编码，唯一标识',
        \`name\` varchar(100) NOT NULL COMMENT '模型名称',
        \`category\` varchar(50) DEFAULT NULL COMMENT '模型类别：石刻、石碑、雕塑、造像、其他',
        \`area\` varchar(50) DEFAULT NULL COMMENT '区域：A区、B区等',
        \`address\` varchar(200) DEFAULT NULL COMMENT '主址/地址',
        \`quantity\` int(11) DEFAULT 1 COMMENT '数量',
        \`image_path\` varchar(500) DEFAULT NULL COMMENT '图片路径',
        \`render_path\` varchar(500) DEFAULT NULL COMMENT '渲染图路径',
        \`model_path\` varchar(500) DEFAULT NULL COMMENT '模型文件路径',
        \`remark\` text DEFAULT NULL COMMENT '备注信息',
        \`create_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`update_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_model_code\` (\`model_code\`),
        KEY \`idx_name\` (\`name\`),
        KEY \`idx_category\` (\`category\`),
        KEY \`idx_area\` (\`area\`),
        KEY \`idx_create_time\` (\`create_time\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维模型表'`,
      
      // 插入默认管理员用户
      `INSERT INTO \`user\` (\`username\`, \`phone\`, \`password\`, \`role\`, \`email\`) VALUES 
      ('admin', 'admin', '123456', 'admin', 'admin@example.com')
      ON DUPLICATE KEY UPDATE \`update_time\` = CURRENT_TIMESTAMP`,
      
      // 插入示例模型数据
      `INSERT INTO \`models\` (\`model_code\`, \`name\`, \`category\`, \`area\`, \`address\`, \`quantity\`, \`image_path\`, \`render_path\`, \`model_path\`, \`remark\`) VALUES 
      ('MODEL_001', '示例石刻模型', '石刻', 'A区', '一楼展厅', 1, '/images/sample1.jpg', '/renders/sample1.png', '/models/sample1.obj', '这是一个示例石刻模型'),
      ('MODEL_002', '示例雕塑模型', '雕塑', 'B区', '二楼展厅', 2, '/images/sample2.jpg', '/renders/sample2.png', '/models/sample2.fbx', '这是一个示例雕塑模型'),
      ('MODEL_003', '示例造像模型', '造像', 'C区', '三楼展厅', 1, '/images/sample3.jpg', '/renders/sample3.png', '/models/sample3.stl', '这是一个示例造像模型')
      ON DUPLICATE KEY UPDATE \`update_time\` = CURRENT_TIMESTAMP`
    ];
    
    console.log(`找到 ${sqlStatements.length} 条SQL语句`);
    
    // 逐条执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      try {
        console.log(`执行第 ${i + 1} 条SQL语句...`);
        await pool.execute(statement);
        console.log(`第 ${i + 1} 条SQL语句执行成功`);
      } catch (error) {
        console.error(`第 ${i + 1} 条SQL语句执行失败:`, error.message);
        // 如果是表已存在的错误，继续执行
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('表已存在，跳过创建');
          continue;
        }
        // 如果是重复键错误，继续执行
        if (error.code === 'ER_DUP_ENTRY') {
          console.log('数据已存在，跳过插入');
          continue;
        }
        throw error;
      }
    }
    
    console.log('数据库初始化完成！');
    
    // 验证表是否创建成功
    console.log('验证表结构...');
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('已创建的表:', tables.map(t => Object.values(t)[0]));
    
    // 验证用户表数据
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM user');
    console.log(`用户表中有 ${users[0].count} 条记录`);
    
    // 验证模型表数据
    const [models] = await pool.execute('SELECT COUNT(*) as count FROM models');
    console.log(`模型表中有 ${models[0].count} 条记录`);
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await pool.end();
    console.log('数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
