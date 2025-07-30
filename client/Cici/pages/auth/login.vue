<!--
  CICI 社交圈子平台 - 登录页面
-->
<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>
    
    <!-- 主要内容 -->
    <view class="login-content">
      <!-- Logo 和标题 -->
      <view class="header-section">
        <image class="app-logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-title">CICI</text>
        <text class="app-subtitle">发现精彩，连接世界</text>
      </view>
      
      <!-- 登录表单 -->
      <view class="form-section">
        <view class="form-container">
          <!-- 登录方式选择 -->
          <view class="login-method-tabs">
            <view 
              class="method-tab"
              :class="{ active: loginMethod === 'phone' }"
              @click="switchLoginMethod('phone')"
            >
              <text class="tab-text">手机登录</text>
            </view>
            <view 
              class="method-tab"
              :class="{ active: loginMethod === 'email' }"
              @click="switchLoginMethod('email')"
            >
              <text class="tab-text">邮箱登录</text>
            </view>
          </view>
          
          <!-- 手机号/邮箱输入 -->
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">{{ loginMethod === 'phone' ? '📱' : '✉️' }}</text>
              <input 
                v-if="loginMethod === 'phone'"
                class="form-input"
                type="number"
                placeholder="请输入手机号"
                v-model="loginForm.phone"
                maxlength="11"
                @input="onPhoneInput"
              />
              <input 
                v-if="loginMethod === 'email'"
                class="form-input"
                type="text"
                placeholder="请输入邮箱地址"
                v-model="loginForm.email"
                @input="onEmailInput"
              />
            </view>
          </view>
          
          <!-- 密码/验证码输入 -->
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">{{ loginType === 'password' ? '🔒' : '🔢' }}</text>
              <input 
                class="form-input"
                :type="loginType === 'password' ? 'password' : 'number'"
                :placeholder="loginType === 'password' ? '请输入密码' : '请输入验证码'"
                v-model="loginForm.password"
                v-if="loginType === 'password'"
                maxlength="20"
              />
              <input 
                class="form-input"
                type="number"
                placeholder="请输入验证码"
                v-model="loginForm.code"
                v-if="loginType === 'code' && loginMethod === 'phone'"
                maxlength="6"
              />
              <view 
                v-if="loginType === 'code' && loginMethod === 'phone'" 
                class="code-btn"
                :class="{ disabled: codeDisabled }"
                @click="sendCode"
              >
                <text class="code-text">{{ codeText }}</text>
              </view>
            </view>
          </view>
          
          <!-- 登录方式切换（仅手机号支持验证码） -->
          <view v-if="loginMethod === 'phone'" class="login-type-switch">
            <text 
              class="switch-text"
              @click="switchLoginType"
            >
              {{ loginType === 'password' ? '验证码登录' : '密码登录' }}
            </text>
          </view>
          
          <!-- 登录按钮 -->
          <view class="login-btn-group">
            <view 
              class="login-btn"
              :class="{ disabled: !canLogin }"
              @click="handleLogin"
            >
              <text class="btn-text">登录</text>
            </view>
          </view>
          
          <!-- 注册链接 -->
          <view class="register-link">
            <text class="link-text">还没有账号？</text>
            <text class="link-btn" @click="goToRegister">立即注册</text>
          </view>
        </view>
      </view>
      
      <!-- 第三方登录 -->
      <view class="third-party-section">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>
        
        <view class="third-party-buttons">
          <view class="third-party-btn" @click="loginWithGoogle">
            <view class="third-party-icon google-icon">
              <uni-icons type="google" size="20" color="#4285F4"></uni-icons>
            </view>
            <text class="third-party-text">Google登录</text>
          </view>
          <view class="third-party-btn" @click="loginWithApple">
            <view class="third-party-icon apple-icon">
              <uni-icons type="apple-filled" size="20" color="#000"></uni-icons>
            </view>
            <text class="third-party-text">Apple登录</text>
          </view>
        </view>
      </view>
      
      <!-- 用户协议 -->
      <view class="agreement-section">
        <view class="agreement-checkbox">
          <view 
            class="checkbox"
            :class="{ checked: agreedToTerms }"
            @click="toggleAgreement"
          >
            <text v-if="agreedToTerms" class="check-icon">✓</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="agreement-link" @click="showUserAgreement">《用户协议》</text>
            和
            <text class="agreement-link" @click="showPrivacyPolicy">《隐私政策》</text>
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../src/store/modules/user.js'

