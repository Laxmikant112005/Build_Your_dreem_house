/**
 * Planova - Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Protected routes
router.get('/', authenticate, dashboardController.getDashboard);

module.exports = router;

