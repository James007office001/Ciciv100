/**
 * 圈子数据工具类
 * 提供圈子相关的数据处理、验证、格式化等功能
 */

class CircleUtils {
  constructor() {
    // 缓存数据结构
    this._structure = null;
  }

  /**
   * 获取圈子数据结构
   */
  async getStructure() {
    if (!this._structure) {
      try {
        const structureModule = await import('../../../../share/datastructure/circle-structure.json');
        this._structure = structureModule.default || structureModule;
      } catch (error) {
        console.error('Failed to load circle structure:', error);
        throw new Error('圈子数据结构加载失败');
      }
    }
    return this._structure;
  }

  /**
   * 格式化圈子数据
   * @param {Object} circleData - 原始圈子数据
   * @returns {Object} 格式化后的圈子数据
   */
  async formatCircleData(circleData) {
    const structure = await this.getStructure();
    const defaultValues = structure.defaultValues.circle;
    
    return {
      id: circleData.id || '',
      name: circleData.name || '',
      avatar: circleData.avatar || defaultValues.avatar,
      coverImage: circleData.coverImage || defaultValues.coverImage,
      description: circleData.description || '',
      category: circleData.category || defaultValues.category,
      tags: circleData.tags || defaultValues.tags,
      location: circleData.location || {
        country: '',
        province: '',
        city: '',
        district: '',
        latitude: null,
        longitude: null
      },
      creatorId: circleData.creatorId || '',
      administratorIds: circleData.administratorIds || [],
      moderatorIds: circleData.moderatorIds || [],
      visibility: circleData.visibility || defaultValues.visibility,
      joinPolicy: circleData.joinPolicy || defaultValues.joinPolicy,
      contentModeration: circleData.contentModeration || defaultValues.contentModeration,
      membersCount: circleData.membersCount || defaultValues.membersCount,
      postsCount: circleData.postsCount || defaultValues.postsCount,
      activeMembers: circleData.activeMembers || defaultValues.activeMembers,
      allowInvitations: circleData.allowInvitations !== undefined ? circleData.allowInvitations : defaultValues.allowInvitations,
      allowMemberPosts: circleData.allowMemberPosts !== undefined ? circleData.allowMemberPosts : defaultValues.allowMemberPosts,
      requirePostApproval: circleData.requirePostApproval !== undefined ? circleData.requirePostApproval : defaultValues.requirePostApproval,
      allowExternalSharing: circleData.allowExternalSharing !== undefined ? circleData.allowExternalSharing : defaultValues.allowExternalSharing,
      createdAt: circleData.createdAt || new Date().toISOString(),
      updatedAt: circleData.updatedAt || new Date().toISOString(),
      lastActivityAt: circleData.lastActivityAt || null
    };
  }

  /**
   * 格式化成员数据
   * @param {Object} memberData - 原始成员数据
   * @returns {Object} 格式化后的成员数据
   */
  async formatMemberData(memberData) {
    const structure = await this.getStructure();
    const defaultValues = structure.defaultValues.member;
    
    return {
      memberId: memberData.memberId || '',
      circleId: memberData.circleId || '',
      userId: memberData.userId || '',
      memberLevel: memberData.memberLevel || defaultValues.memberLevel,
      joinStatus: memberData.joinStatus || defaultValues.joinStatus,
      joinedAt: memberData.joinedAt || new Date().toISOString(),
      lastActiveAt: memberData.lastActiveAt || null,
      postsCount: memberData.postsCount || defaultValues.postsCount,
      commentsCount: memberData.commentsCount || defaultValues.commentsCount,
      likesGiven: memberData.likesGiven || defaultValues.likesGiven,
      likesReceived: memberData.likesReceived || defaultValues.likesReceived,
      canPost: memberData.canPost !== undefined ? memberData.canPost : defaultValues.canPost,
      canComment: memberData.canComment !== undefined ? memberData.canComment : defaultValues.canComment,
      canInvite: memberData.canInvite !== undefined ? memberData.canInvite : defaultValues.canInvite,
      canModerate: memberData.canModerate !== undefined ? memberData.canModerate : defaultValues.canModerate,
      mutedUntil: memberData.mutedUntil || null
    };
  }

  /**
   * 格式化帖子数据
   * @param {Object} postData - 原始帖子数据
   * @returns {Object} 格式化后的帖子数据
   */
  async formatPostData(postData) {
    const structure = await this.getStructure();
    const defaultValues = structure.defaultValues.post;
    
    return {
      id: postData.id || postData.postId || '',
      title: postData.title || '',
      description: postData.description || postData.content || '',
      images: postData.images || postData.mediaFiles || defaultValues.mediaFiles,
      tags: postData.tags || defaultValues.tags,
      location: postData.location || '',
      createTime: postData.createTime || postData.createdAt || new Date().toISOString(),
      
      viewCount: postData.viewCount || postData.viewsCount || defaultValues.viewsCount,
      likeCount: postData.likeCount || postData.likesCount || defaultValues.likesCount,
      commentCount: postData.commentCount || postData.commentsCount || defaultValues.commentsCount,
      collectCount: postData.collectCount || 0,
      
      isLiked: postData.isLiked || false,
      isCollected: postData.isCollected || false,
      isJoined: postData.isJoined || false,
      
      authorId: postData.authorId || '',
      circleId: postData.circleId || '',
      
      event: postData.event || null,
      ticket: postData.ticket || null,
      
      sharesCount: postData.sharesCount || defaultValues.sharesCount,
      status: postData.status || defaultValues.status,
      isSticky: postData.isSticky !== undefined ? postData.isSticky : defaultValues.isSticky,
      isHot: postData.isHot !== undefined ? postData.isHot : defaultValues.isHot,
      updatedAt: postData.updatedAt || new Date().toISOString(),
      publishedAt: postData.publishedAt || null
    };
  }

