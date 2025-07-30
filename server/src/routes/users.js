const express = require('express');
const userService = require('../services/userService');
const { 
  authenticateToken, 
  requireRole, 
  requireFamilyPermission,
  protectMinors 
} = require('../middleware/auth');

const router = express.Router();

// 获取当前用户资料
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user._id);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'GET_PROFILE_FAILED'
    });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const allowedFields = [
      'profile.firstName',
      'profile.lastName',
      'profile.bio',
      'profile.birthDate',
      'profile.gender',
      'profile.location',
      'phone',
      'preferences'
    ];

    // 过滤只允许更新的字段
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.some(field => key.startsWith(field.split('.')[0]))) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        code: 'NO_VALID_FIELDS'
      });
    }

    const updatedProfile = await userService.updateProfile(req.user._id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: updatedProfile }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'UPDATE_PROFILE_FAILED'
    });
  }
});

// 验证手机号码
router.post('/verify-phone', authenticateToken, async (req, res) => {
  try {
    const { phone, verificationCode } = req.body;

    if (!phone || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and verification code are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const result = await userService.verifyPhone(req.user._id, phone, verificationCode);

    res.json({
      success: true,
      message: 'Phone verified successfully',
      data: result
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'PHONE_VERIFICATION_FAILED'
    });
  }
});

// 修改密码
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const result = await userService.changePassword(req.user._id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: result
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'CHANGE_PASSWORD_FAILED'
    });
  }
});

// 上传头像
router.post('/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'Avatar URL is required',
        code: 'MISSING_AVATAR_URL'
      });
    }

    const result = await userService.uploadAvatar(req.user._id, avatarUrl);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'AVATAR_UPLOAD_FAILED'
    });
  }
});

// 获取用户设备列表
router.get('/devices', authenticateToken, async (req, res) => {
  try {
    const devices = await userService.getUserDevices(req.user._id);

    res.json({
      success: true,
      message: 'Devices retrieved successfully',
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'GET_DEVICES_FAILED'
    });
  }
});

// 移除设备
router.delete('/devices/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result = await userService.removeDevice(req.user._id, deviceId);

    res.json({
      success: true,
      message: 'Device removed successfully',
      data: result
    });
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'REMOVE_DEVICE_FAILED'
    });
  }
});

// 搜索用户
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q: query, limit = 20, skip = 0 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long',
        code: 'INVALID_SEARCH_QUERY'
      });
    }

    const users = await userService.searchUsers(
      query.trim(), 
      req.user._id, 
      parseInt(limit), 
      parseInt(skip)
    );

    res.json({
      success: true,
      message: 'Users search completed',
      data: { users, query, limit: parseInt(limit), skip: parseInt(skip) }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'SEARCH_USERS_FAILED'
    });
  }
});

// 创建家庭群组
router.post('/family-group', authenticateToken, async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Family group name is required',
        code: 'MISSING_GROUP_NAME'
      });
    }

    const familyGroup = await userService.createFamilyGroup(req.user._id, {
      name: name.trim(),
      description: description?.trim(),
      settings
    });

    res.status(201).json({
      success: true,
      message: 'Family group created successfully',
      data: { familyGroup }
    });
  } catch (error) {
    console.error('Create family group error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'CREATE_FAMILY_GROUP_FAILED'
    });
  }
});

// 邀请家庭成员
router.post('/family-group/invite', authenticateToken, requireFamilyPermission('manage_family'), async (req, res) => {
  try {
    const { email, username, role } = req.body;

    if ((!email && !username) || !role) {
      return res.status(400).json({
        success: false,
        error: 'User identifier (email or username) and role are required',
        code: 'MISSING_INVITE_DATA'
      });
    }

    if (!['parent', 'child', 'guardian'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be parent, child, or guardian',
        code: 'INVALID_ROLE'
      });
    }

    const result = await userService.inviteFamilyMember(req.user._id, {
      email,
      username,
      role,
      permissions: req.body.permissions
    });

    res.json({
      success: true,
      message: 'Family member invited successfully',
      data: result
    });
  } catch (error) {
    console.error('Invite family member error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'INVITE_FAMILY_MEMBER_FAILED'
    });
  }
});

// 获取家庭群组信息
router.get('/family-group', authenticateToken, async (req, res) => {
  try {
    const familyGroup = await userService.getFamilyGroup(req.user._id);

    if (!familyGroup) {
      return res.status(404).json({
        success: false,
        error: 'No family group found',
        code: 'NO_FAMILY_GROUP'
      });
    }

    res.json({
      success: true,
      message: 'Family group retrieved successfully',
      data: { familyGroup }
    });
  } catch (error) {
    console.error('Get family group error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'GET_FAMILY_GROUP_FAILED'
    });
  }
});

// 更新家庭群组设置
router.put('/family-group/settings', authenticateToken, requireFamilyPermission('manage_family'), async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required',
        code: 'MISSING_SETTINGS'
      });
    }

    const familyGroup = await userService.updateFamilySettings(req.user._id, settings);

    res.json({
      success: true,
      message: 'Family settings updated successfully',
      data: { familyGroup }
    });
  } catch (error) {
    console.error('Update family settings error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'UPDATE_FAMILY_SETTINGS_FAILED'
    });
  }
});

// 离开家庭群组
router.post('/family-group/leave', authenticateToken, async (req, res) => {
  try {
    const result = await userService.leaveFamilyGroup(req.user._id);

    res.json({
      success: true,
      message: 'Left family group successfully',
      data: result
    });
  } catch (error) {
    console.error('Leave family group error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'LEAVE_FAMILY_GROUP_FAILED'
    });
  }
});

// 删除账户
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    // 对于local账户，需要验证密码
    if (req.user.oauthProvider === 'local' && !password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to delete account',
        code: 'PASSWORD_REQUIRED'
      });
    }

    const result = await userService.deleteAccount(req.user._id, password);

    // 清除cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Account deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'DELETE_ACCOUNT_FAILED'
    });
  }
});

// 管理员路由：获取所有用户（仅管理员）
router.get('/admin/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    
    const User = require('../models/User');
    const query = {};
    
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password -passwordResetToken -emailVerificationToken')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'ADMIN_GET_USERS_FAILED'
    });
  }
});

module.exports = router;
