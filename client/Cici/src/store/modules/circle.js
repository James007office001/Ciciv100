/**
 * 圈子状态管理模块
 * 基于圈子数据结构提供状态管理功能
 */

import { defineStore } from 'pinia'
import circleUtils from '../../utils/circleUtils.js'
import circleValidation from '../../../../../shared/utils/circleValidation.js'
import { API_ENDPOINTS } from '../../../../../shared/config/apiEndpoints.js'

export const useCircleStore = defineStore('circle', {
  state: () => ({
    // 圈子列表
    circles: [],
    // 当前圈子详情
    currentCircle: null,
    // 圈子成员列表
    members: [],
    // 圈子帖子列表
    posts: [],
    // 我加入的圈子
    myCircles: [],
    // 推荐圈子
    recommendedCircles: [],
    // 圈子分类
    categories: [],
    // 加载状态
    loading: {
      circles: false,
      currentCircle: false,
      members: false,
      posts: false,
      creating: false,
      joining: false
    },
    // 错误信息
    errors: {},
    // 搜索相关
    searchQuery: '',
    searchResults: [],
    // 分页信息
    pagination: {
      current: 1,
      size: 20,
      total: 0,
      hasMore: true
    }
  }),

  getters: {
    // 获取格式化的圈子列表
    formattedCircles: (state) => {
      return state.circles.map(circle => ({
        ...circle,
        displayMembersCount: circle.membersCount > 1000 
          ? `${(circle.membersCount / 1000).toFixed(1)}k` 
          : circle.membersCount.toString(),
        categoryInfo: state.categories.find(cat => cat.key === circle.category)
      }))
    },

    // 获取当前用户在圈子中的角色
    currentUserRole: (state) => (circleId) => {
      const member = state.members.find(m => m.circleId === circleId)
      return member ? member.memberLevel : null
    },

    // 检查当前用户是否有权限
    hasPermission: (state) => (circleId, permission) => {
      const userRole = state.currentUserRole(circleId)
      if (!userRole) return false
      
      return circleUtils.checkPermission(userRole, permission)
    },

    // 获取圈子统计信息
    circleStats: (state) => (circleId) => {
      const circle = state.circles.find(c => c.id === circleId) || state.currentCircle
      if (!circle) return null
      
      return {
        members: circle.membersCount,
        posts: circle.postsCount,
        activeMembers: circle.activeMembers,
        todayPosts: circle.todayPosts
      }
    },

    // 获取热门圈子
    hotCircles: (state) => {
      return state.circles
        .filter(circle => circle.activeMembers > 10)
        .sort((a, b) => b.activeMembers - a.activeMembers)
        .slice(0, 10)
    },

    // 按分类分组的圈子
    circlesByCategory: (state) => {
      const grouped = {}
      state.circles.forEach(circle => {
        if (!grouped[circle.category]) {
          grouped[circle.category] = []
        }
        grouped[circle.category].push(circle)
      })
      return grouped
    }
  },

  actions: {
    // 获取圈子列表
    async fetchCircles(params = {}) {
      this.loading.circles = true
      try {
        const url = await circleUtils.buildApiUrl('circle', 'getCircleList', params)
        const response = await this.$http.get(url)
        
        if (response.data && response.data.success) {
          this.circles = response.data.data.list || []
          this.pagination = {
            ...this.pagination,
            ...response.data.data.pagination
          }
        }
      } catch (error) {
        console.error('获取圈子列表失败:', error)
        this.errors.fetchCircles = error.message
      } finally {
        this.loading.circles = false
      }
    },

    // 获取圈子详情
    async fetchCircleDetail(circleId) {
      this.loading.currentCircle = true
      try {
        const url = await circleUtils.buildApiUrl('circle', 'getCircleDetail', { circleId })
        const response = await this.$http.get(url)
        
        if (response.data && response.data.success) {
          this.currentCircle = await circleUtils.formatCircleData(response.data.data)
        }
      } catch (error) {
        console.error('获取圈子详情失败:', error)
        this.errors.fetchCircleDetail = error.message
      } finally {
        this.loading.currentCircle = false
      }
    },

    // 创建圈子
    async createCircle(circleData) {
      this.loading.creating = true
      try {
        // 验证数据
        const validation = await circleValidation.validateCreateCircle(circleData)
        if (!validation.valid) {
          this.errors.createCircle = validation.errors
          return { success: false, errors: validation.errors }
        }

        // 格式化数据
        const formattedData = await circleUtils.formatCircleData(circleData)
        
        const url = await circleUtils.buildApiUrl('circle', 'createCircle')
        const response = await this.$http.post(url, formattedData)
        
        if (response.data && response.data.success) {
          const newCircle = response.data.data
          this.circles.unshift(newCircle)
          this.myCircles.unshift(newCircle)
          
          return { success: true, data: newCircle }
        }
      } catch (error) {
        console.error('创建圈子失败:', error)
        this.errors.createCircle = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading.creating = false
      }
    },

    // 加入圈子
    async joinCircle(circleId, message = '') {
      this.loading.joining = true
      try {
        const circle = this.circles.find(c => c.id === circleId)
        if (!circle) {
          throw new Error('圈子不存在')
        }

        // 验证加入条件
        const validation = await circleValidation.validateJoinCircle(circle, {})
        if (!validation.valid) {
          return { success: false, message: validation.message }
        }

        const url = await circleUtils.buildApiUrl('circle', 'joinCircle', { circleId })
        const response = await this.$http.post(url, { message })
        
        if (response.data && response.data.success) {
          // 更新圈子成员数
          circle.membersCount++
          
          // 如果是直接加入，添加到我的圈子列表
          if (circle.joinPolicy === 'open') {
            this.myCircles.push(circle)
          }
          
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        console.error('加入圈子失败:', error)
        this.errors.joinCircle = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading.joining = false
      }
    },

    // 退出圈子
    async leaveCircle(circleId) {
      try {
        const url = await circleUtils.buildApiUrl('circle', 'leaveCircle', { circleId })
        const response = await this.$http.post(url)
        
        if (response.data && response.data.success) {
          // 更新圈子成员数
          const circle = this.circles.find(c => c.id === circleId)
          if (circle) {
            circle.membersCount--
          }
          
          // 从我的圈子列表中移除
          this.myCircles = this.myCircles.filter(c => c.id !== circleId)
          
          return { success: true }
        }
      } catch (error) {
        console.error('退出圈子失败:', error)
        return { success: false, error: error.message }
      }
    },

    // 获取圈子成员
    async fetchMembers(circleId) {
      this.loading.members = true
      try {
        const url = await circleUtils.buildApiUrl('membership', 'getMembers', { circleId })
        const response = await this.$http.get(url)
        
        if (response.data && response.data.success) {
          this.members = response.data.data.map(member => 
            circleUtils.formatMemberData(member)
          )
        }
      } catch (error) {
        console.error('获取成员列表失败:', error)
        this.errors.fetchMembers = error.message
      } finally {
        this.loading.members = false
      }
    },

    // 获取圈子帖子
    async fetchPosts(circleId, params = {}) {
      this.loading.posts = true
      try {
        const url = await circleUtils.buildApiUrl('posts', 'getCirclePosts', { circleId })
        const response = await this.$http.get(url, { params })
        
        if (response.data && response.data.success) {
          this.posts = response.data.data.list || []
        }
      } catch (error) {
        console.error('获取圈子帖子失败:', error)
        this.errors.fetchPosts = error.message
      } finally {
        this.loading.posts = false
      }
    },

    // 搜索圈子
    async searchCircles(query) {
      this.searchQuery = query
      try {
        const url = await circleUtils.buildApiUrl('circle', 'searchCircles')
        const response = await this.$http.get(url, { 
          params: { q: query } 
        })
        
        if (response.data && response.data.success) {
          this.searchResults = response.data.data || []
        }
      } catch (error) {
        console.error('搜索圈子失败:', error)
        this.errors.searchCircles = error.message
      }
    },

    // 获取推荐圈子
    async fetchRecommendedCircles() {
      try {
        const url = await circleUtils.buildApiUrl('circle', 'getRecommendedCircles')
        const response = await this.$http.get(url)
        
        if (response.data && response.data.success) {
          this.recommendedCircles = response.data.data || []
        }
      } catch (error) {
        console.error('获取推荐圈子失败:', error)
        this.errors.fetchRecommended = error.message
      }
    },

    // 获取分类列表
    async fetchCategories() {
      try {
        this.categories = await circleUtils.getCategories()
      } catch (error) {
        console.error('获取分类列表失败:', error)
        this.errors.fetchCategories = error.message
      }
    },

    // 获取我的圈子
    async fetchMyCircles() {
      try {
        // 这里需要根据实际API调整
        const response = await this.$http.get(API_ENDPOINTS.USER.CIRCLES.replace('{userId}', 'me'))
        
        if (response.data && response.data.success) {
          this.myCircles = response.data.data || []
        }
      } catch (error) {
        console.error('获取我的圈子失败:', error)
        this.errors.fetchMyCircles = error.message
      }
    },

    // 清除错误
    clearError(errorKey) {
      if (errorKey) {
        delete this.errors[errorKey]
      } else {
        this.errors = {}
      }
    },

    // 重置状态
    resetState() {
      this.circles = []
      this.currentCircle = null
      this.members = []
      this.posts = []
      this.searchResults = []
      this.errors = {}
      this.loading = {
        circles: false,
        currentCircle: false,
        members: false,
        posts: false,
        creating: false,
        joining: false
      }
    },

    // 更新圈子信息
    updateCircle(circleId, updates) {
      const index = this.circles.findIndex(c => c.id === circleId)
      if (index !== -1) {
        this.circles[index] = { ...this.circles[index], ...updates }
      }
      
      if (this.currentCircle && this.currentCircle.id === circleId) {
        this.currentCircle = { ...this.currentCircle, ...updates }
      }
    }
  }
})
