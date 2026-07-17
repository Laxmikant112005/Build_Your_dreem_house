/**
 * BuildMyHome - Material Routes
 * API routes for materials marketplace
 */

const express = require('express');
const materialController = require('./material.controller');
const { validateJoiRequest } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const materialValidator = require('./material.validator');
const { USER_ROLES } = require('../../constants/enums');

const router = express.Router();

/**
 * Public routes
 */
router.get('/', materialController.getMaterials); // ?category=paint&minPrice=100&maxPrice=1000&page=1
router.get('/featured', materialController.getFeaturedMaterials);
router.get('/category/:category', materialController.getMaterialsByCategory);
router.get('/:id', materialController.getMaterial);

/**
 * Protected routes (Admin/Engineer)
 */
router.use(authenticate);
router.post('/', 
  authorize([USER_ROLES.ADMIN, USER_ROLES.ENGINEER]),
validateJoiRequest(materialValidator.createMaterial),
  materialController.createMaterial
);

router.put('/:id', 
  authorize([USER_ROLES.ADMIN, USER_ROLES.ENGINEER]),
validateJoiRequest(materialValidator.updateMaterial),
  materialController.updateMaterial
);

router.delete('/:id', 
  authorize([USER_ROLES.ADMIN]),
  materialController.deleteMaterial
);

module.exports = router;

