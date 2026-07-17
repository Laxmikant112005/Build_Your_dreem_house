/**
 * AntiGravity - Science Routes
 */

const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const scienceController = require('./science.controller');
const { ROLE } = require('../../constants/roles');

const router = express.Router();

/**
 * @route   GET /api/v1/science/modules
 * @desc    Get all educational modules
 * @access  Public
 */
router.get(
  '/modules',
  scienceController.getScienceModules
);

/**
 * @route   GET /api/v1/science/:topicId
 * @desc    Get specific module details
 * @access  Public
 */
router.get(
  '/:topicId',
  scienceController.getScienceModule
);

/**
 * @route   POST /api/v1/science/modules
 * @desc    Create or update science module
 * @access  Private (Scientist or Admin)
 */
router.post(
  '/modules',
  authenticate,
  authorize(ROLE.SCIENTIST, ROLE.ADMIN),
  scienceController.upsertScienceModule
);

module.exports = router;
