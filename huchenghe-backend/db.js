const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // �ĳ�����û���
  password: 'Bkc123456', // �ĳ��������
  database: 'huchenghe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
