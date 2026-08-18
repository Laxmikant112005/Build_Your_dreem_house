/**
 * BuildMyHome - Material Service
 * Business logic for materials marketplace
 */

const ApiError = require('../../utils/ApiError');
const Material = require('./material.model');
const { cache } = require('../../config/redis');
const logger = require('../../utils/logger');

class MaterialService {
  /**
   * Get all materials with filters/pagination
   */
  async getMaterials(filters = {}, options = {}) {
    const cacheKey = `materials:${JSON.stringify({ ...filters, ...options })}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const materials = await Material.searchAndFilter(filters, options);
    const total = await Material.countDocuments({ 
      status: 'active', 
      stockQuantity: { $gt: 0 },
      ...filters 
    });

    const result = {
      materials,
      pagination: {
        page: options.page || 1,
        limit: options.limit || 20,
        total,
        totalPages: Math.ceil(total / (options.limit || 20)),
      },
    };

    await cache.set(cacheKey, result, 300); // 5 min
    return result;
  }

  /**
   * Get featured materials for homepage/marketplace
   */
  async getFeaturedMaterials(limit = 8) {
    const cacheKey = `materials:featured:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const materials = await Material.getFeatured(limit);
    await cache.set(cacheKey, materials, 600);
    return materials;
  }

  /**
   * Get single material by ID
   */
  async getMaterialById(id) {
    const material = await Material.findById(id);
    if (!material || material.status !== 'active' || material.stockQuantity === 0) {
      throw new ApiError(404, 'Material not found or out of stock');
    }
    return material;
  }

  /**
   * Create new material (admin/engineer only)
   */
  async createMaterial(materialData, userId) {
    const material = await Material.create({
      ...materialData,
      createdBy: userId, // Virtual ref if needed
    });
    logger.info(`Material created: ${material.id} by user ${userId}`);
    
    // Invalidate caches
    await cache.del('materials:featured:*');
    return material;
  }

  /**
   * Update material (admin only)
   */
  async updateMaterial(id, updateData) {
    const material = await Material.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!material) {
      throw new ApiError(404, 'Material not found');
    }
    
    logger.info(`Material updated: ${id}`);
    await cache.del('materials:featured:*');
    return material;
  }

  /**
   * Delete/update stock (admin)
   */
  async deleteMaterial(id, userId) {
    const material = await Material.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!material) {
      throw new ApiError(404, 'Material not found');
    }
    
    logger.info(`Material soft-deleted: ${id} by ${userId}`);
    return material;
  }

  /**
   * Update stock quantity
   */
  async updateStock(id, quantity) {
    const material = await Material.findByIdAndUpdate(
      id,
      { $set: { stockQuantity: quantity } },
      { new: true }
    );
    
    if (!material) {
      throw new ApiError(404, 'Material not found');
    }
    
    await cache.del('materials:featured:*');
    return material;
  }

  /**
   * Get materials by category
   */
  async getByCategory(category, options = {}) {
    return this.getMaterials({ category }, options);
  }

  /**
   * Search materials
   */
  async search(query, options = {}) {
    return this.getMaterials({ search: query }, options);
  }
}

module.exports = new MaterialService();

