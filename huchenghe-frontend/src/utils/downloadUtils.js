/**
 * 下载工具函数
 * 支持批量下载、进度监控、文件管理等功能
 */

/**
 * 单个文件下载
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise} 下载结果
 */
export const downloadFile = async (url, filename, onProgress = null) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    
    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }
    
    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // 调用进度回调
      if (onProgress && total) {
        const progress = Math.round((receivedLength / total) * 100);
        onProgress(progress);
      }
    }
    
    // 合并chunks并创建blob
    const blob = new Blob(chunks);
    
    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(downloadUrl);
    
    return { success: true, filename };
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
};

/**
 * 批量下载文件
 * @param {Array} files - 文件列表，每个文件包含 {url, filename, size}
 * @param {Function} onFileProgress - 单个文件进度回调 (filename, progress)
 * @param {Function} onOverallProgress - 总体进度回调 (completed, total)
 * @param {Function} onFileComplete - 单个文件完成回调 (filename, success)
 * @returns {Promise} 下载结果
 */
export const batchDownload = async (
  files, 
  onFileProgress = null, 
  onOverallProgress = null,
  onFileComplete = null
) => {
  const results = [];
  let completedCount = 0;
  
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 调用总体进度回调
        if (onOverallProgress) {
          onOverallProgress(completedCount, files.length);
        }
        
        // 下载单个文件
        await downloadFile(
          file.url, 
          file.filename, 
          (progress) => {
            if (onFileProgress) {
              onFileProgress(file.filename, progress);
            }
          }
        );
        
        results.push({ filename: file.filename, success: true });
        
        if (onFileComplete) {
          onFileComplete(file.filename, true);
        }
      } catch (error) {
        console.error(`文件 ${file.filename} 下载失败:`, error);
        results.push({ filename: file.filename, success: false, error: error.message });
        
        if (onFileComplete) {
          onFileComplete(file.filename, false, error.message);
        }
      }
      
      completedCount++;
    }
    
    // 最终进度回调
    if (onOverallProgress) {
      onOverallProgress(completedCount, files.length);
    }
    
    return results;
  } catch (error) {
    console.error('批量下载失败:', error);
    throw error;
  }
};

/**
 * 创建ZIP文件并下载
 * @param {Array} files - 文件列表
 * @param {string} zipName - ZIP文件名
 * @param {Function} onProgress - 进度回调
 * @returns {Promise} 下载结果
 */
export const downloadAsZip = async (files, zipName = 'download.zip', onProgress = null) => {
  try {
    // 动态导入JSZip库
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    
    let completedCount = 0;
    
    // 添加文件到ZIP
    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.filename, blob);
        
        completedCount++;
        if (onProgress) {
          onProgress(Math.round((completedCount / files.length) * 100));
        }
      } catch (error) {
        console.error(`添加文件 ${file.filename} 到ZIP失败:`, error);
      }
    }
    
    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // 下载ZIP文件
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(downloadUrl);
    
    return { success: true, filename: zipName };
  } catch (error) {
    console.error('ZIP下载失败:', error);
    throw error;
  }
};

/**
 * 检查文件是否可下载
 * @param {string} url - 文件URL
 * @returns {Promise<boolean>} 是否可下载
 */
export const checkFileDownloadable = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('检查文件可下载性失败:', error);
    return false;
  }
};

/**
 * 获取文件信息
 * @param {string} url - 文件URL
 * @returns {Promise<Object>} 文件信息
 */
export const getFileInfo = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return {
      size: parseInt(response.headers.get('content-length') || '0', 10),
      type: response.headers.get('content-type') || '',
      lastModified: response.headers.get('last-modified') || '',
      filename: url.split('/').pop() || 'unknown'
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    throw error;
  }
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 验证文件类型
 * @param {string} filename - 文件名
 * @param {Array} allowedTypes - 允许的文件类型
 * @returns {boolean} 是否允许
 */
export const validateFileType = (filename, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true;
  
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes('.' + extension);
};

/**
 * 生成下载文件名
 * @param {string} originalName - 原始文件名
 * @param {string} prefix - 前缀
 * @param {string} suffix - 后缀
 * @returns {string} 生成的文件名
 */
export const generateDownloadFilename = (originalName, prefix = '', suffix = '') => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const extension = originalName.split('.').pop();
  return `${prefix}${nameWithoutExt}${suffix}.${extension}`;
};
