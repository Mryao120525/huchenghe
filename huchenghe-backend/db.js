// db.js
// 数据库连接与操作相关代码。
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