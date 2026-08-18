/**
 * Planova - Follow Routes
 */

const express = require('express');
const router = express.Router();
const followController = require('./follow.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { param } = require('express-validator');
const { validate } = require('../../middleware/validation.middleware');

router.use(authenticate);
router.get('/', followController.getFollowing);
router.post('/:engineerId/toggle', param('engineerId').isMongoId(), validate, followController.toggleFollow);
router.get('/:engineerId/check', param('engineerId').isMongoId(), validate, followController.checkFollow);

module.exports = router;

