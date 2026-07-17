/**
 * BuildMyHome - Auth Routes
 * API routes for authentication endpoints
*/
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param } = require('express-validator');
const authValidator = require('./auth.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Public routes
router.post('/register', validateJoi(authValidator.register, 'body', 422), authController.register);
router.post('/login', authLimiter, validateJoi(authValidator.login, 'body', 400), authController.login);
router.post('/otp-send', authLimiter, validateJoi(authValidator.otpSend, 'body', 422), authController.otpSend);
router.post('/otp-login', authLimiter, validateJoi(authValidator.otpLogin, 'body', 422), authController.otpVerifyLogin);


router.post('/refresh-token', validateJoi(authValidator.refreshToken, 'body', 400), authController.refreshToken);
router.post('/forgot-password', body('email').isEmail().normalizeEmail(), validate, authController.forgotPassword);
router.post('/reset-password', body('token').notEmpty(), body('password').isLength({ min: 6 }), validate, authController.resetPassword);
router.get('/verify-email/:token', param('token').notEmpty(), validate, authController.verifyEmail);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, validateJoi(authValidator.changePassword || authValidator.login, 'body'), validate, authController.changePassword);
router.post('/resend-verification', authenticate, authController.resendVerification);

module.exports = router;

