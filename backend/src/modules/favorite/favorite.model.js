/**
 * Planova - Favorite Model
 * Mongoose schema for user favorites (supports both legacy Design and Blueprint)
 */

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    blueprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blueprint',
    },
    plotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plot',
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per user per item type
favoriteSchema.index({ userId: 1, designId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, blueprintId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, plotId: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ userId: 1, collectionId: 1 });
favoriteSchema.index({ blueprintId: 1 });
favoriteSchema.index({ designId: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

