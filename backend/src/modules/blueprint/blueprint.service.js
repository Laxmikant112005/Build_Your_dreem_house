/**
 * Planova - Blueprint Service
 * Business logic for the Professional Blueprint Marketplace
 */

const mongoose = require('mongoose');
const Blueprint = require('./blueprint.model');
const ApiError = require('../../utils/ApiError');
const { BLUEPRINT_STATUS } = require('../../constants/enums');
const { cache } = require('../../config/redis');

class BlueprintService {
  /**
   * Create a new blueprint
   */
  async createBlueprint(engineerId, blueprintData) {
    const blueprint = await Blueprint.create({
      ...blueprintData,
      engineerId,
    });
    return blueprint;
  }

  /**
   * Get blueprint by ID
   */
  async getBlueprintById(blueprintId, incrementView = false) {
    if (!mongoose.Types.ObjectId.isValid(blueprintId)) {
      throw new ApiError(400, 'Invalid blueprint ID format');
    }

    const cacheKey = `blueprint:${blueprintId}`;
    if (!incrementView) {
      const cached = await cache.get(cacheKey);
      if (cached) return cached;
    }

    const blueprint = await Blueprint.findById(blueprintId)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.title engineerProfile.rating');

    if (!blueprint) {
      throw new ApiError(404, 'Blueprint not found');
    }

    if (incrementView) {
      blueprint.metrics.views += 1;
      await blueprint.save();
    }

    await cache.set(cacheKey, blueprint, 300);
    return blueprint;
  }

  /**
   * Get blueprint by slug
   */
  async getBlueprintBySlug(slug) {
    const blueprint = await Blueprint.findOne({ slug })
      .populate('engineerId', 'firstName lastName avatar engineerProfile.title engineerProfile.rating');
    if (!blueprint) throw new ApiError(404, 'Blueprint not found');
    return blueprint;
  }

