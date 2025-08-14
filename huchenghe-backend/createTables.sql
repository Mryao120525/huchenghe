-- 护橙河三维模型管理系统数据库表结构
-- 创建时间: 2024年
-- 数据库: huchenghe

-- 创建用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(20) NOT NULL COMMENT '手机号，用于登录',
  `password` varchar(255) NOT NULL COMMENT '密码，支持明文和bcrypt加密',
  `role` varchar(20) NOT NULL DEFAULT 'user' COMMENT '用户角色：admin-管理员，user-普通用户',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱地址',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建模型表
CREATE TABLE IF NOT EXISTS `models` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '模型ID，主键',
  `model_code` varchar(50) NOT NULL COMMENT '模型编码，唯一标识',
  `name` varchar(100) NOT NULL COMMENT '模型名称',
  `category` varchar(50) DEFAULT NULL COMMENT '模型类别：石刻、石碑、雕塑、造像、其他',
  `area` varchar(50) DEFAULT NULL COMMENT '区域：A区、B区等',
  `address` varchar(200) DEFAULT NULL COMMENT '主址/地址',
  `quantity` int(11) DEFAULT 1 COMMENT '数量',
  `image_path` varchar(500) DEFAULT NULL COMMENT '图片路径',
  `render_path` varchar(500) DEFAULT NULL COMMENT '渲染图路径',
  `model_path` varchar(500) DEFAULT NULL COMMENT '模型文件路径',
  `remark` text DEFAULT NULL COMMENT '备注信息',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_model_code` (`model_code`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_area` (`area`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维模型表';

-- 插入默认管理员用户（密码：123456）
INSERT INTO `user` (`username`, `phone`, `password`, `role`, `email`) VALUES 
('admin', 'admin', '123456', 'admin', 'admin@example.com')
ON DUPLICATE KEY UPDATE `update_time` = CURRENT_TIMESTAMP;

-- 插入示例模型数据
INSERT INTO `models` (`model_code`, `name`, `category`, `area`, `address`, `quantity`, `image_path`, `render_path`, `model_path`, `remark`) VALUES 
('MODEL_001', '示例石刻模型', '石刻', 'A区', '一楼展厅', 1, '/images/sample1.jpg', '/renders/sample1.png', '/models/sample1.obj', '这是一个示例石刻模型'),
('MODEL_002', '示例雕塑模型', '雕塑', 'B区', '二楼展厅', 2, '/images/sample2.jpg', '/renders/sample2.png', '/models/sample2.fbx', '这是一个示例雕塑模型'),
('MODEL_003', '示例造像模型', '造像', 'C区', '三楼展厅', 1, '/images/sample3.jpg', '/renders/sample3.png', '/models/sample3.stl', '这是一个示例造像模型')
ON DUPLICATE KEY UPDATE `update_time` = CURRENT_TIMESTAMP;
