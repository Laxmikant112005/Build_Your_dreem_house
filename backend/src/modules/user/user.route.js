/**
 * BuildMyHome - User Routes
 * API routes for user endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param, query } = require('express-validator');
const userValidator = require('./user.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Note: existing express-validator checks remain for parts not yet migrated to Joi.

// Public routes
router.get('/:id', 
  param('id').isMongoId(),
  validate,
  userController.getUserById
);

// Protected routes - User
router.get('/profile/me', authenticate, userController.getMyProfile);
router.put('/profile/me', authenticate, validateJoi(userValidator.updateProfile, 'body'), validate, userController.updateMyProfile);
router.get('/preferences/me', authenticate, userController.getPreferences);
router.put('/preferences/me', authenticate, userController.updatePreferences);
router.get('/bookings/me', authenticate, userController.getMyBookings);
router.get('/favorites/me', authenticate, userController.getMyFavorites);
router.post('/apply-engineer', authenticate, userController.applyAsEngineer);

// Protected routes - Admin
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/:id', authenticate, authorize('admin'), param('id').isMongoId(), validate, userController.updateUserByAdmin);
router.delete('/:id', authenticate, authorize('admin'), param('id').isMongoId(), validate, userController.deleteUserByAdmin);

module.exports = router;

