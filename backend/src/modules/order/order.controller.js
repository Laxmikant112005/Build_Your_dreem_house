/**
 * BuildMyHome - Order Controller
 */

const orderService = require('./order.service');
const cartService = require('../cart/cart.service');
const transactionService = require('../../services/transactionService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Checkout - Create order from cart
 */
const checkout = asyncHandler(async (req, res) => {
  const { delivery, payment } = req.body;
  const order = await orderService.createOrderFromCart(req.userId, delivery, payment);
  ApiResponse.created(res, 'Order created successfully', order);
});

/**
 * Confirm payment
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentIntentId, gateway } = req.body;
  const order = await orderService.confirmPayment(orderId, paymentIntentId, gateway);
  ApiResponse.ok(res, 'Payment confirmed', order);
});

/**
 * Get user orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await orderService.getUserOrders(req.userId, { page: parseInt(page), limit: parseInt(limit), status });
  ApiResponse.ok(res, 'Orders retrieved', result);
});

/**
 * Get single order
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id, req.userId);
  ApiResponse.ok(res, 'Order retrieved', order);
});

/**
 * Cancel order
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrder(req.params.id, req.userId, reason);
  ApiResponse.ok(res, 'Order cancelled', order);
});

/**
 * Update delivery status (admin only)
 */
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, trackingId } = req.body;
  const order = await orderService.updateDeliveryStatus(req.params.id, status, trackingId);
  ApiResponse.ok(res, 'Delivery status updated', order);
});

module.exports = {
  checkout,
  confirmPayment,
  getOrders,
  getOrder,
  cancelOrder,
  updateDeliveryStatus,
};

