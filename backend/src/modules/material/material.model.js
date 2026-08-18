/**
 * BuildMyHome - Material Model
 * Mongoose schema for construction materials marketplace
 * 
 * AI-READY: Includes aiMetadata, vectorEmbeddingsRef, and costPredictions fields
 * for future ML integrations (price optimization, demand forecasting, etc.)
 */

const mongoose = require('mongoose');
const {
  MATERIAL_CATEGORIES,
  MATERIAL_STATUS,
  AI_PROVIDERS,
} = require('../../constants/enums');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    enum: Object.values(MATERIAL_CATEGORIES),
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  priceUnit: {
    type: String,
    enum: ['per_unit', 'per_kg', 'per_sqm', 'per_liter'],
    default: 'per_unit',
  },
  stockQuantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  specifications: {
    brand: String,
    model: String,
    dimensions: String, // e.g. "12x24 inches"
    weight: String,
    coverage: String, // e.g. "10 sqm per bag"
    color: String,
    materialType: String,
  },
  supplier: {
    name: String,
    contact: String,
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  delivery: {
    freeThreshold: Number, // min order value for free delivery
    estimatedDays: Number,
    areas: [String],
  },
  tags: [String],
  status: {
    type: String,
    enum: Object.values(MATERIAL_STATUS),
    default: MATERIAL_STATUS.ACTIVE,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // --- AI-READY FIELDS ---
  aiMetadata: {
    demandScore: { type: Number, min: 0, max: 1 },
    priceCompetitiveness: { type: Number, min: 0, max: 1 },
    trendingScore: { type: Number, min: 0, max: 1 },
    seasonalityFactor: { type: Number, min: -1, max: 1 },
    autoTags: [String],
    alternativeMaterialIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    bundleSuggestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
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
    predictedPriceTrend: { type: Number }, // positive = increasing, negative = decreasing
    optimalPrice: { type: Number },
    priceVolatility: { type: Number, min: 0, max: 1 },
    confidence: { type: Number, min: 0, max: 1 },
    lastCalculatedAt: { type: Date },
    factors: [{
      name: String,
      impact: { type: Number, min: -1, max: 1 },
    }],
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

// Indexes for marketplace search/filtering
materialSchema.index({ category: 1, status: 1 });
materialSchema.index({ category: 1, price: 1 });
materialSchema.index({ price: 1 });
materialSchema.index({ status: 1, stockQuantity: 1 });
materialSchema.index({ isFeatured: 1, createdAt: -1 });
materialSchema.index({ 'supplier.rating': -1 });
materialSchema.index({ 'supplier.name': 1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ updatedAt: -1 });
materialSchema.index({ name: 'text', description: 'text', tags: 'text' });

// AI-related indexes
materialSchema.index({ 'aiMetadata.demandScore': -1 });
materialSchema.index({ 'aiMetadata.trendingScore': -1 });
materialSchema.index({ 'aiMetadata.priceCompetitiveness': -1 });
materialSchema.index({ 'costPredictions.optimalPrice': 1 });

// Virtual for price display
materialSchema.virtual('displayPrice').get(function() {
  return `${this.price.toLocaleString()} ₹/${this.priceUnit}`;
});

// Static: Get featured materials
materialSchema.statics.getFeatured = function(limit = 8) {
  return this.find({ 
    status: 'active', 
    stockQuantity: { $gt: 0 },
    isFeatured: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static: Filter materials
materialSchema.statics.searchAndFilter = function(filters = {}, options = {}) {
  const query = { status: 'active', stockQuantity: { $gt: 0 } };
  
  if (filters.category) query.category = filters.category;
  if (filters.minPrice !== undefined) query.price = { ...query.price, $gte: filters.minPrice };
  if (filters.maxPrice !== undefined) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.tags && filters.tags.length) {
    query.tags = { $in: filters.tags };
  }

  return this.find(query)
    .sort({ 
      ...(options.sortBy === 'price' && { price: options.sortOrder || 1 }),
      ...(options.sortBy === 'rating' && { 'supplier.rating': -1 }),
      createdAt: -1 
    })
    .limit(options.limit || 20)
    .skip(options.page ? (options.page - 1) * options.limit : 0);
};

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;