export default {
  name: 'LoginPage',
  
  setup() {
    // 获取用户store
    const userStore = useUserStore()
    
    // 登录表单数据
    const loginForm = ref({
      phone: '',
      email: '',
      password: '',
      code: ''
    })
    
    // 登录方式 phone | email
    const loginMethod = ref('phone')
    
    // 登录类型 password | code (仅手机号支持验证码)
    const loginType = ref('password')
    
    // 验证码相关
    const codeDisabled = ref(false)
    const codeCountdown = ref(0)
    
    // 用户协议
    const agreedToTerms = ref(false)
    
    // 验证码按钮文本
    const codeText = computed(() => {
      return codeCountdown.value > 0 ? `${codeCountdown.value}s` : '获取验证码'
    })
    
    // 是否可以登录
    const canLogin = computed(() => {
      let credentialValid = false
      
      if (loginMethod.value === 'phone') {
        const phoneValid = /^1[3-9]\d{9}$/.test(loginForm.value.phone)
        credentialValid = phoneValid && (
          loginType.value === 'password' 
            ? loginForm.value.password.length >= 6
            : loginForm.value.code.length === 6
        )
      } else {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email)
        credentialValid = emailValid && loginForm.value.password.length >= 6
      }
      
      return credentialValid && agreedToTerms.value
    })
    
    // 切换登录方法
    const switchLoginMethod = (method) => {
      loginMethod.value = method
      // 清空表单数据
      loginForm.value.phone = ''
      loginForm.value.email = ''
      loginForm.value.password = ''
      loginForm.value.code = ''
      // 邮箱登录只支持密码方式
      if (method === 'email') {
        loginType.value = 'password'
      }
    }
    
    // 手机号输入处理
    const onPhoneInput = (e) => {
      // 限制只能输入数字
      loginForm.value.phone = e.detail.value.replace(/\D/g, '')
    }
    
    // 邮箱输入处理
    const onEmailInput = (e) => {
      loginForm.value.email = e.detail.value.trim()
    }
    
    // 切换登录方式
    const switchLoginType = () => {
      loginType.value = loginType.value === 'password' ? 'code' : 'password'
      // 清空对应的输入
      if (loginType.value === 'password') {
        loginForm.value.code = ''
      } else {
        loginForm.value.password = ''
      }
    }
    
    // 发送验证码
    const sendCode = async () => {
      if (codeDisabled.value || loginMethod.value !== 'phone') return
      
      const phoneValid = /^1[3-9]\d{9}$/.test(loginForm.value.phone)
      if (!phoneValid) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '发送中...' })
        
        // 模拟发送验证码
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 模拟成功响应
        const mockResponse = { success: true }
        
        uni.hideLoading()
        
        if (mockResponse.success) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          
          // 开始倒计时
          startCodeCountdown()
        } else {
          throw new Error('发送失败')
        }
        
      } catch (error) {
        uni.hideLoading()
        console.error('发送验证码错误:', error)
        uni.showToast({
          title: error.message || '发送失败，请重试',
          icon: 'none'
        })
      }
    }
    
    // 验证码倒计时
    const startCodeCountdown = () => {
      codeDisabled.value = true
      codeCountdown.value = 60
      
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          clearInterval(timer)
          codeDisabled.value = false
        }
      }, 1000)
    }
    
    // 检测Google登录状态
    const detectGoogleLoginStatus = () => {
      try {
        // 检查localStorage中的Google相关数据
        const hasGoogleStorage = localStorage.getItem('google_auth') || 
                                localStorage.getItem('gapi_auth') ||
                                localStorage.getItem('google_user')
        
        // 检查sessionStorage中的Google相关数据
        const hasGoogleSession = sessionStorage.getItem('google_auth') ||
                                sessionStorage.getItem('gapi_auth')
        
        return {
          hasGoogleCookies: false, // 在uni-app中无法直接检查cookies
          hasGoogleStorage: !!(hasGoogleStorage || hasGoogleSession)
        }
      } catch (error) {
        console.warn('检测Google登录状态失败:', error)
        return { hasGoogleCookies: false, hasGoogleStorage: false }
      }
    }
    
    // 清理Google相关数据
    const cleanGoogleData = () => {
      try {
        // 清理localStorage中的Google相关数据
        const googleKeys = ['google_auth', 'gapi_auth', 'google_user', 'google_token']
        googleKeys.forEach(key => {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.warn(`清理localStorage ${key} 失败:`, e)
          }
        })
        
        // 清理sessionStorage中的Google相关数据
        googleKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key)
          } catch (e) {
            console.warn(`清理sessionStorage ${key} 失败:`, e)
          }
        })
        
        console.log('✅ Google相关数据清理完成')
      } catch (error) {
        console.error('清理Google数据失败:', error)
      }
    }
    
    // 模拟登录函数
    const mockLogin = async (loginData) => {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 创建模拟用户数据
      const mockUser = {
        id: 'user_' + Date.now(),
        username: loginMethod.value === 'email' ? loginData.login.split('@')[0] : `user_${loginData.login.slice(-4)}`,
        nickname: loginMethod.value === 'email' ? loginData.login.split('@')[0] : `用户${loginData.login.slice(-4)}`,
        avatar: '/static/c5.png',
        email: loginMethod.value === 'email' ? loginData.login : '',
        phone: loginMethod.value === 'phone' ? loginData.login : ''
      }
      
      const mockTokens = {
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now()
      }
      
      return {
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        },
        message: '登录成功'
      }
    }
    
    // 处理登录
    const handleLogin = async () => {
      // 检查是否同意用户协议
      if (!agreedToTerms.value) {
        uni.showToast({
          title: '请先勾选用户协议',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      if (!canLogin.value) {
        uni.showToast({
          title: '请完善登录信息',
          icon: 'none'
        })
        return
      }

      // 检查并处理Google账号登录冲突
      try {
        const googleStatus = detectGoogleLoginStatus()
        if (googleStatus.hasGoogleCookies || googleStatus.hasGoogleStorage) {
          console.log('⚠️ 检测到Google账号登录状态，可能导致冲突')
          console.log('🧹 正在清理Google相关数据...')
          cleanGoogleData()
          
          // 给用户一个提示
          uni.showToast({
            title: '检测到浏览器登录状态冲突，已自动处理',
            icon: 'none',
            duration: 2000
          })
          
          // 稍微延迟一下再继续登录
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.warn('Google冲突检测失败:', error)
      }
      
      try {
        uni.showLoading({ title: '登录中...' })
        
        // 构建登录数据，后端期待login字段
        const loginData = {}
        
        if (loginMethod.value === 'phone') {
          loginData.login = loginForm.value.phone
          if (loginType.value === 'password') {
            loginData.password = loginForm.value.password
          } else {
            loginData.code = loginForm.value.code
          }
        } else {
          loginData.login = loginForm.value.email
          loginData.password = loginForm.value.password
        }
        
        const response = await userStore.login(loginData)
        
        uni.hideLoading()
        
        if (response && response.success) {
          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          })
          
          // 跳转到日程页面
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/schedule/index'
            })
          }, 1500)
          
        } else {
          throw new Error(response.message || '登录失败')
        }
        
      } catch (error) {
        uni.hideLoading()
        console.error('登录错误 - 详细信息:', {
          errorMessage: error.message,
          errorCode: error.code,
          errorData: error.data,
          errorName: error.name,
          errorStack: error.stack,
          fullError: error
        })
        
        // 显示具体的错误信息
        let errorMessage = '网络异常，请重试'
        
        if (error.code) {
          // 如果有错误码，显示对应的消息
          const errorMessages = {
            'LOGIN_FAILED': '登录失败，请检查邮箱和密码',
            'USER_NOT_FOUND': '用户不存在，请确认邮箱是否正确',
            'INVALID_PASSWORD': '密码错误，请重新输入',
            'MISSING_CREDENTIALS': '请输入完整的邮箱和密码',
            'NETWORK_ERROR': '网络连接失败，请检查网络设置',
            'SERVER_ERROR': '服务器内部错误，请稍后重试',
            'UNKNOWN_ERROR': '系统不可用，请稍后重试'
          }
          errorMessage = errorMessages[error.code] || error.message || '系统错误，请稍后重试'
        } else if (error.message && error.message.trim() !== '') {
          // 如果有具体的错误消息，直接显示
          errorMessage = error.message
        } else {
          // 最后的兜底错误消息
          errorMessage = '登录失败，请检查网络连接或稍后重试'
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      }
    }
    
    // 跳转到注册页
    const goToRegister = () => {
      uni.navigateTo({
        url: '/pages/auth/register'
      })
    }
    
    // Google登录
    const loginWithGoogle = async () => {
      if (!agreedToTerms.value) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: 'Google登录中...' })
        
        // 模拟Google登录成功
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const mockGoogleUser = {
          id: 'google_user_' + Date.now(),
          username: 'google_user',
          nickname: 'Google用户',
          avatar: '/static/c5.png',
          email: 'user@gmail.com',
          phone: ''
        }
        
        const mockTokens = {
          accessToken: 'google_token_' + Date.now(),
          refreshToken: 'google_refresh_' + Date.now()
        }
        
        // 保存到本地存储
        uni.setStorageSync('user_info', mockGoogleUser)
        uni.setStorageSync('access_token', mockTokens.accessToken)
        uni.setStorageSync('token_expiry', Date.now() + (7 * 24 * 60 * 60 * 1000))
        
        uni.hideLoading()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/schedule/index'
          })
        }, 1500)
        
      } catch (error) {
        uni.hideLoading()
        console.error('Google登录错误:', error)
        uni.showToast({
          title: error.message || 'Google登录失败',
          icon: 'none'
        })
      }
    }
    
    // Apple登录
    const loginWithApple = async () => {
      if (!agreedToTerms.value) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: 'Apple登录中...' })
        
        // 模拟Apple登录成功
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const mockAppleUser = {
          id: 'apple_user_' + Date.now(),
          username: 'apple_user',
          nickname: 'Apple用户',
          avatar: '/static/c5.png',
          email: 'user@icloud.com',
          phone: ''
        }
        
        const mockTokens = {
          accessToken: 'apple_token_' + Date.now(),
          refreshToken: 'apple_refresh_' + Date.now()
        }
        
        // 保存到本地存储
        uni.setStorageSync('user_info', mockAppleUser)
        uni.setStorageSync('access_token', mockTokens.accessToken)
        uni.setStorageSync('token_expiry', Date.now() + (7 * 24 * 60 * 60 * 1000))
        
        uni.hideLoading()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/schedule/index'
          })
        }, 1500)
        
      } catch (error) {
        uni.hideLoading()
        console.error('Apple登录错误:', error)
        uni.showToast({
          title: error.message || 'Apple登录失败',
          icon: 'none'
        })
      }
    }
    
    // 切换协议同意状态
    const toggleAgreement = () => {
      agreedToTerms.value = !agreedToTerms.value
    }
    
    // 显示用户协议
    const showUserAgreement = () => {
      uni.navigateTo({
        url: '/pages/auth/user-agreement'
      })
    }
    
    // 显示隐私政策
    const showPrivacyPolicy = () => {
      uni.navigateTo({
        url: '/pages/auth/privacy-policy'
      })
    }
    
    // 检查自动登录
    const checkAutoLogin = async () => {
      try {
        console.log('开始检查自动登录...')
        
        // 使用uni-app存储API检查登录状态
        const userInfo = uni.getStorageSync('user_info')
        const accessToken = uni.getStorageSync('access_token')
        const tokenExpiry = uni.getStorageSync('token_expiry')
        
        if (userInfo && accessToken && tokenExpiry) {
          const now = Date.now()
          if (now < tokenExpiry) {
            console.log('检测到有效登录状态，尝试自动登录')
            
            uni.showLoading({ title: '自动登录中...' })
            
            // 模拟验证令牌有效性
            try {
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // 模拟成功响应
              const mockResponse = { success: true }
              
              if (mockResponse.success) {
                uni.hideLoading()
                
                uni.showToast({
                  title: '自动登录成功',
                  icon: 'success',
                  duration: 1000
                })
                
                // 跳转到主页
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/schedule/index'
                  })
                }, 1000)
                
                return true
              } else {
                throw new Error('令牌验证失败')
              }
            } catch (error) {
              console.log('令牌验证失败，清除登录状态:', error)
              uni.removeStorageSync('user_info')
              uni.removeStorageSync('access_token')
              uni.removeStorageSync('token_expiry')
              uni.hideLoading()
              return false
            }
          } else {
            console.log('令牌已过期，清除登录状态')
            uni.removeStorageSync('user_info')
            uni.removeStorageSync('access_token')
            uni.removeStorageSync('token_expiry')
          }
        }
        
        console.log('未检测到有效的自动登录状态')
        return false
        
      } catch (error) {
        console.error('自动登录检查异常:', error)
        uni.removeStorageSync('user_info')
        uni.removeStorageSync('access_token')
        uni.removeStorageSync('token_expiry')
        return false
      }
    }
    
    // 组件挂载时检查自动登录
    onMounted(async () => {
      console.log('登录页面已挂载，检查自动登录...')
      const autoLoginSuccess = await checkAutoLogin()
      if (!autoLoginSuccess) {
        console.log('未检测到有效的自动登录，显示登录页面')
      }
    })
    
    return {
      loginForm,
      loginMethod,
      loginType,
      codeDisabled,
      codeText,
      agreedToTerms,
      canLogin,
      switchLoginMethod,
      onPhoneInput,
      onEmailInput,
      switchLoginType,
      sendCode,
      mockLogin,
      handleLogin,
      goToRegister,
      loginWithGoogle,
      loginWithApple,
      toggleAgreement,
      showUserAgreement,
      showPrivacyPolicy
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: -200rpx;
  right: -200rpx;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: -150rpx;
  left: -150rpx;
}

