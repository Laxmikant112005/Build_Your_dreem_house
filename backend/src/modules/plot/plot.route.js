/**
 * Planova - Plot Routes
 * API routes for GeoSpatial plot/land mapping
 */

const express = require('express');
const router = express.Router();
const plotController = require('./plot.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { param } = require('express-validator');
const plotValidator = require('./plot.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// All plot routes require authentication
router.use(authenticate);

// GeoSpatial query routes
router.post('/intersecting', plotController.findIntersecting);
router.get('/nearby', plotController.findNearby);

// CRUD routes
router.post('/', validateJoi(plotValidator.createPlot, 'body'), plotController.createPlot);
router.get('/', plotController.getUserPlots);
router.get('/:id', param('id').isMongoId(), validate, plotController.getPlot);
router.put('/:id', param('id').isMongoId(), validateJoi(plotValidator.updatePlot, 'body'), validate, plotController.updatePlot);
router.patch('/:id/primary', param('id').isMongoId(), validate, plotController.setPrimaryPlot);
router.delete('/:id', param('id').isMongoId(), validate, plotController.deletePlot);

module.exports = router;

