/**
 * Planova - Engineer Routes
 */

const express = require('express');
const router = express.Router();

const engineerController = require('./engineer.controller');
const {
  authenticate,
  authorize,
  optionalAuth,
} = require('../../middleware/auth.middleware');

const { ROLE } = require('../../constants/roles');
const engineerValidator = require('./engineer.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Protected /me routes MUST come before dynamic /:id routes
router.get(
  '/me/dashboard',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.getEngineerDashboard
);

router.get(
  '/me/verification',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.getVerificationStatus
);

router.post(
  '/me/verification/submit',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(engineerValidator.submitVerification, 'body'),
  engineerController.submitVerification
);

// Engineer profile
router.put(
  '/profile',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(engineerValidator.updateProfile, 'body'),
  engineerController.updateEngineerProfile
);

router.put(
  '/availability',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(engineerValidator.updateAvailability, 'body'),
  engineerController.updateAvailability
);

// Portfolio
router.post(
  '/portfolio',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(engineerValidator.addPortfolio, 'body'),
  engineerController.addPortfolioItem
);

router.delete(
  '/portfolio/:portfolioId',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.removePortfolioItem
);

// Public routes
router.get('/', engineerController.getEngineers);
router.get('/featured', engineerController.getFeaturedEngineers);
router.get('/search', engineerController.searchEngineers);

router.get(
  '/:id',
  optionalAuth,
  engineerController.getEngineerById
);

router.get(
  '/:id/designs',
  engineerController.getEngineerDesigns
);

router.get(
  '/:id/reviews',
  engineerController.getEngineerReviews
);

router.get(
  '/:id/stats',
  engineerController.getEngineerStats
);

module.exports = router;