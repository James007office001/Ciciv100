const User = require('../models/User');
const FamilyGroup = require('../models/FamilyGroup');
const jwtUtils = require('../utils/jwt');
const crypto = require('crypto');

class AuthService {
  // 用户注册
  async register(userData, deviceInfo = {}) {
    try {
      const { username, email, password, phone, profile, oauthProvider, oauthId } = userData;

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username },
          ...(phone ? [{ phone: phone }] : [])
        ]
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new Error('Email already registered');
        }
        if (existingUser.username === username) {
          throw new Error('Username already taken');
        }
        if (phone && existingUser.phone === phone) {
          throw new Error('Phone number already registered');
        }
      }

      // OAuth注册检查
      if (oauthProvider && oauthProvider !== 'local') {
        const existingOAuthUser = await User.findByOAuth(oauthProvider, oauthId);
        if (existingOAuthUser) {
          throw new Error('OAuth account already registered');
        }
      }

      // 创建新用户
      const user = new User({
        username,
        email: email.toLowerCase(),
        password,
        phone,
        profile: profile || {},
        oauthProvider: oauthProvider || 'local',
        oauthId,
        isEmailVerified: oauthProvider !== 'local', // OAuth用户默认邮箱已验证
        status: oauthProvider !== 'local' ? 'active' : 'pending_verification'
      });

      // 设置初始权限
      user.permissions = ['create_activity', 'join_activity', 'create_circle'];

      await user.save();

      // 添加设备信息
      if (deviceInfo.deviceId || deviceInfo.deviceType) {
        await user.addDevice({
          deviceId: deviceInfo.deviceId || jwtUtils.generateDeviceId(deviceInfo.userAgent, deviceInfo.ipAddress),
          deviceType: deviceInfo.deviceType || 'web',
          userAgent: deviceInfo.userAgent
        });
      }

      // 生成验证token（如果需要）
      if (user.status === 'pending_verification') {
        user.emailVerificationToken = jwtUtils.generateEmailVerificationToken(user.email);
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时
        await user.save();
      }

      return {
        user: user.toSafeObject(),
        needsEmailVerification: user.status === 'pending_verification',
        emailVerificationToken: user.emailVerificationToken
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // 用户登录
  async login(credentials, deviceInfo = {}) {
    try {
      const { login, password, deviceId, deviceType = 'web', userAgent } = credentials;

      // 查找并验证用户
      const user = await User.findByCredentials(login, password);

      // 检查邮箱验证状态
      if (!user.isEmailVerified && user.oauthProvider === 'local') {
        throw new Error('Email verification required');
      }

      // 更新登录信息
      user.lastLogin = new Date();
      user.lastActivity = new Date();

      // 添加/更新设备信息
      const finalDeviceId = deviceId || jwtUtils.generateDeviceId(userAgent, deviceInfo.ipAddress);
      await user.addDevice({
        deviceId: finalDeviceId,
        deviceType,
        userAgent
      });

      // 生成token对
      const tokens = jwtUtils.generateTokenPair(user, { deviceId: finalDeviceId });

      return {
        user: user.toSafeObject(),
        tokens,
        deviceId: finalDeviceId
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // OAuth登录/注册
  async oauthLogin(oauthData, deviceInfo = {}) {
    try {
      const { provider, oauthId, email, profile } = oauthData;

      // 查找现有OAuth用户
      let user = await User.findByOAuth(provider, oauthId);

      if (!user) {
        // 检查邮箱是否已注册
        const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingEmailUser) {
          // 如果邮箱已存在，链接OAuth账户
          existingEmailUser.oauthProvider = provider;
          existingEmailUser.oauthId = oauthId;
          existingEmailUser.isEmailVerified = true;
          existingEmailUser.status = 'active';
          user = await existingEmailUser.save();
        } else {
          // 创建新用户
          const username = profile.username || `${provider}_${oauthId.substring(0, 8)}`;
          
          user = new User({
            username,
            email: email.toLowerCase(),
            profile: {
              firstName: profile.firstName || profile.given_name,
              lastName: profile.lastName || profile.family_name,
              avatar: profile.avatar || profile.picture
            },
            oauthProvider: provider,
            oauthId,
            isEmailVerified: true,
            status: 'active',
            permissions: ['create_activity', 'join_activity', 'create_circle']
          });

          await user.save();
        }
      }

      // 更新登录信息
      user.lastLogin = new Date();
      user.lastActivity = new Date();

      // 添加设备信息
      const deviceId = deviceInfo.deviceId || jwtUtils.generateDeviceId(deviceInfo.userAgent, deviceInfo.ipAddress);
      await user.addDevice({
        deviceId,
        deviceType: deviceInfo.deviceType || 'web',
        userAgent: deviceInfo.userAgent
      });

      // 生成token对
      const tokens = jwtUtils.generateTokenPair(user, { deviceId });

      return {
        user: user.toSafeObject(),
        tokens,
        deviceId,
        isNewUser: !user.lastLogin
      };
    } catch (error) {
      throw new Error(`OAuth login failed: ${error.message}`);
    }
  }

  // 刷新token
  async refreshToken(refreshToken, deviceId) {
    try {
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive');
      }

      // 验证设备
      const device = user.devices.find(d => d.deviceId === deviceId && d.isActive);
      if (!device) {
        throw new Error('Device not authorized');
      }

      // 更新设备最后使用时间
      device.lastSeen = new Date();
      await user.save();

      // 生成新的token对
      const tokens = jwtUtils.generateTokenPair(user, { deviceId });

      return {
        user: user.toSafeObject(),
        tokens
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // 邮箱验证
  async verifyEmail(token) {
    try {
      const decoded = jwtUtils.verifySpecialToken(token, 'email_verification');
      
      const user = await User.findOne({
        email: decoded.email,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.status = 'active';
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      return { user: user.toSafeObject() };
    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  }

  // 忘记密码
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // 为了安全，不透露用户是否存在
        return { message: 'If the email exists, a reset link has been sent' };
      }

      const resetToken = jwtUtils.generatePasswordResetToken(user._id);
      
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小时
      
      await user.save();

      return {
        message: 'Password reset token generated',
        resetToken // 在实际环境中，这应该通过邮件发送
      };
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // 重置密码
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwtUtils.verifySpecialToken(token, 'password_reset');
      
      const user = await User.findOne({
        _id: decoded.userId,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // 重置登录尝试次数
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // 登出
  async logout(userId, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 将设备标记为非活跃
      const device = user.devices.find(d => d.deviceId === deviceId);
      if (device) {
        device.isActive = false;
      }

      await user.save();

      return { message: 'Logout successful' };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // 登出所有设备
  async logoutAllDevices(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 将所有设备标记为非活跃
      user.devices.forEach(device => {
        device.isActive = false;
      });

      await user.save();

      return { message: 'Logged out from all devices' };
    } catch (error) {
      throw new Error(`Logout all devices failed: ${error.message}`);
    }
  }

  // 验证离线token（本地存储验证）
  async validateOfflineToken(token) {
    try {
      const decoded = jwtUtils.decodeToken(token);
      
      if (!decoded || !decoded.exp) {
        return { valid: false, reason: 'Invalid token format' };
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - (decoded.iat || 0);
      const maxOfflineTime = 21 * 24 * 60 * 60; // 21天（3周）

      if (tokenAge > maxOfflineTime) {
        return { valid: false, reason: 'Token too old, re-authentication required' };
      }

      if (decoded.exp < now) {
        return { valid: false, reason: 'Token expired' };
      }

      return {
        valid: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          familyGroup: decoded.familyGroup,
          isMinor: decoded.isMinor
        },
        needsOnlineVerification: tokenAge > 24 * 60 * 60 // 超过24小时需要在线验证
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
}

module.exports = new AuthService();
