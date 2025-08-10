const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // 改成你的 MySQL 用户名
    password: '123456', // 改成你的 MySQL 密码
    database: 'huchenghe'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('已成功连接到 MySQL 数据库');
});

// 获取所有模型
router.get('/', (req, res) => {
    db.query('SELECT * FROM models', (err, results) => {
        if (err) return res.status(500).send('查询失败');
        res.json(results);
    });
});

// 获取单个模型
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM models WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send('查询失败');
        if (results.length === 0) return res.status(404).send('未找到模型');
        res.json(results[0]);
    });
});

// 新增模型
router.post('/', (req, res) => {
    const { main_address, area, code, name, category, quantity, image, remark, server_path, render_image } = req.body;
    const sql = `
        INSERT INTO models (main_address, area, code, name, category, quantity, image, remark, server_path, render_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [main_address, area, code, name, category, quantity, image, remark, server_path, render_image], (err, result) => {
        if (err) return res.status(500).send('插入失败');
        res.json({ message: '新增成功', id: result.insertId });
    });
});

// 更新模型
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { main_address, area, code, name, category, quantity, image, remark, server_path, render_image } = req.body;
    const sql = `
        UPDATE models SET main_address=?, area=?, code=?, name=?, category=?, quantity=?, image=?, remark=?, server_path=?, render_image=?
        WHERE id=?
    `;
    db.query(sql, [main_address, area, code, name, category, quantity, image, remark, server_path, render_image, id], (err, result) => {
        if (err) return res.status(500).send('更新失败');
        res.json({ message: '更新成功' });
    });
});

// 删除模型
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM models WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send('删除失败');
        res.json({ message: '删除成功' });
    });
});

module.exports = router;
