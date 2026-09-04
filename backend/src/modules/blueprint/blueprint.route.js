/**
 * Planova - Blueprint Routes
 * API routes for Professional Blueprint Marketplace
 */

const express = require('express');
const router = express.Router();
const blueprintController = require('./blueprint.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param } = require('express-validator');
const blueprintValidator = require('./blueprint.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Public routes
router.get('/', blueprintController.getBlueprints);
router.get('/featured', blueprintController.getFeaturedBlueprints);
router.get('/trending', blueprintController.getTrendingBlueprints);
router.get('/recommended', authenticate, blueprintController.getRecommendedBlueprints);
router.get('/filters/options', blueprintController.getFilterOptions);
router.get('/slug/:slug', blueprintController.getBlueprintBySlug);
router.get('/engineer/my-blueprints',
  authenticate,
  authorize('engineer'),
  blueprintController.getMyBlueprints
);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, blueprintController.getBlueprintById);
router.get('/:id/related', blueprintController.getRelatedBlueprints);

// Protected routes - Engineer
router.post('/',
  authenticate,
  authorize('engineer', 'admin'),
  validateJoi(blueprintValidator.createBlueprint, 'body'),
  blueprintController.createBlueprint
);
router.put('/:id',
  authenticate,
  authorize('engineer', 'admin'),
  param('id').isMongoId(),
  validateJoi(blueprintValidator.updateBlueprint, 'body'),
  validate,
  blueprintController.updateBlueprint
);
router.delete('/:id',
  authenticate,
  authorize('engineer', 'admin'),
  param('id').isMongoId(),
  validate,
  blueprintController.deleteBlueprint
);
router.post('/:id/submit',
  authenticate,
  authorize('engineer'),
  param('id').isMongoId(),
  validate,
  blueprintController.submitForApproval
);

// Protected routes - User
router.post('/:id/like',
  authenticate,
  param('id').isMongoId(),
  validate,
  blueprintController.toggleLike
);

module.exports = router;

