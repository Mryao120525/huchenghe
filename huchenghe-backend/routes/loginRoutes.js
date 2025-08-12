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
const bcrypt = require('bcryptjs');

/**
 * 用户登录接口
 * @route POST /api/login
 * @body {string} username - 用户名/手机号
 * @body {string} password - 密码
 * @returns {Object} { success: boolean, message: string, user: Object }
 * @throws {500} 数据库错误
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('收到登录请求:', { username });

    if (!username || !password) {
      console.log('登录验证失败: 账号或密码为空');
      return res.json({ success: false, message: '账号和密码不能为空' });
    }

    // 先按手机号查用户
    const [rows] = await pool.execute('SELECT id, username, phone, role, email, password FROM user WHERE phone = ? LIMIT 1', [username]);

    if (!rows || rows.length === 0) {
      console.log('登录失败: 用户不存在');
      return res.json({ success: false, message: '账号或密码错误' });
    }

    const user = rows[0];
    const dbHash = user.password || '';

    let ok = false;
    // 优先尝试 bcrypt 校验
    try {
      if (dbHash && dbHash.startsWith('$2')) {
        ok = await bcrypt.compare(password, dbHash);
      }
    } catch {}
    // 兼容历史明文
    if (!ok) {
      ok = password === dbHash;
    }

    if (!ok) {
      console.log('登录失败: 密码不匹配');
      return res.json({ success: false, message: '账号或密码错误' });
    }

    // 登录成功，去除敏感字段
    const { password: _, ...safeUser } = user;
    console.log('登录成功:', safeUser.id);
    return res.json({ success: true, message: '登录成功', user: safeUser });
  } catch (err) {
    console.error('登录查询失败:', err);
    return res.json({ success: false, message: '数据库错误' });
  }
});

/**
 * 获取用户列表（管理员功能）
 * @route GET /api/users
 * @returns {Array<Object>} 用户对象数组
 * @throws {500} 查询失败
 */
router.get('/users', (req, res) => {
  console.log('收到获取用户列表请求');
  pool.execute('SELECT id, username, phone, role, email FROM user', (err, results) => {
    if (err) {
      console.error('查询用户列表失败:', err);
      return res.status(500).json({ message: '查询失败' });
    }
    console.log('成功获取用户列表，用户数量:', results.length);
    res.json(results);
  });
});

/**
 * 添加新用户
 * @route POST /api/users
 * @body {string} username - 用户名
 * @body {string} role - 用户角色
 * @body {string} phone - 手机号
 * @body {string} email - 邮箱
 * @body {string} [password] - 密码，默认123456
 * @returns {Object} { message: string, userId: number }
 * @throws {400} 参数错误或手机号已存在
 * @throws {500} 添加失败
 */
router.post('/users', (req, res) => {
  const { username, role, email, phone, password } = req.body;
  console.log('收到添加用户请求:', { username, role, email, phone, password });
  
  // 简单验证
  if (!username || !role || !phone) {
    console.log('验证失败: 用户名、角色或手机号为空');
    return res.status(400).json({ message: '用户名、手机号和角色不能为空' });
  }
  
  // 如果提供了密码就使用提供的密码，否则使用默认密码
  const userPassword = password || '123456';
  console.log('准备插入用户数据到数据库');
  
  pool.execute(
    'INSERT INTO user (username, phone, role, email, password) VALUES (?, ?, ?, ?, ?)',
    [username, phone, role, email, userPassword],
    (err, results) => {
      if (err) {
        console.error('添加用户失败:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: '手机号已存在，请使用其他手机号' });
        }
        return res.status(500).json({ message: '添加用户失败: ' + err.message });
      }
      console.log('用户添加成功:', results.insertId);
      res.json({ message: '用户添加成功', userId: results.insertId });
    }
  );
});

/**
 * 更新用户信息
 * @route PUT /api/users/:id
 * @param {number} id - 用户ID
 * @body {string} username - 用户名
 * @body {string} role - 用户角色
 * @body {string} phone - 手机号
 * @body {string} email - 邮箱
 * @returns {Object} { message: string }
 * @throws {400} 参数错误
 * @throws {404} 用户不存在
 * @throws {500} 更新失败
 */
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, role, email, phone } = req.body;
  
  console.log('收到更新用户请求:', { id, username, role, email, phone });
  
  if (!username || !role || !phone) {
    console.log('验证失败: 用户名、角色或手机号为空');
    return res.status(400).json({ message: '用户名、手机号和角色不能为空' });
  }
  
  pool.execute(
    'UPDATE user SET username = ?, phone = ?, role = ?, email = ? WHERE id = ?',
    [username, phone, role, email, id],
    (err, results) => {
      if (err) {
        console.error('更新用户失败:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: '手机号已存在，请使用其他手机号' });
        }
        return res.status(500).json({ message: '更新用户失败: ' + err.message });
      }
      if (results.affectedRows === 0) {
        console.log('用户不存在:', id);
        return res.status(404).json({ message: '用户不存在' });
      }
      console.log('用户更新成功:', id);
      res.json({ message: '用户更新成功' });
    }
  );
});

/**
 * 删除用户
 * @route DELETE /api/users/:id
 * @param {number} id - 用户ID
 * @returns {Object} { message: string }
 * @throws {404} 用户不存在
 * @throws {500} 删除失败
 */
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