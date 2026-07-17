/**
 * Field Routes
 */

const express = require('express');
const router = express.Router();
const fieldController = require('./field.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateJoi } = require('../../middleware/joi.middleware');
const fieldValidator = require('./field.validator');

router.use(authenticate);

// Protected routes
router.post('/', validateJoi(fieldValidator.createField), fieldController.createField);
router.get('/', fieldController.getUserFields);
router.get('/:id', validateJoi(fieldValidator.fieldId), fieldController.getField);
router.put('/:id', validateJoi(fieldValidator.fieldId), fieldController.updateField);
router.patch('/:id/primary', validateJoi(fieldValidator.fieldId), fieldController.setPrimaryField);
router.delete('/:id', validateJoi(fieldValidator.fieldId), fieldController.deleteField);

module.exports = router;

