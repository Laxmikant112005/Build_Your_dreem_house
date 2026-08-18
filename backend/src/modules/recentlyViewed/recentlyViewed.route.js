/**
 * Planova - Recently Viewed Routes
 */

const express = require('express');
const router = express.Router();
const recentlyViewedController = require('./recentlyViewed.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);
router.get('/', recentlyViewedController.getRecentlyViewed);
router.post('/', recentlyViewedController.trackView);

module.exports = router;

