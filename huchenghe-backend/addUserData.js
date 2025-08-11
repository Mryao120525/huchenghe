/*
  addUserData.js
  用于创建用户表并向数据库添加默认用户数据的脚本
*/

const pool = require('./db');

// 创建用户表的函数
async function createUserTable() {
  try {
    // 创建用户表的SQL语句
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await pool.execute(createTableSQL);
    console.log('用户表创建成功或已存在!');
  } catch (error) {
    console.error('创建用户表时出错:', error);
    throw error;
  }
}

// 添加默认用户的函数
async function addDefaultUser() {
  try {
    // 默认管理员账户信息
    const defaultUser = {
      username: 'admin',
      phone: '12345678912',
      password: '12345678912',
      role: 'admin',
      email: 'admin@example.com'
    };
    
    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM user WHERE phone = ?',
      [defaultUser.phone]
    );
    
    if (existingUsers.length > 0) {
      console.log('默认管理员账户已存在，跳过创建');
      return;
    }
    
    // 插入默认管理员账户
    const [result] = await pool.execute(
      'INSERT INTO user (username, phone, password, role, email) VALUES (?, ?, ?, ?, ?)',
      [defaultUser.username, defaultUser.phone, defaultUser.password, defaultUser.role, defaultUser.email]
    );
    
    console.log('默认管理员账户添加成功!');
    console.log('用户ID:', result.insertId);
    
    // 查询并显示刚刚插入的用户数据
    const [rows] = await pool.execute('SELECT * FROM user WHERE id = ?', [result.insertId]);
    console.log('插入的用户数据:', rows[0]);
  } catch (error) {
    console.error('添加默认用户时出错:', error);
    throw error;
  }
}

// 初始化用户数据的主函数
async function initUserData() {
  try {
    console.log('开始初始化用户数据...');
    
    // 创建用户表
    await createUserTable();
    
    // 添加默认用户
    await addDefaultUser();
    
    console.log('用户数据初始化完成!');
  } catch (error) {
    console.error('初始化用户数据时出错:', error);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

// 如果直接运行此脚本，则执行初始化操作
if (require.main === module) {
  initUserData();
}

module.exports = {
  createUserTable,
  addDefaultUser,
  initUserData
};