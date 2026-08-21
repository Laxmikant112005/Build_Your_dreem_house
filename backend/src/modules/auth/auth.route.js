const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authValidator = require('./auth.validator');

const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { validateJoi } = require('../../middleware/joi.middleware');

router.post('/register',
  validateJoi(authValidator.register, 'body', 422),
  authController.register
);

router.post('/login',
  authLimiter,
  validateJoi(authValidator.login, 'body', 400),
  authController.login
);

router.post('/refresh-token',
  validateJoi(authValidator.refreshToken, 'body', 400),
  authController.refreshToken
);

router.post('/forgot-password',
  authLimiter,
  validateJoi(authValidator.forgotPassword, 'body', 400),
  authController.forgotPassword
);

router.post('/reset-password',
  authLimiter,
  validateJoi(authValidator.resetPassword, 'body', 400),
  authController.resetPassword
);

router.get('/verify-email/:token',
  validateJoi(authValidator.verifyEmail, 'params', 400),
  authController.verifyEmail
);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

router.put('/change-password',
  authenticate,
  validateJoi(authValidator.changePassword, 'body', 400),
  authController.changePassword
);

router.post('/resend-verification',
  authenticate,
  authController.resendVerification
);

module.exports = router;