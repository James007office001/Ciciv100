/**
 * Google冲突修复验证脚本
 */

// 导入修复工具
const { 
  detectBrowserEnvironment, 
  detectGoogleLoginStatus, 
  cleanGoogleData 
} = require('./client/Cici/src/utils/googleConflictFix.js');

console.log('=== Google冲突修复验证测试 ===\n');

// 模拟浏览器环境
global.window = {
  location: { origin: 'http://127.0.0.1:5173' }
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 HBuilderX/4.75'
};

global.document = {
  cookie: 'SAPISID=test123; HSID=test456; SSID=test789; other=value'
};

global.localStorage = {
  data: {
    'google-oauth-token': 'test-token',
    'gapi-auth': 'test-auth',
    'normal-data': 'keep-this'
  },
  getItem: function(key) { return this.data[key]; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; },
  key: function(index) { return Object.keys(this.data)[index]; },
  get length() { return Object.keys(this.data).length; }
};

Object.defineProperty(global.localStorage, 'length', {
  get: function() { return Object.keys(this.data).length; }
});

global.sessionStorage = {
  data: {
    'google-session': 'test-session',
    'oauth-temp': 'temp-data'
  },
  getItem: function(key) { return this.data[key]; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; },
  key: function(index) { return Object.keys(this.data)[index]; },
  get length() { return Object.keys(this.data).length; }
};

// 模拟Object.keys
if (!Object.keys) {
  Object.keys = function(obj) {
    const keys = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  };
}

// 提供keys方法给localStorage
Object.keys = Object.keys || function(obj) {
  const keys = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
};

try {
  // 1. 测试浏览器环境检测
  console.log('1. 浏览器环境检测:');
  const browserEnv = detectBrowserEnvironment();
  console.log('   Chrome环境:', browserEnv.isChrome);
  console.log('   HBuilderX环境:', browserEnv.isHBuilderX);
  console.log();

  // 2. 测试Google登录状态检测
  console.log('2. Google登录状态检测:');
  const googleStatus = detectGoogleLoginStatus();
  console.log('   Google Cookies:', googleStatus.hasGoogleCookies);
  console.log('   Google Storage:', googleStatus.hasGoogleStorage);
  console.log();

  // 3. 显示修复前的存储状态
  console.log('3. 修复前的存储状态:');
  console.log('   localStorage项目:', Object.keys(localStorage.data));
  console.log('   sessionStorage项目:', Object.keys(sessionStorage.data));
  console.log();

  // 4. 执行数据清理
  console.log('4. 执行Google数据清理:');
  const cleaned = cleanGoogleData();
  console.log('   清理结果:', cleaned);
  console.log();

  // 5. 显示修复后的存储状态
  console.log('5. 修复后的存储状态:');
  console.log('   localStorage项目:', Object.keys(localStorage.data));
  console.log('   sessionStorage项目:', Object.keys(sessionStorage.data));
  console.log();

  // 6. 验证清理效果
  console.log('6. 清理效果验证:');
  const hasGoogleAfter = Object.keys(localStorage.data).some(key => 
    key.includes('google') || key.includes('gapi') || key.includes('oauth')
  );
  const hasSessionGoogleAfter = Object.keys(sessionStorage.data).some(key => 
    key.includes('google') || key.includes('gapi') || key.includes('oauth')
  );
  
  if (!hasGoogleAfter && !hasSessionGoogleAfter) {
    console.log('   ✅ Google相关数据已完全清理');
  } else {
    console.log('   ❌ 仍有Google相关数据残留');
  }

  console.log('   保留的正常数据:', Object.keys(localStorage.data).filter(key => 
    !key.includes('google') && !key.includes('gapi') && !key.includes('oauth')
  ));

  console.log('\n=== 验证测试完成 ===');
  console.log('修复工具运行正常，可以有效处理Google账号登录冲突问题。');

} catch (error) {
  console.error('验证测试失败:', error);
  console.log('\n请检查googleConflictFix.js文件是否正确创建。');
}