  /**
   * 验证圈子名称
   * @param {string} name - 圈子名称
   * @returns {Object} 验证结果
   */
  async validateCircleName(name) {
    const structure = await this.getStructure();
    const rule = structure.validationRules.circleName;
    
    if (!name || name.trim() === '') {
      return { valid: false, message: '圈子名称不能为空' };
    }
    
    const regex = new RegExp(rule.pattern);
    if (!regex.test(name)) {
      return { valid: false, message: rule.message };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证圈子简介
   * @param {string} description - 圈子简介
   * @returns {Object} 验证结果
   */
  async validateCircleDescription(description) {
    const structure = await this.getStructure();
    const rule = structure.validationRules.circleDescription;
    
    if (description && description.length > rule.maxLength) {
      return { valid: false, message: rule.message };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证帖子内容
   * @param {string} content - 帖子内容
   * @returns {Object} 验证结果
   */
  async validatePostContent(content) {
    const structure = await this.getStructure();
    const rule = structure.validationRules.postContent;
    
    if (!content || content.trim().length < rule.minLength) {
      return { valid: false, message: rule.message };
    }
    
    if (content.length > rule.maxLength) {
      return { valid: false, message: rule.message };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证标签
   * @param {string} tag - 标签名称
   * @returns {Object} 验证结果
   */
  async validateTag(tag) {
    const structure = await this.getStructure();
    const rule = structure.validationRules.tagName;
    
    if (!tag || tag.trim() === '') {
      return { valid: false, message: '标签不能为空' };
    }
    
    const regex = new RegExp(rule.pattern);
    if (!regex.test(tag)) {
      return { valid: false, message: rule.message };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 检查权限
   * @param {string} memberLevel - 成员等级
   * @param {string} permission - 权限名称
   * @returns {boolean} 是否有权限
   */
  async checkPermission(memberLevel, permission) {
    const structure = await this.getStructure();
    const membershipLevels = structure.circleSchema.membershipInfo.membershipLevels.default;
    
    const level = membershipLevels.find(l => l.level === memberLevel);
    return level ? level.permissions.includes(permission) : false;
  }

  /**
   * 获取成员等级信息
   * @param {string} memberLevel - 成员等级
   * @returns {Object} 等级信息
   */
  async getMemberLevelInfo(memberLevel) {
    const structure = await this.getStructure();
    const membershipLevels = structure.circleSchema.membershipInfo.membershipLevels.default;
    
    return membershipLevels.find(l => l.level === memberLevel) || null;
  }

  /**
   * 获取分类列表
   * @returns {Array} 分类列表
   */
  async getCategories() {
    const structure = await this.getStructure();
    return structure.categories;
  }

  /**
   * 获取分类信息
   * @param {string} categoryKey - 分类键
   * @returns {Object} 分类信息
   */
  async getCategoryInfo(categoryKey) {
    const categories = await this.getCategories();
    return categories.find(cat => cat.key === categoryKey) || null;
  }

  /**
   * 获取API端点
   * @param {string} type - 端点类型 (circle, membership, posts, management)
   * @param {string} action - 操作名称
   * @returns {string} API端点
   */
  async getApiEndpoint(type, action) {
    const structure = await this.getStructure();
    return structure.apiEndpoints[type]?.[action] || '';
  }

  /**
   * 构建API URL
   * @param {string} type - 端点类型
   * @param {string} action - 操作名称
   * @param {Object} params - 参数对象
   * @returns {string} 完整的API URL
   */
  async buildApiUrl(type, action, params = {}) {
    let endpoint = await this.getApiEndpoint(type, action);
    
    // 替换路径参数
    Object.keys(params).forEach(key => {
      endpoint = endpoint.replace(`{${key}}`, params[key]);
    });
    
    return endpoint;
  }

  /**
   * 获取错误信息
   * @param {string} errorCode - 错误代码
   * @returns {Object} 错误信息
   */
  async getErrorInfo(errorCode) {
    const structure = await this.getStructure();
    return structure.errorCodes[errorCode] || { code: 500000, message: '未知错误' };
  }

  /**
   * 获取存储键
   * @param {string} key - 键名
   * @returns {string} 存储键
   */
  async getStorageKey(key) {
    const structure = await this.getStructure();
    return structure.storageKeys[key] || key;
  }

  /**
   * 创建圈子表单数据
   * @returns {Object} 默认表单数据
   */
  async createCircleFormData() {
    const structure = await this.getStructure();
    return JSON.parse(JSON.stringify(structure.circleFormData.createCircleForm));
  }

  /**
   * 创建帖子表单数据
   * @returns {Object} 默认表单数据
   */
  async createPostFormData() {
    const structure = await this.getStructure();
    return JSON.parse(JSON.stringify(structure.circleFormData.postForm));
  }

  /**
   * 创建设置表单数据
   * @returns {Object} 默认表单数据
   */
  async createSettingsFormData() {
    const structure = await this.getStructure();
    return JSON.parse(JSON.stringify(structure.circleFormData.circleSettingsForm));
  }
}

// 创建全局实例
const circleUtils = new CircleUtils();

export default circleUtils;
