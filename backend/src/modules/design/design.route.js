/**
 * BuildMyHome - Design Routes
 * API routes for design endpoints
 */

const express = require('express');
const router = express.Router();
const designController = require('./design.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param, query } = require('express-validator');
const designValidator = require('./design.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Public routes
router.get('/', designController.getDesigns);
router.get('/featured', designController.getFeaturedDesigns);
router.get('/trending', designController.getTrendingDesigns);
router.get('/filters/options', designController.getFilterOptions);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, designController.getDesignById);
router.get('/slug/:slug', designController.getDesignBySlug);

// Protected routes - Engineer
router.post('/', authenticate, authorize('engineer', 'admin'), validateJoi(designValidator.createDesign, 'body'), designController.createDesign);
router.put('/:id', authenticate, authorize('engineer', 'admin'), param('id').isMongoId(), validateJoi(designValidator.createDesign, 'body'), validate, designController.updateDesign);
router.delete('/:id', authenticate, authorize('engineer', 'admin'), param('id').isMongoId(), validate, designController.deleteDesign);
router.post('/:id/submit', authenticate, authorize('engineer'), param('id').isMongoId(), validate, designController.submitForApproval);
router.get('/engineer/my-designs', authenticate, authorize('engineer'), designController.getMyDesigns);

// Protected routes - User
router.post('/:id/like', authenticate, param('id').isMongoId(), validate, designController.toggleLike);
router.get('/:id/related', designController.getRelatedDesigns);

module.exports = router;

