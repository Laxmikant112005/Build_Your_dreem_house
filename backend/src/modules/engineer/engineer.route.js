/**
 * BuildMyHome - Engineer Routes
 * API routes for engineer endpoints
 */

const express = require('express');
const router = express.Router();

const engineerController = require('./engineer.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const { ROLE } = require('../../constants/roles');
const engineerValidator = require('./engineer.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// Public routes (no authentication required)
router.get('/', engineerController.getEngineers);
router.get('/featured', engineerController.getFeaturedEngineers);
router.get('/search', engineerController.searchEngineers);
router.get('/:id', optionalAuth, engineerController.getEngineerById);
router.get('/:id/designs', engineerController.getEngineerDesigns);
router.get('/:id/reviews', engineerController.getEngineerReviews);
router.get('/:id/stats', engineerController.getEngineerStats);

// Protected routes (authentication required)
// Engineer-specific `/me/*` routes (must be before the dynamic /:id routes)
router.get('/me/dashboard', authenticate, authorize(ROLE.ENGINEER), engineerController.getEngineerDashboard);
router.get('/me/verification', authenticate, engineerController.getVerificationStatus);
router.post('/me/verification/submit', authenticate, validateJoi(engineerValidator.submitVerification, 'body'), engineerController.submitVerification);

// Engineer can update their own profile
router.put('/profile', authenticate, validateJoi(engineerValidator.updateProfile, 'body'), engineerController.updateEngineerProfile);
router.put('/availability', authenticate, validateJoi(engineerValidator.updateAvailability, 'body'), engineerController.updateAvailability);

// Portfolio management
router.post('/portfolio', authenticate, validateJoi(engineerValidator.addPortfolio, 'body'), engineerController.addPortfolioItem);
router.delete('/portfolio/:portfolioId', authenticate, engineerController.removePortfolioItem);

module.exports = router;

