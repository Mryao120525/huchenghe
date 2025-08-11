/*
  modelRoutes.js
  定义与三维模型相关的 API 路由。

  ## 功能描述
  该文件定义了所有与三维模型相关的 RESTful API 接口，包括模型的增删改查操作，
  以及支持筛选和分页的查询功能。

  ## API 接口列表

  ### 获取模型列表
  - **URL**: GET /api/models
  - **功能**: 获取所有模型，支持名称筛选、类型筛选和分页
  - **查询参数**:
    - name (可选): 模型名称模糊查询
    - type (可选): 模型类型精确查询
    - page (可选，默认为1): 页码
    - pageSize (可选，默认为10): 每页数据条数
  - **返回值**: 模型对象数组

  ### 获取模型总数
  - **URL**: GET /api/models/count
  - **功能**: 获取符合条件的模型总数，用于分页计算
  - **查询参数**:
    - name (可选): 模型名称模糊查询
    - type (可选): 模型类型精确查询
  - **返回值**: 包含 total 字段的对象，表示模型总数

  ### 获取模型详情
  - **URL**: GET /api/models/:id
  - **功能**: 根据 ID 获取特定模型的详细信息
  - **路径参数**: id - 模型唯一标识符
  - **返回值**: 模型对象

  ### 上传模型
  - **URL**: POST /api/models
  - **功能**: 创建新的模型记录
  - **请求体参数**:
    - name: 模型名称 (必填)
    - version: 模型版本 (必填)
    - format: 模型格式 (必填)
    - type: 模型类型 (必填)
    - path: 模型存储路径 (必填)
    - uploader: 上传者 (可选)
  - **返回值**: 包含成功消息和模型ID的对象

  ### 更新模型
  - **URL**: PUT /api/models/:id
  - **功能**: 根据 ID 更新模型信息
  - **路径参数**: id - 模型唯一标识符
  - **请求体参数**:
    - name: 模型名称 (必填)
    - version: 模型版本 (必填)
    - format: 模型格式 (必填)
    - type: 模型类型 (必填)
    - path: 模型存储路径 (必填)
  - **返回值**: 包含成功消息的对象

  ### 删除模型
  - **URL**: DELETE /api/models/:id
  - **功能**: 根据 ID 删除模型
  - **路径参数**: id - 模型唯一标识符
  - **返回值**: 包含成功消息的对象

  ## 数据库操作说明
  所有数据库操作使用 mysql2 库的 promisePool 执行，通过 pool.execute() 方法执行 SQL 语句，
  该方法支持参数化查询，可有效防止 SQL 注入攻击。
*/

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