/**
 * Planova - Project Model
 * Mongoose schema for User construction projects.
 * Projects act as independent workspaces for managing construction
 * activities, budgets, timelines, documents, and team members.
 */

const mongoose = require('mongoose');
const { AI_PROVIDERS } = require('../../constants/enums');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // Link to plot/property
    plotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plot',
    },
    // Link to chosen design/blueprint
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    blueprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blueprint',
    },
    // Assigned engineer
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Project status
    status: {
      type: String,
      enum: [
        'planning',
        'design_approval',
        'permit_pending',
        'construction_ready',
        'under_construction',
        'on_hold',
        'completed',
        'cancelled',
      ],
      default: 'planning',
    },
    // Budget tracking
    budget: {
      estimated: { type: Number, min: 0, default: 0 },
      current: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    // Timeline
    timeline: {
      startDate: Date,
      estimatedEndDate: Date,
      actualEndDate: Date,
    },
    // Construction details
    construction: {
      totalArea: { type: Number, min: 0 }, // sq.ft
      floors: { type: Number, min: 1, default: 1 },
      bedrooms: { type: Number, min: 0, default: 0 },
      bathrooms: { type: Number, min: 0, default: 0 },
    },
    // Progress tracking
    progress: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      stages: [
        {
          name: { type: String, required: true },
          percentage: { type: Number, min: 0, max: 100, default: 0 },
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'delayed'],
            default: 'pending',
          },
          startDate: Date,
          endDate: Date,
          notes: String,
        },
      ],
    },
    // Team members (invited users)
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'engineer', 'contractor', 'viewer'],
          default: 'viewer',
        },
        invitedAt: { type: Date, default: Date.now },
        acceptedAt: Date,
      },
    ],
    // Milestones
    milestones: [
      {
        title: { type: String, required: true, maxlength: 200 },
        description: { type: String, maxlength: 500 },
        dueDate: Date,
        completedDate: Date,
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'overdue'],
          default: 'pending',
        },
        budgetAllocated: { type: Number, min: 0 },
        budgetSpent: { type: Number, min: 0 },
      },
    ],
    // Documents (non-engineering)
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String }, // pdf, image, doc
        category: {
          type: String,
          enum: ['land_record', 'legal', 'quotation', 'agreement', 'bill', 'receipt', 'other'],
          default: 'other',
        },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Activity feed
    activities: [
      {
        action: { type: String, required: true },
        description: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // --- AI-READY FIELDS ---
    aiMetadata: {
      riskScore: { type: Number, min: 0, max: 1 },
      budgetOverrunRisk: { type: Number, min: 0, max: 1 },
      timelineDelayRisk: { type: Number, min: 0, max: 1 },
      predictedCompletionDate: Date,
      lastAnalyzedAt: Date,
    },
    vectorEmbeddingsRef: {
      provider: { type: String, enum: Object.values(AI_PROVIDERS) },
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
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ engineerId: 1 });
projectSchema.index({ plotId: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isActive: 1, userId: 1 });

// Pre-save: auto-calculate progress from stages
projectSchema.pre('save', function (next) {
  if (this.progress?.stages?.length > 0) {
    const total = this.progress.stages.reduce((sum, s) => sum + s.percentage, 0);
    this.progress.percentage = Math.min(
      100,
      Math.round((total / this.progress.stages.length) * 100) / 100
    );
  }
  next();
});

// Static: Get user projects with summary
projectSchema.statics.getUserProjects = async function (userId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  const query = { userId, isActive: true };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    this.find(query)
      .select('name status budget progress.percentage timeline createdAt plotId engineerId')
      .populate('plotId', 'name address.city dimensions.area')
      .populate('engineerId', 'firstName lastName avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);

  return {
    projects,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

