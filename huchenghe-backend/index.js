const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const modelRoutes = require('./routes/modelRoutes');

const app = express();
const PORT = 3000; // 你也可以改成别的端口

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/api/models', modelRoutes);

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
