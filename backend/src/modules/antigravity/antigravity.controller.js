/**
 * AntiGravity - Simulation Controller
 */

const simulationService = require('./simulation.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * Get current simulation state
 */
const getSimulationState = catchAsync(async (req, res) => {
  const state = await simulationService.getSimulationState(req.user.id);
  res.status(200).json(new ApiResponse(200, state, 'Simulation state fetched successfully'));
});

/**
 * Control simulation parameters
 */
const controlSimulation = catchAsync(async (req, res) => {
  const { intensity, vectors } = req.body;
  const simulation = await simulationService.updateSimulation(req.user.id, { intensity, vectors });
  res.status(200).json(new ApiResponse(200, simulation, 'Simulation parameters updated'));
});

/**
 * Toggle simulation status
 */
const toggleSimulation = catchAsync(async (req, res) => {
  const { status } = req.body;
  const simulation = await simulationService.toggleSimulation(req.user.id, status);
  res.status(200).json(new ApiResponse(200, simulation, `Simulation ${status}`));
});

/**
 * Get 3D visualization metadata
 */
const get3DMetadata = catchAsync(async (req, res) => {
  // Metadata for Three.js rendering
  const metadata = {
    geometry: {
      type: 'BufferGeometry',
      vertices: 1200,
      indices: 2400,
    },
    materials: [
      { name: 'GlowMaterial', color: '#00f2ff', intensity: 1.5 },
      { name: 'CoreMaterial', color: '#ffffff', opacity: 0.8 },
    ],
    animationKeys: ['hover', 'pulse', 'field-ripple'],
  };
  res.status(200).json(new ApiResponse(200, metadata, '3D visualization metadata fetched'));
});

module.exports = {
  getSimulationState,
  controlSimulation,
  toggleSimulation,
  get3DMetadata,
};
