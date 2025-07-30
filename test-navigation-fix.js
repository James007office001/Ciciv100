/**
 * 导航修复测试脚本
 * 测试登录状态和导航问题
 */

// 模拟uni-app的本地存储
const mockStorage = {
  data: {},
  setStorageSync(key, value) {
    this.data[key] = JSON.stringify(value);
    console.log(`设置存储: ${key} =`, value);
  },
  getStorageSync(key) {
    const value = this.data[key];
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`获取存储: ${key} =`, parsed);
        return parsed;
      } catch (e) {
        console.log(`获取存储: ${key} =`, value);
        return value;
      }
    }
    console.log(`获取存储: ${key} = null (不存在)`);
    return null;
  },
  removeStorageSync(key) {
    delete this.data[key];
    console.log(`删除存储: ${key}`);
  }
};

// 模拟autoLoginManager
class MockAutoLoginManager {
  constructor() {
    this.AUTO_LOGIN_KEY = 'auto_login'
    this.LAST_LOGIN_PHONE_KEY = 'last_login_phone'
    this.USER_TOKEN_KEY = 'user_token'
    this.USER_INFO_KEY = 'user_info'
    this.LOGIN_TIME_KEY = 'login_time'
    this.LOGIN_METHOD_KEY = 'login_method'
    
    // 登录有效期：7天
    this.LOGIN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000
  }

  saveLoginState(userInfo, loginMethod = 'password') {
    try {
      const currentTime = Date.now()
      
      // 保存到本地存储
      mockStorage.setStorageSync(this.USER_TOKEN_KEY, userInfo.token)
      mockStorage.setStorageSync(this.USER_INFO_KEY, userInfo)
      mockStorage.setStorageSync(this.LOGIN_TIME_KEY, currentTime)
      mockStorage.setStorageSync(this.AUTO_LOGIN_KEY, true)
      mockStorage.setStorageSync(this.LAST_LOGIN_PHONE_KEY, userInfo.phone)
      mockStorage.setStorageSync(this.LOGIN_METHOD_KEY, loginMethod)
      
      console.log('登录状态已保存:', {
        phone: userInfo.phone,
        loginTime: new Date(currentTime).toISOString(),
        method: loginMethod
      })
      
      return true
    } catch (error) {
      console.error('保存登录状态失败:', error)
      return false
    }
  }

  getCurrentUser() {
    try {
      const userInfo = mockStorage.getStorageSync(this.USER_INFO_KEY)
      const userToken = mockStorage.getStorageSync(this.USER_TOKEN_KEY)
      const loginTime = mockStorage.getStorageSync(this.LOGIN_TIME_KEY)
      
      if (!userInfo || !userToken || !loginTime) {
        console.log('缺少登录信息')
        return null
      }
      
      // 检查是否过期
      const currentTime = Date.now()
      if (currentTime - loginTime > this.LOGIN_EXPIRE_TIME) {
        console.log('登录已过期')
        this.clearAutoLoginData()
        return null
      }
      
      console.log('获取到有效用户信息:', userInfo)
      return userInfo
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return null
    }
  }

  isLoggedIn() {
    const user = this.getCurrentUser()
    const loggedIn = user !== null
    console.log('登录状态检查:', loggedIn)
    return loggedIn
  }

  clearAutoLoginData() {
    mockStorage.removeStorageSync(this.AUTO_LOGIN_KEY)
    mockStorage.removeStorageSync(this.LAST_LOGIN_PHONE_KEY)
    mockStorage.removeStorageSync(this.USER_TOKEN_KEY)
    mockStorage.removeStorageSync(this.USER_INFO_KEY)
    mockStorage.removeStorageSync(this.LOGIN_TIME_KEY)
    mockStorage.removeStorageSync(this.LOGIN_METHOD_KEY)
    console.log('登录数据已清除')
  }
}

// 模拟storage工具
class MockStorage {
  constructor() {
    this.keys = {
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token',
      USER_INFO: 'user_info',
      USER_SETTINGS: 'user_settings',
      DEVICE_ID: 'device_id'
    }
  }

  async setToken(accessToken, refreshToken) {
    try {
      mockStorage.setStorageSync(this.keys.ACCESS_TOKEN, accessToken)
      if (refreshToken) {
        mockStorage.setStorageSync(this.keys.REFRESH_TOKEN, refreshToken)
      }
    } catch (error) {
      console.error('Error saving tokens:', error)
      throw error
    }
  }

  async setUserInfo(userInfo) {
    try {
      mockStorage.setStorageSync(this.keys.USER_INFO, userInfo)
    } catch (error) {
      console.error('Error saving user info:', error)
      throw error
    }
  }

  async getUserInfo() {
    try {
      return mockStorage.getStorageSync(this.keys.USER_INFO)
    } catch (error) {
      console.error('Error getting user info:', error)
      return null
    }
  }
}

// 测试场景
async function testNavigationFix() {
  console.log('=== 导航修复测试开始 ===\n')
  
  const autoLoginManager = new MockAutoLoginManager()
  const storage = new MockStorage()
  
  // 1. 测试登录前状态
  console.log('1. 登录前状态检查:')
  console.log('autoLoginManager.isLoggedIn():', autoLoginManager.isLoggedIn())
  console.log()
  
  // 2. 模拟登录成功 - 新的方式（修复后）
  console.log('2. 模拟登录成功 - 修复后的方式:')
  
  const mockLoginResponse = {
    success: true,
    data: {
      accessToken: 'mock_access_token_12345',
      refreshToken: 'mock_refresh_token_67890',
      user: {
        id: 'user123',
        username: 'test001',
        email: 'test001@cici.com',
        phone: '13800138000',
        displayName: '测试用户',
        avatar: '/static/default-avatar.png',
        bio: '这是一个测试用户'
      }
    }
  }
  
  // 保存到storage（原有方式）
  await storage.setToken(mockLoginResponse.data.accessToken, mockLoginResponse.data.refreshToken)
  await storage.setUserInfo(mockLoginResponse.data.user)
  
  // 保存到autoLoginManager（新增方式）
  const userInfoForAutoLogin = {
    ...mockLoginResponse.data.user,
    token: mockLoginResponse.data.accessToken,
    phone: mockLoginResponse.data.user.phone,
    email: mockLoginResponse.data.user.email
  }
  
  autoLoginManager.saveLoginState(userInfoForAutoLogin, 'email')
  console.log()
  
  // 3. 检查登录后状态
  console.log('3. 登录后状态检查:')
  console.log('autoLoginManager.isLoggedIn():', autoLoginManager.isLoggedIn())
  console.log('autoLoginManager.getCurrentUser():', autoLoginManager.getCurrentUser())
  console.log()
  
  // 4. 模拟profile页面的登录检查
  console.log('4. 模拟profile页面的登录检查:')
  const isLogin = autoLoginManager.isLoggedIn()
  const currentUser = autoLoginManager.getCurrentUser()
  
  console.log('登录状态:', isLogin)
  console.log('当前用户:', currentUser)
  
  if (isLogin && currentUser) {
    console.log('✅ 导航到profile页面 - 登录状态正常')
  } else {
    console.log('❌ 重定向到登录页面 - 登录状态异常')
  }
  console.log()
  
  // 5. 测试存储数据对比
  console.log('5. 存储数据对比:')
  console.log('storage存储的用户信息:', await storage.getUserInfo())
  console.log('autoLoginManager存储的用户信息:', autoLoginManager.getCurrentUser())
  console.log()
  
  console.log('=== 导航修复测试完成 ===')
}

// 运行测试
testNavigationFix().catch(console.error)
