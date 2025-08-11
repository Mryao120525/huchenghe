/*
  db.js
  数据库连接与操作相关代码。

  ## 功能描述
  该文件负责创建和配置 MySQL 数据库连接池，并导出 Promise 形式的连接池对象，
  供其他模块进行数据库操作使用。

  ## 数据库配置信息
  - host: localhost (数据库主机地址)
  - user: root (数据库用户名)
  - password: Bkc123456 (数据库密码)
  - database: huchenghe (数据库名称)
  - waitForConnections: true (当无可用连接时是否等待)
  - connectionLimit: 10 (连接池最大连接数)
  - queueLimit: 0 (排队等待连接的最大请求数，0 表示无限制)

  ## 技术实现说明
  使用 mysql2 库创建连接池，相比于单个连接，连接池具有以下优势：
  1. 提高性能：避免频繁创建和关闭数据库连接
  2. 资源管理：控制数据库连接数量，防止连接过多导致数据库性能下降
  3. 可重用性：连接使用完毕后返回池中，可被其他请求复用

  导出的是 promisePool 对象，使用 Promise 形式进行数据库操作，
  相比回调函数形式，Promise 形式具有更好的可读性和错误处理能力。
*/

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Bkc123456',
  database: 'huchenghe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 使用 Promise 形式
const promisePool = pool.promise();

module.exports = promisePool;