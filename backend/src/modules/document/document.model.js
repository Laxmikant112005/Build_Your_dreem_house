/**
 * Planova - Document Model
 * Mongoose schema for user document management
 * (non-engineering documents: land records, legal docs, quotations, agreements, bills, property images)
 */
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    default: null,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: [
      'property_document', 'land_record', 'legal_document',
      'quotation', 'agreement', 'bill', 'receipt',
      'property_image', 'identification', 'contract',
      'permit', 'insurance', 'warranty', 'other',
    ],
  },
  folder: {
    type: String,
    default: 'General',
    trim: true,
    maxlength: 100,
  },
  file: {
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    name: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    format: { type: String },
  },
  tags: [{ type: String, trim: true }],
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  expiresAt: { type: Date },
  metadata: {
    uploadedVia: { type: String, enum: ['web', 'mobile', 'email'], default: 'web' },
    documentDate: { type: Date },
    documentNumber: { type: String },
    issuedBy: { type: String },
    amount: { type: Number },
  },
}, {
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
});

// Indexes
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, folder: 1 });
documentSchema.index({ userId: 1, isFavorite: 1 });
documentSchema.index({ userId: 1, isArchived: 1 });
documentSchema.index({ projectId: 1 });
documentSchema.index({ propertyId: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Statics
documentSchema.statics.getUserFolders = async function (userId) {
  return this.distinct('folder', { userId, isArchived: false });
};

documentSchema.statics.getCategoryCounts = async function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;

