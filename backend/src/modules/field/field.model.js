/**
 * BuildMyHome - Field Model
 * Mongoose schema for user land/field mapping
 */

const mongoose = require('mongoose');
const { FIELD_STATUS } = require('../../constants/enums');

const fieldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
    maxlength: [100, 'Field name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  geoJSON: {
    // Leaflet draw export format
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // [[[lng, lat]]]
      required: true,
    },
  },
  dimensions: {
    width: {
      type: Number,
      min: 0,
    },
    length: {
      type: Number,
      min: 0,
    },
    area: {
      type: Number,
      min: 0,
      required: true,
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft',
    },
  },
  address: {
    full: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [lng, lat] center
    },
  },
  status: {
    type: String,
    enum: Object.values(FIELD_STATUS),
    default: 'draft',
  },
  isPrimary: {
    type: Boolean,
    default: false,
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
fieldSchema.index({ userId: 1 });
fieldSchema.index({ 'address.location': '2dsphere' });
fieldSchema.index({ status: 1 });
fieldSchema.index({ isPrimary: 1, userId: 1 });

fieldSchema.statics.getUserPrimaryField = function(userId) {
  return this.findOne({ userId, isPrimary: true, status: { $ne: 'deleted' } });
};

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;

