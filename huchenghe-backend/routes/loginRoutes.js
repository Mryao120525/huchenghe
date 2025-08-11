/*
  loginRoutes.js
  用户登录相关API路由

  ## 功能描述
  该文件定义了所有与用户认证和管理相关的 RESTful API 接口，包括用户登录验证、
  用户列表查询、用户增删改等管理员功能。

  ## API 接口列表

  ### 用户登录
  - **URL**: POST /api/login
  - **功能**: 验证用户登录凭据
  - **请求体参数**:
    - username: 用户名/手机号 (必填)
    - password: 密码 (必填)
  - **返回值**: 包含登录结果和用户信息的对象
  - **验证逻辑**: 查询数据库中是否存在匹配的手机号和密码组合

  ### 获取用户列表
  - **URL**: GET /api/users
  - **功能**: 获取所有用户的基本信息（管理员功能）
  - **返回值**: 用户对象数组，包含 id, username, role, email 字段

  ### 添加用户
  - **URL**: POST /api/users
  - **功能**: 创建新用户（管理员功能）
  - **请求体参数**:
    - username: 用户名 (必填)
    - role: 用户角色 (必填)
    - email: 邮箱 (可选)
  - **默认设置**: 新用户默认密码为 '123456'
  - **返回值**: 包含成功消息和用户ID的对象

  ### 更新用户
  - **URL**: PUT /api/users/:id
  - **功能**: 根据 ID 更新用户信息（管理员功能）
  - **路径参数**: id - 用户唯一标识符
  - **请求体参数**:
    - username: 用户名 (必填)
    - role: 用户角色 (必填)
    - email: 邮箱 (可选)
  - **返回值**: 包含成功消息的对象

  ### 删除用户
  - **URL**: DELETE /api/users/:id
  - **功能**: 根据 ID 删除用户（管理员功能）
  - **路径参数**: id - 用户唯一标识符
  - **返回值**: 包含成功消息的对象

  ## 安全注意事项
  1. 当前登录验证使用明文密码比较，实际生产环境中应使用加密密码
  2. 缺少身份验证中间件，所有用户管理接口都应添加权限验证
  3. 应该添加更复杂的密码策略和安全措施
*/

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