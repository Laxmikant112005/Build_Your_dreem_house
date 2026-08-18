/**
 * Planova - Collection / Wishlist Model
 * Folder-based collections for saving blueprints, engineers, and plots
 */

const mongoose = require('mongoose');
const { COLLECTION_VISIBILITY } = require('../../constants/enums');

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    visibility: {
      type: String,
      enum: Object.values(COLLECTION_VISIBILITY),
      default: COLLECTION_VISIBILITY.PRIVATE,
    },
    // Items stored as references
    items: {
      blueprints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blueprint',
      }],
      engineers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      plots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plot',
      }],
      materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      }],
    },
    coverImage: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });
collectionSchema.index({ userId: 1, isDefault: 1 });
collectionSchema.index({ userId: 1, sortOrder: 1 });
collectionSchema.index({ 'items.blueprints': 1 });
collectionSchema.index({ 'items.engineers': 1 });
collectionSchema.index({ 'items.plots': 1 });
collectionSchema.index({ visibility: 1 });

// Static: Get or create default collection for a user
collectionSchema.statics.getDefault = async function (userId) {
  let coll = await this.findOne({ userId, isDefault: true });
  if (!coll) {
    coll = await this.create({
      userId,
      name: 'Favorites',
      description: 'Default favorites collection',
      isDefault: true,
    });
  }
  return coll;
};

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;

