const express = require('express');
const authService = require('../services/authService');
const { authenticateRefreshToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone, profile, oauthProvider, oauthId } = req.body;

    // 基本验证
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!password && (!oauthProvider || oauthProvider === 'local')) {
      return res.status(400).json({
        success: false,
        error: 'Password is required for local registration',
        code: 'PASSWORD_REQUIRED'
      });
    }

    // 获取设备信息
    const deviceInfo = {
      deviceType: req.headers['x-device-type'] || 'web',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const result = await authService.register({
      username,
      email,
      password,
      phone,
      profile,
      oauthProvider,
      oauthId
    }, deviceInfo);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { login, password, deviceId, rememberMe } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        error: 'Login credentials are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // 获取设备信息
    const deviceInfo = {
      deviceId,
      deviceType: req.headers['x-device-type'] || 'web',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const result = await authService.login({
      login,
      password,
      ...deviceInfo
    }, deviceInfo);

    // 设置cookie（如果是web端）
    if (deviceInfo.deviceType === 'web') {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30天或1天
      };

      res.cookie('accessToken', result.tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message,
      code: 'LOGIN_FAILED'
    });
  }
});

// OAuth登录/注册
router.post('/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { oauthId, email, profile, accessToken } = req.body;

    if (!['google', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported OAuth provider',
        code: 'UNSUPPORTED_PROVIDER'
      });
    }

    if (!oauthId || !email) {
      return res.status(400).json({
        success: false,
        error: 'OAuth ID and email are required',
        code: 'MISSING_OAUTH_DATA'
      });
    }

    // 获取设备信息
    const deviceInfo = {
      deviceType: req.headers['x-device-type'] || 'web',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const result = await authService.oauthLogin({
      provider,
      oauthId,
      email,
      profile
    }, deviceInfo);

    // 设置cookie（如果是web端）
    if (deviceInfo.deviceType === 'web') {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      };

      res.cookie('accessToken', result.tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);
    }

    res.json({
      success: true,
      message: result.isNewUser ? 'Registration successful' : 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'OAUTH_FAILED'
    });
  }
});

// 刷新token
router.post('/refresh-token', authenticateRefreshToken, async (req, res) => {
  try {
    const result = await authService.refreshToken(req.refreshToken, req.deviceId);

    // 更新cookie（如果是web端）
    const deviceType = req.headers['x-device-type'] || 'web';
    if (deviceType === 'web') {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      };

      res.cookie('accessToken', result.tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions);
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: error.message,
      code: 'REFRESH_FAILED'
    });
  }
});

// 邮箱验证
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: result
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'VERIFICATION_FAILED'
    });
  }
});

// 忘记密码
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: 'Password reset instructions sent',
      data: result
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'FORGOT_PASSWORD_FAILED'
    });
  }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required',
        code: 'MISSING_DATA'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const result = await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: result
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'RESET_PASSWORD_FAILED'
    });
  }
});

// 登出
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.deviceId || req.body.deviceId;
    
    const result = await authService.logout(req.user._id, deviceId);

    // 清除cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful',
      data: result
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'LOGOUT_FAILED'
    });
  }
});

// 登出所有设备
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const result = await authService.logoutAllDevices(req.user._id);

    // 清除cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices',
      data: result
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'LOGOUT_ALL_FAILED'
    });
  }
});

// 验证离线token
router.post('/validate-offline', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const result = await authService.validateOfflineToken(token);

    res.json({
      success: true,
      message: 'Offline token validation complete',
      data: result
    });
  } catch (error) {
    console.error('Offline validation error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'OFFLINE_VALIDATION_FAILED'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'User information retrieved',
      data: {
        user: req.user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'GET_USER_FAILED'
    });
  }
});

module.exports = router;
