const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const logger = require('../../utils/logger');

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret || config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
  }

  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.id = userObj._id?.toString?.() || userObj.id || user._id?.toString?.();
    delete userObj._id;
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.otpCode;
    delete userObj.otpExpires;
    delete userObj.otpAttempts;
    delete userObj.__v;
    return userObj;
  }

  async register(userData) {
    const normalizedEmail = this.normalizeEmail(userData.email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    const shouldAutoActivate = config.env === 'test';
    const user = await User.create({
      ...userData,
      email: normalizedEmail,
      isActive: shouldAutoActivate,
      isEmailVerified: shouldAutoActivate,
    });

    const otpResult = await this.generateOtp(user._id);
    const tokens = this.generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      otpSent: otpResult.otpSent,
      otpRequired: !shouldAutoActivate,
      otp: ['development', 'test'].includes(config.env) ? otpResult.otp : undefined,
    };
  }

  async login(email, password) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive || !user.isEmailVerified) {
      throw new ApiError(403, 'Please verify OTP first');
    }

    const tokens = this.generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async verifyOtpAndLogin(credential, otpCode) {
    const normalizedCredential = (credential || '').trim();
    const query = normalizedCredential.includes('@')
      ? { email: this.normalizeEmail(normalizedCredential) }
      : { phone: normalizedCredential };

    let user = await User.findOne(query).select('+otpCode +otpExpires +otpAttempts +password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    await this.verifyOtp(user._id, otpCode);

    const tokens = this.generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
    return true;
  }

  async refreshToken(token) {
    try {
      if (!token || !token.trim()) {
        throw new ApiError(400, 'Refresh token is required');
      }

      const decoded = jwt.verify(token, config.jwt.refreshSecret || config.jwt.secret);

      if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('AUTH SERVICE ERROR: refreshToken failed', error);
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  async generatePasswordResetToken(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    return {
      success: true,
      resetToken,
    };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return true;
  }

  async verifyEmail(token) {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires.getTime() < Date.now()) {
      throw new ApiError(400, 'Verification token expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  async resendVerificationEmail(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    return {
      token: verificationToken, // In production, send via email
      expiresAt: user.emailVerificationExpires,
    };
  }

  async sendOtp(credential) {
    const normalizedCredential = (credential || '').trim();
    const query = normalizedCredential.includes('@')
      ? { email: this.normalizeEmail(normalizedCredential) }
      : { phone: normalizedCredential };

    const user = await User.findOne(query);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const otpResult = await this.generateOtp(user._id);
    if (config.env === 'development' || config.env === 'test') {
      logger.info(`[DEV OTP] ${otpResult.otp} for ${normalizedCredential}`);
      return {
        otpSent: true,
        otp: otpResult.otp,
        expiresIn: otpResult.expiresIn,
        message: 'OTP generated in development mode. Check backend logs for the code.',
      };
    }

    const smtpConfigured = Boolean(config.email?.smtp?.host && config.email?.smtp?.auth?.user && config.email?.smtp?.auth?.pass);
    if (!smtpConfigured) {
      return {
        otpSent: false,
        expiresIn: otpResult.expiresIn,
        message: 'OTP delivery is not configured on this server.',
      };
    }

    try {
      const transporter = require('nodemailer').createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: false,
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass,
        },
      });
      await transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Your verification OTP',
        html: `<p>Your OTP is <strong>${otpResult.otp}</strong></p>`,
      });
      return {
        otpSent: true,
        expiresIn: otpResult.expiresIn,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      logger.error('OTP send failed', error);
      return {
        otpSent: false,
        expiresIn: otpResult.expiresIn,
        message: 'OTP delivery failed. Please try again.',
      };
    }
  }

  async generateOtp(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    logger.info(`OTP ${otp} generated for user ${userId} (expires ${user.otpExpires})`);

    return {
      otpSent: true,
      otp,
      expiresIn: 600,
      message: 'OTP generated successfully',
    };
  }

  async verifyOtp(userId, code) {
    const user = await User.findById(userId).select('+otpCode +otpExpires +otpAttempts');
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.otpCode || !user.otpExpires) {
      throw new ApiError(400, 'No OTP requested');
    }

    if (user.otpExpires.getTime() < Date.now()) {
      user.otpCode = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      throw new ApiError(400, 'OTP expired');
    }

    if (user.otpAttempts >= 5) {
      throw new ApiError(429, 'Too many attempts');
    }

    if (user.otpCode !== String(code)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      throw new ApiError(400, 'Invalid OTP');
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.isEmailVerified = true;
    user.isActive = true;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();

