/**
 * AntiGravity - Model Info Routes
 */

const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const modelInfoController = require('./model-info.controller');
const { ROLE } = require('../../constants/roles');

const router = express.Router();

/**
 * @route   GET /api/v1/model-info/specs
 * @desc    Get model technical specifications
 * @access  Public
 */
router.get(
  '/specs',
  modelInfoController.getModelSpecs
);

/**
 * @route   PATCH /api/v1/model-info/specs
 * @desc    Update model specifications
 * @access  Private (Admin)
 */
router.patch(
  '/specs',
  authenticate,
  authorize(ROLE.ADMIN),
  modelInfoController.updateModelSpecs
);

module.exports = router;
