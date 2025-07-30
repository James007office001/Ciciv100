<!--
  CICI 社交圈子平台 - 注册页面
-->
<template>
  <view class="register-page">
    <!-- 顶部导航 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <view class="header-title">
        <text class="title-text">注册</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>
    
    <!-- 主要内容 -->
    <view class="register-content">
      <!-- 注册表单 -->
      <view class="form-section">
        <view class="form-container">
          <!-- 注册方式选择 -->
          <view class="register-type-section">
            <view class="register-type-tabs">
              <view 
                class="register-type-tab"
                :class="{ active: registerType === 'phone' }"
                @click="switchRegisterType('phone')"
              >
                <text class="tab-text">手机注册</text>
              </view>
              <view 
                class="register-type-tab"
                :class="{ active: registerType === 'email' }"
                @click="switchRegisterType('email')"
              >
                <text class="tab-text">邮箱注册</text>
              </view>
            </view>
          </view>
          
          <!-- 手机号注册表单 -->
          <view v-if="registerType === 'phone'" class="phone-register-form">
            <!-- 手机号输入 -->
            <view class="input-group">
              <view class="input-wrapper">
                <text class="input-icon">📱</text>
                <input 
                  class="form-input"
                  type="number"
                  placeholder="请输入手机号"
                  v-model="registerForm.phone"
                  maxlength="11"
                  @input="onPhoneInput"
                />
              </view>
            </view>
            
            <!-- 验证码输入 -->
            <view class="input-group">
              <view class="input-wrapper">
                <text class="input-icon">🔢</text>
                <input 
                  class="form-input"
                  type="number"
                  placeholder="请输入验证码"
                  v-model="registerForm.code"
                  maxlength="6"
                />
                <view 
                  class="code-btn"
                  :class="{ disabled: codeDisabled }"
                  @click="sendCode"
                >
                  <text class="code-text">{{ codeText }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 邮箱注册表单 -->
          <view v-else-if="registerType === 'email'" class="email-register-form">
            <!-- 邮箱输入 -->
            <view class="input-group">
              <view class="input-wrapper">
                <text class="input-icon">📧</text>
                <input 
                  class="form-input"
                  type="text"
                  placeholder="请输入邮箱地址"
                  v-model="registerForm.email"
                  @input="onEmailInput"
                />
              </view>
            </view>
            
            <!-- 邮箱验证码输入 -->
            <view class="input-group">
              <view class="input-wrapper">
                <text class="input-icon">🔢</text>
                <input 
                  class="form-input"
                  type="text"
                  placeholder="请输入邮箱验证码"
                  v-model="registerForm.emailCode"
                  maxlength="6"
                />
                <view 
                  class="code-btn"
                  :class="{ disabled: emailCodeDisabled }"
                  @click="sendEmailCode"
                >
                  <text class="code-text">{{ emailCodeText }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 密码输入 -->
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input 
                class="form-input"
                type="password"
                placeholder="请设置密码（6-20位）"
                v-model="registerForm.password"
                maxlength="20"
              />
            </view>
          </view>
          
          <!-- 确认密码输入 -->
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">🔐</text>
              <input 
                class="form-input"
                type="password"
                placeholder="请确认密码"
                v-model="registerForm.confirmPassword"
                maxlength="20"
              />
            </view>
          </view>
          
          <!-- 用户名输入 -->
          <view class="input-group">
            <view class="input-wrapper">
              <text class="input-icon">👤</text>
              <input 
                class="form-input"
                type="text"
                placeholder="请输入用户名（可选）"
                v-model="registerForm.username"
                maxlength="20"
              />
            </view>
          </view>
          
          <!-- 注册按钮 -->
          <view class="register-btn-group">
            <view 
              class="register-btn"
              :class="{ disabled: !canRegister }"
              @click="handleRegister"
            >
              <text class="btn-text">立即注册</text>
            </view>
          </view>
          
          <!-- 登录链接 -->
          <view class="login-link">
            <text class="link-text">已有账号？</text>
            <text class="link-btn" @click="goToLogin">立即登录</text>
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
import { ref, computed } from 'vue'

export default {
  name: 'RegisterPage',
  
  setup() {
    // 注册方式：'phone' 或 'email'
    const registerType = ref('phone')
    
    // 注册表单数据
    const registerForm = ref({
      phone: '',
      email: '',
      code: '',
      emailCode: '',
      password: '',
      confirmPassword: '',
      username: ''
    })
    
    // 手机验证码相关
    const codeDisabled = ref(false)
    const codeCountdown = ref(0)
    
    // 邮箱验证码相关
    const emailCodeDisabled = ref(false)
    const emailCodeCountdown = ref(0)
    
    // 用户协议
    const agreedToTerms = ref(false)
    
    // 手机验证码按钮文本
    const codeText = computed(() => {
      return codeCountdown.value > 0 ? `${codeCountdown.value}s` : '获取验证码'
    })
    
    // 邮箱验证码按钮文本
    const emailCodeText = computed(() => {
      return emailCodeCountdown.value > 0 ? `${emailCodeCountdown.value}s` : '获取验证码'
    })
    
    // 是否可以注册
    const canRegister = computed(() => {
      const passwordValid = registerForm.value.password.length >= 6
      const confirmPasswordValid = registerForm.value.password === registerForm.value.confirmPassword
      
      if (registerType.value === 'phone') {
        const phoneValid = /^1[3-9]\d{9}$/.test(registerForm.value.phone)
        const codeValid = registerForm.value.code.length === 6
        return phoneValid && codeValid && passwordValid && confirmPasswordValid && agreedToTerms.value
      } else {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)
        const emailCodeValid = registerForm.value.emailCode.length === 6
        return emailValid && emailCodeValid && passwordValid && confirmPasswordValid && agreedToTerms.value
      }
    })
    
    // 切换注册方式
    const switchRegisterType = (type) => {
      registerType.value = type
      // 清空相关字段
      if (type === 'phone') {
        registerForm.value.email = ''
        registerForm.value.emailCode = ''
      } else {
        registerForm.value.phone = ''
        registerForm.value.code = ''
      }
    }
    
    // 手机号输入处理
    const onPhoneInput = (e) => {
      registerForm.value.phone = e.detail.value.replace(/\D/g, '')
    }
    
    // 邮箱输入处理
    const onEmailInput = (e) => {
      registerForm.value.email = e.detail.value.trim()
    }
    
    // 发送验证码
    const sendCode = async () => {
      if (codeDisabled.value) return
      
      const phoneValid = /^1[3-9]\d{9}$/.test(registerForm.value.phone)
      if (!phoneValid) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '发送中...' })
        
        // TODO: 调用发送验证码API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uni.hideLoading()
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        
        // 开始倒计时
        startCodeCountdown()
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '发送失败，请重试',
          icon: 'error'
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
    
    // 发送邮箱验证码
    const sendEmailCode = async () => {
      if (emailCodeDisabled.value) return
      
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)
      if (!emailValid) {
        uni.showToast({
          title: '请输入正确的邮箱地址',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '发送中...' })
        
        // TODO: 调用发送邮箱验证码API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uni.hideLoading()
        uni.showToast({
          title: '验证码已发送至邮箱',
          icon: 'success'
        })
        
        // 开始倒计时
        startEmailCodeCountdown()
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '发送失败，请重试',
          icon: 'error'
        })
      }
    }
    
    // 邮箱验证码倒计时
    const startEmailCodeCountdown = () => {
      emailCodeDisabled.value = true
      emailCodeCountdown.value = 60
      
      const timer = setInterval(() => {
        emailCodeCountdown.value--
        if (emailCodeCountdown.value <= 0) {
          clearInterval(timer)
          emailCodeDisabled.value = false
        }
      }, 1000)
    }
    
    // 处理注册
    const handleRegister = async () => {
      if (!canRegister.value) return
      
      try {
        uni.showLoading({ title: '注册中...' })
        
        // 准备注册数据
        const registerData = {
          password: registerForm.value.password,
          username: registerForm.value.username || '',
          registerType: registerType.value
        }
        
        // 根据注册方式添加相应字段
        if (registerType.value === 'phone') {
          registerData.phone = registerForm.value.phone
          registerData.code = registerForm.value.code
          registerData.username = registerData.username || '用户' + registerForm.value.phone.slice(-4)
        } else {
          registerData.email = registerForm.value.email
          registerData.emailCode = registerForm.value.emailCode
          registerData.username = registerData.username || registerForm.value.email.split('@')[0]
        }
        
        // TODO: 调用注册API
        console.log('注册数据:', registerData)
        
        // 模拟注册请求
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        uni.hideLoading()
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 注册成功后跳转到登录页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '注册失败，请重试',
          icon: 'error'
        })
      }
    }
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack()
    }
    
    // 跳转到登录页
    const goToLogin = () => {
      uni.navigateBack()
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
    
    return {
      registerType,
      registerForm,
      codeDisabled,
      codeText,
      emailCodeDisabled,
      emailCodeText,
      agreedToTerms,
      canRegister,
      switchRegisterType,
      onPhoneInput,
      onEmailInput,
      sendCode,
      sendEmailCode,
      handleRegister,
      goBack,
      goToLogin,
      toggleAgreement,
      showUserAgreement,
      showPrivacyPolicy
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding-top: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
}

/* 顶部导航 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 7rpx 20rpx;
  padding-top: calc(var(--status-bar-height, 0px) + 7rpx);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28rpx;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }
}

.back-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: bold;
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  font-weight: 500;
}

.header-right {
  width: 56rpx;
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
  width: 300rpx;
  height: 300rpx;
  top: 20%;
  right: -150rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: 20%;
  left: -100rpx;
}

/* 主要内容 */
.register-content {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - var(--status-bar-height, 0px) - 80rpx);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 表单区域 */
.form-section {
  margin-bottom: 40rpx;
}

.form-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40rpx;
}

/* 注册方式选择器 */
.register-type-section {
  margin-bottom: 32rpx;
}

.register-type-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12rpx;
  padding: 6rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.register-type-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 20rpx;
  border-radius: 8rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  &:not(.active):hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.tab-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  font-weight: 500;
  transition: color 0.3s ease;
  
  .register-type-tab.active & {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
  }
}

.input-group {
  margin-bottom: 24rpx;
  
  &:last-of-type {
    margin-bottom: 32rpx;
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

.register-btn-group {
  margin-bottom: 24rpx;
}

.register-btn {
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

.login-link {
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

/* 用户协议 */
.agreement-section {
  margin-top: auto;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-top: 2rpx;
  
  &.checked {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;
  }
}

.check-icon {
  color: white;
  font-size: 16rpx;
  font-weight: bold;
}

.agreement-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
  line-height: 1.5;
}

.agreement-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
  
  &:active {
    opacity: 0.7;
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .register-content {
    padding: 32rpx;
  }
  
  .form-container {
    padding: 32rpx;
  }
  
  .btn-text {
    font-size: 28rpx;
  }
}
</style>
