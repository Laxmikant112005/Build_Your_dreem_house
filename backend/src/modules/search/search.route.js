/**
 * BuildMyHome - Global Search Routes
 */

const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All search routes require authentication
router.use(authenticate);

// Global search endpoint
router.get('/', searchController.globalSearch);

// Search suggestions endpoint
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;

