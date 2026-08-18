/**
 * BuildMyHome - Auth Controller
 * Request handlers for authentication endpoints
 */

const authService = require('./auth.service');

// Access tokens are signed with JWT_SECRET and refresh tokens with
// JWT_REFRESH_SECRET (see auth.service.js#generateTokens). Both are
// verified with the matching secret everywhere (auth middleware for
// access tokens, authService.refreshToken() for refresh tokens).

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Register new user
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  });

  ApiResponse.created(res, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  ApiResponse.ok(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.userId);
  ApiResponse.ok(res, 'Logout successful');
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.badRequest(res, 'Refresh token is required');
  }

  const tokens = await authService.refreshToken(refreshToken);

  ApiResponse.ok(res, 'Token refreshed successfully', tokens);
});

/**
 * Forgot password - always responds the same way regardless of whether
 * the email exists, to avoid account enumeration. Sends a reset email
 * when SMTP is configured.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.generatePasswordResetToken(email);

  ApiResponse.ok(res, 'If that email is registered, a password reset link has been sent');
});

/**
 * Reset password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  ApiResponse.ok(res, 'Password reset successful');
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.userId, currentPassword, newPassword);

  ApiResponse.ok(res, 'Password changed successfully');
});

/**
 * Get current user
 */
const getMe = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, 'User retrieved successfully', req.user);
});

/**
 * Verify email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  await authService.verifyEmail(token);

  ApiResponse.ok(res, 'Email verified successfully');
});

/**
 * Resend verification email
 */
const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.userId);

  ApiResponse.ok(res, 'Verification email sent');
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
