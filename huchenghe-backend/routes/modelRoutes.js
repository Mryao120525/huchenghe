const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// ���ݿ�����
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // �ĳ���� MySQL �û���
    password: '123456', // �ĳ���� MySQL ����
    database: 'huchenghe'
});

db.connect(err => {
    if (err) {
        console.error('���ݿ�����ʧ��:', err);
        return;
    }
    console.log('�ѳɹ����ӵ� MySQL ���ݿ�');
});

// ��ȡ����ģ��
router.get('/', (req, res) => {
    db.query('SELECT * FROM models', (err, results) => {
        if (err) return res.status(500).send('��ѯʧ��');
        res.json(results);
    });
});

// ��ȡ����ģ��
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM models WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send('��ѯʧ��');
        if (results.length === 0) return res.status(404).send('δ�ҵ�ģ��');
        res.json(results[0]);
    });
});

// ����ģ��
router.post('/', (req, res) => {
    const { main_address, area, code, name, category, quantity, image, remark, server_path, render_image } = req.body;
    const sql = `
        INSERT INTO models (main_address, area, code, name, category, quantity, image, remark, server_path, render_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [main_address, area, code, name, category, quantity, image, remark, server_path, render_image], (err, result) => {
        if (err) return res.status(500).send('����ʧ��');
        res.json({ message: '�����ɹ�', id: result.insertId });
    });
});

// ����ģ��
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { main_address, area, code, name, category, quantity, image, remark, server_path, render_image } = req.body;
    const sql = `
        UPDATE models SET main_address=?, area=?, code=?, name=?, category=?, quantity=?, image=?, remark=?, server_path=?, render_image=?
        WHERE id=?
    `;
    db.query(sql, [main_address, area, code, name, category, quantity, image, remark, server_path, render_image, id], (err, result) => {
        if (err) return res.status(500).send('����ʧ��');
        res.json({ message: '���³ɹ�' });
    });
});

// ɾ��ģ��
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM models WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send('ɾ��ʧ��');
        res.json({ message: 'ɾ���ɹ�' });
    });
});

module.exports = router;
