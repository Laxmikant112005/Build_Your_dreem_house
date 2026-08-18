/**
 * Planova - Plot Model
 * Mongoose schema for GeoSpatial land/plot mapping.
 * Replaces legacy Field model with full GeoJSON geometry,
 * terrain analysis, soil data, road access, and AI metadata.
 * Used for plot selection, geospatial blueprint matching,
 * and area/perimeter calculations via Turf.js.
 */

const mongoose = require('mongoose');
const {
  PLOT_STATUS,
  TERRAIN_TYPE,
  SOIL_TYPE,
  ROAD_ACCESS,
  AI_PROVIDERS,
} = require('../../constants/enums');

const plotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Plot name is required'],
      trim: true,
      maxlength: [100, 'Plot name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // GeoJSON geometry (Leaflet/Mapbox draw output)
    geojson: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // [[[lng, lat], [lng, lat], ...]]
        required: true,
      },
    },
    // Calculated dimensions (populated via Turf.js on frontend or webhook)
    dimensions: {
      width: { type: Number, min: 0 },
      length: { type: Number, min: 0 },
      perimeter: { type: Number, min: 0 }, // in meters or feet
      area: {
        type: Number,
        min: 0,
        required: true,
      },
      areaUnit: {
        type: String,
        enum: ['sqft', 'sqm', 'acre', 'hectare', 'gunta', 'cent'],
        default: 'sqft',
      },
    },
    // Orientation (North-facing detection)
    orientation: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'irregular'],
    },
    // Address and location
    address: {
      full: { type: String, maxlength: 500 },
      street: { type: String, maxlength: 200 },
      city: { type: String, maxlength: 100 },
      state: { type: String, maxlength: 100 },
      country: { type: String, default: 'India' },
      postalCode: { type: String, maxlength: 20 },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [lng, lat] centroid
        },
      },
    },
    // Terrain and soil analysis
    terrainType: {
      type: String,
      enum: TERRAIN_TYPE,
    },
    soilType: {
      type: String,
      enum: SOIL_TYPE,
    },
    soilReport: {
      url: String,
      uploadedAt: Date,
      notes: String,
    },
    roadAccess: {
      type: String,
      enum: ROAD_ACCESS,
    },
    roadWidth: {
      type: Number, // in feet/meters
      min: 0,
    },
    // Zoning and regulatory
    zoning: {
      type: String, // e.g. 'residential', 'commercial', 'agricultural', 'mixed'
    },
    floorAreaRatio: {
      type: Number, // FAR/FSI
      min: 0,
    },
    setBackFeet: {
      front: { type: Number, min: 0 },
      rear: { type: Number, min: 0 },
      side: { type: Number, min: 0 },
    },
    // Utility connectivity
    utilities: {
      waterSupply: { type: Boolean, default: false },
      electricity: { type: Boolean, default: false },
      sewage: { type: Boolean, default: false },
      gasConnection: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
    },
    // Lifecycle
    status: {
      type: String,
      enum: Object.values(PLOT_STATUS),
      default: PLOT_STATUS.ACTIVE,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    // --- AI-READY FIELDS ---
    aiMetadata: {
      soilTypePrediction: { type: String },
      landGrade: { type: String },
      estimatedValue: { type: Number },
      buildabilityScore: { type: Number, min: 0, max: 1 },
      floodRiskScore: { type: Number, min: 0, max: 1 },
      sunlightExposure: { type: String, enum: ['low', 'medium', 'high'] },
      climateZone: { type: String },
      recommendedBlueprints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' }],
      autoSuggestions: [{ type: String }],
      lastProcessedAt: { type: Date },
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

// ===================================================================
// INDEXES
// ===================================================================
plotSchema.index({ userId: 1 });
plotSchema.index({ 'address.location': '2dsphere' }); // GeoSpatial centroid index
plotSchema.index({ geojson: '2dsphere' }); // GeoSpatial polygon index for spatial queries
plotSchema.index({ status: 1 });
plotSchema.index({ isPrimary: 1, userId: 1 });
plotSchema.index({ 'dimensions.area': 1 });
plotSchema.index({ 'dimensions.areaUnit': 1 });
plotSchema.index({ terrainType: 1 });
plotSchema.index({ soilType: 1 });
plotSchema.index({ roadAccess: 1 });
plotSchema.index({ 'address.city': 1 });
plotSchema.index({ 'address.state': 1 });
plotSchema.index({ zoning: 1 });
plotSchema.index({ userId: 1, status: 1, isPrimary: 1 });
plotSchema.index({ userId: 1, status: 1, createdAt: -1 });

// AI-related indexes
plotSchema.index({ 'aiMetadata.buildabilityScore': -1 });
plotSchema.index({ 'aiMetadata.estimatedValue': -1 });
plotSchema.index({ 'aiMetadata.floodRiskScore': -1 });
plotSchema.index({ 'aiMetadata.climateZone': 1 });
plotSchema.index({ 'aiMetadata.recommendedBlueprints': 1 });

// ===================================================================
// STATIC METHODS
// ===================================================================
/**
 * Get the primary plot for a user
 */
plotSchema.statics.getUserPrimaryPlot = function (userId) {
  return this.findOne({ userId, isPrimary: true, status: { $ne: 'deleted' } });
};

/**
 * Find plots that intersect with a given GeoJSON polygon
 */
plotSchema.statics.findIntersecting = function (geojson) {
  return this.find({
    geojson: {
      $geoIntersects: {
        $geometry: geojson,
      },
    },
  });
};

/**
 * Find plots within a radius of a point (in meters)
 */
plotSchema.statics.findNearby = function (lng, lat, maxDistanceMeters = 5000) {
  return this.find({
    'address.location': {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistanceMeters,
      },
    },
  });
};

// ===================================================================
// INSTANCE METHODS
// ===================================================================
/**
 * Calculate the cardinal orientation based on the longest side
 */
plotSchema.methods.detectOrientation = function () {
  // This is a simplified detection. In production, use Turf.js
  // on the frontend for precise cardinal direction analysis.
  const coords = this.geojson.coordinates[0];
  if (!coords || coords.length < 3) return null;
  
  // Find the longest edge to determine primary facing direction
  let maxDist = 0;
  let maxEdge = null;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      maxDist = dist;
      maxEdge = Math.atan2(dy, dx) * (180 / Math.PI);
    }
  }
  
  if (maxEdge === null) return 'irregular';
  
  // Convert angle to cardinal direction
  if (maxEdge >= -22.5 && maxEdge < 22.5) return 'east';
  if (maxEdge >= 22.5 && maxEdge < 67.5) return 'northeast';
  if (maxEdge >= 67.5 && maxEdge < 112.5) return 'north';
  if (maxEdge >= 112.5 && maxEdge < 157.5) return 'northwest';
  if (maxEdge >= 157.5 || maxEdge < -157.5) return 'west';
  if (maxEdge >= -157.5 && maxEdge < -112.5) return 'southwest';
  if (maxEdge >= -112.5 && maxEdge < -67.5) return 'south';
  if (maxEdge >= -67.5 && maxEdge < -22.5) return 'southeast';
  return 'irregular';
};

const Plot = mongoose.model('Plot', plotSchema);

module.exports = Plot;

