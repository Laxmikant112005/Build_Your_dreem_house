/**
 * Planova - Recently Viewed Model
 * Tracks user browsing history for blueprints, engineers, plots
 */

const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Polymorphic reference
    itemType: {
      type: String,
      enum: ['blueprint', 'engineer', 'plot', 'collection'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      enum: ['Blueprint', 'User', 'Plot', 'Collection'],
      required: true,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    thumbnail: {
      type: String,
    },
    // Context for recommendations
    context: {
      source: { type: String, enum: ['search', 'recommendation', 'browse', 'direct_link', 'compare'] },
      searchQuery: String,
      filters: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes: keep last 50 per user, per type
recentlyViewedSchema.index({ userId: 1, itemType: 1, createdAt: -1 });
recentlyViewedSchema.index({ userId: 1, createdAt: -1 });
recentlyViewedSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

// Static: Add or update a view
recentlyViewedSchema.statics.track = async function (userId, itemType, itemId, data = {}) {
  const itemModelMap = {
    blueprint: 'Blueprint',
    engineer: 'User',
    plot: 'Plot',
    collection: 'Collection',
  };

  if (!itemModelMap[itemType]) throw new Error(`Invalid itemType: ${itemType}`);

  await this.findOneAndUpdate(
    { userId, itemType, itemId },
    {
      $set: {
        userId,
        itemType,
        itemId,
        itemModel: itemModelMap[itemType],
        title: data.title || '',
        thumbnail: data.thumbnail || '',
        context: data.context || {},
      },
      $currentDate: { createdAt: true },
    },
    { upsert: true, new: true }
  );

  // Keep only the most recent 50 per user per type
  const count = await this.countDocuments({ userId, itemType });
  if (count > 50) {
    const oldest = await this.find({ userId, itemType })
      .sort({ createdAt: -1 })
      .skip(50)
      .limit(count - 50)
      .select('_id');
    if (oldest.length > 0) {
      await this.deleteMany({ _id: { $in: oldest.map(o => o._id) } });
    }
  }
};

// Static: Get recently viewed for a user
recentlyViewedSchema.statics.getRecent = async function (userId, itemType = null, limit = 20) {
  const query = { userId };
  if (itemType) query.itemType = itemType;
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('itemId');
};

const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);

module.exports = RecentlyViewed;

