// 用户配置结构使用示例
// 适用于前端（Vue/UniApp）和后端（Node.js）

/**
 * 前端使用示例 - Vue组件中
 */
export default {
  data() {
    return {
      // 使用用户表单数据结构
      userForm: {
        basicInfoForm: {
          displayName: "",
          bio: "",
          gender: "prefer_not_to_say",
          birthday: "",
          location: {
            country: "",
            province: "",
            city: "",
            district: ""
          }
        },
        privacyForm: {
          profileVisibility: "public",
          contactVisibility: "friends",
          allowFriendRequests: true,
          allowMessages: "friends",
          showOnlineStatus: true,
          allowLocationSharing: false
        }
      },
      
      // 验证规则
      validationRules: {
        displayName: [
          {
            required: true,
            message: '请输入显示名称'
          },
          {
            max: 50,
            message: '显示名称不能超过50个字符'
          }
        ]
      }
    };
  },
  
  methods: {
    // 保存用户配置
    async saveUserProfile() {
      try {
        const response = await uni.request({
          url: '/api/v1/users/1001/profile',
          method: 'PUT',
          data: this.userForm
        });
        
        if (response.statusCode === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('保存失败:', error);
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    },
    
    // 验证表单数据
    validateForm() {
      const { displayName, bio } = this.userForm.basicInfoForm;
      
      // 使用配置中的验证规则
      if (!displayName || displayName.length > 50) {
        return {
          valid: false,
          message: '显示名称必填且不能超过50个字符'
        };
      }
      
      if (bio && bio.length > 200) {
        return {
          valid: false,
          message: '个人简介不能超过200个字符'
        };
      }
      
      return { valid: true };
    }
  }
};

/**
 * 后端使用示例 - Node.js/Express
 */
const userProfileStructure = require('./user-profile-structure.json');

// 用户配置API路由
app.put('/api/v1/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    // 使用配置中的验证规则验证数据
    const validation = validateUserData(userData);
    if (!validation.valid) {
      return res.status(400).json({
        code: userProfileStructure.errorCodes.VALIDATION_ERROR.code,
        message: validation.message
      });
    }
    
    // 应用默认值
    const processedData = applyDefaultValues(userData);
    
    // 保存到数据库
    const updatedUser = await User.findByIdAndUpdate(userId, processedData, {
      new: true,
      runValidators: true
    });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('更新用户配置失败:', error);
    res.status(500).json({
      code: userProfileStructure.errorCodes.SETTINGS_UPDATE_FAILED.code,
      message: userProfileStructure.errorCodes.SETTINGS_UPDATE_FAILED.message
    });
  }
});

// 数据验证函数
function validateUserData(userData) {
  const { validationRules } = userProfileStructure;
  
  // 验证显示名称
  if (userData.basicInfoForm?.displayName) {
    const displayName = userData.basicInfoForm.displayName;
    if (displayName.length > validationRules.maxLengths.displayName) {
      return {
        valid: false,
        message: `显示名称不能超过${validationRules.maxLengths.displayName}个字符`
      };
    }
  }
  
  // 验证个人简介
  if (userData.basicInfoForm?.bio) {
    const bio = userData.basicInfoForm.bio;
    if (bio.length > validationRules.maxLengths.bio) {
      return {
        valid: false,
        message: `个人简介不能超过${validationRules.maxLengths.bio}个字符`
      };
    }
  }
  
  return { valid: true };
}

// 应用默认值函数
function applyDefaultValues(userData) {
  const { defaultValues } = userProfileStructure;
  
  return {
    ...userData,
    basicInfoForm: {
      ...defaultValues.basicInfo,
      ...userData.basicInfoForm
    },
    privacyForm: {
      ...defaultValues.privacySettings,
      ...userData.privacyForm
    },
    notificationForm: {
      ...defaultValues.notificationSettings,
      ...userData.notificationForm
    }
  };
}

/**
 * 通用工具函数
 */
class UserProfileManager {
  constructor(structureConfig) {
    this.config = structureConfig;
  }
  
  // 获取默认用户配置
  getDefaultConfig() {
    return this.config.defaultValues;
  }
  
  // 获取API端点
  getApiEndpoint(action) {
    return this.config.apiEndpoints.user[action];
  }
  
  // 获取错误代码
  getErrorCode(errorType) {
    return this.config.errorCodes[errorType];
  }
  
  // 验证用户数据
  validate(userData, field) {
    const rule = this.config.validationRules[field];
    if (!rule) return { valid: true };
    
    const regex = new RegExp(rule.pattern);
    const isValid = regex.test(userData);
    
    return {
      valid: isValid,
      message: isValid ? '' : rule.message
    };
  }
}

// 导出供前后端使用
module.exports = {
  UserProfileManager,
  userProfileStructure
};
