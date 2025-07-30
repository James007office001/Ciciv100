const jwtUtils = require('../utils/jwt');
const User = require('../models/User');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    
    // 获取用户信息
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // 检查账户锁定
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // 更新最后活动时间
    user.lastActivity = new Date();
    await user.save();

    req.user = user;
    req.token = token;
    req.deviceId = decoded.deviceId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      details: error.message
    });
  }
};

// 可选认证中间件（不强制要求token）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwtUtils.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active' && !user.isLocked) {
        req.user = user;
        req.token = token;
        req.deviceId = decoded.deviceId;
        
        // 更新最后活动时间
        user.lastActivity = new Date();
        await user.save();
      }
    }
    
    next();
  } catch (error) {
    // 在可选认证中，token错误不应该阻止请求
    next();
  }
};

// 角色验证中间件
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// 权限验证中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasPermission = req.user.permissions.includes(permission) ||
                         req.user.role === 'admin';

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required: permission
      });
    }

    next();
  };
};

// 家庭群组权限验证
const requireFamilyPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!req.user.familyGroup) {
        return res.status(403).json({
          success: false,
          error: 'No family group associated',
          code: 'NO_FAMILY_GROUP'
        });
      }

      const FamilyGroup = require('../models/FamilyGroup');
      const familyGroup = await FamilyGroup.findById(req.user.familyGroup);
      
      if (!familyGroup) {
        return res.status(404).json({
          success: false,
          error: 'Family group not found',
          code: 'FAMILY_GROUP_NOT_FOUND'
        });
      }

      const hasPermission = familyGroup.hasPermission(req.user._id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Family permission denied',
          code: 'FAMILY_PERMISSION_DENIED',
          required: permission
        });
      }

      req.familyGroup = familyGroup;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking family permissions',
        details: error.message
      });
    }
  };
};

// 未成年人保护中间件
const protectMinors = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // 如果用户是未成年人且有家长监护
    if (req.user.isMinor && req.user.parentId) {
      const currentHour = new Date().getHours();
      
      // 检查是否在就寝时间
      if (req.user.familyGroup) {
        const FamilyGroup = require('../models/FamilyGroup');
        const familyGroup = await FamilyGroup.findById(req.user.familyGroup);
        
        if (familyGroup && familyGroup.settings.childrenBedtime) {
          const bedtimeHour = parseInt(familyGroup.settings.childrenBedtime.split(':')[0]);
          
          if (currentHour >= bedtimeHour || currentHour < 6) {
            return res.status(403).json({
              success: false,
              error: 'Access restricted during bedtime hours',
              code: 'BEDTIME_RESTRICTION',
              bedtime: familyGroup.settings.childrenBedtime
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error checking minor protection rules',
      details: error.message
    });
  }
};

// 刷新token验证中间件
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const decoded = jwtUtils.verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    req.user = user;
    req.deviceId = decoded.deviceId;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN',
      details: error.message
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requirePermission,
  requireFamilyPermission,
  protectMinors,
  authenticateRefreshToken
};
