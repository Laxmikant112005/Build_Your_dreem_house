/**
 * BuildMyHome - Order Model
 * Mongoose schema for material orders
 */

const mongoose = require('mongoose');

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
    gateway: String, // 'stripe', 'razorpay'
    transactionId: String,
    status: String, // 'pending', 'paid', 'failed', 'refunded'
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
      enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingId: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  notes: String,
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'delivery.status': 1 });

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

