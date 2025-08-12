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
  - **URL**: POST /api/models/upload
  - **功能**: 上传模型文件并创建模型记录
  - **请求体参数**:
    - modelFile: 模型文件 (必填)
    - name: 模型名称 (必填)
    - version: 模型版本 (必填)
    - type: 模型类型 (必填)
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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 设置上传目录为NAS映射目录
    const uploadDir = '\\\\192.168.0.49\\宝可橙科技\\_02项目文件\\_01FBX模型文件';
    
    // 检查目录是否存在，如果不存在则使用本地备份目录
    try {
      // 检查NAS目录是否可写
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('使用NAS目录存储文件');
      cb(null, uploadDir);
    } catch (err) {
      // 如果无法访问NAS目录，使用本地目录作为备份
      console.log('无法访问NAS目录，使用本地备份目录');
      const localUploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(localUploadDir)) {
        fs.mkdirSync(localUploadDir, { recursive: true });
      }
      cb(null, localUploadDir);
    }
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('生成文件名:', fileName);
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 增加文件大小限制到500MB以适应大型模型文件
  },
  fileFilter: function (req, file, cb) {
    // 支持常见的3D模型文件格式
    const allowedTypes = /fbx|obj|stl|gltf|glb|dae|ply|3ds|max|blend|mtl|ase|ifc|flt|wrl|dxf|dgn|ms3d|mdl|md2|md3|md5|smd|abc|lwo|lws|ma|mb|hpb|scn|irr|q3o|q3s/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // 对于3D模型文件，有时mimetype可能不准确，所以我们主要依赖扩展名
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传3D对象文件，如FBX、OBJ、STL、GLTF、GLB等格式'));
    }
  }
});

// 添加示例数据的端点（仅用于开发和测试）
router.post('/add-sample', async (req, res) => {
  try {
    // 插入示例数据
    const sampleModel = {
      model_code: 'SAMPLE_' + Date.now(),
      name: '示例模型',
      category: '雕塑',
      area: 'A区',
      address: '一楼展厅',
      quantity: 1,
      imagePath: '/images/sample.jpg',
      renderPath: '/renders/sample.png',
      modelPath: '/models/sample.obj',
      remark: '这是一个示例模型'
    };
    
    // 执行插入操作 - 使用实际的数据库字段名
    const [result] = await pool.execute(
      'INSERT INTO models (model_code, name, category, region, address, quantity, image_url, render_url, nas_path, remark, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [sampleModel.model_code, sampleModel.name, sampleModel.category, sampleModel.area, sampleModel.address, sampleModel.quantity, sampleModel.imagePath, sampleModel.renderPath, sampleModel.modelPath, sampleModel.remark]
    );
    
    res.json({ message: '示例数据添加成功', modelId: result.insertId });
  } catch (error) {
    console.error('添加示例数据时出错:', error);
    res.status(500).json({ message: '添加示例数据失败', error: error.message });
  }
});

// 获取所有模型（支持筛选和分页）
router.get('/', async (req, res) => {
  try {
    const { name, type, page = 1, pageSize = 10 } = req.query;
    
    // 确保分页参数是有效的正整数
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10)); // 限制最大页面大小为100
    const offset = (parsedPage - 1) * parsedPageSize;
    
    let sql = 'SELECT id, model_code, name, category, region, address, quantity, image_url, render_url, nas_path, remark, created_at, updated_at FROM models WHERE 1=1';
    const params = [];
    
    // 名称筛选
    if (name) {
      sql += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    // 类别筛选
    if (type && type !== 'all') {
      sql += ' AND category = ?';
      params.push(type);
    }
    
    // 添加分页 - 确保参数是整数
    sql += ' LIMIT ?, ?';
    params.push(offset, parsedPageSize);
    
    console.log('执行SQL查询:', sql);
    console.log('查询参数:', params);
    
    const [results] = await pool.execute(sql, params);
    res.json(results);
  } catch (err) {
    console.error('模型查询失败:', err);
    res.status(500).json({ message: '查询失败', error: err.message });
  }
});

