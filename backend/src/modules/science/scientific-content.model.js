/**
 * AntiGravity - Scientific Content Model
 */

const mongoose = require('mongoose');

const scientificContentSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      unique: true,
      trim: true,
    },
    equations: [{
      type: String,
    }],
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    visualReferences: [{
      type: String, // URLs or asset paths
    }],
    sections: [{
      title: String,
      content: String,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// `topic` field is unique at schema level; avoid creating duplicate index here

const ScientificContent = mongoose.model('ScientificContent', scientificContentSchema);

module.exports = ScientificContent;
