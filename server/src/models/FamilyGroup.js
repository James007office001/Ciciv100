const mongoose = require('mongoose');

const familyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // 家庭成员
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['parent', 'child', 'guardian'],
      required: true
    },
    permissions: [{
      type: String,
      enum: ['manage_family', 'view_children_activity', 'set_restrictions', 'approve_activities']
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // 家庭设置
  settings: {
    childrenBedtime: {
      type: String,
      default: '21:00'
    },
    allowedActivities: [{
      type: String,
      enum: ['sports', 'education', 'entertainment', 'social', 'outdoor']
    }],
    requireParentalApproval: {
      type: Boolean,
      default: true
    },
    maxScreenTime: {
      type: Number, // 分钟
      default: 120
    }
  },
  
  // 创建者信息
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段
familyGroupSchema.virtual('parentMembers').get(function() {
  return this.members.filter(member => 
    member.role === 'parent' || member.role === 'guardian'
  );
});

familyGroupSchema.virtual('childMembers').get(function() {
  return this.members.filter(member => member.role === 'child');
});

// 索引
familyGroupSchema.index({ createdBy: 1 });
familyGroupSchema.index({ 'members.userId': 1 });

// 实例方法
familyGroupSchema.methods.addMember = function(userId, role, permissions = []) {
  // 检查用户是否已经在家庭群组中
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this family group');
  }
  
  this.members.push({
    userId,
    role,
    permissions,
    joinedAt: new Date(),
    isActive: true
  });
  
  return this.save();
};

familyGroupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

familyGroupSchema.methods.updateMemberRole = function(userId, newRole, newPermissions = []) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this family group');
  }
  
  member.role = newRole;
  member.permissions = newPermissions;
  
  return this.save();
};

familyGroupSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  return member ? member.role : null;
};

familyGroupSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!member || !member.isActive) return false;
  
  return member.permissions.includes(permission) || 
         (member.role === 'parent' && ['manage_family', 'view_children_activity', 'set_restrictions', 'approve_activities'].includes(permission));
};

// 静态方法
familyGroupSchema.statics.findByMember = async function(userId) {
  return this.findOne({
    'members.userId': userId,
    'members.isActive': true,
    status: 'active'
  }).populate('members.userId', 'username email profile.firstName profile.lastName');
};

const FamilyGroup = mongoose.model('FamilyGroup', familyGroupSchema);

module.exports = FamilyGroup;
