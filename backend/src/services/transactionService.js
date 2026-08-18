/**
 * BuildMyHome - Transaction Service
 * Payment gateway integration (Razorpay/Stripe)
 */

const Razorpay = require('razorpay');
const config = require('../config');

// Lazy-init external SDKs to avoid startup crashes during tests/dev
const stripe = config?.stripe?.secretKey
  ? require('stripe')(config.stripe.secretKey)
  : null;

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

class TransactionService {
  constructor() {
    // In dev/test we may not have payment keys; avoid crashing on import.
    if (config?.razorpay?.keyId && config?.razorpay?.secret) {
      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.secret,
      });
    } else {
      this.razorpay = null;
    }
  }


  /**
   * Create payment intent
   */
  async createPaymentIntent(amount, userId, orderId, gateway = 'razorpay') {
    try {
      if (gateway === 'razorpay') {
        const options = {
          amount: Math.round(amount * 100), // paise
          currency: 'INR',
          receipt: `order_${orderId}`,
          notes: {
            userId,
            orderId,
          },
        };

        const order = await this.razorpay.orders.create(options);
        logger.info(`Razorpay order created: ${order.id}`);
        return {
          id: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          gateway,
        };
      } else if (gateway === 'stripe') {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'inr',
          metadata: { userId, orderId },
          automatic_payment_methods: { enabled: true },
        });
        logger.info(`Stripe payment intent created: ${paymentIntent.id}`);
        return {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          gateway,
        };
      }
    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      throw new ApiError(500, 'Payment initialization failed');
    }
  }

  /**
   * Verify payment signature (Razorpay)
   */
  async verifyRazorpayPayment(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (signature === expectedSignature) {
      return 'paid';
    }
    throw new ApiError(400, 'Invalid payment signature');
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      return 'paid';
    }
    if (paymentIntent.status === 'requires_payment_method') {
      throw new ApiError(400, 'Payment requires action');
    }
    throw new ApiError(400, `Payment ${paymentIntent.status}`);
  }

  /**
   * Generic verify payment
   */
  async verifyPayment(paymentIntentId, gateway) {
    if (gateway === 'razorpay') {
      // For Razorpay, signature verified on webhook/frontend
      // Here we can fetch order status
      const order = await this.razorpay.orders.fetch(paymentIntentId);
      return order.status === 'paid' ? 'paid' : order.status;
    } else if (gateway === 'stripe') {
      return this.verifyStripePayment(paymentIntentId);
    }
    throw new ApiError(400, 'Unsupported gateway');
  }

  /**
   * Generate Razorpay client config for frontend
   */
  getRazorpayConfig() {
    return {
      key: config.razorpay.keyId,
      name: 'BuildMyHome',
      theme: {
        color: '#1e293b',
      },
    };
  }
}

module.exports = new TransactionService();

