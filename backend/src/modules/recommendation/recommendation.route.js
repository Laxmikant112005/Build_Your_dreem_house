/**
 * Planova - Recommendation Routes
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('./recommendation.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/', authenticate, recommendationController.getRecommendations);
router.get('/similar/:id', recommendationController.findSimilar);
router.get('/estimate/:id', recommendationController.estimateCost);

module.exports = router;

