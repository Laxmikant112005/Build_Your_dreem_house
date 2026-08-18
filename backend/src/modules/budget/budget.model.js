/**
 * Planova - Budget Model
 * Mongoose schema for project budget tracking
 */
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['labour', 'material', 'equipment', 'permits', 'design', 'consultation', 'utilities', 'furnishing', 'landscaping', 'miscellaneous'],
  },
  description: { type: String, required: true, maxlength: 500 },
  amount: { type: Number, required: true, min: 0 },
  vendor: { type: String, maxlength: 100 },
  date: { type: Date, default: Date.now },
  receipt: { type: String },
  notes: { type: String, maxlength: 500 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const budgetSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  estimatedTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  categories: [{
    name: {
      type: String,
      required: true,
      enum: ['labour', 'material', 'equipment', 'permits', 'design', 'consultation', 'utilities', 'furnishing', 'landscaping', 'miscellaneous'],
    },
    label: { type: String },
    estimated: { type: Number, default: 0 },
    actual: { type: Number, default: 0 },
  }],
  contingencyPercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 50,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'over_budget', 'completed'],
    default: 'draft',
  },
  expenses: [expenseSchema],
  notes: { type: String, maxlength: 1000 },
}, { timestamps: true });

// Indexes
budgetSchema.index({ projectId: 1, userId: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ createdAt: -1 });

// Virtual: total actual spent
budgetSchema.virtual('totalActual').get(function () {
  return this.categories.reduce((sum, cat) => sum + (cat.actual || 0), 0);
});

// Virtual: remaining budget
budgetSchema.virtual('remaining').get(function () {
  const contingency = this.estimatedTotal * (this.contingencyPercent / 100);
  return (this.estimatedTotal + contingency) - this.totalActual;
});

// Virtual: over budget amount
budgetSchema.virtual('overBudget').get(function () {
  const rem = this.remaining;
  return rem < 0 ? Math.abs(rem) : 0;
});

// Pre-save: update status based on spending
budgetSchema.pre('save', function (next) {
  if (this.totalActual > this.estimatedTotal) {
    this.status = 'over_budget';
  } else if (this.status === 'draft' && this.expenses.length > 0) {
    this.status = 'active';
  }
  next();
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;

