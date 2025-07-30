/**
 * Google账号登录冲突修复脚本
 * 解决Chrome浏览器Google账号登录状态影响uni-app登录的问题
 */

// HBuilderX浏览器环境检测
function detectBrowserEnvironment() {
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.includes('Chrome');
  const isHBuilderX = userAgent.includes('HBuilderX') || window.location.origin.includes('127.0.0.1');
  
  console.log('浏览器环境检测:', {
    userAgent,
    isChrome,
    isHBuilderX,
    origin: window.location.origin
  });
  
  return { isChrome, isHBuilderX };
}

// Google账号登录状态检测
function detectGoogleLoginStatus() {
  // 检查是否存在Google相关的cookie或存储
  const cookies = typeof document !== 'undefined' ? document.cookie : '';
  const hasGoogleCookies = cookies.includes('SAPISID') || 
                          cookies.includes('HSID') || 
                          cookies.includes('SSID') ||
                          cookies.includes('APISID') ||
                          cookies.includes('SID');
  
  // 检查localStorage中的Google相关数据
  let hasGoogleStorage = false;
  if (typeof localStorage !== 'undefined') {
    if (localStorage.data) {
      // 测试环境
      for (let key in localStorage.data) {
        if (localStorage.data.hasOwnProperty(key) && 
            (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
          hasGoogleStorage = true;
          break;
        }
      }
    } else {
      // 浏览器环境
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('google') || key.includes('gapi') || key.includes('oauth'))) {
          hasGoogleStorage = true;
          break;
        }
      }
    }
  }
  
  console.log('Google登录状态检测:', {
    hasGoogleCookies,
    hasGoogleStorage,
    cookieCount: cookies.split(';').length,
    localStorageCount: typeof localStorage !== 'undefined' ? 
      (localStorage.data ? Object.keys(localStorage.data).length : localStorage.length) : 0
  });
  
  return { hasGoogleCookies, hasGoogleStorage };
}

// 清理Google相关的存储数据
function cleanGoogleData() {
  try {
    // 清理localStorage中的Google相关数据
    if (typeof localStorage !== 'undefined') {
      // 获取所有localStorage键名的兼容方式
      const localStorageKeys = [];
      if (localStorage.data) {
        // 测试环境
        for (let key in localStorage.data) {
          if (localStorage.data.hasOwnProperty(key)) {
            localStorageKeys.push(key);
          }
        }
      } else {
        // 浏览器环境
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) localStorageKeys.push(key);
        }
      }
      
      localStorageKeys.forEach(key => {
        if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
          localStorage.removeItem(key);
          console.log('已清理localStorage项:', key);
        }
      });
    }
    
    // 清理sessionStorage中的Google相关数据
    if (typeof sessionStorage !== 'undefined') {
      // 获取所有sessionStorage键名的兼容方式
      const sessionStorageKeys = [];
      if (sessionStorage.data) {
        // 测试环境
        for (let key in sessionStorage.data) {
          if (sessionStorage.data.hasOwnProperty(key)) {
            sessionStorageKeys.push(key);
          }
        }
      } else {
        // 浏览器环境
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) sessionStorageKeys.push(key);
        }
      }
      
      sessionStorageKeys.forEach(key => {
        if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
          sessionStorage.removeItem(key);
          console.log('已清理sessionStorage项:', key);
        }
      });
    }
    
    console.log('Google相关数据清理完成');
    return true;
  } catch (error) {
    console.error('清理Google数据时出错:', error);
    return false;
  }
}

// 修改网络请求以避免Google冲突
function patchNetworkRequest() {
  // 保存原始的uni.request方法
  const originalRequest = uni.request;
  
  // 重写uni.request方法
  uni.request = function(options) {
    // 为请求添加特殊的header，避免与Google服务冲突
    options.header = options.header || {};
    
    // 添加自定义请求头，明确表示这是uni-app应用的请求
    options.header['X-Uni-App'] = 'true';
    options.header['X-Requested-With'] = 'XMLHttpRequest';
    
    // 如果是登录请求，添加特殊标识
    if (options.url && (options.url.includes('/login') || options.url.includes('/auth'))) {
      options.header['X-Login-Request'] = 'true';
      options.header['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      options.header['Pragma'] = 'no-cache';
      options.header['Expires'] = '0';
    }
    
    console.log('修补后的请求配置:', {
      url: options.url,
      method: options.method,
      headers: options.header
    });
    
    // 调用原始方法
    return originalRequest.call(this, options);
  };
  
  console.log('网络请求修补完成');
}

// 初始化修复
function initGoogleConflictFix() {
  console.log('=== Google账号登录冲突修复启动 ===');
  
  const browserEnv = detectBrowserEnvironment();
  const googleStatus = detectGoogleLoginStatus();
  
  // 如果检测到Chrome环境且有Google登录状态
  if (browserEnv.isChrome && (googleStatus.hasGoogleCookies || googleStatus.hasGoogleStorage)) {
    console.log('⚠️ 检测到Google账号登录冲突风险');
    
    // 清理Google相关数据
    const cleaned = cleanGoogleData();
    
    if (cleaned) {
      console.log('✅ Google冲突数据已清理');
    }
  }
  
  // 无论如何都应用网络请求修补
  patchNetworkRequest();
  
  // 添加页面卸载时的清理
  window.addEventListener('beforeunload', () => {
    // 在页面卸载前清理可能的冲突数据
    cleanGoogleData();
  });
  
  console.log('=== Google账号登录冲突修复完成 ===');
}

// 导出修复函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initGoogleConflictFix,
    detectBrowserEnvironment,
    detectGoogleLoginStatus,
    cleanGoogleData,
    patchNetworkRequest
  };
} else if (typeof window !== 'undefined') {
  window.GoogleConflictFix = {
    initGoogleConflictFix,
    detectBrowserEnvironment,
    detectGoogleLoginStatus,
    cleanGoogleData,
    patchNetworkRequest
  };
}
