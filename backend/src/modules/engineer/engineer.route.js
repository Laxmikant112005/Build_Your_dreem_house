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
// Engineer can update their own profile
router.put('/profile', authenticate, validateJoi(engineerValidator.createProfile, 'body'), engineerController.updateEngineerProfile);
router.put('/availability', authenticate, validateJoi(engineerValidator.availability, 'body'), engineerController.updateAvailability);

// Portfolio management
router.post('/portfolio', authenticate, validateJoi(engineerValidator.createProfile, 'body'), engineerController.addPortfolioItem);
router.delete('/portfolio/:portfolioId', authenticate, engineerController.removePortfolioItem);

module.exports = router;

