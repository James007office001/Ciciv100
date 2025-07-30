/**
 * 网络请求工具
 * 基于uni.request封装，支持拦截器、错误处理、自动重试等功能
 */

// 临时移除有问题的导入，使用本地配置
// import { APP_CONFIG } from '../../../../shared/config/constants.js'
// import { ERROR_CODES, getErrorMessage } from '../../../../shared/config/errorCodes.js'
import { storage } from './storage.js'

// 本地配置替代
const APP_CONFIG = {
  API_TIMEOUT: 30000
}

const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  LOGIN_FAILED: 'LOGIN_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS'
}

// 本地错误消息映射
const getErrorMessage = (code) => {
  const errorMessages = {
    [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
    [ERROR_CODES.SERVER_ERROR]: '服务器内部错误，请稍后重试',
    [ERROR_CODES.TOKEN_EXPIRED]: '登录已过期，请重新登录',
    [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请稍后重试',
    [ERROR_CODES.UNAUTHORIZED]: '未授权访问，请重新登录',
    [ERROR_CODES.FORBIDDEN]: '访问被拒绝，权限不足',
    [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
    [ERROR_CODES.VALIDATION_ERROR]: '数据验证失败，请检查输入',
    [ERROR_CODES.LOGIN_FAILED]: '登录失败，请检查邮箱和密码',
    [ERROR_CODES.USER_NOT_FOUND]: '用户不存在，请确认邮箱是否正确',
    [ERROR_CODES.INVALID_PASSWORD]: '密码错误，请重新输入',
    [ERROR_CODES.ACCOUNT_LOCKED]: '账户已被锁定，请联系管理员',
    [ERROR_CODES.MISSING_CREDENTIALS]: '请输入完整的邮箱和密码'
  }
  
  return errorMessages[code] || '未知错误'
}

class Request {
  constructor() {
    this.baseURL = 'http://localhost:3000' // Docker服务器地址
    this.timeout = APP_CONFIG.API_TIMEOUT || 30000
    this.interceptors = {
      request: [],
      response: []
    }
    
    // 请求队列，防止重复请求
    this.requestQueue = new Map()
    
    // 重试配置
    this.retryConfig = {
      maxRetries: 2,
      retryDelay: 1000,
      retryCondition: (error) => {
        // 网络错误或服务器错误时重试
        return error.code === ERROR_CODES.NETWORK_ERROR || 
               error.code === ERROR_CODES.SERVER_ERROR
      }
    }

    // 添加默认的请求拦截器（添加JWT认证）
    this.addRequestInterceptor(async (config) => {
      const token = await storage.getAccessToken()
      if (token) {
        config.header = config.header || {}
        config.header['Authorization'] = `Bearer ${token}`
      }
      return config
    })

    // 添加默认的响应拦截器（处理401错误）
    this.addResponseInterceptor(
      (response) => response,
      async (error) => {
        if (error.statusCode === 401) {
          // Token过期，尝试刷新
          try {
            const userService = await import('../services/userService.js')
            await userService.default.refreshToken()
            // 重新发起原请求
            return this.request(error.config)
          } catch (refreshError) {
            // 刷新失败，跳转到登录页
            uni.reLaunch({
              url: '/pages/auth/login'
            })
            throw refreshError
          }
        }
        throw error
      }
    )
  }

  /**
   * 添加请求拦截器
   * @param {Function} onFulfilled - 请求成功拦截器
   * @param {Function} onRejected - 请求失败拦截器
   */
  addRequestInterceptor(onFulfilled, onRejected) {
    this.interceptors.request.push({
      onFulfilled,
      onRejected
    })
  }

  /**
   * 添加响应拦截器
   * @param {Function} onFulfilled - 响应成功拦截器
   * @param {Function} onRejected - 响应失败拦截器
   */
  addResponseInterceptor(onFulfilled, onRejected) {
    this.interceptors.response.push({
      onFulfilled,
      onRejected
    })
  }

  /**
   * 执行请求拦截器
   * @param {Object} config - 请求配置
   * @returns {Object} 处理后的请求配置
   */
  async executeRequestInterceptors(config) {
    let result = config
    
    for (const interceptor of this.interceptors.request) {
      try {
        if (interceptor.onFulfilled) {
          result = await interceptor.onFulfilled(result)
        }
      } catch (error) {
        if (interceptor.onRejected) {
          result = await interceptor.onRejected(error)
        } else {
          throw error
        }
      }
    }
    
    return result
  }

  /**
   * 执行响应拦截器
   * @param {Object} response - 响应数据
   * @returns {Object} 处理后的响应数据
   */
  async executeResponseInterceptors(response) {
    let result = response
    
    for (const interceptor of this.interceptors.response) {
      try {
        if (interceptor.onFulfilled) {
          result = await interceptor.onFulfilled(result)
        }
      } catch (error) {
        if (interceptor.onRejected) {
          result = await interceptor.onRejected(error)
        } else {
          throw error
        }
      }
    }
    
    return result
  }

  /**
   * 生成请求唯一标识
   * @param {Object} config - 请求配置
   * @returns {string} 请求标识
   */
  generateRequestKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`
  }

  /**
   * 格式化URL
   * @param {string} url - 请求URL
   * @param {Object} params - URL参数
   * @returns {string} 格式化后的URL
   */
  formatUrl(url, params = {}) {
    let fullUrl = url.startsWith('http') ? url : this.baseURL + url
    
    // 替换路径参数
    Object.keys(params).forEach(key => {
      if (fullUrl.includes(`:${key}`)) {
        fullUrl = fullUrl.replace(`:${key}`, params[key])
        delete params[key]
      }
    })
    
    // 添加查询参数
    const queryParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    if (queryParams) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams
    }
    
    return fullUrl
  }

  /**
   * 发送请求
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求Promise
   */
  async request(config) {
    try {
      // 执行请求拦截器
      const processedConfig = await this.executeRequestInterceptors(config)
      
      // 生成请求标识
      const requestKey = this.generateRequestKey(processedConfig)
      
      // 检查是否有重复请求
      if (this.requestQueue.has(requestKey)) {
        return this.requestQueue.get(requestKey)
      }
      
      // 创建请求Promise
      const requestPromise = this.executeRequest(processedConfig)
      
      // 添加到请求队列
      this.requestQueue.set(requestKey, requestPromise)
      
      // 请求完成后从队列中移除
      requestPromise.finally(() => {
        this.requestQueue.delete(requestKey)
      })
      
      return requestPromise
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 执行实际请求
   * @param {Object} config - 请求配置
   * @param {number} retryCount - 重试次数
   * @returns {Promise} 请求结果
   */
  async executeRequest(config, retryCount = 0) {
    console.log('🚀 发送网络请求:', {
      url: this.formatUrl(config.url, config.params),
      method: config.method || 'GET',
      data: config.data,
      retryCount: retryCount
    })
    
    return new Promise((resolve, reject) => {
      const requestConfig = {
        url: this.formatUrl(config.url, config.params),
        method: config.method || 'GET',
        data: config.data,
        header: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        timeout: config.timeout || this.timeout,
        dataType: 'json',
        success: async (res) => {
          console.log('✅ uni.request success回调被调用')
          console.log('📊 响应状态码:', res.statusCode)
          console.log('📋 响应数据:', JSON.stringify(res.data))
          console.log('📄 响应头:', res.header)
          
          try {
            const response = {
              data: res.data,
              statusCode: res.statusCode,
              header: res.header,
              config
            }
            
            // 在HBuilderX环境中，HTTP错误状态码也可能进入success回调
            // 我们需要检查所有非200状态码，包括4xx和5xx
            if (res.statusCode < 200 || res.statusCode >= 300) {
              console.log('⚠️ 检测到HTTP错误状态码在success回调中:', res.statusCode)
              
              // 检查是否有错误响应数据
              if (res.data && (res.data.success === false || res.data.error || res.data.code)) {
                const errorMessage = res.data.error || res.data.message || `HTTP ${res.statusCode} 错误`
                const errorCode = res.data.code || ERROR_CODES.SERVER_ERROR
                console.log('⚠️ HTTP错误状态码包含业务错误信息:')
                console.log('   错误码:', errorCode)
                console.log('   错误消息:', errorMessage)
                console.log('   完整响应:', JSON.stringify(res.data))
                
                const businessError = this.createError(errorCode, errorMessage)
                console.log('🔄 reject业务错误:', businessError.code, '-', businessError.message)
                reject(businessError)
                return
              } else {
                // 纯HTTP错误，没有业务错误信息
                console.log('⚠️ 纯HTTP错误，无业务错误信息')
                const httpError = this.createError(ERROR_CODES.SERVER_ERROR, `HTTP ${res.statusCode} 错误`)
                console.log('🔄 reject HTTP错误:', httpError.code, '-', httpError.message)
                reject(httpError)
                return
              }
            }
            
            // 检查200状态码下的业务逻辑错误
            if (res.data && res.data.success === false) {
              // 后端返回格式: {success: false, error: "错误信息", code: "错误码"}
              const errorMessage = res.data.error || res.data.message || '未知错误'
              const errorCode = res.data.code || ERROR_CODES.UNKNOWN_ERROR
              console.log('⚠️ 200状态码下的业务逻辑错误:')
              console.log('   错误码:', errorCode)
              console.log('   错误消息:', errorMessage)
              console.log('   完整响应:', JSON.stringify(res.data))
              
              const businessError = this.createError(errorCode, errorMessage)
              console.log('🔄 reject业务错误:', businessError.code, '-', businessError.message)
              reject(businessError)
              return
            }
            
            console.log('✅ 请求成功，准备resolve')
            // 执行响应拦截器
            const processedResponse = await this.executeResponseInterceptors(response)
            resolve(processedResponse)
          } catch (error) {
            console.error('❌ success回调中发生异常:', error)
            // 如果需要重试
            if (retryCount < this.retryConfig.maxRetries && 
                this.retryConfig.retryCondition(error)) {
              console.log('🔄 开始重试，当前重试次数:', retryCount + 1)
              setTimeout(() => {
                this.executeRequest(config, retryCount + 1)
                  .then(resolve)
                  .catch(reject)
              }, this.retryConfig.retryDelay * (retryCount + 1))
            } else {
              console.log('❌ 不重试，直接reject错误')
              reject(error)
            }
          }
        },
        fail: (error) => {
          console.log('❌ uni.request fail回调被调用')
          console.log('📊 错误状态码:', error.statusCode)
          console.log('📋 错误数据:', JSON.stringify(error.data))
          console.log('📄 错误消息:', error.errMsg)
          console.log('🔍 完整错误对象:', JSON.stringify(error))
          
          // 检查是否是HTTP错误状态码，但有响应数据
          if (error.statusCode && error.data) {
            console.log('🔍 fail回调包含响应数据，进行错误解析')
            
            // 如果响应数据包含业务错误信息，按业务错误处理
            if (error.data.success === false) {
              const errorMessage = error.data.error || error.data.message || '未知错误'
              const errorCode = error.data.code || ERROR_CODES.UNKNOWN_ERROR
              console.log('⚠️ fail回调中发现业务逻辑错误:')
              console.log('   错误码:', errorCode)
              console.log('   错误消息:', errorMessage)
              console.log('   完整响应:', JSON.stringify(error.data))
              
              const businessError = this.createError(errorCode, errorMessage)
              console.log('🔄 reject业务错误:', businessError.code, '-', businessError.message)
              reject(businessError)
              return
            }
            
            // 检查是否有其他格式的错误信息
            if (error.data && (error.data.error || error.data.message || error.data.code)) {
              const errorMessage = error.data.error || error.data.message || '请求失败'
              const errorCode = error.data.code || ERROR_CODES.SERVER_ERROR
              console.log('⚠️ fail回调中发现其他格式错误信息:')
              console.log('   错误码:', errorCode)
              console.log('   错误消息:', errorMessage)
              console.log('   完整响应:', JSON.stringify(error.data))
              
              const businessError = this.createError(errorCode, errorMessage)
              console.log('🔄 reject其他格式错误:', businessError.code, '-', businessError.message)
              reject(businessError)
              return
            }
            
            // 如果不是业务错误格式，按HTTP错误处理
            console.log('⚠️ fail回调中的数据不是业务错误格式，按HTTP错误处理')
            const httpError = this.createError(
              ERROR_CODES.SERVER_ERROR,
              `HTTP ${error.statusCode}: ${error.errMsg || '服务器错误'}`,
              error
            )
            console.log('🔄 reject HTTP错误:', httpError.code, '-', httpError.message)
            reject(httpError)
            return
          }
          
          console.log('⚠️ fail回调中无响应数据，按网络错误处理')
          const requestError = this.createError(
            ERROR_CODES.NETWORK_ERROR,
            '网络请求失败',
            error
          )
          
          // 如果需要重试
          if (retryCount < this.retryConfig.maxRetries && 
              this.retryConfig.retryCondition(requestError)) {
            console.log('🔄 开始重试网络错误，当前重试次数:', retryCount + 1)
            setTimeout(() => {
              this.executeRequest(config, retryCount + 1)
                .then(resolve)
                .catch(reject)
            }, this.retryConfig.retryDelay * (retryCount + 1))
          } else {
            console.log('❌ 不重试网络错误，直接reject')
            console.log('🔄 reject网络错误:', requestError.code, '-', requestError.message)
            reject(requestError)
          }
        }
      }
      
      uni.request(requestConfig)
    })
  }

  /**
   * 创建错误对象
   * @param {number} code - 错误码
   * @param {string} message - 错误信息
   * @param {any} data - 错误数据
   * @returns {Error} 错误对象
   */
  createError(code, message, data) {
    // 优先使用服务器返回的错误信息，如果没有则使用本地映射
    const errorMessage = message || getErrorMessage(code)
    const error = new Error(errorMessage)
    error.code = code
    error.data = data
    return error
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @returns {Error} 处理后的错误对象
   */
  handleError(error) {
    console.error('Request error:', error)
    
    // 如果没有错误码，设置为未知错误
    if (!error.code) {
      error.code = ERROR_CODES.UNKNOWN_ERROR
      error.message = getErrorMessage(ERROR_CODES.UNKNOWN_ERROR)
    }
    
    return error
  }

  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求Promise
   */
  get(url, params = {}, config = {}) {
    return this.request({
      ...config,
      method: 'GET',
      url,
      params
    })
  }

  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求Promise
   */
  post(url, data = {}, config = {}) {
    return this.request({
      ...config,
      method: 'POST',
      url,
      data
    })
  }

  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求Promise
   */
  put(url, data = {}, config = {}) {
    return this.request({
      ...config,
      method: 'PUT',
      url,
      data
    })
  }

  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} config - 请求配置
   * @returns {Promise} 请求Promise
   */
  delete(url, config = {}) {
    return this.request({
      ...config,
      method: 'DELETE',
      url
    })
  }

  /**
   * 上传文件
   * @param {string} url - 上传URL
   * @param {string} filePath - 文件路径
   * @param {Object} formData - 表单数据
   * @param {Object} config - 配置
   * @returns {Promise} 上传Promise
   */
  upload(url, filePath, formData = {}, config = {}) {
    return new Promise((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: this.formatUrl(url),
        filePath,
        name: config.name || 'file',
        formData,
        header: {
          ...config.headers
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            resolve({ data, statusCode: res.statusCode })
          } catch (error) {
            resolve({ data: res.data, statusCode: res.statusCode })
          }
        },
        fail: reject
      })
      
      // 支持上传进度回调
      if (config.onProgress) {
        uploadTask.onProgressUpdate(config.onProgress)
      }
    })
  }
}

// 创建默认实例
const request = new Request()

// 添加默认请求拦截器 - 添加认证信息
request.addRequestInterceptor(
  (config) => {
    // 从存储中获取token
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }
    
    // 添加请求时间戳
    config.headers['X-Request-Time'] = Date.now()
    
    console.log('Request:', config.method, config.url, config.data)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 添加默认响应拦截器 - 处理通用错误
request.addResponseInterceptor(
  (response) => {
    console.log('Response:', response.config.method, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('Response interceptor error:', error)
    
    // 处理token过期
    if (error.code === ERROR_CODES.TOKEN_EXPIRED) {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }
    
    return Promise.reject(error)
  }
)

export default request
