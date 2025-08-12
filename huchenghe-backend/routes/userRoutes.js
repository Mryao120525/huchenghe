/**
 * 用户管理路由模块
 * 处理用户的CRUD操作，包括获取用户列表、创建、更新和删除用户
 * @module routes/userRoutes
 * @requires express
 * @requires db
 * @requires bcryptjs
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, phone, role, email FROM user');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 获取单个用户
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, phone, role, email FROM user WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ message: '获取用户失败' });
  }
});

// 创建新用户
router.post('/', async (req, res) => {
  try {
    const { username, phone, role, email, password } = req.body;

    // 检查用户名是否已存在
    const [existingUsers] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const [result] = await db.query(
      'INSERT INTO user (username, phone, role, email, password) VALUES (?, ?, ?, ?, ?)',
      [username, phone, role, email, hashedPassword]
    );

    res.status(201).json({ message: '用户创建成功', userId: result.insertId });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
});

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { username, phone, role, email } = req.body;
    const userId = req.params.id;

    // 检查用户是否存在
    const [existingUsers] = await db.query('SELECT id FROM user WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新用户信息
    await db.query(
      'UPDATE user SET username = ?, phone = ?, role = ?, email = ? WHERE id = ?',
      [username, phone, role, email, userId]
    );

    res.json({ message: '用户更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 检查用户是否存在
    const [existingUsers] = await db.query('SELECT id FROM user WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 删除用户
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

module.exports = router;