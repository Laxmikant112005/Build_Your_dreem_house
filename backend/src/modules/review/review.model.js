/**
 * BuildMyHome - Review Model
 * Mongoose schema for reviews
 * 
 * AI-READY: Includes aiMetadata, vectorEmbeddingsRef fields
 * for future ML integrations (sentiment analysis, fake review detection, etc.)
 */

const mongoose = require('mongoose');
const {
  REVIEW_RATINGS,
  REVIEW_STATUS,
  AI_PROVIDERS,
} = require('../../constants/enums');

const reviewSchema = new mongoose.Schema(
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
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [REVIEW_RATINGS.MIN, `Rating must be at least ${REVIEW_RATINGS.MIN}`],
      max: [REVIEW_RATINGS.MAX, `Rating cannot exceed ${REVIEW_RATINGS.MAX}`],
    },
    // Optional category-specific ratings
    designRating: {
      type: Number,
      min: [REVIEW_RATINGS.MIN, `Rating must be at least ${REVIEW_RATINGS.MIN}`],
      max: [REVIEW_RATINGS.MAX, `Rating cannot exceed ${REVIEW_RATINGS.MAX}`],
    },
    communicationRating: {
      type: Number,
      min: [REVIEW_RATINGS.MIN, `Rating must be at least ${REVIEW_RATINGS.MIN}`],
      max: [REVIEW_RATINGS.MAX, `Rating cannot exceed ${REVIEW_RATINGS.MAX}`],
    },
    completionTimeRating: {
      type: Number,
      min: [REVIEW_RATINGS.MIN, `Rating must be at least ${REVIEW_RATINGS.MIN}`],
      max: [REVIEW_RATINGS.MAX, `Rating cannot exceed ${REVIEW_RATINGS.MAX}`],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [{
      url: String,
      caption: String,
    }],
    pros: [{
      type: String,
      maxlength: [50, 'Pro item cannot exceed 50 characters'],
    }],
    cons: [{
      type: String,
      maxlength: [50, 'Con item cannot exceed 50 characters'],
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    response: {
      message: String,
      respondedAt: Date,
    },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.PENDING,
    },
    rejectionReason: String,
    // --- AI-READY FIELDS ---
    aiMetadata: {
      sentimentScore: { type: Number, min: -1, max: 1 },
      authenticityScore: { type: Number, min: 0, max: 1 },
      helpfulnessPrediction: { type: Number, min: 0, max: 1 },
      autoFlags: [String],
      suggestedResponse: { type: String },
      categoryTags: [String],
      isVerifiedPurchase: { type: Boolean, default: false },
      lastProcessedAt: { type: Date },
    },
    vectorEmbeddingsRef: {
      provider: {
        type: String,
        enum: Object.values(AI_PROVIDERS),
      },
      embeddingId: { type: String },
      lastSyncedAt: { type: Date },
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
reviewSchema.index({ userId: 1 });
reviewSchema.index({ engineerId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ designId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound indexes
reviewSchema.index({ engineerId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ engineerId: 1, rating: 1 });
reviewSchema.index({ designId: 1, status: 1, rating: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, status: 1 });
reviewSchema.index({ isHelpful: -1 });

// AI-related indexes
reviewSchema.index({ 'aiMetadata.sentimentScore': 1 });
reviewSchema.index({ 'aiMetadata.authenticityScore': -1 });
reviewSchema.index({ 'aiMetadata.autoFlags': 1 });
// Ensure one review per user per booking or per design
// Unique per booking when bookingId exists
reviewSchema.index(
  { userId: 1, bookingId: 1 },
  { unique: true, partialFilterExpression: { bookingId: { $exists: true } } }
);
// Unique per design when designId exists
reviewSchema.index(
  { userId: 1, designId: 1 },
  { unique: true, partialFilterExpression: { designId: { $exists: true } } }
);

// Static method to calculate average rating for engineer
reviewSchema.statics.calculateAverageRating = async function (engineerId) {
  // `engineerId` may arrive as a raw hex string (caller) OR as a Mongoose
  // ObjectId (post('save')/post('remove') middleware passes `this.engineerId`,
  // which is an ObjectId instance). createFromHexString only accepts a string,
  // so normalize both forms here to avoid "hex string must be 24 characters".
  const engineerObjectId =
    typeof engineerId === 'string'
      ? mongoose.Types.ObjectId.createFromHexString(engineerId)
      : engineerId;

  const result = await this.aggregate([
    {
      $match: {
        engineerId: engineerObjectId,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: '$engineerId',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    const { average, count } = result[0];
    await mongoose.model('User').findByIdAndUpdate(engineerId, {
      'engineerProfile.rating': {
        average: Math.round(average * 10) / 10,
        count,
      },
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(engineerId, {
      'engineerProfile.rating': {
        average: 0,
        count: 0,
      },
    });
  }

  return result[0] || { average: 0, count: 0 };
};

// Post-save middleware to update engineer rating
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.engineerId);
});

// Post-remove middleware to update engineer rating
reviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.engineerId);
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.isHelpful += 1;
    await this.save();
  }
  return this;
};

// Pre-save: if category ratings provided and overall rating missing, compute average
reviewSchema.pre('save', function (next) {
  if ((this.designRating || this.communicationRating || this.completionTimeRating) && !this.rating) {
    const vals = [];
    if (this.designRating) vals.push(this.designRating);
    if (this.communicationRating) vals.push(this.communicationRating);
    if (this.completionTimeRating) vals.push(this.completionTimeRating);
    if (vals.length > 0) {
      const sum = vals.reduce((s, v) => s + v, 0);
      this.rating = Math.round((sum / vals.length) * 10) / 10;
    }
  }
  next();
});

// Method to add response
reviewSchema.methods.addResponse = async function (message) {
  this.response = {
    message,
    respondedAt: new Date(),
  };
  await this.save();
  return this;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

