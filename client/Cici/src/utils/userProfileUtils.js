/**
 * 用户数据结构工具类
 * 基于 share/datastructure/user-profile-structure.json
 */

/**
 * 用户数据工具类
 */
export class UserProfileUtils {
  constructor() {
    this._structure = null;
  }

  /**
   * 获取用户配置结构
   */
  async getStructure() {
    if (!this._structure) {
      try {
        // 动态导入用户配置结构
        const structureModule = await import('../../../../share/datastructure/user-profile-structure.json');
        this._structure = structureModule.default || structureModule;
      } catch (error) {
        console.error('Failed to load user profile structure:', error);
        throw new Error('用户配置结构加载失败');
      }
    }
    return this._structure;
  }

  /**
   * 获取默认用户数据
   */
  async getDefaultUserData() {
    const structure = await this.getStructure();
    return {
      ...structure.defaultValues.basicInfo,
      ...structure.defaultValues.accountInfo,
      ...structure.defaultValues.socialStats
    };
  }

  /**
   * 获取默认用户设置
   */
  async getDefaultSettings() {
    const structure = await this.getStructure();
    return {
      privacy: structure.defaultValues.privacySettings,
      notification: structure.defaultValues.notificationSettings,
      display: structure.defaultValues.displaySettings,
      functional: structure.defaultValues.functionalSettings,
      security: structure.defaultValues.securitySettings
    };
  }

  /**
   * 验证用户数据字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {Object} 验证结果
   */
  async validateField(field, value) {
    const structure = await this.getStructure();
    const rules = structure.validationRules;
    
    if (rules[field]) {
      const rule = rules[field];
      if (rule.pattern) {
        const regex = new RegExp(rule.pattern);
        return {
          valid: regex.test(value),
          message: rule.message
        };
      }
    }

    // 检查最大长度限制
    if (rules.maxLengths && rules.maxLengths[field]) {
      const maxLength = rules.maxLengths[field];
      if (typeof value === 'string' && value.length > maxLength) {
        return {
          valid: false,
          message: `${field}不能超过${maxLength}个字符`
        };
      }
    }

    return { valid: true };
  }

  /**
   * 获取API端点
   * @param {string} category - API分类 (user/social/security)
   * @param {string} action - 操作名称
   * @returns {string} API端点
   */
  async getApiEndpoint(category, action) {
    const structure = await this.getStructure();
    return structure.apiEndpoints[category]?.[action];
  }

  /**
   * 获取错误信息
   * @param {string} errorCode - 错误代码
   * @returns {Object} 错误信息
   */
  async getErrorInfo(errorCode) {
    const structure = await this.getStructure();
    return structure.errorCodes[errorCode];
  }

  /**
   * 格式化用户数据以匹配前端需求
   * @param {Object} rawUserData - 原始用户数据
   * @returns {Object} 格式化后的用户数据
   */
  async formatUserData(rawUserData) {
    const defaultData = await this.getDefaultUserData();
    
    return {
      // 基本信息
      id: rawUserData.id,
      username: rawUserData.username,
      displayName: rawUserData.displayName || rawUserData.username,
      name: rawUserData.displayName || rawUserData.username, // 兼容现有代码
      phone: rawUserData.phone,
      email: rawUserData.email,
      avatar: rawUserData.avatar || defaultData.avatar,
      bio: rawUserData.bio || defaultData.bio,
      gender: rawUserData.gender || defaultData.gender,
      birthday: rawUserData.birthday,
      location: rawUserData.location,

      // 账户信息
      level: rawUserData.level || defaultData.level,
      experience: rawUserData.experience || defaultData.experience,
      nextLevelExp: rawUserData.nextLevelExp,
      balance: rawUserData.balance || defaultData.balance,
      points: rawUserData.points || defaultData.points,
      verificationStatus: rawUserData.verificationStatus || defaultData.verificationStatus,
      membershipType: rawUserData.membershipType || defaultData.membershipType,
      membershipExpireTime: rawUserData.membershipExpireTime,

      // 社交统计
      friendsCount: rawUserData.friendsCount || defaultData.friendsCount,
      followsCount: rawUserData.followsCount || defaultData.followsCount,
      followersCount: rawUserData.followersCount || defaultData.followersCount,
      circlesCount: rawUserData.circlesCount || defaultData.circlesCount,
      postsCount: rawUserData.postsCount || defaultData.postsCount,
      likesCount: rawUserData.likesCount || defaultData.likesCount,
      collectionsCount: rawUserData.collectionsCount || defaultData.collectionsCount,

      // 时间戳
      createdAt: rawUserData.createdAt,
      updatedAt: rawUserData.updatedAt,
      lastLoginAt: rawUserData.lastLoginAt,
      lastActiveAt: rawUserData.lastActiveAt
    }
  }

  /**
   * 格式化用户设置数据
   * @param {Object} rawSettings - 原始设置数据
   * @returns {Object} 格式化后的设置数据
   */
  static formatUserSettings(rawSettings) {
    const defaultSettings = this.getDefaultSettings()
    
    return {
      privacy: {
        ...defaultSettings.privacy,
        ...rawSettings.privacy
      },
      notification: {
        ...defaultSettings.notification,
        ...rawSettings.notification
      },
      display: {
        ...defaultSettings.display,
        ...rawSettings.display
      },
      functional: {
        ...defaultSettings.functional,
        ...rawSettings.functional
      },
      security: {
        ...defaultSettings.security,
        ...rawSettings.security
      }
    }
  }

  /**
   * 获取存储键名
   * @param {string} key - 键名
   * @returns {string} 完整的存储键名
   */
  static getStorageKey(key) {
    return userProfileStructure.storageKeys[key]
  }

  /**
   * 创建空的用户表单数据
   * @returns {Object} 空的表单数据
   */
  static createEmptyFormData() {
    return {
      basicInfoForm: { ...userProfileStructure.userFormData.basicInfoForm },
      privacyForm: { ...userProfileStructure.userFormData.privacyForm },
      notificationForm: { ...userProfileStructure.userFormData.notificationForm },
      displayForm: { ...userProfileStructure.userFormData.displayForm },
      functionalForm: { ...userProfileStructure.userFormData.functionalForm },
      securityForm: { ...userProfileStructure.userFormData.securityForm }
    }
  }
}

// 创建并导出工具类实例
const userProfileUtils = new UserProfileUtils();

export default userProfileUtils;