.circle-3 {
  width: 200rpx;
  height: 200rpx;
  top: 30%;
  left: -100rpx;
}

/* 主要内容 */
.login-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: calc(var(--status-bar-height, 0px) + 60rpx) 40rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 24rpx;
}

.app-title {
  display: block;
  color: rgba(255, 255, 255, 0.95);
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.app-subtitle {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  font-weight: 400;
}

/* 表单区域 */
.form-section {
  margin-bottom: 60rpx;
}

.form-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40rpx;
}

/* 登录方式选择器 */
.login-method-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 6rpx;
  margin-bottom: 32rpx;
}

.method-tab {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }
  
  &:not(.active):active {
    background: rgba(255, 255, 255, 0.06);
  }
}

.tab-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 500;
  
  .method-tab:not(.active) & {
    color: rgba(255, 255, 255, 0.6);
  }
}

.input-group {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 88rpx;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
  }
}

.input-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-right: 16rpx;
}

.form-input {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  background: transparent;
  border: none;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

.code-btn {
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12rpx;
  transition: all 0.3s ease;
  
  &.disabled {
    background: rgba(255, 255, 255, 0.1);
    opacity: 0.6;
  }
  
  &:not(.disabled):active {
    transform: scale(0.95);
  }
}

.code-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
  font-weight: 500;
}

