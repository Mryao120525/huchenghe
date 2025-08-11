// modelRoutes.js
// 定义与三维模型相关的 API 路由。
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取所有模型（支持筛选和分页）
router.get('/', (req, res) => {
  const { name, type, page = 1, pageSize = 10 } = req.query;
  let sql = 'SELECT * FROM models WHERE 1=1';
  const params = [];
  
  // 名称筛选
  if (name) {
    sql += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  
  // 类型筛选
  if (type && type !== 'all') {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  // 添加分页
  const offset = (page - 1) * pageSize;
  sql += ' LIMIT ?, ?';
  params.push(parseInt(offset), parseInt(pageSize));
  
  pool.execute(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    res.json(results);
  });
});

// 获取模型总数（用于分页）
router.get('/count', (req, res) => {
  const { name, type } = req.query;
  let sql = 'SELECT COUNT(*) as total FROM models WHERE 1=1';
  const params = [];
  
  // 名称筛选
  if (name) {
    sql += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  
  // 类型筛选
  if (type && type !== 'all') {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  pool.execute(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    res.json(results[0]);
  });
});

// 获取模型详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  pool.execute('SELECT * FROM models WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    if (results.length === 0) return res.status(404).json({ message: '未找到模型' });
    res.json(results[0]);
  });
});

// 上传模型
router.post('/', (req, res) => {
  const { name, version, format, type, path, uploader } = req.body;
  
  // 验证必填字段
  if (!name || !version || !format || !type || !path) {
    return res.status(400).json({ message: '缺少必要字段' });
  }
  
  const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  pool.execute(
    'INSERT INTO models (name, version, format, type, path, uploader, uploadTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, version, format, type, path, uploader || '未知用户', uploadTime],
    (err, results) => {
      if (err) return res.status(500).json({ message: '上传失败' });
      res.json({ message: '模型上传成功', modelId: results.insertId });
    }
  );
});

// 更新模型
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, version, format, type, path } = req.body;
  
  // 验证必填字段
  if (!name || !version || !format || !type || !path) {
    return res.status(400).json({ message: '缺少必要字段' });
  }
  
  pool.execute(
    'UPDATE models SET name = ?, version = ?, format = ?, type = ?, path = ? WHERE id = ?',
    [name, version, format, type, path, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: '更新失败' });
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: '模型不存在' });
      }
      res.json({ message: '模型更新成功' });
    }
  );
});

// 删除模型
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  pool.execute('DELETE FROM models WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: '删除失败' });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: '模型不存在' });
    }
    res.json({ message: '模型删除成功' });
  });
});

module.exports = router;