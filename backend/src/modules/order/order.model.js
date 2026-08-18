/**
 * BuildMyHome - Order Model
 * Mongoose schema for material orders
 * 
 * AI-READY: Includes aiMetadata and vectorEmbeddingsRef fields
 * for future ML integrations (delivery prediction, fraud detection, etc.)
 */

const mongoose = require('mongoose');
const {
  PAYMENT_GATEWAYS,
  PAYMENT_STATUS,
  DELIVERY_STATUS,
  ORDER_STATUS,
  AI_PROVIDERS,
} = require('../../constants/enums');

const orderItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
  },
  items: [orderItemSchema],
  totalItems: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  payment: {
    gateway: { type: String, enum: PAYMENT_GATEWAYS },
    transactionId: String,
    status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
    method: String,
    paidAt: Date,
  },
  delivery: {
    address: {
      full: String,
      city: String,
      state: String,
      postalCode: String,
      coordinates: [Number], // [lng, lat]
    },
    status: {
      type: String,
      enum: DELIVERY_STATUS,
      default: 'pending',
    },
    trackingId: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
  },
  status: {
    type: String,
    enum: ORDER_STATUS,
    default: 'pending',
  },
  notes: String,
  // --- AI-READY FIELDS ---
  aiMetadata: {
    fraudRiskScore: { type: Number, min: 0, max: 1 },
    deliveryPrediction: {
      estimatedDate: Date,
      confidence: { type: Number, min: 0, max: 1 },
    },
    delayRisk: { type: Number, min: 0, max: 1 },
    shoppingIntent: { type: String }, // 'high_intent', 'browsing', 'price_sensitive'
    autoCategorized: { type: Boolean, default: false },
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
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.status': 1 });
orderSchema.index({ totalAmount: 1 });
orderSchema.index({ createdAt: -1, totalAmount: 1 });
orderSchema.index({ 'payment.gateway': 1, 'payment.status': 1 });

// AI-related indexes
orderSchema.index({ 'aiMetadata.fraudRiskScore': -1 });
orderSchema.index({ 'aiMetadata.delayRisk': -1 });
orderSchema.index({ 'aiMetadata.shoppingIntent': 1 });

// Static: Get user orders with pagination
orderSchema.statics.getUserOrders = function(userId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  const query = { userId };
  if (status) query.status = status;

  return this.find(query)
    .populate('items.materialId', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

