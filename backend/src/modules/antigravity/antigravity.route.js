/**
 * AntiGravity - Simulation Routes
 */

const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const antigravityController = require('./antigravity.controller');
const { ROLE } = require('../../constants/roles');

const router = express.Router();

/**
 * @route   GET /api/v1/antigravity/simulation/state
 * @desc    Get current simulation state
 * @access  Private
 */
router.get(
  '/simulation/state',
  authenticate,
  antigravityController.getSimulationState
);

/**
 * @route   PATCH /api/v1/antigravity/simulation/control
 * @desc    Adjust simulation parameters
 * @access  Private (Operator or Admin)
 */
router.patch(
  '/simulation/control',
  authenticate,
  authorize(ROLE.OPERATOR, ROLE.ADMIN),
  antigravityController.controlSimulation
);

/**
 * @route   POST /api/v1/antigravity/simulation/toggle
 * @desc    Start or stop simulation
 * @access  Private (Operator or Admin)
 */
router.post(
  '/simulation/toggle',
  authenticate,
  authorize(ROLE.OPERATOR, ROLE.ADMIN),
  antigravityController.toggleSimulation
);

/**
 * @route   GET /api/v1/antigravity/3d/metadata
 * @desc    Get 3D visualization metadata
 * @access  Public/Private
 */
router.get(
  '/3d/metadata',
  antigravityController.get3DMetadata
);

module.exports = router;
