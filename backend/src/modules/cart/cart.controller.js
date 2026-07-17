/**
 * BuildMyHome - Cart Controller
 * Request handlers for cart endpoints
 */

const cartService = require('./cart.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get user cart
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.userId);
  ApiResponse.ok(res, 'Cart retrieved successfully', cart);
});

/**
 * Add item to cart
 */
const addItem = asyncHandler(async (req, res) => {
  const { materialId, quantity } = req.body;
  const cart = await cartService.addItem(req.userId, materialId, parseInt(quantity));
  ApiResponse.ok(res, 'Item added to cart', cart);
});

/**
 * Update cart item quantity
 */
const updateItem = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateItem(req.userId, materialId, parseInt(quantity));
  ApiResponse.ok(res, 'Cart item updated', cart);
});

/**
 * Remove item from cart
 */
const removeItem = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const cart = await cartService.removeItem(req.userId, materialId);
  ApiResponse.ok(res, 'Item removed from cart', cart);
});

/**
 * Clear cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.userId);
  ApiResponse.ok(res, 'Cart cleared successfully', cart);
});

/**
 * Validate cart for checkout
 */
const validateCart = asyncHandler(async (req, res) => {
  await cartService.validateCart(req.userId);
  ApiResponse.ok(res, 'Cart validation passed');
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  validateCart,
};

