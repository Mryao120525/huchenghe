/**
 * 数据库连接池模块
 * @module db
 * @description 提供MySQL数据库连接池功能，使用Promise API进行异步操作
 * @author 系统自动生成
 * @version 1.0.0
 */

/**
 * MySQL数据库连接池配置
 * @typedef {Object} PoolConfig
 * @property {string} host - 数据库主机地址
 * @property {string} user - 数据库用户名
 * @property {string} password - 数据库密码
 * @property {string} database - 数据库名称
 * @property {boolean} waitForConnections - 无可用连接时是否等待
 * @property {number} connectionLimit - 连接池最大连接数
 * @property {number} queueLimit - 排队等待连接的最大请求数(0表示无限制)
 */

/**
 * 创建并配置MySQL连接池
 * @type {mysql2.Pool}
 * @see {@link https://github.com/sidorares/node-mysql2|mysql2文档}了解更多连接池配置选项
 */

/**
 * Promise风格的数据库连接池对象
 * 提供execute方法用于执行SQL查询
 * @type {mysql2.PromisePool}
 * @example
 * // 使用示例
 * const db = require('./db');
 * async function getUser(id) {
 *   const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
 *   return rows[0];
 * }
 */

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

// 从环境变量获取数据库配置，如果不存在则使用默认值
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Bkc123456',
  database: process.env.DB_NAME || 'huchenghe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 使用 Promise 形式
const promisePool = pool.promise();

module.exports = promisePool;