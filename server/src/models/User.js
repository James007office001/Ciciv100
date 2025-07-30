const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户Schema定义
const userSchema = new mongoose.Schema({
  // 基本信息
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // 允许null值，但如果有值则必须唯一
    validate: {
      validator: function(v) {
        return !v || /^[+]?[\d\s\-()]{10,15}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider || this.oauthProvider === 'local';
    },
    minlength: 6
  },
  
  // 个人资料
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    birthDate: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // OAuth认证信息
  oauthProvider: {
    type: String,
    enum: ['google', 'apple', 'local'],
    default: 'local'
  },
  oauthId: {
    type: String,
    sparse: true
  },

  // 账户状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  // 家庭群组相关
  familyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyGroup',
    default: null
  },
  isMinor: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // 权限和角色
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'parent', 'child'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: ['create_activity', 'join_activity', 'create_circle', 'moderate_content']
  }],

  // 安全设置
  lastLogin: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // 设备和会话管理
  devices: [{
    deviceId: String,
    deviceType: { type: String, enum: ['web', 'mobile', 'desktop'] },
    lastSeen: { type: Date, default: Date.now },
    userAgent: String,
    isActive: { type: Boolean, default: true }
  }],

  // 偏好设置
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ['public', 'friends', 'private'], 
        default: 'friends' 
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
});

userSchema.virtual('age').get(function() {
  if (!this.profile.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.profile.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// 账户锁定检查
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// 索引
userSchema.index({ email: 1, username: 1 });
userSchema.index({ 'oauthProvider': 1, 'oauthId': 1 });
userSchema.index({ familyGroup: 1 });
userSchema.index({ lastActivity: 1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 更新年龄状态
userSchema.pre('save', function(next) {
  if (this.profile.birthDate) {
    const age = this.age;
    this.isMinor = age !== null && age < 17;
  }
  next();
});

// 实例方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = function() {
  // 如果之前有锁定时间且已过期，重置登录尝试次数
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // 如果登录尝试次数达到5次，锁定账户2小时
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2小时
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

userSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

userSchema.methods.addDevice = function(deviceInfo) {
  // 移除相同设备ID的旧记录
  this.devices = this.devices.filter(device => device.deviceId !== deviceInfo.deviceId);
  
  // 添加新设备信息
  this.devices.push({
    deviceId: deviceInfo.deviceId,
    deviceType: deviceInfo.deviceType,
    userAgent: deviceInfo.userAgent,
    lastSeen: new Date(),
    isActive: true
  });
  
  // 只保留最近的10个设备
  if (this.devices.length > 10) {
    this.devices = this.devices.slice(-10);
  }
  
  return this.save();
};

userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// 静态方法
userSchema.statics.findByCredentials = async function(login, password) {
  // login可以是username或email
  const user = await this.findOne({
    $or: [
      { email: login.toLowerCase() },
      { username: login }
    ]
  });
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid login credentials');
  }
  
  // 重置登录尝试次数
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  return user;
};

userSchema.statics.findByOAuth = async function(provider, oauthId) {
  return this.findOne({
    oauthProvider: provider,
    oauthId: oauthId
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
