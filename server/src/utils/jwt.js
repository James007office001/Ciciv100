const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTUtils {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'cici-super-secret-jwt-key-2025';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'cici-refresh-secret-2025';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  // 生成访问token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'cici-platform',
      audience: 'cici-users'
    });
  }

  // 生成刷新token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'cici-platform',
      audience: 'cici-users'
    });
  }

  // 生成token对
  generateTokenPair(user, deviceInfo = {}) {
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      familyGroup: user.familyGroup,
      isMinor: user.isMinor,
      deviceId: deviceInfo.deviceId || crypto.randomUUID()
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ 
      userId: user._id,
      deviceId: payload.deviceId
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.expiresIn,
      tokenType: 'Bearer'
    };
  }

  // 验证访问token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'cici-platform',
        audience: 'cici-users'
      });
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  // 验证刷新token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'cici-platform',
        audience: 'cici-users'
      });
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  // 从token中提取payload（不验证签名）
  decodeToken(token) {
    return jwt.decode(token);
  }

  // 生成邮箱验证token
  generateEmailVerificationToken(email) {
    return jwt.sign(
      { email, type: 'email_verification' },
      this.secret,
      { expiresIn: '24h' }
    );
  }

  // 生成密码重置token
  generatePasswordResetToken(userId) {
    return jwt.sign(
      { userId, type: 'password_reset' },
      this.secret,
      { expiresIn: '1h' }
    );
  }

  // 验证特殊用途token
  verifySpecialToken(token, expectedType) {
    try {
      const payload = jwt.verify(token, this.secret);
      if (payload.type !== expectedType) {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error(`Invalid ${expectedType} token: ${error.message}`);
    }
  }

  // 检查token是否即将过期（15分钟内）
  isTokenExpiringSoon(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      return timeUntilExpiry < 15 * 60; // 15分钟
    } catch (error) {
      return true;
    }
  }

  // 生成设备ID
  generateDeviceId(userAgent = '', ipAddress = '') {
    const deviceString = `${userAgent}-${ipAddress}-${Date.now()}`;
    return crypto.createHash('sha256').update(deviceString).digest('hex').substring(0, 32);
  }
}

module.exports = new JWTUtils();
