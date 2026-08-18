/**
 * Planova - Blueprint Model
 * Mongoose schema for the Professional Blueprint Marketplace.
 * Replaces legacy Design model with ConTech-specific fields:
 * material breakdown, sustainability index, Vastu compliance,
 * download access tiers, and AI recommendation metadata.
 */

const mongoose = require('mongoose');
const slugify = require('slugify');
const {
  BLUEPRINT_STATUS,
  BLUEPRINT_ACCESS_TIER,
  HOUSE_STYLES,
  CONSTRUCTION_TYPES,
  VASTU_ORIENTATION,
  KITCHEN_TYPE,
  PARKING_TYPE,
  SUSTAINABILITY_FEATURES,
  FILE_CATEGORIES,
  AI_PROVIDERS,
} = require('../../constants/enums');

const blueprintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blueprint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    // Access & monetization
    accessTier: {
      type: String,
      enum: Object.values(BLUEPRINT_ACCESS_TIER),
      default: BLUEPRINT_ACCESS_TIER.FREE,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Download/access tracking
    downloadCount: {
      type: Number,
      default: 0,
    },
    // Blueprint specifications
    specs: {
      builtUpArea: { // Total built-up area in sq.ft
        type: Number,
        required: true,
        min: 0,
      },
      plotAreaRequired: { // Minimum plot area required
        type: Number,
        min: 0,
      },
      plotWidth: { // Minimum plot width required
        type: Number,
        min: 0,
      },
      plotLength: { // Minimum plot length required
        type: Number,
        min: 0,
      },
      floors: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
      },
      bedrooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      bathrooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      livingRooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      kitchen: {
        type: String,
        enum: Object.values(KITCHEN_TYPE),
        default: KITCHEN_TYPE[0],
      },
      parking: {
        type: String,
        enum: Object.values(PARKING_TYPE),
        default: PARKING_TYPE[0],
      },
      garage: {
        type: Number,
        default: 0,
        min: 0,
      },
      style: {
        type: String,
        enum: HOUSE_STYLES,
        required: true,
      },
      constructionType: {
        type: String,
        enum: CONSTRUCTION_TYPES,
        required: true,
      },
      estimatedCost: {
        type: Number,
        min: 0,
      },
      costPerSqft: {
        type: Number,
        min: 0,
      },
      estimatedDuration: {
        type: Number, // in days
        min: 0,
      },
    },
    // Vastu compliance
    vastu: {
      compliant: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      orientation: {
        type: String,
        enum: VASTU_ORIENTATION,
      },
      notes: {
        type: String,
        maxlength: 1000,
      },
    },
    // Material breakdown
    materials: {
      cementBags: { type: Number, min: 0, default: 0 },
      steelTons: { type: Number, min: 0, default: 0 },
      bricks: { type: Number, min: 0, default: 0 },
      sandCubicFeet: { type: Number, min: 0, default: 0 },
      aggregateCubicFeet: { type: Number, min: 0, default: 0 },
      flooringArea: { type: Number, min: 0, default: 0 }, // in sq.ft
      paintArea: { type: Number, min: 0, default: 0 }, // in sq.ft
      tilesArea: { type: Number, min: 0, default: 0 },
      windows: { type: Number, min: 0, default: 0 },
      doors: { type: Number, min: 0, default: 0 },
      electricalPoints: { type: Number, min: 0, default: 0 },
      plumbingPoints: { type: Number, min: 0, default: 0 },
      customMaterials: [{
        name: String,
        quantity: Number,
        unit: String,
        estimatedCost: Number,
      }],
    },
    // Sustainability
    sustainability: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      features: [{
        type: String,
        enum: SUSTAINABILITY_FEATURES,
      }],
      energyRating: {
        type: String,
        enum: ['A+', 'A', 'B', 'C', 'D', 'E', null],
      },
      greenCertification: {
        type: String,
        enum: ['griha', 'igbc', 'leed', 'breeam', 'none', null],
      },
      estimatedEnergySavings: {
        type: Number, // percentage
        min: 0,
        max: 100,
      },
    },
    // Blueprint media files
    files: {
      images: [{
        url: String,
        thumbnailUrl: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
        caption: String,
      }],
      floorPlans: [{
        url: String,
        name: String,
        floor: Number,
        fileType: { type: String, default: 'image' },
      }],
      cadFiles: [{
        url: String,
        name: String,
        format: { type: String, default: 'dwg' },
        fileSize: Number,
      }],
      model3d: {
        url: String,
        thumbnailUrl: String,
        format: { type: String, default: 'glb' },
        fileSize: Number,
      },
      documents: [{
        url: String,
        name: String,
        type: { type: String, default: 'pdf' },
        fileSize: Number,
      }],
    },
    // Location context
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: 'India' },
      suitableClimate: [String],
    },
    // Status lifecycle
    status: {
      type: String,
      enum: Object.values(BLUEPRINT_STATUS),
      default: BLUEPRINT_STATUS.DRAFT,
    },
    rejectionReason: String,
    // Metrics
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
    },
    // Tags & SEO
    tags: [{
      type: String,
      trim: true,
    }],
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    publishedAt: Date,
    // --- AI-READY FIELDS ---
    aiMetadata: {
      styleConfidence: { type: Number, min: 0, max: 1 },
      costAccuracy: { type: Number, min: 0, max: 1 },
      popularityTrend: { type: String, enum: ['rising', 'stable', 'declining', 'new'] },
      autoTags: [String],
      similarBlueprintIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' }],
      recommendationScore: { type: Number, min: 0, max: 1 },
      relevanceScores: {
        plotMatch: { type: Number, min: 0, max: 1 },
        budgetMatch: { type: Number, min: 0, max: 1 },
        familyFit: { type: Number, min: 0, max: 1 },
        climateFit: { type: Number, min: 0, max: 1 },
        lifestyleFit: { type: Number, min: 0, max: 1 },
      },
      lastProcessedAt: { type: Date },
      blueprintParsed: { type: Boolean, default: false },
      parseConfidence: { type: Number, min: 0, max: 1 },
    },
    vectorEmbeddingsRef: {
      provider: { type: String, enum: Object.values(AI_PROVIDERS) },
      embeddingId: { type: String },
      lastSyncedAt: { type: Date },
    },
    costPredictions: {
      materialCost: { type: Number },
      laborCost: { type: Number },
      totalPredictedCost: { type: Number },
      costRange: {
        min: { type: Number },
        max: { type: Number },
      },
      confidence: { type: Number, min: 0, max: 1 },
      factors: [{
        name: String,
        impact: { type: Number, min: -1, max: 1 },
        description: String,
      }],
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
blueprintSchema.index({ engineerId: 1 });
blueprintSchema.index({ category: 1 });
blueprintSchema.index({ status: 1 });
blueprintSchema.index({ accessTier: 1 });
blueprintSchema.index({ price: 1 });
blueprintSchema.index({ 'specs.style': 1 });
blueprintSchema.index({ 'specs.builtUpArea': 1 });
blueprintSchema.index({ 'specs.estimatedCost': 1 });
blueprintSchema.index({ 'specs.costPerSqft': 1 });
blueprintSchema.index({ 'specs.bedrooms': 1 });
blueprintSchema.index({ 'specs.floors': 1 });
blueprintSchema.index({ 'specs.kitchen': 1 });
blueprintSchema.index({ 'specs.parking': 1 });
blueprintSchema.index({ 'location.city': 1 });
blueprintSchema.index({ 'location.state': 1 });
blueprintSchema.index({ 'location.suitableClimate': 1 });
blueprintSchema.index({ createdAt: -1 });
blueprintSchema.index({ publishedAt: -1 });
blueprintSchema.index({ 'metrics.views': -1 });
blueprintSchema.index({ 'metrics.likes': -1 });
blueprintSchema.index({ 'metrics.downloads': -1 });
blueprintSchema.index({ 'vastu.compliant': 1 });
blueprintSchema.index({ 'vastu.score': -1 });
blueprintSchema.index({ 'sustainability.score': -1 });

// Compound indexes for marketplace filtering
blueprintSchema.index({ status: 1, 'specs.style': 1, 'specs.estimatedCost': 1 });
blueprintSchema.index({ status: 1, 'specs.bedrooms': 1, 'specs.floors': 1 });
blueprintSchema.index({ status: 1, 'specs.builtUpArea': 1, 'specs.estimatedCost': 1 });
blueprintSchema.index({ status: 1, 'specs.costPerSqft': 1 });
blueprintSchema.index({ status: 1, 'location.city': 1, 'specs.style': 1 });
blueprintSchema.index({ status: 1, 'vastu.compliant': 1 });
blueprintSchema.index({ status: 1, 'sustainability.score': -1 });
blueprintSchema.index({ status: 1, 'aiMetadata.recommendationScore': -1 });
blueprintSchema.index({ engineerId: 1, status: 1, createdAt: -1 });
blueprintSchema.index({ category: 1, 'specs.style': 1, 'specs.estimatedCost': 1 });

// AI-related indexes
blueprintSchema.index({ 'aiMetadata.recommendationScore': -1 });
blueprintSchema.index({ 'aiMetadata.popularityTrend': 1 });
blueprintSchema.index({ 'aiMetadata.styleConfidence': -1 });
blueprintSchema.index({ 'aiMetadata.blueprintParsed': 1 });
blueprintSchema.index({ 'costPredictions.confidence': -1 });

// Text search index
blueprintSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 } }
);