// 获取模型总数（用于分页）
router.get('/count', async (req, res) => {
  try {
    const { name, type } = req.query;
    let sql = 'SELECT COUNT(*) as total FROM models WHERE 1=1';
    const params = [];
    
    // 名称筛选
    if (name) {
      sql += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    // 类别筛选
    if (type && type !== 'all') {
      sql += ' AND category = ?';
      params.push(type);
    }
    
    const [results] = await pool.execute(sql, params);
    res.json(results[0]);
  } catch (err) {
    console.error('模型总数查询失败:', err);
    res.status(500).json({ message: '查询失败', error: err.message });
  }
});

// 获取模型详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.execute('SELECT id, model_code, name, category, region, address, quantity, image_url, render_url, nas_path, remark, created_at, updated_at FROM models WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: '未找到模型' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('模型详情查询失败:', err);
    res.status(500).json({ message: '查询失败', error: err.message });
  }
});

// 上传模型文件
router.post('/upload', upload.single('modelFile'), async (req, res) => {
  try {
    console.log('收到文件上传请求');
    console.log('文件信息:', req.file);
    console.log('表单数据:', req.body);
    
    // 检查文件是否存在
    if (!req.file) {
      console.log('未找到上传的文件');
      return res.status(400).json({ message: '请选择要上传的文件' });
    }
    
    // 获取表单数据
    const { name, category, area, address, quantity, imagePath, renderPath, modelPath, remark } = req.body;
    console.log('表单数据:', { name, category, area, address, quantity, imagePath, renderPath, modelPath, remark });
    
    // 验证必填字段
    if (!name) {
      console.log('缺少必要字段: name');
      return res.status(400).json({ message: '缺少必要字段: 模型名称' });
    }
    
    // 获取文件信息
    const format = path.extname(req.file.originalname).substring(1).toUpperCase();
    console.log('文件格式:', format);
    
    // 判断文件存储位置并生成相应的路径
    const fullPath = req.file.path;
    console.log('文件完整路径:', fullPath);
    
    let filePath;
    if (fullPath.startsWith('\\\\192.168.0.49')) {
      // 文件存储在NAS上
      filePath = '/nas-files/' + path.basename(fullPath);
    } else {
      // 文件存储在本地
      filePath = '/uploads/' + path.basename(fullPath);
    }
    
    console.log('存储路径:', filePath);
    
    // 生成模型编码
    const modelCode = 'MODEL_' + Date.now();

    console.log('准备插入数据库');
    // 插入数据库记录 - 使用实际的数据库字段名
    const [result] = await pool.execute(
      'INSERT INTO models (model_code, name, category, region, address, quantity, image_url, render_url, nas_path, remark, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [modelCode, name, category || null, area || null, address || null, quantity || 1, imagePath || null, renderPath || null, filePath, remark || null]
    );
    
    console.log('数据库插入成功，ID:', result.insertId);
    res.json({ 
      message: '模型上传成功', 
      modelId: result.insertId,
      modelCode: modelCode,
      filePath: filePath
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    // 提供更详细的错误信息
    let errorMessage = '文件上传失败';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = '数据库表不存在，请先运行数据库迁移脚本';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = '数据库字段错误，请检查表结构';
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = '模型编码重复，请重试';
    }
    res.status(500).json({ message: errorMessage, error: error.message, code: error.code });
  }
});

// 更新模型
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, area, address, quantity, imagePath, renderPath, modelPath, remark } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({ message: '缺少必要字段: 模型名称' });
    }

    // 检查模型是否存在
    const [modelResult] = await pool.execute('SELECT id FROM models WHERE id = ?', [id]);
    if (modelResult.length === 0) {
      return res.status(404).json({ message: '模型不存在' });
    }

    // 更新模型信息 - 使用实际的数据库字段名
    await pool.execute(
      'UPDATE models SET name = ?, category = ?, region = ?, address = ?, quantity = ?, image_url = ?, render_url = ?, nas_path = ?, remark = ?, updated_at = NOW() WHERE id = ?',
      [name, category || null, area || null, address || null, quantity || 1, imagePath || null, renderPath || null, modelPath || null, remark || null, id]
    );

    res.json({ message: '模型更新成功' });
  } catch (error) {
    console.error('更新模型失败:', error);
    res.status(500).json({ message: '更新失败', error: error.message });
  }
});

// 删除模型
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.execute('DELETE FROM models WHERE id = ?', [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: '模型不存在' });
    }
    res.json({ message: '模型删除成功' });
  } catch (err) {
    console.error('模型删除失败:', err);
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

module.exports = router;
