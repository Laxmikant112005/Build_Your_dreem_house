const authService = require('./auth.service');

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
  } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    phone,

    // Never trust req.body.role for public registration.
    role: 'user',
  });

  return ApiResponse.created(
    res,
    'Registration successful',
    {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }
  );
});

/**
 * Login user.
 */
const login = asyncHandler(async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  const result = await authService.login(
    email,
    password
  );

  return ApiResponse.ok(
    res,
    'Login successful',
    {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }
  );
});

/**
 * Logout user.
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(
    req.userId
  );

  return ApiResponse.ok(
    res,
    'Logout successful'
  );
});

/**
 * Refresh access token.
 */
const refreshToken = asyncHandler(async (req, res) => {
  const {
    refreshToken: token,
  } = req.body;

  if (
    !token ||
    typeof token !== 'string' ||
    !token.trim()
  ) {
    return ApiResponse.badRequest(
      res,
      'Refresh token is required'
    );
  }

  const tokens =
    await authService.refreshToken(
      token.trim()
    );

  return ApiResponse.ok(
    res,
    'Token refreshed successfully',
    tokens
  );
});

/**
 * Forgot password.
 *
 * Always returns the same response so that attackers
 * cannot determine whether an email exists.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.generatePasswordResetToken(
    email
  );

  return ApiResponse.ok(
    res,
    'If that email is registered, a password reset link has been sent'
  );
});

/**
 * Reset password.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const {
    token,
    password,
  } = req.body;

  if (
    !token ||
    typeof token !== 'string'
  ) {
    return ApiResponse.badRequest(
      res,
      'Reset token is required'
    );
  }

  if (
    !password ||
    typeof password !== 'string'
  ) {
    return ApiResponse.badRequest(
      res,
      'Password is required'
    );
  }

  await authService.resetPassword(
    token.trim(),
    password
  );

  return ApiResponse.ok(
    res,
    'Password reset successful'
  );
});

/**
 * Change password.
 *
 * Requires authentication.
 */
const changePassword = asyncHandler(async (req, res) => {
  const {
    currentPassword,
    newPassword,
  } = req.body;

  if (
    !currentPassword ||
    typeof currentPassword !== 'string'
  ) {
    return ApiResponse.badRequest(
      res,
      'Current password is required'
    );
  }

  if (
    !newPassword ||
    typeof newPassword !== 'string'
  ) {
    return ApiResponse.badRequest(
      res,
      'New password is required'
    );
  }

  await authService.changePassword(
    req.userId,
    currentPassword,
    newPassword
  );

  return ApiResponse.ok(
    res,
    'Password changed successfully'
  );
});

/**
 * Get currently authenticated user.
 */
const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return ApiResponse.unauthorized(
      res,
      'Authentication required'
    );
  }

  return ApiResponse.ok(
    res,
    'User retrieved successfully',
    req.user
  );
});

/**
 * Verify email.
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (
    !token ||
    typeof token !== 'string'
  ) {
    return ApiResponse.badRequest(
      res,
      'Verification token is required'
    );
  }

  await authService.verifyEmail(
    token.trim()
  );

  return ApiResponse.ok(
    res,
    'Email verified successfully'
  );
});

/**
 * Resend verification email.
 *
 * Requires authentication.
 */
const resendVerification = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return ApiResponse.unauthorized(
      res,
      'Authentication required'
    );
  }

  await authService.resendVerificationEmail(
    req.userId
  );

  return ApiResponse.ok(
    res,
    'Verification email sent'
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  verifyEmail,
  resendVerification,
};