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

const {
  validateJoi,
} = require('../../middleware/joi.middleware');

/*
 * ============================================================
 * PROTECTED /ME ROUTES
 * ============================================================
 *
 * These routes MUST remain before /:id routes.
 */

/**
 * Engineer dashboard
 *
 * Requires:
 * - valid JWT
 * - engineer role
 *
 * Verification is intentionally NOT required here.
 */
router.get(
  '/me/dashboard',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.getEngineerDashboard
);

/**
 * Engineer verification status
 */
router.get(
  '/me/verification',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.getVerificationStatus
);

/**
 * Submit engineer verification
 */
router.post(
  '/me/verification/submit',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(
    engineerValidator.submitVerification,
    'body'
  ),
  engineerController.submitVerification
);

/*
 * ============================================================
 * ENGINEER PROFILE
 * ============================================================
 */

/**
 * Update engineer profile
 */
router.put(
  '/profile',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(
    engineerValidator.updateProfile,
    'body'
  ),
  engineerController.updateEngineerProfile
);

/**
 * Update engineer availability
 */
router.put(
  '/availability',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(
    engineerValidator.updateAvailability,
    'body'
  ),
  engineerController.updateAvailability
);

/*
 * ============================================================
 * PORTFOLIO
 * ============================================================
 */

/**
 * Add portfolio item
 */
router.post(
  '/portfolio',
  authenticate,
  authorize(ROLE.ENGINEER),
  validateJoi(
    engineerValidator.addPortfolio,
    'body'
  ),
  engineerController.addPortfolioItem
);

/**
 * Remove portfolio item
 */
router.delete(
  '/portfolio/:portfolioId',
  authenticate,
  authorize(ROLE.ENGINEER),
  engineerController.removePortfolioItem
);

/*
 * ============================================================
 * PUBLIC ENGINEER ROUTES
 * ============================================================
 */

router.get(
  '/',
  engineerController.getEngineers
);

router.get(
  '/featured',
  engineerController.getFeaturedEngineers
);

router.get(
  '/search',
  engineerController.searchEngineers
);

/*
 * ============================================================
 * DYNAMIC ENGINEER ROUTES
 * ============================================================
 *
 * Keep these AFTER /me routes.
 */

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