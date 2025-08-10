const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const modelRoutes = require('./routes/modelRoutes');

const app = express();
const PORT = 3000; // ��Ҳ���Ըĳɱ�Ķ˿�

// �м��
app.use(cors());
app.use(bodyParser.json());

// ·��
app.use('/api/models', modelRoutes);

// ��������
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
