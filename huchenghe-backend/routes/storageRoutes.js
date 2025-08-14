/**
 * 存储空间管理路由
 * 提供存储空间监控、文件管理、空间清理等功能
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 存储路径配置
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../storage');
const MODEL_PATH = path.join(STORAGE_PATH, 'models');
const TEXTURE_PATH = path.join(STORAGE_PATH, 'textures');
const DOCUMENT_PATH = path.join(STORAGE_PATH, 'documents');
const TEMP_PATH = path.join(STORAGE_PATH, 'temp');

// 确保存储目录存在
async function ensureStorageDirectories() {
  const directories = [STORAGE_PATH, MODEL_PATH, TEXTURE_PATH, DOCUMENT_PATH, TEMP_PATH];
  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch (error) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

// 获取存储空间信息
router.get('/info', async (req, res) => {
  try {
    await ensureStorageDirectories();
    
    // 获取磁盘空间信息
    let diskInfo;
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
      const lines = stdout.trim().split('\n').slice(1);
      const disk = lines.find(line => line.includes('C:'));
      if (disk) {
        const [caption, freeSpace, size] = disk.trim().split(/\s+/);
        diskInfo = {
          totalSpace: parseInt(size),
          freeSpace: parseInt(freeSpace),
          usedSpace: parseInt(size) - parseInt(freeSpace)
        };
      }
    } else {
      const { stdout } = await execAsync('df -B1 .');
      const lines = stdout.trim().split('\n');
      const [, size, used, available] = lines[1].trim().split(/\s+/);
      diskInfo = {
        totalSpace: parseInt(size),
        usedSpace: parseInt(used),
        freeSpace: parseInt(available)
      };
    }
    
    // 获取文件总数
    const totalFiles = await countFilesRecursively(STORAGE_PATH);
    
    const usagePercentage = Math.round((diskInfo.usedSpace / diskInfo.totalSpace) * 100);
    
    res.json({
      success: true,
      data: {
        totalSpace: diskInfo.totalSpace,
        usedSpace: diskInfo.usedSpace,
        freeSpace: diskInfo.freeSpace,
        availableSpace: diskInfo.freeSpace,
        usagePercentage,
        totalFiles
      }
    });
  } catch (error) {
    console.error('获取存储信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取存储信息失败',
      error: error.message
    });
  }
});

// 获取文件列表
router.get('/files', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = '', type = 'all' } = req.query;
    
    const files = await getAllFiles(STORAGE_PATH);
    
    // 过滤文件
    let filteredFiles = files;
    
    if (search) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.type === type);
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        total: filteredFiles.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error.message
    });
  }
});

// 删除文件
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: '文件路径不能为空'
      });
    }
    
    // 验证文件路径是否在存储目录内
    const normalizedPath = path.resolve(filePath);
    const normalizedStoragePath = path.resolve(STORAGE_PATH);
    
    if (!normalizedPath.startsWith(normalizedStoragePath)) {
      return res.status(403).json({
        success: false,
        message: '无权访问该文件'
      });
    }
    
    await fs.unlink(normalizedPath);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文件失败',
      error: error.message
    });
  }
});

// 批量删除文件
router.delete('/files/batch-delete', async (req, res) => {
  try {
    const { fileIds, filePaths } = req.body;
    
    if (!filePaths || !Array.isArray(filePaths)) {
      return res.status(400).json({
        success: false,
        message: '文件路径列表不能为空'
      });
    }
    
    const normalizedStoragePath = path.resolve(STORAGE_PATH);
    const deletedFiles = [];
    const failedFiles = [];
    
    for (const filePath of filePaths) {
      try {
        const normalizedPath = path.resolve(filePath);
        
        // 验证文件路径
        if (!normalizedPath.startsWith(normalizedStoragePath)) {
          failedFiles.push({ path: filePath, error: '无权访问该文件' });
          continue;
        }
        
        await fs.unlink(normalizedPath);
        deletedFiles.push(filePath);
      } catch (error) {
        failedFiles.push({ path: filePath, error: error.message });
      }
    }
    
    res.json({
      success: true,
      data: {
        deletedFiles,
        failedFiles,
        totalDeleted: deletedFiles.length,
        totalFailed: failedFiles.length
      },
      message: `成功删除 ${deletedFiles.length} 个文件`
    });
  } catch (error) {
    console.error('批量删除文件失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除文件失败',
      error: error.message
    });
  }
});

// 下载文件
router.get('/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: '文件路径不能为空'
      });
    }
    
    // 验证文件路径
    const normalizedPath = path.resolve(filePath);
    const normalizedStoragePath = path.resolve(STORAGE_PATH);
    
    if (!normalizedPath.startsWith(normalizedStoragePath)) {
      return res.status(403).json({
        success: false,
        message: '无权访问该文件'
      });
    }
    
    // 检查文件是否存在
    try {
      await fs.access(normalizedPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    const fileName = path.basename(normalizedPath);
    res.download(normalizedPath, fileName);
  } catch (error) {
    console.error('下载文件失败:', error);
    res.status(500).json({
      success: false,
      message: '下载文件失败',
      error: error.message
    });
  }
});

// 扫描可清理文件
router.get('/cleanup/scan', async (req, res) => {
  try {
    await ensureStorageDirectories();
    
    const cleanupStats = {
      tempFiles: 0,
      tempFilesSize: 0,
      duplicateFiles: 0,
      duplicateFilesSize: 0,
      oldFiles: 0,
      oldFilesSize: 0,
      emptyFolders: 0,
      emptyFoldersSize: 0
    };
    
    // 扫描临时文件
    const tempFiles = await scanTempFiles();
    cleanupStats.tempFiles = tempFiles.length;
    cleanupStats.tempFilesSize = tempFiles.reduce((sum, file) => sum + file.size, 0);
    
    // 扫描空文件夹
    const emptyFolders = await scanEmptyFolders();
    cleanupStats.emptyFolders = emptyFolders.length;
    
    // 扫描过期文件（超过30天的文件）
    const oldFiles = await scanOldFiles(30);
    cleanupStats.oldFiles = oldFiles.length;
    cleanupStats.oldFilesSize = oldFiles.reduce((sum, file) => sum + file.size, 0);
    
    res.json({
      success: true,
      data: cleanupStats
    });
  } catch (error) {
    console.error('扫描清理文件失败:', error);
    res.status(500).json({
      success: false,
      message: '扫描清理文件失败',
      error: error.message
    });
  }
});

// 执行清理操作
router.post('/cleanup/execute', async (req, res) => {
  try {
    const { tempFiles, duplicateFiles, oldFiles, emptyFolders } = req.body;
    
    const results = {
      tempFilesDeleted: 0,
      tempFilesSize: 0,
      duplicateFilesDeleted: 0,
      duplicateFilesSize: 0,
      oldFilesDeleted: 0,
      oldFilesSize: 0,
      emptyFoldersDeleted: 0
    };
    
    // 清理临时文件
    if (tempFiles) {
      const tempFilesList = await scanTempFiles();
      for (const file of tempFilesList) {
        try {
          await fs.unlink(file.path);
          results.tempFilesDeleted++;
          results.tempFilesSize += file.size;
        } catch (error) {
          console.error(`删除临时文件失败: ${file.path}`, error);
        }
      }
    }
    
    // 清理过期文件
    if (oldFiles) {
      const oldFilesList = await scanOldFiles(30);
      for (const file of oldFilesList) {
        try {
          await fs.unlink(file.path);
          results.oldFilesDeleted++;
          results.oldFilesSize += file.size;
        } catch (error) {
          console.error(`删除过期文件失败: ${file.path}`, error);
        }
      }
    }
    
    // 清理空文件夹
    if (emptyFolders) {
      const emptyFoldersList = await scanEmptyFolders();
      for (const folder of emptyFoldersList) {
        try {
          await fs.rmdir(folder);
          results.emptyFoldersDeleted++;
        } catch (error) {
          console.error(`删除空文件夹失败: ${folder}`, error);
        }
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: '清理操作完成'
    });
  } catch (error) {
    console.error('执行清理操作失败:', error);
    res.status(500).json({
      success: false,
      message: '执行清理操作失败',
      error: error.message
    });
  }
});

// 快速清理
router.post('/cleanup/quick', async (req, res) => {
  try {
    const results = {
      tempFilesDeleted: 0,
      tempFilesSize: 0,
      emptyFoldersDeleted: 0
    };
    
    // 清理临时文件
    const tempFiles = await scanTempFiles();
    for (const file of tempFiles) {
      try {
        await fs.unlink(file.path);
        results.tempFilesDeleted++;
        results.tempFilesSize += file.size;
      } catch (error) {
        console.error(`删除临时文件失败: ${file.path}`, error);
      }
    }
    
    // 清理空文件夹
    const emptyFolders = await scanEmptyFolders();
    for (const folder of emptyFolders) {
      try {
        await fs.rmdir(folder);
        results.emptyFoldersDeleted++;
      } catch (error) {
        console.error(`删除空文件夹失败: ${folder}`, error);
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: '快速清理完成'
    });
  } catch (error) {
    console.error('快速清理失败:', error);
    res.status(500).json({
      success: false,
      message: '快速清理失败',
      error: error.message
    });
  }
});

// 获取存储设置
router.get('/settings', async (req, res) => {
  try {
    const settings = {
      storagePath: STORAGE_PATH,
      autoCleanup: false,
      cleanupInterval: 'weekly',
      fileRetentionDays: 30,
      storageWarningThreshold: 80
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('获取存储设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取存储设置失败',
      error: error.message
    });
  }
});

// 更新存储设置
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // 这里可以保存设置到配置文件或数据库
    console.log('更新存储设置:', settings);
    
    res.json({
      success: true,
      message: '设置更新成功'
    });
  } catch (error) {
    console.error('更新存储设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新存储设置失败',
      error: error.message
    });
  }
});

// 获取文件类型统计
router.get('/stats/file-types', async (req, res) => {
  try {
    const files = await getAllFiles(STORAGE_PATH);
    
    const stats = {
      model: { count: 0, size: 0 },
      image: { count: 0, size: 0 },
      document: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    };
    
    for (const file of files) {
      if (stats[file.type]) {
        stats[file.type].count++;
        stats[file.type].size += file.size;
      } else {
        stats.other.count++;
        stats.other.size += file.size;
      }
    }
    
    const result = Object.entries(stats).map(([type, data]) => ({
      type,
      name: getFileTypeName(type),
      count: data.count,
      size: data.size
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取文件类型统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件类型统计失败',
      error: error.message
    });
  }
});

// 辅助函数
async function countFilesRecursively(dir) {
  try {
    const items = await fs.readdir(dir);
    let count = 0;
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        count += await countFilesRecursively(itemPath);
      } else {
        count++;
      }
    }
    
    return count;
  } catch (error) {
    return 0;
  }
}

async function getAllFiles(dir) {
  const files = [];
  
  async function scanDirectory(currentDir) {
    try {
      const items = await fs.readdir(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(itemPath);
        } else {
          const relativePath = path.relative(STORAGE_PATH, itemPath);
          const fileType = getFileType(item);
          
          files.push({
            id: files.length + 1,
            name: item,
            type: fileType,
            typeName: getFileTypeName(fileType),
            size: stat.size,
            createTime: stat.birthtime,
            path: relativePath
          });
        }
      }
    } catch (error) {
      console.error(`扫描目录失败: ${currentDir}`, error);
    }
  }
  
  await scanDirectory(dir);
  return files;
}

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  const modelExts = ['.obj', '.fbx', '.dae', '.3ds', '.max', '.blend'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
  const documentExts = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
  
  if (modelExts.includes(ext)) return 'model';
  if (imageExts.includes(ext)) return 'image';
  if (documentExts.includes(ext)) return 'document';
  
  return 'other';
}

function getFileTypeName(type) {
  const typeNames = {
    model: '模型文件',
    image: '图片文件',
    document: '文档文件',
    other: '其他文件'
  };
  return typeNames[type] || '其他文件';
}

async function scanTempFiles() {
  const tempFiles = [];
  
  try {
    const items = await fs.readdir(TEMP_PATH);
    
    for (const item of items) {
      const itemPath = path.join(TEMP_PATH, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isFile()) {
        tempFiles.push({
          path: itemPath,
          size: stat.size,
          name: item
        });
      }
    }
  } catch (error) {
    console.error('扫描临时文件失败:', error);
  }
  
  return tempFiles;
}

async function scanEmptyFolders() {
  const emptyFolders = [];
  
  async function checkDirectory(dir) {
    try {
      const items = await fs.readdir(dir);
      
      if (items.length === 0) {
        emptyFolders.push(dir);
      } else {
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = await fs.stat(itemPath);
          
          if (stat.isDirectory()) {
            await checkDirectory(itemPath);
          }
        }
      }
    } catch (error) {
      console.error(`检查目录失败: ${dir}`, error);
    }
  }
  
  await checkDirectory(STORAGE_PATH);
  return emptyFolders;
}

async function scanOldFiles(days) {
  const oldFiles = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  async function scanDirectory(dir) {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(itemPath);
        } else if (stat.birthtime < cutoffDate) {
          oldFiles.push({
            path: itemPath,
            size: stat.size,
            name: item,
            createTime: stat.birthtime
          });
        }
      }
    } catch (error) {
      console.error(`扫描目录失败: ${dir}`, error);
    }
  }
  
  await scanDirectory(STORAGE_PATH);
  return oldFiles;
}

module.exports = router;
