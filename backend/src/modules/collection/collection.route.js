/**
 * Planova - Collection Routes
 */

const express = require('express');
const router = express.Router();
const collectionController = require('./collection.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { param } = require('express-validator');
const collectionValidator = require('./collection.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

router.use(authenticate);

router.post('/', validateJoi(collectionValidator.createCollection, 'body'), collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.get('/:id', param('id').isMongoId(), validate, collectionController.getCollectionById);
router.put('/:id', param('id').isMongoId(), validateJoi(collectionValidator.updateCollection, 'body'), validate, collectionController.updateCollection);
router.delete('/:id', param('id').isMongoId(), validate, collectionController.deleteCollection);
router.post('/:id/items', param('id').isMongoId(), validateJoi(collectionValidator.addItem, 'body'), validate, collectionController.addItem);
router.delete('/:id/items', param('id').isMongoId(), validate, collectionController.removeItem);
router.post('/toggle', validateJoi(collectionValidator.toggleItem, 'body'), collectionController.toggleItem);

module.exports = router;

