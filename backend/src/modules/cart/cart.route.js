/**
 * BuildMyHome - Cart Routes
 */

const express = require('express');
const cartController = require('./cart.controller');
const { validateRequest, validateJoiRequest } = require('../../middleware/validation.middleware');


const { authenticate } = require('../../middleware/auth.middleware');
const cartValidator = require('./cart.validator');

const router = express.Router();

router.use(authenticate); // All cart operations require auth

/**
 * Cart operations
 */
router.get('/', cartController.getCart);
router.post('/items',
  validateJoiRequest(cartValidator.addItem),
  cartController.addItem
);

router.put('/items/:materialId',
  validateJoiRequest(cartValidator.updateItem),
  cartController.updateItem
);

router.delete('/items/:materialId', cartController.removeItem);
router.delete('/', cartController.clearCart);
router.post('/validate', cartController.validateCart);

module.exports = router;

