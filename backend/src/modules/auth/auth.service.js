/**
 * Planova - Authentication Service
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const logger = require('../../utils/logger');

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRY_MS = 30 * 60 * 1000;
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const MONGO_DUPLICATE_KEY_ERROR = 11000;

const assertJwtSecretsConfigured = () => {
  if (!config.jwt?.secret || !config.jwt?.refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured');
  }

  if (config.jwt.secret === config.jwt.refreshSecret) {
    logger.warn('JWT_SECRET and JWT_REFRESH_SECRET should be different');
  }
};

assertJwtSecretsConfigured();

const getMailTransporter = () => {
  const smtp = config.email?.smtp;

  if (!smtp?.host || !smtp?.auth?.user || !smtp?.auth?.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: Boolean(smtp.secure),
    auth: {
      user: smtp.auth.user,
      pass: smtp.auth.pass,
    },
  });
};

class AuthService {
  generateTokens(userId) {
    const payload = { id: userId.toString() };

    return {
      accessToken: jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      }),
      refreshToken: jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
      }),
    };
  }

  normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  sanitizeUser(user) {
    const data = user.toObject ? user.toObject() : { ...user };

    data.id = data._id?.toString() || data.id;

    delete data._id;
    delete data.password;
    delete data.refreshToken;
    delete data.passwordResetToken;
    delete data.passwordResetExpires;
    delete data.emailVerificationToken;
    delete data.emailVerificationExpires;
    delete data.__v;

    return data;
  }

  async register(userData) {
    const email = this.normalizeEmail(userData.email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict(
        'Email is already registered. Please log in or use a different email.',
        'email'
      );
    }

    let user;

    try {
      user = await User.create({
        ...userData,
        email,
        role: userData.role || 'user',
        isActive: true,
        isEmailVerified: false,
      });
    } catch (error) {
      if (error?.code === MONGO_DUPLICATE_KEY_ERROR) {
        throw ApiError.conflict(
          'Email is already registered. Please log in or use a different email.',
          'email'
        );
      }

      throw error;
    }

    const tokens = this.generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email, password) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+password +refreshToken');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.isActive === false) {
      throw new ApiError(403, 'This account has been deactivated');
    }

    const tokens = this.generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });

    return true;
  }

  async refreshToken(token) {
    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Refresh token is required');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);

      if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== token || user.isActive === false) {
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

      logger.warn('Refresh token validation failed');
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  async generatePasswordResetToken(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return { success: true };

    const token = crypto
      .randomBytes(PASSWORD_RESET_TOKEN_BYTES)
      .toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    user.passwordResetExpires =
      Date.now() + PASSWORD_RESET_EXPIRY_MS;

    await user.save();

    await this.sendPasswordResetEmail(user, token);

    return { success: true };
  }

  async sendPasswordResetEmail(user, token) {
    const transporter = getMailTransporter();
    const clientUrl = config.clientUrl || '';

    const resetUrl =
      `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;

    if (!transporter) {
      logger.warn(
        `Password reset requested for ${user.email}; SMTP is not configured`
      );
      return;
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Reset your Planova password',
        html: `
          <p>Hi ${user.firstName || 'there'},</p>
          <p>We received a request to reset your password.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>This link expires in 30 minutes.</p>
        `,
      });
    } catch (error) {
      logger.error('Password reset email failed', error);
    }
  }

  async resetPassword(token, newPassword) {
    if (!token) {
      throw new ApiError(400, 'Reset token is required');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

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
    user.refreshToken = undefined;

    await user.save();

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = undefined;

    await user.save();

    return true;
  }

  async verifyEmail(token) {
    if (!token) {
      throw new ApiError(400, 'Verification token is required');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
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

    const token = crypto
      .randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES)
      .toString('hex');

    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    user.emailVerificationExpires =
      Date.now() + EMAIL_VERIFICATION_EXPIRY_MS;

    await user.save();

    const transporter = getMailTransporter();
    const clientUrl = config.clientUrl || '';

    const verifyUrl =
      `${clientUrl}/verify-email/${encodeURIComponent(token)}`;

    if (!transporter) {
      logger.warn(
        `Verification email requested for ${user.email}; SMTP is not configured`
      );
      return { expiresAt: user.emailVerificationExpires };
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Verify your Planova email',
        html: `
          <p>Hi ${user.firstName || 'there'},</p>
          <p>Please verify your email address.</p>
          <p><a href="${verifyUrl}">Verify email</a></p>
        `,
      });
    } catch (error) {
      logger.error('Verification email failed', error);
    }

    return { expiresAt: user.emailVerificationExpires };
  }
}

module.exports = new AuthService();