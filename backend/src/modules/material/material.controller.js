/**
 * BuildMyHome - Material Controller
 * Request handlers for material marketplace endpoints
 */

const materialService = require('./material.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all materials (filtered/paginated)
 */
const getMaterials = asyncHandler(async (req, res) => {
  const { 
    category, search, minPrice, maxPrice, tags, 
    page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' 
  } = req.query;

  const filters = {
    ...(category && { category }),
    ...(minPrice && { minPrice: parseFloat(minPrice) }),
    ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
    ...(search && { search }),
    ...(tags && { tags: tags.split(',') }),
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const result = await materialService.getMaterials(filters, options);
  ApiResponse.ok(res, 'Materials retrieved successfully', result);
});

/**
 * Get featured materials
 */
const getFeaturedMaterials = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  const materials = await materialService.getFeaturedMaterials(parseInt(limit));
  ApiResponse.ok(res, 'Featured materials retrieved', materials);
});

/**
 * Get single material
 */
const getMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.getMaterialById(req.params.id);
  ApiResponse.ok(res, 'Material retrieved successfully', material);
});

/**
 * Create material (admin)
 */
const createMaterial = asyncHandler(async (req, res) => {
  req.body.createdBy = req.userId;
  const material = await materialService.createMaterial(req.body, req.userId);
  ApiResponse.created(res, 'Material created successfully', material);
});

/**
 * Update material (admin)
 */
const updateMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.updateMaterial(req.params.id, req.body);
  ApiResponse.ok(res, 'Material updated successfully', material);
});

/**
 * Delete material (admin)
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.deleteMaterial(req.params.id, req.userId);
  ApiResponse.ok(res, 'Material deleted successfully', material);
});

/**
 * Materials by category
 */
const getMaterialsByCategory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await materialService.getByCategory(req.params.category, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  ApiResponse.ok(res, `Materials in ${req.params.category}`, result);
});

module.exports = {
  getMaterials,
  getFeaturedMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByCategory,
};

