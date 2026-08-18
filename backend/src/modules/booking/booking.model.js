/**
 * BuildMyHome - Booking Model
 * Mongoose schema for bookings
 * 
 * AI-READY: Includes aiMetadata and costPredictions fields
 * for future ML integrations (schedule optimization, pricing prediction, risk assessment)
 */

const mongoose = require('mongoose');
const {
  BOOKING_STATUS,
  BOOKING_TYPE,
  MEETING_TYPE,
  AI_PROVIDERS,
} = require('../../constants/enums');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
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
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    type: {
      type: String,
      enum: Object.values(BOOKING_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    // Booking time window
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    meetingType: {
      type: String,
      enum: Object.values(MEETING_TYPE),
      default: MEETING_TYPE.VIDEO,
    },
    meetingLink: {
      type: String,
    },
    location: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    projectDetails: {
      landSize: Number,
      budget: Number,
      requirements: String,
      timeline: String,
    },
    pricing: {
      consultationFee: {
        type: Number,
        default: 0,
      },
      designFee: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    timeline: {
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      confirmedAt: Date,
      startedAt: Date,
      completedAt: Date,
      cancelledAt: Date,
      cancellationReason: String,
    },
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    notes: {
      type: String,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    internalNotes: {
      type: String,
    },
    // --- AI-READY FIELDS ---
    aiMetadata: {
      riskScore: { type: Number, min: 0, max: 1 },
      scheduleConflictScore: { type: Number, min: 0, max: 1 },
      noShowProbability: { type: Number, min: 0, max: 1 },
      estimatedCompletionConfidence: { type: Number, min: 0, max: 1 },
      autoSuggestedSlots: [{
        start: Date,
        end: Date,
        confidence: { type: Number, min: 0, max: 1 },
      }],
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
    costPredictions: {
      predictedFinalCost: { type: Number },
      costOverrunRisk: { type: Number, min: 0, max: 1 },
      confidence: { type: Number, min: 0, max: 1 },
      lastCalculatedAt: { type: Date },
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
// `bookingId` field is unique on the schema; avoid creating a duplicate index here
bookingSchema.index({ userId: 1 });
bookingSchema.index({ engineerId: 1 });
bookingSchema.index({ designId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startAt: 1 });
bookingSchema.index({ endAt: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ meetingType: 1 });
bookingSchema.index({ 'pricing.totalAmount': 1 });

// Compound indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ engineerId: 1, status: 1 });
bookingSchema.index({ engineerId: 1, startAt: 1 });
bookingSchema.index({ engineerId: 1, startAt: 1, endAt: 1 });
bookingSchema.index({ engineerId: 1, status: 1, startAt: 1 });
bookingSchema.index({ status: 1, startAt: 1, endAt: 1 });
bookingSchema.index({ assignedAdmin: 1, status: 1 });

// AI-related indexes
bookingSchema.index({ 'aiMetadata.riskScore': -1 });
bookingSchema.index({ 'aiMetadata.noShowProbability': -1 });
bookingSchema.index({ 'costPredictions.costOverrunRisk': -1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await this.constructor.countDocuments();
    this.bookingId = `BMH-${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Static method to generate booking ID
bookingSchema.statics.generateBookingId = async function () {
  const count = await this.countDocuments();
  return `BMH-${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
};

// Virtual for user
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for engineer
bookingSchema.virtual('engineer', {
  ref: 'User',
  localField: 'engineerId',
  foreignField: '_id',
  justOne: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

