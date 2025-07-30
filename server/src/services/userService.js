const User = require('../models/User');
const FamilyGroup = require('../models/FamilyGroup');

class UserService {
  // 获取用户资料
  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .populate('familyGroup', 'name description members settings')
        .populate('parentId', 'username profile.firstName profile.lastName')
        .select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user.toSafeObject();
    } catch (error) {
      throw new Error(`Get profile failed: ${error.message}`);
    }
  }

  // 更新用户资料
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allowedUpdates = [
        'profile.firstName',
        'profile.lastName',
        'profile.bio',
        'profile.birthDate',
        'profile.gender',
        'profile.location',
        'phone',
        'preferences'
      ];

      // 更新允许的字段
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key) || key.startsWith('profile.') || key.startsWith('preferences.')) {
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!user[parent]) user[parent] = {};
            user[parent][child] = updateData[key];
          } else {
            user[key] = updateData[key];
          }
        }
      });

      // 如果更新了生日，重新计算是否为未成年人
      if (updateData['profile.birthDate']) {
        const age = user.age;
        user.isMinor = age !== null && age < 17;
      }

      await user.save();

      return user.toSafeObject();
    } catch (error) {
      throw new Error(`Update profile failed: ${error.message}`);
    }
  }

  // 验证手机号码
  async verifyPhone(userId, phone, verificationCode) {
    try {
      // 在实际实现中，这里应该验证短信验证码
      // 这里简化处理
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 检查手机号是否已被其他用户使用
      const existingUser = await User.findOne({ 
        phone: phone,
        _id: { $ne: userId }
      });

      if (existingUser) {
        throw new Error('Phone number already in use');
      }

      user.phone = phone;
      user.isPhoneVerified = true;
      await user.save();

      return {
        message: 'Phone number verified successfully',
        user: user.toSafeObject()
      };
    } catch (error) {
      throw new Error(`Phone verification failed: ${error.message}`);
    }
  }

  // 修改密码
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 验证当前密码
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // 设置新密码
      user.password = newPassword;
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  }

  // 上传头像
  async uploadAvatar(userId, avatarUrl) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.profile.avatar = avatarUrl;
      await user.save();

      return {
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl,
        user: user.toSafeObject()
      };
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  // 获取用户设备列表
  async getUserDevices(userId) {
    try {
      const user = await User.findById(userId).select('devices');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        devices: user.devices.map(device => ({
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          lastSeen: device.lastSeen,
          isActive: device.isActive,
          userAgent: device.userAgent
        }))
      };
    } catch (error) {
      throw new Error(`Get devices failed: ${error.message}`);
    }
  }

  // 移除设备
  async removeDevice(userId, deviceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.devices = user.devices.filter(device => device.deviceId !== deviceId);
      await user.save();

      return { message: 'Device removed successfully' };
    } catch (error) {
      throw new Error(`Remove device failed: ${error.message}`);
    }
  }

  // 搜索用户
  async searchUsers(query, currentUserId, limit = 20, skip = 0) {
    try {
      const searchRegex = new RegExp(query, 'i');
      
      const users = await User.find({
        _id: { $ne: currentUserId },
        status: 'active',
        $or: [
          { username: searchRegex },
          { 'profile.firstName': searchRegex },
          { 'profile.lastName': searchRegex },
          { email: searchRegex }
        ]
      })
      .select('username profile.firstName profile.lastName profile.avatar')
      .limit(limit)
      .skip(skip);

      return users.map(user => ({
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.profile.avatar
      }));
    } catch (error) {
      throw new Error(`Search users failed: ${error.message}`);
    }
  }

  // 创建家庭群组
  async createFamilyGroup(userId, groupData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 检查用户是否已经在家庭群组中
      if (user.familyGroup) {
        throw new Error('User already belongs to a family group');
      }

      // 创建家庭群组
      const familyGroup = new FamilyGroup({
        name: groupData.name,
        description: groupData.description,
        createdBy: userId,
        members: [{
          userId: userId,
          role: 'parent',
          permissions: ['manage_family', 'view_children_activity', 'set_restrictions', 'approve_activities']
        }],
        settings: groupData.settings || {}
      });

      await familyGroup.save();

      // 更新用户的家庭群组关联
      user.familyGroup = familyGroup._id;
      user.role = 'parent';
      await user.save();

      return familyGroup;
    } catch (error) {
      throw new Error(`Create family group failed: ${error.message}`);
    }
  }

  // 邀请家庭成员
  async inviteFamilyMember(userId, memberData) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.familyGroup) {
        throw new Error('User not found or not in a family group');
      }

      const familyGroup = await FamilyGroup.findById(user.familyGroup);
      if (!familyGroup) {
        throw new Error('Family group not found');
      }

      // 检查权限
      if (!familyGroup.hasPermission(userId, 'manage_family')) {
        throw new Error('Permission denied');
      }

      // 查找要邀请的用户
      const memberUser = await User.findOne({
        $or: [
          { email: memberData.email },
          { username: memberData.username }
        ]
      });

      if (!memberUser) {
        throw new Error('User to invite not found');
      }

      if (memberUser.familyGroup) {
        throw new Error('User already belongs to a family group');
      }

      // 添加成员到家庭群组
      await familyGroup.addMember(memberUser._id, memberData.role, memberData.permissions || []);

      // 更新被邀请用户的信息
      memberUser.familyGroup = familyGroup._id;
      memberUser.role = memberData.role;
      
      if (memberData.role === 'child') {
        memberUser.parentId = userId;
      }

      await memberUser.save();

      return {
        message: 'Family member invited successfully',
        member: memberUser.toSafeObject()
      };
    } catch (error) {
      throw new Error(`Invite family member failed: ${error.message}`);
    }
  }

  // 获取家庭群组信息
  async getFamilyGroup(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.familyGroup) {
        return null;
      }

      const familyGroup = await FamilyGroup.findById(user.familyGroup)
        .populate('members.userId', 'username profile.firstName profile.lastName profile.avatar email')
        .populate('createdBy', 'username profile.firstName profile.lastName');

      return familyGroup;
    } catch (error) {
      throw new Error(`Get family group failed: ${error.message}`);
    }
  }

  // 更新家庭群组设置
  async updateFamilySettings(userId, settings) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.familyGroup) {
        throw new Error('User not found or not in a family group');
      }

      const familyGroup = await FamilyGroup.findById(user.familyGroup);
      if (!familyGroup) {
        throw new Error('Family group not found');
      }

      // 检查权限
      if (!familyGroup.hasPermission(userId, 'manage_family')) {
        throw new Error('Permission denied');
      }

      // 更新设置
      familyGroup.settings = { ...familyGroup.settings, ...settings };
      await familyGroup.save();

      return familyGroup;
    } catch (error) {
      throw new Error(`Update family settings failed: ${error.message}`);
    }
  }

  // 离开家庭群组
  async leaveFamilyGroup(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.familyGroup) {
        throw new Error('User not found or not in a family group');
      }

      const familyGroup = await FamilyGroup.findById(user.familyGroup);
      if (!familyGroup) {
        throw new Error('Family group not found');
      }

      // 如果是创建者，不能直接离开
      if (familyGroup.createdBy.toString() === userId.toString()) {
        throw new Error('Family group creator cannot leave. Transfer ownership or delete the group.');
      }

      // 从家庭群组中移除
      await familyGroup.removeMember(userId);

      // 更新用户信息
      user.familyGroup = null;
      user.parentId = null;
      user.role = 'user';
      await user.save();

      return { message: 'Left family group successfully' };
    } catch (error) {
      throw new Error(`Leave family group failed: ${error.message}`);
    }
  }

  // 删除账户
  async deleteAccount(userId, password) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 验证密码（除非是OAuth用户）
      if (user.oauthProvider === 'local') {
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          throw new Error('Password verification failed');
        }
      }

      // 如果用户在家庭群组中，先离开
      if (user.familyGroup) {
        const familyGroup = await FamilyGroup.findById(user.familyGroup);
        if (familyGroup) {
          if (familyGroup.createdBy.toString() === userId.toString()) {
            // 如果是创建者，删除整个家庭群组
            await FamilyGroup.findByIdAndDelete(user.familyGroup);
            
            // 清除所有成员的家庭群组关联
            await User.updateMany(
              { familyGroup: user.familyGroup },
              { 
                $unset: { familyGroup: 1, parentId: 1 },
                $set: { role: 'user' }
              }
            );
          } else {
            // 如果不是创建者，从群组中移除
            await familyGroup.removeMember(userId);
          }
        }
      }

      // 软删除用户（标记为不活跃）
      user.status = 'inactive';
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.username = `deleted_${Date.now()}_${user.username}`;
      user.devices = [];
      await user.save();

      return { message: 'Account deleted successfully' };
    } catch (error) {
      throw new Error(`Delete account failed: ${error.message}`);
    }
  }
}

module.exports = new UserService();
