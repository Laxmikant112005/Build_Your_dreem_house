/**
 * Planova - Follow Model
 * User follows/bookmarks engineers
 */

const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notifyOnAvailability: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ userId: 1, engineerId: 1 }, { unique: true });
followSchema.index({ engineerId: 1 });

followSchema.statics.isFollowing = async function (userId, engineerId) {
  const existing = await this.findOne({ userId, engineerId });
  return !!existing;
};

followSchema.statics.toggle = async function (userId, engineerId) {
  const existing = await this.findOne({ userId, engineerId });
  if (existing) {
    await this.findByIdAndDelete(existing._id);
    return { following: false };
  }
  await this.create({ userId, engineerId });
  return { following: true };
};

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;

