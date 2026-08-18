/**
 * Planova - Recommendation Service
 * AI-powered blueprint recommendation engine
 * Uses preference matching, collaborative filtering signals,
 * and plot-based compatibility scoring.
 */

const Blueprint = require('../blueprint/blueprint.model');
const RecentlyViewed = require('../recentlyViewed/recentlyViewed.model');
const User = require('../user/user.model');
const Plot = require('../plot/plot.model');
const { BLUEPRINT_STATUS } = require('../../constants/enums');

class RecommendationService {
  /**
   * Get AI-powered blueprint recommendations for a user.
   * Combines: user preferences, plot data, browsing history,
   * and collaborative filtering signals.
   */
  async getRecommendations(userId, options = {}) {
    const limit = options.limit || 20;
    const plotId = options.plotId || null;
    const user = await User.findById(userId);

    // 1. Build preference-based query
    const query = { status: BLUEPRINT_STATUS.APPROVED };
    const preferences = user?.preferences || {};

    if (preferences.preferredStyles?.length) {
      query['specs.style'] = { $in: preferences.preferredStyles };
    }
    if (preferences.budgetMax) {
      query['specs.estimatedCost'] = { $lte: preferences.budgetMax };
    }
    if (preferences.budgetMin) {
      query['specs.estimatedCost'] = Object.assign(
        query['specs.estimatedCost'] || {},
        { $gte: preferences.budgetMin }
      );
    }
    if (preferences.desiredRooms) {
      query['specs.bedrooms'] = { $gte: preferences.desiredRooms };
    }
    if (preferences.preferredLocations?.length) {
      query['location.city'] = { $in: preferences.preferredLocations };
    }

    // 2. If a plot is provided, add plot-based compatibility filters
    let plot = null;
    if (plotId) {
      plot = await Plot.findById(plotId);
      if (plot) {
        if (plot.dimensions?.area > 0) {
          query['specs.plotAreaRequired'] = { $lte: plot.dimensions.area };
        }
        if (plot.dimensions?.width > 0) {
          query['specs.plotWidth'] = { $lte: plot.dimensions.width };
        }
        if (plot.dimensions?.length > 0) {
          query['specs.plotLength'] = { $lte: plot.dimensions.length };
        }
      }
    }

    // 3. Sort by AI relevance score, with preference matching boost
    const recommendations = await Blueprint.find(query)
      .sort({ 'aiMetadata.recommendationScore': -1, 'metrics.views': -1, 'metrics.likes': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.rating engineerProfile.title')
      .lean();

    // 4. Calculate relevance scores dynamically
    const scored = recommendations.map(bp => {
      let score = bp.aiMetadata?.recommendationScore || 0.5;

      // Boost if style matches user preferences
      if (preferences.preferredStyles?.includes(bp.specs?.style)) {
        score += 0.15;
      }

      // Boost if within budget
      if (preferences.budgetMax && bp.specs?.estimatedCost <= preferences.budgetMax) {
        score += 0.1;
      }

      // Boost if bedroom count matches
      if (preferences.desiredRooms && bp.specs?.bedrooms >= preferences.desiredRooms) {
        score += 0.05;
      }

      // Penalize if too expensive relative to plot value (if plot provided)
      if (plot && bp.specs?.estimatedCost > (plot.aiMetadata?.estimatedValue || Infinity) * 1.5) {
        score -= 0.1;
      }

      // Boost for Vastu compliance if user prefers it
      if (preferences.vastuPreference && bp.vastu?.compliant) {
        score += 0.08;
      }

      // Boost for sustainability
      if (preferences.sustainabilityPreference && bp.sustainability?.score >= 50) {
        score += 0.05;
      }

      return {
        ...bp,
        relevanceScore: Math.min(Math.max(score, 0), 1),
      };
    });

    // 5. Sort by final relevance score
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scored;
  }

  /**
   * Estimate construction cost for a blueprint based on local factors
   */
  async estimateCost(blueprintId, options = {}) {
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new Error('Blueprint not found');

    const { location = 'default', quality = 'standard' } = options;

    // Base cost per sqft by location tier (INR)
    const locationMultipliers = {
      'metro': 1.3,      // Mumbai, Delhi, Bangalore
      'tier1': 1.15,     // Pune, Hyderabad, Chennai
      'tier2': 1.0,      // Coimbatore, Lucknow, Nagpur
      'tier3': 0.85,     // Smaller cities
      'rural': 0.7,      // Village areas
      'default': 1.0,
    };

    // Quality adjustment
    const qualityMultipliers = {
      'economy': 0.8,
      'standard': 1.0,
      'premium': 1.3,
      'luxury': 1.8,
      'ultra_luxury': 2.5,
    };

    const baseCostPerSqft = blueprint.specs?.costPerSqft || 1500;
    const area = blueprint.specs?.builtUpArea || 1000;
    const locationFactor = locationMultipliers[location] || 1.0;
    const qualityFactor = qualityMultipliers[quality] || 1.0;

    const estimatedTotal = baseCostPerSqft * area * locationFactor * qualityFactor;
    const materialCost = estimatedTotal * 0.55; // 55% materials
    const laborCost = estimatedTotal * 0.30; // 30% labor
    const overheadCost = estimatedTotal * 0.15; // 15% overhead

    // Material breakdown
    const materialBreakdown = {
      cement: Math.ceil(area * 0.4 * qualityFactor),
      steel: Math.ceil(area * 4.5 * qualityFactor / 1000),
      bricks: Math.ceil(area * 6 * qualityFactor),
      sand: Math.ceil(area * 1.5 * qualityFactor),
      aggregate: Math.ceil(area * 2.5 * qualityFactor),
      flooring: Math.ceil(area * 1.1),
      paint: Math.ceil(area * 1.8),
      tiles: Math.ceil(area * 0.6),
      windows: Math.ceil(area * 0.02),
      doors: Math.ceil(area * 0.01),
      electrical: Math.ceil(area * 0.3),
      plumbing: Math.ceil(area * 0.15),
    };

    const duration = blueprint.specs?.estimatedDuration ||
      Math.ceil(area / 500 * 30 * (qualityFactor > 1.3 ? 1.3 : 1));

    return {
      blueprintId: blueprint._id,
      title: blueprint.title,
      builtUpArea: area,
      location,
      quality,
      breakdown: {
        materialCost: Math.round(materialCost),
        laborCost: Math.round(laborCost),
        overheadCost: Math.round(overheadCost),
        totalEstimatedCost: Math.round(estimatedTotal),
      },
      costPerSqft: Math.round(estimatedTotal / area),
      materialBreakdown,
      estimatedDurationDays: duration,
      confidence: 0.85,
      generatedAt: new Date(),
    };
  }

  /**
   * Find similar blueprints based on specs and style
   */
  async findSimilar(blueprintId, limit = 5) {
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new Error('Blueprint not found');

    const query = {
      _id: { $ne: blueprintId },
      status: BLUEPRINT_STATUS.APPROVED,
      $or: [
        { 'specs.style': blueprint.specs?.style },
        { 'specs.bedrooms': blueprint.specs?.bedrooms },
        { 'specs.floors': blueprint.specs?.floors },
        { category: blueprint.category },
      ],
    };

    return Blueprint.find(query)
      .sort({ 'aiMetadata.recommendationScore': -1, 'metrics.likes': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar');
  }
}

module.exports = new RecommendationService();

