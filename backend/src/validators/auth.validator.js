/**
 * BuildMyHome - Auth Validators
 * Request validation for authentication endpoints
 */

const { body, param } = require('express-validator');
const { USER_STATUS } = require('../constants/enums');

/**
 * Validation rules for user registration
 */
const register = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .trim(),
  
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['user', 'engineer'])
    .withMessage('Invalid role specified'),
];

/**
 * Validation rules for user login
 */
const login = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim(),
];

/**
 * Validation rules for forgot password
 */
const forgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
];

/**
 * Validation rules for reset password
 */
const resetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .trim(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .trim(),
];

/**
 * Validation rules for refresh token
 */
const refreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .trim(),
];

/**
 * Validation rules for change password
 */
const changePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .trim(),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
    .trim(),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation rules for email verification
 */
const verifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .trim(),
];

/**
 * Validation rules for resend verification email
 */
const resendVerification = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
];

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  changePassword,
  verifyEmail,
  resendVerification,
};