  /**
   * Update blueprint
   */
  async updateBlueprint(blueprintId, engineerId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(blueprintId) || !mongoose.Types.ObjectId.isValid(engineerId)) {
      throw new ApiError(400, 'Invalid ID format');
    }
    const blueprint = await Blueprint.findOne({ _id: blueprintId, engineerId });
    if (!blueprint) throw new ApiError(404, 'Blueprint not found or unauthorized');
    if (blueprint.status === BLUEPRINT_STATUS.APPROVED) {
      throw new ApiError(400, 'Cannot update approved blueprint');
    }
    Object.assign(blueprint, updateData);
    await blueprint.save();
    await cache.del(`blueprint:${blueprintId}`);
    return blueprint;
  }

  /**
   * Delete blueprint
   */
  async deleteBlueprint(blueprintId, engineerId) {
    if (!mongoose.Types.ObjectId.isValid(blueprintId) || !mongoose.Types.ObjectId.isValid(engineerId)) {
      throw new ApiError(400, 'Invalid ID format');
    }
    const blueprint = await Blueprint.findOneAndDelete({ _id: blueprintId, engineerId });
    if (!blueprint) throw new ApiError(404, 'Blueprint not found or unauthorized');
    await cache.del(`blueprint:${blueprintId}`);
    return true;
  }

  /**
   * Get blueprints with filters and pagination
   */
  async getBlueprints(filters = {}, options = {}) {
    const {
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
    } = options;

    const query = { status: BLUEPRINT_STATUS.APPROVED };

    if (filters.search) query.$text = { $search: filters.search };
    if (filters.style) query['specs.style'] = filters.style;
    if (filters.category) query.category = filters.category;
    if (filters.minCost || filters.maxCost) {
      query['specs.estimatedCost'] = {};
      if (filters.minCost) query['specs.estimatedCost'].$gte = filters.minCost;
      if (filters.maxCost) query['specs.estimatedCost'].$lte = filters.maxCost;
    }
    if (filters.minCostPerSqft || filters.maxCostPerSqft) {
      query['specs.costPerSqft'] = {};
      if (filters.minCostPerSqft) query['specs.costPerSqft'].$gte = filters.minCostPerSqft;
      if (filters.maxCostPerSqft) query['specs.costPerSqft'].$lte = filters.maxCostPerSqft;
    }
    if (filters.minArea || filters.maxArea) {
      query['specs.builtUpArea'] = {};
      if (filters.minArea) query['specs.builtUpArea'].$gte = filters.minArea;
      if (filters.maxArea) query['specs.builtUpArea'].$lte = filters.maxArea;
    }
    if (filters.minBedrooms) query['specs.bedrooms'] = { $gte: filters.minBedrooms };
    if (filters.floors) query['specs.floors'] = filters.floors;
    if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
    if (filters.state) query['location.state'] = new RegExp(filters.state, 'i');
    if (filters.vastuCompliant === 'true') query['vastu.compliant'] = true;
    if (filters.sustainabilityScore) query['sustainability.score'] = { $gte: filters.sustainabilityScore };
    if (filters.kitchenType) query['specs.kitchen'] = filters.kitchenType;
    if (filters.parkingType) query['specs.parking'] = filters.parkingType;
    if (filters.constructionType) query['specs.constructionType'] = filters.constructionType;
    if (filters.accessTier) query.accessTier = filters.accessTier;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [blueprints, total] = await Promise.all([
      Blueprint.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating engineerProfile.title'),
      Blueprint.countDocuments(query),
    ]);

    return {
      blueprints,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get featured blueprints
   */
  async getFeatured(limit = 10) {
    const cacheKey = `blueprints:featured:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    const blueprints = await Blueprint.getFeatured(limit);
    await cache.set(cacheKey, blueprints, 600);
    return blueprints;
  }

  /**
   * Get trending blueprints
   */
  async getTrending(days = 7, limit = 10) {
    const cacheKey = `blueprints:trending:${days}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    const blueprints = await Blueprint.getTrending(days, limit);
    await cache.set(cacheKey, blueprints, 300);
    return blueprints;
  }

  /**
   * Get AI-recommended blueprints based on user profile
   */
  async getRecommended(user, limit = 20) {
    const preferences = user?.preferences || {};
    const cacheKey = `blueprints:recommended:${user?._id || 'anonymous'}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
    const blueprints = await Blueprint.getRecommended(preferences, limit);
    await cache.set(cacheKey, blueprints, 300);
    return blueprints;
  }

  /**
   * Get engineer blueprints
   */
  async getEngineerBlueprints(engineerId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = { engineerId };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [blueprints, total] = await Promise.all([
      Blueprint.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Blueprint.countDocuments(query),
    ]);
    return {
      blueprints,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Submit blueprint for approval
   */
  async submitForApproval(blueprintId, engineerId) {
    const blueprint = await Blueprint.findOne({ _id: blueprintId, engineerId });
    if (!blueprint) throw new ApiError(404, 'Blueprint not found');
    if (blueprint.status !== BLUEPRINT_STATUS.DRAFT) throw new ApiError(400, 'Blueprint already submitted');
    blueprint.status = BLUEPRINT_STATUS.PENDING;
    await blueprint.save();
    return blueprint;
  }

  /**
   * Approve blueprint (admin)
   */
  async approveBlueprint(blueprintId) {
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new ApiError(404, 'Blueprint not found');
    blueprint.status = BLUEPRINT_STATUS.APPROVED;
    blueprint.publishedAt = new Date();
    await blueprint.save();
    await Promise.all([
      cache.del(`blueprint:${blueprintId}`),
      cache.del('blueprints:featured'),
      cache.del('blueprints:trending'),
    ]);
    return blueprint;
  }

  /**
   * Reject blueprint (admin)
   */
  async rejectBlueprint(blueprintId, reason) {
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new ApiError(404, 'Blueprint not found');
    blueprint.status = BLUEPRINT_STATUS.REJECTED;
    blueprint.rejectionReason = reason;
    await blueprint.save();
    await cache.del(`blueprint:${blueprintId}`);
    return blueprint;
  }

  /**
   * Get related blueprints
   */
  async getRelatedBlueprints(blueprintId, limit = 5) {
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new ApiError(404, 'Blueprint not found');
    const query = {
      _id: { $ne: blueprintId },
      status: BLUEPRINT_STATUS.APPROVED,
      $or: [
        { 'specs.style': blueprint.specs.style },
        { category: blueprint.category },
      ],
    };
    return Blueprint.find(query).limit(limit).populate('engineerId', 'firstName lastName avatar');
  }

  /**
   * Like/unlike blueprint
   */
  async toggleLike(blueprintId, userId) {
    const Favorite = require('../favorite/favorite.model');
    const existing = await Favorite.findOne({ userId, blueprintId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      await Blueprint.findByIdAndUpdate(blueprintId, { $inc: { 'metrics.likes': -1 } });
      return { liked: false };
    }
    await Favorite.create({ userId, blueprintId });
    await Blueprint.findByIdAndUpdate(blueprintId, { $inc: { 'metrics.likes': 1 } });
    return { liked: true };
  }

  /**
   * Get filter options for marketplace
   */
  async getFilterOptions() {
    const [styles, cities, costRange, areaRange, constructionTypes, kitchenTypes, parkingTypes] = await Promise.all([
      Blueprint.distinct('specs.style', { status: BLUEPRINT_STATUS.APPROVED }),
      Blueprint.distinct('location.city', { status: BLUEPRINT_STATUS.APPROVED, 'location.city': { $exists: true } }),
      Blueprint.findOne({ status: BLUEPRINT_STATUS.APPROVED, 'specs.estimatedCost': { $exists: true } })
        .sort({ 'specs.estimatedCost': -1 }).select('specs.estimatedCost'),
      Blueprint.findOne({ status: BLUEPRINT_STATUS.APPROVED })
        .sort({ 'specs.builtUpArea': -1 }).select('specs.builtUpArea'),
      Blueprint.distinct('specs.constructionType', { status: BLUEPRINT_STATUS.APPROVED }),
      Blueprint.distinct('specs.kitchen', { status: BLUEPRINT_STATUS.APPROVED }),
      Blueprint.distinct('specs.parking', { status: BLUEPRINT_STATUS.APPROVED }),
    ]);

    return {
      styles,
      cities: cities.filter(Boolean),
      constructionTypes,
      kitchenTypes,
      parkingTypes,
      costRange: { min: 0, max: costRange?.specs?.estimatedCost || 10000000 },
      areaRange: { min: 0, max: areaRange?.specs?.builtUpArea || 10000 },
      floors: [1, 2, 3, 4, 5],
      bedroomOptions: [1, 2, 3, 4, 5, 6],
      sustainabilityScores: [0, 20, 40, 60, 80, 100],
      vastuOptions: [true, false],
    };
  }
}

module.exports = new BlueprintService();

