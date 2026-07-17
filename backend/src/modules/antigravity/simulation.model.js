/**
 * AntiGravity - Simulation Model
 */

const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gravityIntensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },
    fieldVectors: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 0 },
    },
    energyConsumption: {
      type: Number,
      default: 0,
    },
    stabilityMetrics: {
      type: Number,
      min: 0,
      max: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'stopped'],
      default: 'stopped',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
simulationSchema.index({ userId: 1 });
simulationSchema.index({ status: 1 });

const Simulation = mongoose.model('Simulation', simulationSchema);

module.exports = Simulation;