// ===================================================================
// VIRTUALS
// ===================================================================
blueprintSchema.virtual('likes', {
  ref: 'Favorite',
  localField: '_id',
  foreignField: 'blueprintId',
  count: true,
});

blueprintSchema.virtual('engineer', {
  ref: 'User',
  localField: 'engineerId',
  foreignField: '_id',
  justOne: true,
});

// ===================================================================
// PRE-SAVE HOOKS
// ===================================================================
blueprintSchema.pre('save', function (next) {
  // Generate slug from title
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  // Calculate cost per sqft
  if (this.specs.estimatedCost && this.specs.builtUpArea > 0) {
    this.specs.costPerSqft = Math.round(this.specs.estimatedCost / this.specs.builtUpArea);
  }
  next();
});

// ===================================================================
// STATIC METHODS
// ===================================================================
/**
 * Get featured blueprints for marketplace homepage
 */
blueprintSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ status: BLUEPRINT_STATUS.APPROVED })
    .sort({ 'metrics.views': -1, 'metrics.likes': -1, 'aiMetadata.recommendationScore': -1 })
    .limit(limit)
    .populate('engineerId', 'firstName lastName avatar engineerProfile.rating engineerProfile.title');
};

/**
 * Get trending blueprints
 */
blueprintSchema.statics.getTrending = function (days = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({
    status: BLUEPRINT_STATUS.APPROVED,
    publishedAt: { $gte: date },
  })
    .sort({ 'metrics.views': -1, 'metrics.downloads': -1 })
    .limit(limit)
    .populate('engineerId', 'firstName lastName avatar engineerProfile.rating engineerProfile.title');
};

