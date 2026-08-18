/**
 * BuildMyHome - Auth Service
 * JWT-based authentication (register, login, refresh, logout,
 * forgot/reset password, change password, email verification).
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const logger = require('../../utils/logger');

// ---------------------------------------------------------------------------
// Configuration constants. Keeping these in one place makes token/reset
// lifetimes easy to audit and tune.
// ---------------------------------------------------------------------------
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
// Mongo duplicate-key error code, used to detect a race condition on the
// unique `email` index during registration.
const MONGO_DUPLICATE_KEY_ERROR = 11000;

/**
 * Fail fast if the JWT signing secrets are not configured.
 * An auth service without properly configured secrets is a critical
 * misconfiguration - it must never start up "successfully" and silently
 * issue tokens with a missing/undefined secret.
 */
function assertJwtSecretsConfigured() {
  const missing = [];
  if (!config.jwt || !config.jwt.secret) missing.push('JWT_SECRET');
  if (!config.jwt || !config.jwt.refreshSecret) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `Auth service misconfigured: missing required environment variable(s): ${missing.join(
        ', '
      )}. Refusing to start.`
    );
  }

  // A shared secret between access and refresh tokens defeats the point
  // of having two of them (compromising one compromises both). Warn
  // loudly rather than silently accepting a weak configuration.
  if (config.jwt.secret === config.jwt.refreshSecret) {
    logger.error(
      'SECURITY WARNING: JWT_SECRET and JWT_REFRESH_SECRET are identical. ' +
        'They should be distinct random values.'
    );
  }
}

assertJwtSecretsConfigured();

/**
 * Whether SMTP is configured on this server, and if so, a ready-to-use
 * nodemailer transporter. Used by forgot-password to actually deliver the
 * reset link instead of silently no-op'ing.
 */
function getMailTransporter() {
  const smtpConfigured = Boolean(
    config.email?.smtp?.host &&
      config.email?.smtp?.auth?.user &&
      config.email?.smtp?.auth?.pass
  );

  if (!smtpConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: Boolean(config.email.smtp.secure),
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass,
    },
  });
}

class AuthService {
  generateTokens(userId) {
    const payload = { id: userId };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
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
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    delete userObj.emailVerificationToken;
    delete userObj.emailVerificationExpires;
    delete userObj.__v;
    return userObj;
  }

  /**
   * Register a new user. Accounts are usable immediately after
   * registration - JWTs are issued right away. Email verification is a
   * separate, non-blocking flow (see verifyEmail/resendVerificationEmail):
   * the account is not gated on it.
   */
  async register(userData) {
    const normalizedEmail = this.normalizeEmail(userData.email);

    const existingUser = await User.findOne({ email: normalizedEmail });
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
        email: normalizedEmail,
        isActive: true,
        isEmailVerified: false,
      });
    } catch (error) {
      if (error && error.code === MONGO_DUPLICATE_KEY_ERROR) {
        const field = Object.keys(error.keyPattern)[0];
        const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
        throw ApiError.conflict(
          `${formattedField} is already registered. Please log in or use a different ${field}.`,
          field
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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

    if (!user.isActive) {
      throw new ApiError(403, 'This account has been deactivated');
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

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
    return true;
  }

  async refreshToken(token) {
    try {
      if (!token || !token.trim()) {
        throw new ApiError(400, 'Refresh token is required');
      }

      const decoded = jwt.verify(token, config.jwt.refreshSecret);

      if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const user = await User.findById(decoded.id).select('+refreshToken');

      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Rotate the refresh token on every use so a stolen (but not yet
      // used) token becomes worthless the moment the legitimate client
      // refreshes again.
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

  /**
   * Generate a password reset token and email it to the user, if the
   * account exists. Always resolves the same way regardless of whether
   * the email is registered, so callers can't use this endpoint to
   * enumerate valid accounts.
   */
  async generatePasswordResetToken(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + PASSWORD_RESET_EXPIRY_MS;
    await user.save();

    await this.sendPasswordResetEmail(user, resetToken);

    return { success: true };
  }

  async sendPasswordResetEmail(user, resetToken) {
    const transporter = getMailTransporter();
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

    if (!transporter) {
      // No SMTP configured on this environment (e.g. local dev). Log
      // instead of silently dropping the email so the flow is still
      // testable end-to-end without a mail server.
      logger.warn(
        `Password reset requested for ${user.email} but SMTP is not configured. ` +
          `Reset URL: ${resetUrl}`
      );
      return;
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Reset your BuildMyHome password',
        html: `
          <p>Hi ${user.firstName},</p>
          <p>We received a request to reset your BuildMyHome password. This link expires in 30 minutes.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (error) {
      // Don't leak delivery failures to the caller - generatePasswordResetToken()
      // must remain indistinguishable for existing vs non-existing accounts.
      logger.error('Password reset email failed to send', error);
    }
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

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return true;
  }

  /**
   * Email verification is an independent, non-blocking flow: accounts
   * work fully without it. Kept as architecture for future use (e.g.
   * gating certain actions on a verified email).
   */
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

    const verificationToken = crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + EMAIL_VERIFICATION_EXPIRY_MS;
    await user.save();

    const transporter = getMailTransporter();
    const verifyUrl = `${config.clientUrl}/verify-email/${verificationToken}`;

    if (!transporter) {
      logger.warn(
        `Verification email requested for ${user.email} but SMTP is not configured. ` +
          `Verify URL: ${verifyUrl}`
      );
      return { expiresAt: user.emailVerificationExpires };
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Verify your BuildMyHome email',
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Please verify your email address to finish setting up your account.</p>
          <p><a href="${verifyUrl}">Verify email</a></p>
        `,
      });
    } catch (error) {
      logger.error('Verification email failed to send', error);
    }

    return { expiresAt: user.emailVerificationExpires };
  }
}

module.exports = new AuthService();
