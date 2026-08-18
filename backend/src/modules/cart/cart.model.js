/**
 * BuildMyHome - Cart Model
 * Mongoose schema for user shopping cart
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
  }, // Price at time of adding to cart
  total: {
    type: Number,
    required: true,
  }, // quantity * price
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One cart per user
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for fast user lookup
cartSchema.index({ userId: 1 });

// Pre-save: Recalculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

