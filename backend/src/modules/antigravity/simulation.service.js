/**
 * AntiGravity - Simulation Service
 * Handles core simulation calculations and state management.
 */

const Simulation = require('./simulation.model');
const { getIO } = require('../../sockets');
const logger = require('../../utils/logger');

class SimulationService {
  /**
   * Calculate derived simulation values
   */
  calculateState(intensity, vectors) {
    // Basic formulas for demonstration
    const energyConsumption = (intensity * Math.abs(vectors.y)) * 0.85;
    const stabilityMetrics = Math.max(0, 1 - (intensity / 150) - (Math.abs(vectors.x + vectors.z) / 10));

    return {
      energyConsumption: Number(energyConsumption.toFixed(2)),
      stabilityMetrics: Number(stabilityMetrics.toFixed(2)),
    };
  }

  /**
   * Update simulation state and broadcast to user
   */
  async updateSimulation(userId, params) {
    const { intensity, vectors } = params;

    const { energyConsumption, stabilityMetrics } = this.calculateState(intensity, vectors);

    const simulation = await Simulation.findOneAndUpdate(
      { userId },
      {
        gravityIntensity: intensity,
        fieldVectors: vectors,
        energyConsumption,
        stabilityMetrics,
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    // Broadcast to user's room
    const io = getIO();
    io.to(`user:${userId}`).emit('simulation-update', {
      gravityIntensity: simulation.gravityIntensity,
      fieldVectors: simulation.fieldVectors,
      energyConsumption: simulation.energyConsumption,
      stabilityMetrics: simulation.stabilityMetrics,
      status: simulation.status,
      timestamp: simulation.lastUpdated,
    });

    return simulation;
  }

  /**
   * Toggle simulation status
   */
  async toggleSimulation(userId, status) {
    const simulation = await Simulation.findOneAndUpdate(
      { userId },
      { status },
      { new: true, upsert: true }
    );

    const io = getIO();
    io.to(`user:${userId}`).emit('simulation-status-changed', {
      status: simulation.status,
      userId,
    });

    return simulation;
  }

  /**
   * Get current simulation state
   */
  async getSimulationState(userId) {
    return await Simulation.findOne({ userId });
  }
}

module.exports = new SimulationService();
