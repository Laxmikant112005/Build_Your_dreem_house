/**
 * Planova - Appointment Model
 * Mongoose schema for engineer-client appointment scheduling.
 * Replaces legacy Booking model with full lifecycle states,
 * slot management, meeting modes, and AI metadata.
 */

const mongoose = require('mongoose');
const {
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
  APPOINTMENT_MODE,
  AI_PROVIDERS,
} = require('../../constants/enums');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
    },
    // Core participants
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blueprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blueprint',
    },
    plotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plot',
    },
    // Appointment details
    type: {
      type: String,
      enum: Object.values(APPOINTMENT_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    // Time window
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
    // Meeting configuration
    mode: {
      type: String,
      enum: Object.values(APPOINTMENT_MODE),
      default: APPOINTMENT_MODE.VIDEO,
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
      notes: String,
    },
    // Pricing (if applicable)
    pricing: {
      consultationFee: { type: Number, default: 0 },
      siteVisitFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isPaid: { type: Boolean, default: false },
    },
    // Timeline tracking
    timeline: {
      requestedAt: { type: Date, default: Date.now },
      acceptedAt: Date,
      rescheduledAt: Date,
      rescheduleReason: String,
      startedAt: Date,
      completedAt: Date,
      cancelledAt: Date,
      cancelledBy: {
        type: String,
        enum: ['client', 'engineer', 'system', null],
      },
      cancellationReason: String,
      noShowAt: Date,
    },
    // Client notes
    notes: {
      clientNotes: { type: String, maxlength: 2000 },
      engineerNotes: { type: String, maxlength: 2000 },
      internalNotes: { type: String, maxlength: 2000 },
    },
    // Chat room associated with this appointment
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    // Feedback after completion
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 1000 },
      submittedAt: Date,
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
      provider: { type: String, enum: Object.values(AI_PROVIDERS) },
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

// ===================================================================
// INDEXES
// ===================================================================
appointmentSchema.index({ clientId: 1 });
appointmentSchema.index({ engineerId: 1 });
appointmentSchema.index({ blueprintId: 1 });
appointmentSchema.index({ plotId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ mode: 1 });
appointmentSchema.index({ startAt: 1 });
appointmentSchema.index({ endAt: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound indexes
appointmentSchema.index({ clientId: 1, status: 1 });
appointmentSchema.index({ clientId: 1, startAt: -1 });
appointmentSchema.index({ engineerId: 1, status: 1 });
appointmentSchema.index({ engineerId: 1, startAt: 1 });
appointmentSchema.index({ engineerId: 1, startAt: 1, endAt: 1 });
appointmentSchema.index({ engineerId: 1, status: 1, startAt: 1 });
appointmentSchema.index({ status: 1, startAt: 1, endAt: 1 });
appointmentSchema.index({ blueprintId: 1, status: 1 });
appointmentSchema.index({ blueprintId: 1, engineerId: 1 });

// Slot availability queries
appointmentSchema.index({ engineerId: 1, startAt: 1, status: 1 });

// AI-related indexes
appointmentSchema.index({ 'aiMetadata.riskScore': -1 });
appointmentSchema.index({ 'aiMetadata.noShowProbability': -1 });

// ===================================================================
// PRE-SAVE HOOKS
// ===================================================================
appointmentSchema.pre('save', async function (next) {
  // Generate unique appointment ID
  if (!this.appointmentId) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APPT-${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
  }

  // Auto-calculate duration if not set
  if (this.startAt && this.endAt && !this.duration) {
    this.duration = Math.round((this.endAt.getTime() - this.startAt.getTime()) / 60000);
  }

  // Set timeline timestamps based on status transitions
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case APPOINTMENT_STATUS.ACCEPTED:
        if (!this.timeline.acceptedAt) this.timeline.acceptedAt = now;
        break;
      case APPOINTMENT_STATUS.RESCHEDULED:
        if (!this.timeline.rescheduledAt) this.timeline.rescheduledAt = now;
        break;
      case APPOINTMENT_STATUS.IN_PROGRESS:
        if (!this.timeline.startedAt) this.timeline.startedAt = now;
        break;
      case APPOINTMENT_STATUS.COMPLETED:
        if (!this.timeline.completedAt) this.timeline.completedAt = now;
        break;
      case APPOINTMENT_STATUS.CANCELLED:
        if (!this.timeline.cancelledAt) this.timeline.cancelledAt = now;
        break;
      case APPOINTMENT_STATUS.NO_SHOW:
        if (!this.timeline.noShowAt) this.timeline.noShowAt = now;
        break;
    }
  }

  next();
});

// ===================================================================
// STATIC METHODS
// ===================================================================
/**
 * Check for time slot conflicts for an engineer
 */
appointmentSchema.statics.findConflicts = async function (engineerId, startAt, endAt, excludeId = null) {
  const query = {
    engineerId,
    status: {
      $in: [
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.ACCEPTED,
        APPOINTMENT_STATUS.IN_PROGRESS,
      ],
    },
    $and: [
      { startAt: { $lt: endAt } },
      { endAt: { $gt: startAt } },
    ],
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return this.find(query).select('startAt endAt appointmentId status');
};

/**
 * Get available time slots for an engineer on a given date
 */
appointmentSchema.statics.getAvailableSlots = async function (engineerId, date, durationMinutes = 60) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all booked slots for the day
  const bookedSlots = await this.find({
    engineerId,
    status: {
      $in: [
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.ACCEPTED,
        APPOINTMENT_STATUS.IN_PROGRESS,
      ],
    },
    $and: [
      { startAt: { $lt: endOfDay } },
      { endAt: { $gt: startOfDay } },
    ],
  }).select('startAt endAt');

  // Generate hourly slots (9:00 AM to 6:00 PM)
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    const slotStart = new Date(startOfDay);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    // Check if slot overlaps any booked slot
    const isBooked = bookedSlots.some(
      (b) => slotStart < b.endAt && b.startAt < slotEnd
    );

    slots.push({
      startAt: slotStart,
      endAt: slotEnd,
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: !isBooked,
    });
  }

  return slots;
};

// ===================================================================
// INSTANCE METHODS
// ===================================================================
appointmentSchema.methods.canCancel = function (userId) {
  const cancellableStatuses = [
    APPOINTMENT_STATUS.PENDING,
    APPOINTMENT_STATUS.ACCEPTED,
    APPOINTMENT_STATUS.RESCHEDULED,
  ];
  return cancellableStatuses.includes(this.status);
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

