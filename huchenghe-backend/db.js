const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // 改成你的用户名
  password: 'Bkc123456', // 改成你的密码
  database: 'huchenghe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
