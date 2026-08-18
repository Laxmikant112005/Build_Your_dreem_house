const express = require('express');
const orderController = require('./order.controller');
const { validateRequest, validateJoiRequest } = require('../../middleware/validation.middleware');

const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { USER_ROLES } = require('../../constants/enums');
const orderValidator = require('./order.validator');

const router = express.Router();

router.use(authenticate);
router.post('/checkout', validateJoiRequest(orderValidator.checkout), orderController.checkout);

router.post('/confirm-payment', orderController.confirmPayment);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.delete('/:id', validateJoiRequest(orderValidator.cancelOrder), orderController.cancelOrder);

router.put('/:id/delivery', authorize([USER_ROLES.ADMIN]), orderController.updateDeliveryStatus);

module.exports = router;