/**
 * Get AI-recommended blueprints for a user profile
 */
blueprintSchema.statics.getRecommended = function (userPreferences = {}, limit = 20) {
  const query = { status: BLUEPRINT_STATUS.APPROVED };
  const sort = { 'aiMetadata.recommendationScore': -1, 'metrics.views': -1 };

  // Apply preference-based filters if available
  if (userPreferences.preferredStyles && userPreferences.preferredStyles.length > 0) {
    query['specs.style'] = { $in: userPreferences.preferredStyles };
  }
  if (userPreferences.budgetMax) {
    query['specs.estimatedCost'] = { $lte: userPreferences.budgetMax };
  }
  if (userPreferences.desiredRooms) {
    query['specs.bedrooms'] = { $gte: userPreferences.desiredRooms };
  }
  if (userPreferences.climateRegion) {
    query['location.suitableClimate'] = userPreferences.climateRegion;
  }

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');
};

// ===================================================================
// INSTANCE METHODS
// ===================================================================
blueprintSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  await this.save();
};

blueprintSchema.methods.incrementDownloads = async function () {
  this.metrics.downloads += 1;
  this.downloadCount += 1;
  await this.save();
};

const Blueprint = mongoose.model('Blueprint', blueprintSchema);

module.exports = Blueprint;

