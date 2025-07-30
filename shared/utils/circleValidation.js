/**
 * 圈子数据验证工具
 * 基于圈子数据结构提供验证功能
 */

class CircleValidation {
  constructor() {
    this._structure = null;
  }

  /**
   * 获取数据结构
   */
  async getStructure() {
    if (!this._structure) {
      try {
        const structureModule = await import('../../share/datastructure/circle-structure.json');
        this._structure = structureModule.default || structureModule;
      } catch (error) {
        console.error('Failed to load circle structure:', error);
        throw new Error('圈子数据结构加载失败');
      }
    }
    return this._structure;
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
   * 验证圈子创建数据
   * @param {Object} circleData - 圈子数据
   * @returns {Object} 验证结果
   */
  async validateCreateCircle(circleData) {
    const errors = {};
    
    // 验证圈子名称
    const nameValidation = await this.validateCircleName(circleData.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.message;
    }
    
    // 验证圈子简介
    if (circleData.description) {
      const descValidation = await this.validateCircleDescription(circleData.description);
      if (!descValidation.valid) {
        errors.description = descValidation.message;
      }
    }
    
    // 验证分类
    if (!circleData.category) {
      errors.category = '请选择圈子分类';
    } else {
      const categoryInfo = await this.getCategoryInfo(circleData.category);
      if (!categoryInfo) {
        errors.category = '无效的分类选择';
      }
    }
    
    // 验证标签
    if (circleData.tags && circleData.tags.length > 0) {
      const structure = await this.getStructure();
      const maxTags = structure.validationRules.limits.maxTagsPerCircle;
      
      if (circleData.tags.length > maxTags) {
        errors.tags = `标签数量不能超过${maxTags}个`;
      } else {
        for (let i = 0; i < circleData.tags.length; i++) {
          const tagValidation = await this.validateTag(circleData.tags[i]);
          if (!tagValidation.valid) {
            errors.tags = `标签"${circleData.tags[i]}"${tagValidation.message}`;
            break;
          }
        }
      }
    }
    
    // 验证可见性
    const structure = await this.getStructure();
    const validVisibility = structure.circleSchema.managementInfo.visibility.enum;
    if (circleData.visibility && !validVisibility.includes(circleData.visibility)) {
      errors.visibility = '无效的可见性设置';
    }
    
    // 验证加入政策
    const validJoinPolicy = structure.circleSchema.managementInfo.joinPolicy.enum;
    if (circleData.joinPolicy && !validJoinPolicy.includes(circleData.joinPolicy)) {
      errors.joinPolicy = '无效的加入政策设置';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 验证帖子创建数据
   * @param {Object} postData - 帖子数据
   * @returns {Object} 验证结果
   */
  async validateCreatePost(postData) {
    const errors = {};
    
    // 验证帖子内容
    const contentValidation = await this.validatePostContent(postData.content);
    if (!contentValidation.valid) {
      errors.content = contentValidation.message;
    }
    
    // 验证标题长度
    if (postData.title && postData.title.length > 100) {
      errors.title = '帖子标题不能超过100个字符';
    }
    
    // 验证标签
    if (postData.tags && postData.tags.length > 0) {
      const structure = await this.getStructure();
      const maxTags = structure.validationRules.limits.maxTagsPerPost;
      
      if (postData.tags.length > maxTags) {
        errors.tags = `标签数量不能超过${maxTags}个`;
      } else {
        for (let i = 0; i < postData.tags.length; i++) {
          const tagValidation = await this.validateTag(postData.tags[i]);
          if (!tagValidation.valid) {
            errors.tags = `标签"${postData.tags[i]}"${tagValidation.message}`;
            break;
          }
        }
      }
    }
    
    // 验证媒体文件
    if (postData.mediaFiles && postData.mediaFiles.length > 0) {
      const structure = await this.getStructure();
      const maxFiles = structure.validationRules.limits.maxMediaFilesPerPost;
      
      if (postData.mediaFiles.length > maxFiles) {
        errors.mediaFiles = `媒体文件数量不能超过${maxFiles}个`;
      }
    }
    
    // 验证内容类型
    const structure = await this.getStructure();
    const validContentTypes = structure.circlePostSchema.postInfo.contentType.enum;
    if (postData.contentType && !validContentTypes.includes(postData.contentType)) {
      errors.contentType = '无效的内容类型';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 验证成员等级更新
   * @param {string} currentLevel - 当前等级
   * @param {string} newLevel - 新等级
   * @param {string} operatorLevel - 操作者等级
   * @returns {Object} 验证结果
   */
  async validateMemberLevelUpdate(currentLevel, newLevel, operatorLevel) {
    const structure = await this.getStructure();
    const membershipLevels = structure.circleSchema.membershipInfo.membershipLevels.default;
    
    // 检查等级是否有效
    const validLevels = membershipLevels.map(l => l.level);
    if (!validLevels.includes(newLevel)) {
      return { valid: false, message: '无效的成员等级' };
    }
    
    // 检查操作者权限
    const hasAdminPermission = await this.checkPermission(operatorLevel, 'admin');
    if (!hasAdminPermission && operatorLevel !== 'owner') {
      return { valid: false, message: '权限不足，无法修改成员等级' };
    }
    
    // 圈主级别只能由系统设置
    if (newLevel === 'owner' && operatorLevel !== 'owner') {
      return { valid: false, message: '无法设置为圈主等级' };
    }
    
    // 不能降级圈主
    if (currentLevel === 'owner' && newLevel !== 'owner') {
      return { valid: false, message: '无法降级圈主' };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证权限操作
   * @param {string} memberLevel - 成员等级
   * @param {string} permission - 权限名称
   * @returns {Object} 验证结果
   */
  async validatePermission(memberLevel, permission) {
    const hasPermission = await this.checkPermission(memberLevel, permission);
    
    if (!hasPermission) {
      return { valid: false, message: '权限不足' };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证圈子设置更新
   * @param {Object} settings - 设置数据
   * @param {string} operatorLevel - 操作者等级
   * @returns {Object} 验证结果
   */
  async validateCircleSettings(settings, operatorLevel) {
    const errors = {};
    
    // 检查操作权限
    const hasAdminPermission = await circleUtils.checkPermission(operatorLevel, 'admin');
    if (!hasAdminPermission && operatorLevel !== 'owner') {
      return { valid: false, errors: { permission: '权限不足，无法修改圈子设置' } };
    }
    
    // 验证发帖规则
    if (settings.postingRules && settings.postingRules.length > 0) {
      if (settings.postingRules.length > 10) {
        errors.postingRules = '发帖规则不能超过10条';
      } else {
        for (let i = 0; i < settings.postingRules.length; i++) {
          if (settings.postingRules[i].length > 100) {
            errors.postingRules = '单条规则不能超过100个字符';
            break;
          }
        }
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 验证加入圈子请求
   * @param {Object} circleInfo - 圈子信息
   * @param {Object} userInfo - 用户信息
   * @returns {Object} 验证结果
   */
  async validateJoinCircle(circleInfo, userInfo) {
    // 检查圈子是否存在
    if (!circleInfo || !circleInfo.id) {
      return { valid: false, message: '圈子不存在' };
    }
    
    // 检查圈子可见性
    if (circleInfo.visibility === 'private') {
      return { valid: false, message: '私有圈子无法直接加入' };
    }
    
    // 检查加入政策
    if (circleInfo.joinPolicy === 'invite_only') {
      return { valid: false, message: '仅限邀请加入' };
    }
    
    // 检查圈子人数限制
    const structure = await this.getStructure();
    const maxMembers = structure.validationRules.limits.maxMembersPerCircle;
    if (circleInfo.membersCount >= maxMembers) {
      return { valid: false, message: '圈子人数已满' };
    }
    
    return { valid: true, message: '' };
  }

  /**
   * 验证批量操作限制
   * @param {string} operation - 操作类型
   * @param {number} count - 操作数量
   * @returns {Object} 验证结果
   */
  async validateBatchOperation(operation, count) {
    const structure = await this.getStructure();
    const limits = structure.validationRules.limits;
    
    let maxCount = 0;
    let message = '';
    
    switch (operation) {
      case 'createCircles':
        maxCount = limits.maxCirclesPerUser;
        message = `每个用户最多创建${maxCount}个圈子`;
        break;
      case 'createPosts':
        maxCount = limits.maxPostsPerDay;
        message = `每天最多发布${maxCount}个帖子`;
        break;
      default:
        return { valid: true, message: '' };
    }
    
    if (count > maxCount) {
      return { valid: false, message };
    }
    
    return { valid: true, message: '' };
  }
}

// 创建全局实例
const circleValidation = new CircleValidation();

export default circleValidation;
