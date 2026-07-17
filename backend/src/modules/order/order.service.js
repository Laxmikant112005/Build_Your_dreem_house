/**
 * BuildMyHome - Order Service
 * Business logic for material orders and checkout
 */

const ApiError = require('../../utils/ApiError');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const cartService = require('../cart/cart.service');
// transactionService will be created next
const logger = require('../../utils/logger');

class OrderService {
  /**
   * Create order from cart (checkout)
   */
  async createOrderFromCart(userId, deliveryData, paymentData) {
    // 1. Validate cart stock
    await cartService.validateCart(userId);

    // 2. Get cart
    const cart = await cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // 3. Calculate totals
    const subtotal = cart.totalAmount;
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // 4. Create order
    const order = await Order.create({
      userId,
      cartId: cart._id,
      items: cart.items.map(item => ({
        materialId: item.materialId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      totalItems: cart.totalItems,
      subtotal,
      taxAmount,
      totalAmount,
      delivery: deliveryData,
      payment: {
        ...paymentData,
        status: 'pending',
      },
    });

    // 5. Process payment
    const paymentResult = await transactionService.createPaymentIntent(
      totalAmount, 
      userId, 
      order._id,
      paymentData.gateway || 'razorpay'
    );

    order.payment.transactionId = paymentResult.id;
    await order.save();

    // 6. Clear cart
    await cartService.clearCart(userId);

    logger.info(`Order created: ${order._id} for user ${userId}, amount ₹${totalAmount}`);
    return order.populate('items.materialId');
  }

  /**
   * Confirm payment and update order
   */
  async confirmPayment(orderId, paymentIntentId, gateway) {
    const order = await Order.findById(orderId);
    if (!order || order.payment.transactionId !== paymentIntentId) {
      throw new ApiError(400, 'Invalid payment for order');
    }

    // Verify payment status via gateway
    const paymentStatus = await transactionService.verifyPayment(paymentIntentId, gateway);
    if (paymentStatus !== 'paid') {
      throw new ApiError(400, 'Payment not confirmed');
    }

    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    order.timeline.confirmedAt = new Date();

    await order.save();
    logger.info(`Payment confirmed for order ${orderId}`);
    return order;
  }

  /**
   * Get user orders (paginated)
   */
  async getUserOrders(userId, options = {}) {
    const orders = await Order.getUserOrders(userId, options);
    const total = await Order.countDocuments({ userId });
    
    return {
      orders,
      pagination: {
        page: options.page || 1,
        limit: options.limit || 20,
        total,
        totalPages: Math.ceil(total / (options.limit || 20)),
      },
    };
  }

  /**
   * Get single order
   */
  async getOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.materialId', 'name price images');
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  }

  /**
   * Update delivery status (admin/delivery)
   */
  async updateDeliveryStatus(orderId, status, trackingId) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        'delivery.status': status,
        'delivery.trackingId': trackingId,
        ...(status === 'delivered' && { 'delivery.deliveredAt': new Date() }),
      },
      { new: true }
    ).populate('items.materialId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Update materials stock
    if (status === 'delivered') {
      for (const item of order.items) {
        await item.materialId.updateStock(item.materialId.stockQuantity - item.quantity);
      }
    }

    logger.info(`Delivery status updated: ${orderId} → ${status}`);
    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new ApiError(400, 'Cannot cancel this order');
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    logger.info(`Order cancelled: ${orderId}`);
    return order;
  }
}

module.exports = new OrderService();

