/**
 * Planova - Construction Monitoring Model
 * Mongoose schema for tracking construction progress
 */
const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  weather: { type: String },
  temperature: { type: String },
  workersPresent: { type: Number, min: 0 },
  hoursWorked: { type: Number, min: 0 },
  description: { type: String, maxlength: 2000 },
  photos: [{ url: String, caption: String, uploadedAt: { type: Date, default: Date.now } }],
  notes: { type: String, maxlength: 1000 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  order: { type: Number, required: true },
  description: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'delayed'], default: 'pending' },
  startDate: Date,
  endDate: Date,
  actualEndDate: Date,
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  photos: [{ url: String, caption: String }],
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  stageIndex: { type: Number },
  description: { type: String, maxlength: 500 },
  targetDate: { type: Date },
  completedDate: Date,
  status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], required: true },
  period: { start: Date, end: Date },
  summary: { type: String, maxlength: 3000 },
  metrics: {
    progressAchieved: { type: Number, min: 0, max: 100 },
    delays: { type: Number, default: 0 },
    budgetConsumed: { type: Number, min: 0 },
    issuesReported: { type: Number, default: 0 },
  },
  photos: [String],
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const constructionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stages: [stageSchema],
  milestones: [milestoneSchema],
  dailyLogs: [dailyLogSchema],
  reports: [reportSchema],
  startDate: { type: Date },
  estimatedEndDate: { type: Date },
  actualEndDate: { type: Date },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'on_hold', 'completed', 'delayed'],
    default: 'not_started',
  },
  delayAlerts: [{
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
    date: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; } },
});

// Indexes
constructionSchema.index({ projectId: 1, userId: 1 });
constructionSchema.index({ status: 1 });
constructionSchema.index({ overallProgress: -1 });

// Virtual: days elapsed
constructionSchema.virtual('daysElapsed').get(function () {
  if (!this.startDate) return 0;
  return Math.floor((Date.now() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual: days remaining
constructionSchema.virtual('daysRemaining').get(function () {
  if (!this.estimatedEndDate) return null;
  const rem = Math.floor((this.estimatedEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return rem > 0 ? rem : 0;
});

// Pre-save: auto-calculate overall progress
constructionSchema.pre('save', function (next) {
  if (this.stages.length > 0) {
    const total = this.stages.reduce((s, st) => s + (st.progressPercent || 0), 0);
    this.overallProgress = Math.round(total / this.stages.length);
  }
  // Auto-detect delays
  this.milestones.forEach(m => {
    if (m.status === 'pending' && m.targetDate && m.targetDate < new Date()) {
      m.status = 'overdue';
    }
  });
  // Update status
  if (this.overallProgress >= 100) this.status = 'completed';
  else if (this.overallProgress > 0) this.status = 'in_progress';
  next();
});

const Construction = mongoose.model('Construction', constructionSchema);
module.exports = Construction;