.login-type-switch {
  text-align: right;
  margin-bottom: 32rpx;
}

.switch-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  text-decoration: underline;
  
  &:active {
    opacity: 0.7;
  }
}

.login-btn-group {
  margin-bottom: 24rpx;
}

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  
  &.disabled {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  
  &:not(.disabled):active {
    transform: scale(0.98);
  }
}

.btn-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 30rpx;
  font-weight: 600;
}

.register-link {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.link-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-right: 8rpx;
}

.link-btn {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: 500;
  text-decoration: underline;
  
  &:active {
    opacity: 0.7;
  }
}

/* 第三方登录 */
.third-party-section {
  margin-bottom: 40rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin: 0 24rpx;
}

.third-party-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.third-party-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(0.98);
  }
}

.third-party-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
  
  &.google-icon {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6rpx;
  }
  
  &.apple-icon {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6rpx;
  }
}

/* Google图标样式 */
.google-icon {
  width: 32rpx;
  height: 32rpx;
  background: linear-gradient(45deg, #4285F4, #34A853, #FBBC05, #EA4335);
  background-size: 200% 200%;
  color: white;
  font-weight: bold;
  font-size: 20rpx;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8rpx auto;
  animation: googleColorShift 3s ease-in-out infinite;
}

@keyframes googleColorShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Apple图标样式 */
.apple-icon {
  width: 32rpx;
  height: 32rpx;
  margin: 0 auto 8rpx auto;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 24rpx;
    height: 28rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12rpx 12rpx 8rpx 8rpx;
    top: 2rpx;
    left: 4rpx;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 8rpx;
    height: 8rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50% 50% 50% 0;
    top: -2rpx;
    right: 8rpx;
    transform: rotate(-45deg);
  }
}

.third-party-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
}

/* 用户协议 */
.agreement-section {
  margin-top: 40rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-top: 2rpx;
  background: rgba(255, 255, 255, 0.05);
  
  &.checked {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;
    box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.check-icon {
  color: white;
  font-size: 18rpx;
  font-weight: bold;
}

.agreement-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  line-height: 1.6;
  font-weight: 400;
}

.agreement-link {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: underline;
  font-weight: 500;
  
  &:active {
    opacity: 0.7;
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .login-content {
    padding: calc(var(--status-bar-height, 0px) + 40rpx) 32rpx 32rpx 32rpx;
  }
  
  .form-container {
    padding: 32rpx;
  }
  
  .app-title {
    font-size: 42rpx;
  }
  
  .btn-text {
    font-size: 28rpx;
  }
}
</style>
