/**
 * BuildMyHome - Cart Service
 * Business logic for shopping cart operations
 */

const ApiError = require('../../utils/ApiError');
const Cart = require('./cart.model');
const Material = require('../material/material.model');
const logger = require('../../utils/logger');

class CartService {
  /**
   * Get user cart or create empty
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId });
    }
    return cart.populate('items.materialId');
  }

  /**
   * Add item to cart
   */
  async addItem(userId, materialId, quantity = 1) {
    const material = await Material.findById(materialId);
    if (!material || material.stockQuantity < quantity) {
      throw new ApiError(400, 'Material not available or insufficient stock');
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if item exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.materialId.toString() === materialId
    );

    const itemData = {
      materialId,
      quantity,
      price: material.price,
      total: material.price * quantity,
    };

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push(itemData);
    }

    await cart.save();
    logger.info(`Cart updated for user ${userId}: added ${quantity}x ${material.name}`);
    return this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(userId, materialId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(userId, materialId);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item.materialId.toString() === materialId);
    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not in cart');
    }

    const material = await Material.findById(materialId);
    if (!material || material.stockQuantity < quantity) {
      throw new ApiError(400, 'Insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = material.price * quantity;
    
    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, materialId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = cart.items.filter(item => item.materialId.toString() !== materialId);
    await cart.save();

    logger.info(`Item removed from cart ${userId}: ${materialId}`);
    return this.getCart(userId);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalItems: 0, totalAmount: 0 },
      { new: true }
    );

    logger.info(`Cart cleared for user ${userId}`);
    return cart || { userId, items: [], totalItems: 0, totalAmount: 0 };
  }

  /**
   * Validate cart stock before checkout
   */
  async validateCart(userId) {
    const cart = await this.getCart(userId);
    const errors = [];

    for (const item of cart.items) {
      const material = await Material.findById(item.materialId);
      if (!material || material.stockQuantity < item.quantity) {
        errors.push({
          materialId: item.materialId,
          available: material?.stockQuantity || 0,
          requested: item.quantity,
        });
      }
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Stock validation failed', { errors });
    }

    return true;
  }
}

module.exports = new CartService();

