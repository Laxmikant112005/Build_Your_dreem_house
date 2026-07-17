/**
 * AntiGravity - Model Specification Model
 */

const mongoose = require('mongoose');

const modelSpecSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Gemini Flash',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    specifications: [{
      label: String,
      value: String,
    }],
    benefits: [String],
    useCases: [String],
    technicalMetadata: {
      dimensions: { x: Number, y: Number, z: Number },
      weight: Number,
      maxThrust: Number,
    },
  },
  {
    timestamps: true,
  }
);

const ModelSpec = mongoose.model('ModelSpec', modelSpecSchema);

module.exports = ModelSpec;
