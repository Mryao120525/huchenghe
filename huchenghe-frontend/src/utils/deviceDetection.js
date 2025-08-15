// 设备检测工具
export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // 检测移动设备
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // 检测屏幕尺寸
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || isSmallScreen;
};

export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

export const isAndroid = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android/i.test(userAgent);
};

export const isWeChat = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /MicroMessenger/i.test(userAgent);
};

export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// 获取设备信息
export const getDeviceInfo = () => {
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isWeChat: isWeChat(),
    isStandalone: isStandalone(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent
  };
};

// 检查是否应该使用移动端页面
export const shouldUseMobileView = () => {
  const deviceInfo = getDeviceInfo();
  
  // 如果是移动设备或小屏幕，使用移动端视图
  if (deviceInfo.isMobile) {
    return true;
  }
  
  // 如果屏幕宽度小于768px，也使用移动端视图
  if (deviceInfo.screenWidth <= 768) {
    return true;
  }
  
  return false;
};

// 自动跳转到移动端页面
export const redirectToMobile = (router) => {
  if (shouldUseMobileView()) {
    const currentPath = router.currentRoute.value.path;
    
    // 如果当前不在移动端页面，则跳转
    if (!currentPath.startsWith('/mobile')) {
      const mobilePath = currentPath.replace(/^\//, '/mobile/');
      router.push(mobilePath);
    }
  }
};
