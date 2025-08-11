// loginRoutes.js
// 用户登录相关API路由
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 登录接口
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: '账号和密码不能为空' });
  }
  pool.execute(
    'SELECT * FROM user WHERE phone = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.json({ success: false, message: '数据库错误' });
      if (results.length > 0) {
        res.json({ success: true, message: '登录成功', user: results[0] });
      } else {
        res.json({ success: false, message: '账号或密码错误' });
      }
    }
  );
});

// 获取用户列表（管理员功能）
router.get('/users', (req, res) => {
  pool.execute('SELECT id, username, role, email FROM user', (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    res.json(results);
  });
});

// 添加用户
router.post('/users', (req, res) => {
  const { username, role, email } = req.body;
  // 简单验证
  if (!username || !role) {
    return res.status(400).json({ message: '用户名和角色不能为空' });
  }
  
  // 这里应该有更复杂的密码生成逻辑，暂时使用默认密码
  const defaultPassword = '123456';
  pool.execute(
    'INSERT INTO user (username, role, email, password) VALUES (?, ?, ?, ?)',
    [username, role, email, defaultPassword],
    (err, results) => {
      if (err) return res.status(500).json({ message: '添加用户失败' });
      res.json({ message: '用户添加成功', userId: results.insertId });
    }
  );
});

// 更新用户
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, role, email } = req.body;
  
  if (!username || !role) {
    return res.status(400).json({ message: '用户名和角色不能为空' });
  }
  
  pool.execute(
    'UPDATE user SET username = ?, role = ?, email = ? WHERE id = ?',
    [username, role, email, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: '更新用户失败' });
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json({ message: '用户更新成功' });
    }
  );
});

// 删除用户
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  pool.execute('DELETE FROM user WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: '删除用户失败' });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户删除成功' });
  });
});

module.exports = router;