/**
 * 导出工具函数
 * 支持Excel、CSV、JSON格式的数据导出
 */

// 字段映射表
const fieldMapping = {
  id: 'ID',
  name: '模型名称',
  category: '类别',
  area: '区域',
  address: '主址',
  quantity: '数量',
  create_time: '创建时间',
  update_time: '更新时间',
  remark: '备注'
};

/**
 * 格式化数据
 * @param {Array} data - 原始数据
 * @param {Array} fields - 要导出的字段
 * @returns {Array} 格式化后的数据
 */
const formatData = (data, fields) => {
  return data.map(item => {
    const formattedItem = {};
    fields.forEach(field => {
      if (field === 'create_time' || field === 'update_time') {
        formattedItem[fieldMapping[field]] = item[field] ? 
          new Date(item[field]).toLocaleString('zh-CN') : '';
      } else {
        formattedItem[fieldMapping[field]] = item[field] || '';
      }
    });
    return formattedItem;
  });
};

/**
 * 导出为CSV格式
 * @param {Array} data - 数据
 * @param {Array} fields - 字段列表
 * @param {string} filename - 文件名
 */
export const exportToCSV = (data, fields, filename) => {
  const formattedData = formatData(data, fields);
  
  // 生成CSV内容
  const headers = fields.map(field => fieldMapping[field]);
  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 下载文件
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * 导出为JSON格式
 * @param {Array} data - 数据
 * @param {Array} fields - 字段列表
 * @param {string} filename - 文件名
 */
export const exportToJSON = (data, fields, filename) => {
  const formattedData = formatData(data, fields);
  
  const jsonContent = JSON.stringify(formattedData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  
  // 下载文件
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * 导出为Excel格式
 * @param {Array} data - 数据
 * @param {Array} fields - 字段列表
 * @param {string} filename - 文件名
 */
export const exportToExcel = async (data, fields, filename) => {
  try {
    // 动态导入xlsx库
    const XLSX = await import('xlsx');
    
    const formattedData = formatData(data, fields);
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // 设置列宽
    const colWidths = fields.map(field => ({
      wch: Math.max(fieldMapping[field].length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '模型数据');
    
    // 导出文件
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel导出失败:', error);
    throw new Error('Excel导出失败，请检查是否安装了xlsx库');
  }
};

/**
 * 通用导出函数
 * @param {Array} data - 数据
 * @param {Object} options - 导出选项
 * @param {string} options.format - 导出格式 (excel, csv, json)
 * @param {Array} options.fields - 导出字段
 * @param {string} options.filename - 文件名
 */
export const exportData = async (data, options) => {
  const { format, fields, filename } = options;
  
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出');
  }
  
  if (!fields || fields.length === 0) {
    throw new Error('请选择要导出的字段');
  }
  
  const safeFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
  
  try {
    switch (format) {
      case 'excel':
        await exportToExcel(data, fields, safeFilename);
        break;
      case 'csv':
        exportToCSV(data, fields, safeFilename);
        break;
      case 'json':
        exportToJSON(data, fields, safeFilename);
        break;
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
};

/**
 * 获取支持的导出格式
 */
export const getSupportedFormats = () => {
  return [
    { label: 'Excel (.xlsx)', value: 'excel' },
    { label: 'CSV (.csv)', value: 'csv' },
    { label: 'JSON (.json)', value: 'json' }
  ];
};

/**
 * 获取可导出的字段
 */
export const getExportableFields = () => {
  return Object.entries(fieldMapping).map(([key, label]) => ({
    label,
    value: key
  }));
};
