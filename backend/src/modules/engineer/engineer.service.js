/**
 * BuildMyHome - Engineer Service
 * Business logic for engineer operations
 */

const User = require('../user/user.model');
const Design = require('../design/design.model');
const Blueprint = require('../blueprint/blueprint.model');
const Review = require('../review/review.model');
const Booking = require('../booking/booking.model');
const Appointment = require('../appointment/appointment.model');
const Project = require('../project/project.model');
const Follow = require('../follow/follow.model');
const Favorite = require('../favorite/favorite.model');
const Notification = require('../notification/notification.model');
const { Chat } = require('../chat/chat.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const { ROLE } = require('../../constants/roles');
const { DESIGN_STATUS, BLUEPRINT_STATUS, APPOINTMENT_STATUS, BOOKING_STATUS } = require('../../constants/enums');

class EngineerService {
  /**
   * Get all engineers with filtering and pagination
   */
  async getEngineers(filters, options) {
    const { page = 1, limit = 20, sortBy = 'rating', sortOrder = 'desc' } = options;
    const { city, style, minRating, minExperience, lat, lng, radiusKm = 50 } = filters;

    // Build query
    const query = {
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
    };

    // Add filters
    // If lat/lng provided, perform geo query for nearby engineers
    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      const maxDistance = (parseFloat(radiusKm) || 50) * 1000; // meters
      query['engineerProfile.serviceAreas.location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistance,
        },
      };
    } else if (city) {
      // Fallback: check serviceAreas text field or engineer's location fields if present
      query['engineerProfile.serviceAreas'] = {
        $elemMatch: { radiusKm: { $exists: true } }
      };
    }

    if (minRating) {
      query['engineerProfile.rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
      query['engineerProfile.experience'] = { $gte: parseInt(minExperience) };
    }

    // Build sort
    const sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions['engineerProfile.rating.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'experience':
        sortOptions['engineerProfile.experience'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortOptions.firstName = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortOptions['engineerProfile.rating.average'] = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [engineers, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName avatar phone engineerProfile createdAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return {
      engineers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get engineer by ID with full profile
   */
  async getEngineerById(engineerId) {
    const engineer = await User.findOne({
      _id: engineerId,
      role: ROLE.ENGINEER,
      isActive: true,
    }).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    // Get additional stats
    const [totalDesigns, totalBookings, completedBookings] = await Promise.all([
      Design.countDocuments({ engineerId, status: DESIGN_STATUS.APPROVED }),
      Booking.countDocuments({ engineerId }),
      Booking.countDocuments({ engineerId, status: 'completed' }),
    ]);

    return {
      ...engineer.toObject(),
      stats: {
        totalDesigns,
        totalBookings,
        completedBookings,
      },
    };
  }

  /**
   * Get featured engineers (highest rated)
   */
  async getFeaturedEngineers(limit = 10) {
    const engineers = await User.find({
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
      'engineerProfile.rating.average': { $gte: 4.0 },
    })
      .select('firstName lastName avatar engineerProfile')
      .sort({ 'engineerProfile.rating.average': -1, 'engineerProfile.rating.count': -1 })
      .limit(parseInt(limit));

    return engineers;
  }

  /**
   * Get designs by engineer
   */
  async getEngineerDesigns(engineerId, options) {
    const { page = 1, limit = 20, status = 'approved' } = options;

    const query = {
      engineerId,
      status: status === 'all' ? { $in: Object.values(DESIGN_STATUS) } : status,
    };

    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Design.countDocuments(query),
    ]);

    return {
      designs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviews for engineer
   */
  async getEngineerReviews(engineerId, options) {
    const { page = 1, limit = 20 } = options;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ engineerId })
        .populate('userId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ engineerId }),
    ]);

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId) } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      reviews,
      rating: ratingStats[0] || { average: 0, count: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update engineer profile
   */
  async updateProfile(userId, updateData) {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'engineerProfile',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        if (key === 'engineerProfile') {
// Handle nested engineer profile updates
          const profileFields = [
            'title',
            'company',
            'bio',
            'licenseNumber',
            'licenseFile',
            'specializations',
            'experience',
            'yearsOfExperience',
            'hourlyRate',
            'projectRate',
            'currency',
            'serviceAreas',
            'availability',
            'availabilitySlots',
            'education',
            'certifications',
            'portfolio',
          ];
          for (const field of profileFields) {
            if (updateData.engineerProfile[field] !== undefined) {
              // Allow serviceAreas to be provided as [{ coordinates: [lng, lat], radiusKm }] or legacy format
              if (field === 'serviceAreas') {
                const areas = updateData.engineerProfile.serviceAreas.map(a => {
                  if (a.location && Array.isArray(a.location.coordinates)) {
                    return {
                      location: {
                        type: 'Point',
                        coordinates: a.location.coordinates,
                      },
                      radiusKm: a.radiusKm || a.radius || null,
                    };
                  }
                  if (a.lng !== undefined && a.lat !== undefined) {
                    return {
                      location: { type: 'Point', coordinates: [a.lng, a.lat] },
                      radiusKm: a.radiusKm || a.radius || null,
                    };
                  }
                  // fallback: keep as-is
                  return a;
                });
                updates[`engineerProfile.${field}`] = areas;
              } else {
                updates[`engineerProfile.${field}`] = updateData.engineerProfile[field];
              }
            }
          }
        } else {
          updates[key] = updateData[key];
        }
      }
    }

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    return engineer;
  }

  /**
   * Update engineer availability
   */
  async updateAvailability(userId, availability) {
    // Validate availability format
    if (!Array.isArray(availability)) {
      throw new ApiError(400, 'Availability must be an array');
    }

    for (const slot of availability) {
      if (slot.dayOfWeek === undefined || !slot.startTime || !slot.endTime) {
        throw new ApiError(400, 'Each availability slot must have dayOfWeek, startTime, and endTime');
      }
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new ApiError(400, 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $set: { 'engineerProfile.availability': availability } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    return engineer;
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(userId, portfolioItem) {
    const { title, description, images, completedDate } = portfolioItem;

    if (!title) {
      throw new ApiError(400, 'Portfolio title is required');
    }

    const newPortfolioItem = {
      title,
      description,
      images: images || [],
      completedDate: completedDate ? new Date(completedDate) : null,
    };

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $push: { 'engineerProfile.portfolio': newPortfolioItem } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    // Return the newly added portfolio item
    const portfolio = engineer.engineerProfile.portfolio;
    return portfolio[portfolio.length - 1];
  }

  /**
   * Remove portfolio item
   */
  async removePortfolioItem(userId, portfolioId) {
    const engineer = await User.findOneAndUpdate(
      {
        _id: userId,
        role: ROLE.ENGINEER,
        'engineerProfile.portfolio._id': portfolioId,
      },
      {
        $pull: { 'engineerProfile.portfolio': { _id: portfolioId } },
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Portfolio item not found');
    }

    return engineer;
  }

/**
   * Submit/update the authenticated engineer's verification application.
   * This only sets the application data + resets status to PENDING; actual
   * approval/rejection is enforced through the ADMIN verifyEngineer service.
   */
  async submitVerification(userId, data) {
    const engineer = await User.findById(userId);
    if (!engineer) throw new ApiError(404, 'Engineer not found');
    if (engineer.role !== ROLE.ENGINEER) {
      throw new ApiError(403, 'Only engineers can submit verification');
    }

    // Prevent re-submitting while already approved
    if (engineer.engineerProfile?.verificationStatus === 'approved') {
      throw new ApiError(400, 'Your profile is already verified');
    }

    const updates = {};
    if (data.licenseNumber !== undefined) updates['engineerProfile.licenseNumber'] = data.licenseNumber;
    if (data.licenseFile !== undefined) updates['engineerProfile.licenseFile.url'] = data.licenseFile.url;
    if (data.licenseFile !== undefined && data.licenseFile.name) updates['engineerProfile.licenseFile.name'] = data.licenseFile.name;
    if (data.yearsOfExperience !== undefined) updates['engineerProfile.yearsOfExperience'] = data.yearsOfExperience;
    if (data.education !== undefined) updates['engineerProfile.education'] = data.education;
    if (data.certifications !== undefined) updates['engineerProfile.certifications'] = data.certifications;
    // Only allow resubmission if previously rejected or new
    updates['engineerProfile.verificationStatus'] = 'pending';
    updates['engineerProfile.isVerified'] = false;
    updates['engineerProfile.rejectionReason'] = null;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return {
      verificationStatus: updated.engineerProfile.verificationStatus,
      isVerified: updated.engineerProfile.isVerified,
      rejectionReason: updated.engineerProfile.rejectionReason,
      submittedAt: new Date(),
    };
  }

  /**
   * Get the authenticated engineer's verification status.
   */
  async getVerificationStatus(userId) {
    const engineer = await User.findById(userId).select('-password -refreshToken');
    if (!engineer) throw new ApiError(404, 'Engineer not found');
    return {
      verificationStatus: engineer.engineerProfile?.verificationStatus || 'pending',
      isVerified: engineer.engineerProfile?.isVerified || false,
      rejectionReason: engineer.engineerProfile?.rejectionReason || null,
      licenseNumber: engineer.engineerProfile?.licenseNumber || null,
      licenseFile: engineer.engineerProfile?.licenseFile || null,
    };
  }

  /**
   * Get engineer statistics
   */
  async getEngineerStats(engineerId) {
    const [
      totalDesigns,
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalReviews,
    ] = await Promise.all([
      Design.countDocuments({ engineerId, status: DESIGN_STATUS.APPROVED }),
      Booking.countDocuments({ engineerId }),
      Booking.countDocuments({ engineerId, status: 'completed' }),
      Booking.countDocuments({ engineerId, status: 'cancelled' }),
      Booking.countDocuments({ engineerId, status: 'pending' }),
      Review.countDocuments({ engineerId }),
    ]);

    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId) } },
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Get monthly bookings for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId),
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      designs: {
        total: totalDesigns,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
        completionRate: totalBookings > 0 
          ? ((completedBookings / totalBookings) * 100).toFixed(2) 
          : 0,
      },
      reviews: {
        total: totalReviews,
        breakdown: ratingBreakdown,
      },
      monthlyBookings,
    };
  }

  /**
   * Get engineer dashboard aggregation for the authenticated engineer.
   * All values are computed from real database data.
   */
  async getEngineerDashboard(engineerId) {
    const oid = new mongoose.Types.ObjectId(engineerId);

    const [
      engineer,
      profileViews,
      totalBlueprints,
      draftBlueprints,
      publishedBlueprints,
      portfolioViews,
      totalDesigns,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      completedBookings,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalProjects,
      activeProjects,
      completedProjects,
      totalReviews,
      avgRating,
      totalFollowers,
      totalFavorites,
      totalChats,
      unreadNotifications,
    ] = await Promise.all([
      User.findById(oid).select('-password -refreshToken').lean(),

// Profile views (tracked via RecentlyViewed with itemType 'engineer')
      (async () => {
        try {
          const RecentlyViewed = mongoose.models.RecentlyViewed || require('../recentlyViewed/recentlyViewed.model');
          return RecentlyViewed.countDocuments({ itemType: 'engineer', itemId: oid });
        } catch { return 0; }
      })(),

      // Blueprints
      Blueprint.countDocuments({ engineerId: oid }),
      Blueprint.countDocuments({ engineerId: oid, status: BLUEPRINT_STATUS.DRAFT }),
      Blueprint.countDocuments({ engineerId: oid, status: BLUEPRINT_STATUS.APPROVED }),

      // Blueprint aggregate views + saves (fallback to count when no view field)
      (async () => {
        const agg = await Blueprint.aggregate([
          { $match: { engineerId: oid } },
          {
            $group: {
              _id: null,
              views: { $sum: '$metrics.views' },
              saves: { $sum: '$metrics.saves' },
              likes: { $sum: '$metrics.likes' },
              downloads: { $sum: '$metrics.downloads' },
            },
          },
        ]);
        const row = agg[0] || {};
        return {
          views: row.views || 0,
          saves: row.saves || 0,
          likes: row.likes || 0,
          downloads: row.downloads || 0,
        };
      })(),

      // Legacy designs
      Design.countDocuments({ engineerId: oid }),

      // Bookings
      Booking.countDocuments({ engineerId: oid }),
      Booking.countDocuments({ engineerId: oid, status: BOOKING_STATUS.PENDING }),
      Booking.countDocuments({ engineerId: oid, status: BOOKING_STATUS.CONFIRMED }),
      Booking.countDocuments({ engineerId: oid, status: BOOKING_STATUS.REJECTED }),
      Booking.countDocuments({ engineerId: oid, status: BOOKING_STATUS.COMPLETED }),

      // Appointments
      Appointment.countDocuments({ engineerId: oid }),
      Appointment.countDocuments({ engineerId: oid, startAt: { $gte: new Date() }, status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.ACCEPTED] } }),
      Appointment.countDocuments({ engineerId: oid, status: APPOINTMENT_STATUS.COMPLETED }),

      // Projects
      Project.countDocuments({
        isActive: true,
        $or: [{ engineerId: oid }, { 'members.userId': oid }],
      }),
      Project.countDocuments({
        isActive: true,
        status: { $in: ['planning', 'design_approval', 'permit_pending', 'construction_ready', 'under_construction', 'on_hold'] },
        $or: [{ engineerId: oid }, { 'members.userId': oid }],
      }),
      Project.countDocuments({
        isActive: true,
        status: 'completed',
        $or: [{ engineerId: oid }, { 'members.userId': oid }],
      }),

      // Reviews
      Review.countDocuments({ engineerId: oid }),

      // Average rating
      (async () => {
        const agg = await Review.aggregate([
          { $match: { engineerId: oid } },
          { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        return agg[0] || { average: 0, count: 0 };
      })(),

      // Followers
      Follow.countDocuments({ engineerId: oid }),

      // Favorites saving blueprints of this engineer (via Blueprint IDs)
      (async () => {
        const ids = await Blueprint.find({ engineerId: oid }).select('_id').lean();
        const blueprintIds = ids.map(b => b._id);
        if (blueprintIds.length === 0) return 0;
        const fav = await Favorite.aggregate([
          { $match: { blueprintId: { $in: blueprintIds } } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        return fav[0]?.count || 0;
      })(),

      // Chats
      Chat.countDocuments({ participants: oid, isActive: true }),

      // Unread notifications
      Notification.countDocuments({ userId: oid, isRead: false, isArchived: false }),
    ]);

    // Profile completion scoring (0-100)
    const ep = engineer?.engineerProfile || {};
    const completionParts = [
      { done: !!(engineer?.firstName && engineer?.lastName), weight: 10 },
      { done: !!engineer?.avatar, weight: 10 },
      { done: !!ep?.bio, weight: 10 },
      { done: !!ep?.title, weight: 10 },
      { done: Array.isArray(ep?.specializations) && ep.specializations.length > 0, weight: 15 },
      { done: (ep?.yearsOfExperience ?? 0) > 0, weight: 10 },
      { done: Array.isArray(ep?.serviceAreas) && ep.serviceAreas.length > 0, weight: 10 },
      { done: Array.isArray(ep?.availability) && ep.availability.length > 0, weight: 10 },
      { done: !!ep?.licenseNumber || !!ep?.licenseFile, weight: 15 },
    ];
    const completion = completionParts.reduce((sum, p) => sum + (p.done ? p.weight : 0), 0);
    const completionLabel =
      completion === 100 ? 'Complete' :
      completion >= 80 ? 'Almost Complete' :
      completion >= 50 ? 'Developing' : 'Incomplete';

    const reviewsCount = (avgRating?.count || totalReviews);
    const bookingCompletionRate = totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0;

    // Recent activity
    const [recentNotifications, recentReviews, recentMessages] = await Promise.all([
      Notification.find({ userId: oid, isArchived: false })
        .sort({ createdAt: -1 }).limit(5).lean(),
      Review.find({ engineerId: oid })
        .sort({ createdAt: -1 }).limit(3)
        .populate('userId', 'firstName lastName avatar').lean(),
      Chat.find({ participants: oid, isActive: true })
        .sort({ updatedAt: -1 }).limit(4)
        .populate('participants', 'firstName lastName avatar').lean(),
    ]);

    // Pending requests summary (bookings + appointment requests)
    const [recentBookings, recentAppointments] = await Promise.all([
      Booking.find({ engineerId: oid })
        .sort({ createdAt: -1 }).limit(5)
        .populate('userId', 'firstName lastName avatar').lean(),
      Appointment.find({ engineerId: oid, status: APPOINTMENT_STATUS.PENDING })
        .sort({ startAt: 1 }).limit(5)
        .populate('clientId', 'firstName lastName avatar').lean(),
    ]);

    const alerts = [];
    if (pendingBookings > 0) alerts.push({ type: 'booking', message: `${pendingBookings} pending booking request(s)` });
    if (ep?.verificationStatus === 'pending') alerts.push({ type: 'verification', message: 'Your verification is pending admin review' });
    if (unreadNotifications > 0) alerts.push({ type: 'notification', message: `${unreadNotifications} unread notification(s)` });

    return {
      profile: {
        name: engineer ? `${engineer.firstName} ${engineer.lastName}` : '',
        avatar: engineer?.avatar || null,
        title: ep?.title || null,
        isVerified: ep?.isVerified || false,
        verificationStatus: ep?.verificationStatus || 'pending',
        yearsOfExperience: ep?.yearsOfExperience || 0,
        specializations: ep?.specializations || [],
        rating: avgRating?.average || 0,
        ratingCount: reviewsCount,
        followers: totalFollowers,
        profileViews: profileViews,
        completion,
        completionLabel,
        availability: ep?.availability || [],
      },
      work: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        completedBookings,
        bookingCompletionRate,
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        approvedBlueprints: publishedBlueprints,
        draftBlueprints,
      },
      portfolio: {
        totalBlueprints,
        draftBlueprints,
        publishedBlueprints,
        portfolioViews,
        totalDesigns,
        blueprintViews: portfolioViews?.views || 0,
        blueprintSaves: portfolioViews?.saves || 0,
        favorites: totalFavorites,
        views: portfolioViews?.views || 0,
        totalFavorites,
      },
      reviews: {
        average: avgRating?.average || 0,
        total: reviewsCount,
        recent: recentReviews,
      },
      activity: {
        recentNotifications,
        recentBookings,
        recentAppointments,
        recentMessages,
      },
      alerts,
      chat: {
        totalChats,
        unreadCount: 0,
      },
      notifications: {
        unread: unreadNotifications,
      },
    };
  }

  /**
   * Search engineers by name or specialization
   */
  async searchEngineers(searchQuery, options) {
    const { page = 1, limit = 20 } = options;

    const query = {
      role: ROLE.ENGINEER,
      isActive: true,
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { 'engineerProfile.specializations': { $regex: searchQuery, $options: 'i' } },
      ],
    };

    const skip = (page - 1) * limit;

    const [engineers, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName avatar engineerProfile')
        .sort({ 'engineerProfile.rating.average': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return {
      engineers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new EngineerService();
/**
 * Planova - Engineer Service
 *
 * Business logic for:
 * - Engineer discovery
 * - Engineer profiles
 * - Engineer verification
 * - Portfolio management
 * - Availability
 * - Reviews
 * - Engineer statistics
 * - Engineer dashboard
 *
 * Supports both:
 * - New Blueprint architecture
 * - Legacy Design architecture
 */

const mongoose = require('mongoose');

const User = require('../user/user.model');
const Design = require('../design/design.model');
const Blueprint = require('../blueprint/blueprint.model');
const Review = require('../review/review.model');
const Booking = require('../booking/booking.model');
const Appointment = require('../appointment/appointment.model');
const Project = require('../project/project.model');
const Follow = require('../follow/follow.model');
const Favorite = require('../favorite/favorite.model');
const Notification = require('../notification/notification.model');
const { Chat } = require('../chat/chat.model');

const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const { ROLE } = require('../../constants/roles');

const {
  DESIGN_STATUS,
  BLUEPRINT_STATUS,
  APPOINTMENT_STATUS,
  BOOKING_STATUS,
} = require('../../constants/enums');

/**
 * Convert a value into a valid MongoDB ObjectId.
 *
 * @param {string|mongoose.Types.ObjectId} id
 * @param {string} fieldName
 * @returns {mongoose.Types.ObjectId}
 */
const toObjectId = (id, fieldName = 'ID') => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(id);
};

/**
 * Safely convert pagination values.
 */
const normalizePagination = (page = 1, limit = 20) => {
  let normalizedPage = Number.parseInt(page, 10);
  let normalizedLimit = Number.parseInt(limit, 10);

  if (!Number.isFinite(normalizedPage) || normalizedPage < 1) {
    normalizedPage = 1;
  }

  if (!Number.isFinite(normalizedLimit) || normalizedLimit < 1) {
    normalizedLimit = 20;
  }

  // Prevent unnecessarily large database queries.
  normalizedLimit = Math.min(normalizedLimit, 100);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

/**
 * Safely parse a number.
 */
const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Get an enum value safely.
 */
const enumValue = (enumObject, key, fallback) => {
  if (enumObject && enumObject[key] !== undefined) {
    return enumObject[key];
  }

  return fallback;
};

class EngineerService {
  /**
   * Get all verified engineers.
   */
  async getEngineers(filters = {}, options = {}) {
    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      options.page,
      options.limit
    );

    const {
      city,
      style,
      minRating,
      minExperience,
      lat,
      lng,
      radiusKm = 50,
    } = filters;

    const query = {
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
    };

    /*
     * Geographic search.
     */
    const latitude = parseOptionalNumber(lat);
    const longitude = parseOptionalNumber(lng);

    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const radius = parseOptionalNumber(radiusKm) || 50;

      query['engineerProfile.serviceAreas.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    /*
     * City filtering.
     *
     * The serviceAreas schema contains city/state fields.
     */
    if (city) {
      query['engineerProfile.serviceAreas'] = {
        $elemMatch: {
          city: {
            $regex: String(city),
            $options: 'i',
          },
        },
      };
    }

    /*
     * Specialization/style filtering.
     */
    if (style) {
      query['engineerProfile.specializations'] = {
        $regex: String(style),
        $options: 'i',
      };
    }

    /*
     * Rating.
     */
    const rating = parseOptionalNumber(minRating);

    if (rating !== undefined) {
      query['engineerProfile.rating.average'] = {
        $gte: rating,
      };
    }

    /*
     * IMPORTANT:
     * User model uses yearsOfExperience,
     * not engineerProfile.experience.
     */
    const experience = parseOptionalNumber(minExperience);

    if (experience !== undefined) {
      query['engineerProfile.yearsOfExperience'] = {
        $gte: experience,
      };
    }

    /*
     * Sorting.
     */
    const sortOptions = {};

    const sortBy = options.sortBy || 'rating';
    const sortOrder =
      String(options.sortOrder || 'desc').toLowerCase() === 'asc'
        ? 1
        : -1;

    switch (sortBy) {
      case 'rating':
        sortOptions['engineerProfile.rating.average'] = sortOrder;
        break;

      case 'experience':
        sortOptions['engineerProfile.yearsOfExperience'] = sortOrder;
        break;

      case 'name':
        sortOptions.firstName = sortOrder;
        sortOptions.lastName = sortOrder;
        break;

      case 'createdAt':
        sortOptions.createdAt = sortOrder;
        break;

      case 'hourlyRate':
        sortOptions['engineerProfile.hourlyRate'] = sortOrder;
        break;

      default:
        sortOptions['engineerProfile.rating.average'] = -1;
    }

    const [engineers, total] = await Promise.all([
      User.find(query)
        .select(
          'firstName lastName avatar phone engineerProfile createdAt'
        )
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(query),
    ]);

    return {
      engineers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one engineer by ID.
   */
  async getEngineerById(engineerId) {
    const oid = toObjectId(engineerId, 'engineer ID');

    const engineer = await User.findOne({
      _id: oid,
      role: ROLE.ENGINEER,
      isActive: true,
    })
      .select('-password -refreshToken')
      .lean();

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    const approvedDesignStatus =
      enumValue(DESIGN_STATUS, 'APPROVED', 'approved');

    const [
      totalDesigns,
      totalBookings,
      completedBookings,
    ] = await Promise.all([
      Design.countDocuments({
        engineerId: oid,
        status: approvedDesignStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: enumValue(
          BOOKING_STATUS,
          'COMPLETED',
          'completed'
        ),
      }),
    ]);

    return {
      ...engineer,

      stats: {
        totalDesigns,
        totalBookings,
        completedBookings,
      },
    };
  }

  /**
   * Get featured engineers.
   */
  async getFeaturedEngineers(limit = 10) {
    const normalizedLimit = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      100
    );

    const engineers = await User.find({
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
      'engineerProfile.rating.average': {
        $gte: 4,
      },
    })
      .select(
        'firstName lastName avatar engineerProfile'
      )
      .sort({
        'engineerProfile.rating.average': -1,
        'engineerProfile.rating.count': -1,
      })
      .limit(normalizedLimit)
      .lean();

    return engineers;
  }

  /**
   * Get designs created by an engineer.
   */
  async getEngineerDesigns(engineerId, options = {}) {
    const oid = toObjectId(engineerId, 'engineer ID');

    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      options.page,
      options.limit
    );

    const status = options.status || 'approved';

    const query = {
      engineerId: oid,
    };

    if (status !== 'all') {
      query.status = status;
    } else {
      query.status = {
        $in: Object.values(DESIGN_STATUS || {}),
      };
    }

    const [
      designs,
      total,
    ] = await Promise.all([
      Design.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Design.countDocuments(query),
    ]);

    return {
      designs,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviews for an engineer.
   */
  async getEngineerReviews(engineerId, options = {}) {
    const oid = toObjectId(engineerId, 'engineer ID');

    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      options.page,
      options.limit
    );

    const [
      reviews,
      total,
      ratingStats,
    ] = await Promise.all([
      Review.find({
        engineerId: oid,
      })
        .populate(
          'userId',
          'firstName lastName avatar'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Review.countDocuments({
        engineerId: oid,
      }),

      Review.aggregate([
        {
          $match: {
            engineerId: oid,
          },
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: '$rating',
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    return {
      reviews,

      rating: ratingStats[0] || {
        average: 0,
        count: 0,
      },

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update engineer profile.
   */
  async updateProfile(userId, updateData = {}) {
    const oid = toObjectId(userId, 'user ID');

    const engineer = await User.findOne({
      _id: oid,
      role: ROLE.ENGINEER,
    });

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    const updates = {};

    const allowedUserFields = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
    ];

    for (const field of allowedUserFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    /*
     * Engineer profile fields that the engineer is allowed to edit.
     *
     * Verification-related fields are intentionally excluded.
     */
    const allowedProfileFields = [
      'title',
      'company',
      'bio',
      'licenseNumber',
      'licenseFile',
      'specializations',
      'yearsOfExperience',
      'hourlyRate',
      'projectRate',
      'currency',
      'serviceAreas',
      'availability',
      'availabilitySlots',
      'education',
      'certifications',
      'portfolio',
    ];

    if (
      updateData.engineerProfile &&
      typeof updateData.engineerProfile === 'object'
    ) {
      for (const field of allowedProfileFields) {
        if (
          updateData.engineerProfile[field] !== undefined
        ) {
          if (field === 'serviceAreas') {
            const areas =
              Array.isArray(
                updateData.engineerProfile.serviceAreas
              )
                ? updateData.engineerProfile.serviceAreas
                : [];

            updates[
              'engineerProfile.serviceAreas'
            ] = areas.map((area) => {
              if (
                area?.location &&
                Array.isArray(
                  area.location.coordinates
                )
              ) {
                return {
                  location: {
                    type: 'Point',
                    coordinates:
                      area.location.coordinates,
                  },
                  radiusKm:
                    area.radiusKm ??
                    area.radius ??
                    null,
                  city: area.city,
                  state: area.state,
                };
              }

              if (
                area?.lng !== undefined &&
                area?.lat !== undefined
              ) {
                return {
                  location: {
                    type: 'Point',
                    coordinates: [
                      Number(area.lng),
                      Number(area.lat),
                    ],
                  },
                  radiusKm:
                    area.radiusKm ??
                    area.radius ??
                    null,
                  city: area.city,
                  state: area.state,
                };
              }

              return area;
            });
          } else {
            updates[
              `engineerProfile.${field}`
            ] =
              updateData.engineerProfile[field];
          }
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return User.findById(oid)
        .select('-password -refreshToken')
        .lean();
    }

    const updatedEngineer =
      await User.findOneAndUpdate(
        {
          _id: oid,
          role: ROLE.ENGINEER,
        },
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select('-password -refreshToken')
        .lean();

    if (!updatedEngineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    return updatedEngineer;
  }

  /**
   * Update engineer weekly availability.
   */
  async updateAvailability(userId, availability) {
    const oid = toObjectId(userId, 'user ID');

    if (!Array.isArray(availability)) {
      throw new ApiError(
        400,
        'Availability must be an array'
      );
    }

    for (const slot of availability) {
      if (
        slot.dayOfWeek === undefined ||
        !slot.startTime ||
        !slot.endTime
      ) {
        throw new ApiError(
          400,
          'Each availability slot must have dayOfWeek, startTime, and endTime'
        );
      }

      const day = Number(slot.dayOfWeek);

      if (
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6
      ) {
        throw new ApiError(
          400,
          'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'
        );
      }
    }

    const engineer =
      await User.findOneAndUpdate(
        {
          _id: oid,
          role: ROLE.ENGINEER,
        },
        {
          $set: {
            'engineerProfile.availability':
              availability,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select('-password -refreshToken')
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    return engineer;
  }

  /**
   * Add portfolio item.
   */
  async addPortfolioItem(
    userId,
    portfolioItem = {}
  ) {
    const oid = toObjectId(userId, 'user ID');

    const {
      title,
      description,
      images,
      blueprintId,
      completedDate,
      clientName,
      projectUrl,
    } = portfolioItem;

    if (
      !title ||
      typeof title !== 'string' ||
      !title.trim()
    ) {
      throw new ApiError(
        400,
        'Portfolio title is required'
      );
    }

    const newPortfolioItem = {
      title: title.trim(),
      description,
      images: Array.isArray(images)
        ? images
        : [],
      completedDate: completedDate
        ? new Date(completedDate)
        : undefined,
      clientName,
      projectUrl,
    };

    if (blueprintId) {
      newPortfolioItem.blueprintId =
        toObjectId(
          blueprintId,
          'blueprint ID'
        );
    }

    const engineer =
      await User.findOneAndUpdate(
        {
          _id: oid,
          role: ROLE.ENGINEER,
        },
        {
          $push: {
            'engineerProfile.portfolio':
              newPortfolioItem,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select('-password -refreshToken')
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const portfolio =
      engineer.engineerProfile?.portfolio || [];

    return portfolio[portfolio.length - 1];
  }

  /**
   * Remove portfolio item.
   */
  async removePortfolioItem(
    userId,
    portfolioId
  ) {
    const userOid =
      toObjectId(userId, 'user ID');

    const portfolioOid =
      toObjectId(
        portfolioId,
        'portfolio ID'
      );

    const engineer =
      await User.findOneAndUpdate(
        {
          _id: userOid,
          role: ROLE.ENGINEER,
          'engineerProfile.portfolio._id':
            portfolioOid,
        },
        {
          $pull: {
            'engineerProfile.portfolio': {
              _id: portfolioOid,
            },
          },
        },
        {
          new: true,
        }
      )
        .select('-password -refreshToken')
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Portfolio item not found'
      );
    }

    return engineer;
  }

  /**
   * Submit engineer verification application.
   */
  async submitVerification(
    userId,
    data = {}
  ) {
    const oid = toObjectId(
      userId,
      'user ID'
    );

    const engineer =
      await User.findById(oid);

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    if (engineer.role !== ROLE.ENGINEER) {
      throw new ApiError(
        403,
        'Only engineers can submit verification'
      );
    }

    const currentStatus =
      engineer.engineerProfile
        ?.verificationStatus;

    const approvedStatus =
      enumValue(
        require('../../constants/enums').VERIFICATION_STATUS,
        'APPROVED',
        'approved'
      );

    if (
      currentStatus === approvedStatus
    ) {
      throw new ApiError(
        400,
        'Your profile is already verified'
      );
    }

    const updates = {};

    if (
      data.licenseNumber !== undefined
    ) {
      updates[
        'engineerProfile.licenseNumber'
      ] = data.licenseNumber;
    }

    if (
      data.licenseFile !== undefined
    ) {
      if (
        typeof data.licenseFile ===
        'string'
      ) {
        updates[
          'engineerProfile.licenseFile.url'
        ] = data.licenseFile;
      } else if (
        data.licenseFile &&
        data.licenseFile.url
      ) {
        updates[
          'engineerProfile.licenseFile.url'
        ] = data.licenseFile.url;

        if (data.licenseFile.name) {
          updates[
            'engineerProfile.licenseFile.name'
          ] =
            data.licenseFile.name;
        }

        updates[
          'engineerProfile.licenseFile.uploadedAt'
        ] = new Date();
      }
    }

    if (
      data.yearsOfExperience !== undefined
    ) {
      const years =
        Number(data.yearsOfExperience);

      if (
        !Number.isFinite(years) ||
        years < 0
      ) {
        throw new ApiError(
          400,
          'yearsOfExperience must be a valid non-negative number'
        );
      }

      updates[
        'engineerProfile.yearsOfExperience'
      ] = years;
    }

    if (
      data.education !== undefined
    ) {
      updates[
        'engineerProfile.education'
      ] = data.education;
    }

    if (
      data.certifications !== undefined
    ) {
      updates[
        'engineerProfile.certifications'
      ] = data.certifications;
    }

    const pendingStatus =
      enumValue(
        require('../../constants/enums').VERIFICATION_STATUS,
        'PENDING',
        'pending'
      );

    updates[
      'engineerProfile.verificationStatus'
    ] = pendingStatus;

    updates[
      'engineerProfile.isVerified'
    ] = false;

    updates[
      'engineerProfile.rejectionReason'
    ] = null;

    const updated =
      await User.findOneAndUpdate(
        {
          _id: oid,
          role: ROLE.ENGINEER,
        },
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select('-password -refreshToken')
        .lean();

    if (!updated) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    return {
      verificationStatus:
        updated.engineerProfile
          ?.verificationStatus ||
        pendingStatus,

      isVerified:
        updated.engineerProfile
          ?.isVerified || false,

      rejectionReason:
        updated.engineerProfile
          ?.rejectionReason || null,

      submittedAt: new Date(),
    };
  }

  /**
   * Get verification status.
   */
  async getVerificationStatus(userId) {
    const oid =
      toObjectId(
        userId,
        'user ID'
      );

    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      })
        .select('-password -refreshToken')
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    return {
      verificationStatus:
        engineer.engineerProfile
          ?.verificationStatus ||
        'pending',

      isVerified:
        engineer.engineerProfile
          ?.isVerified || false,

      rejectionReason:
        engineer.engineerProfile
          ?.rejectionReason || null,

      licenseNumber:
        engineer.engineerProfile
          ?.licenseNumber || null,

      licenseFile:
        engineer.engineerProfile
          ?.licenseFile || null,
    };
  }

  /**
   * Get engineer statistics.
   */
  async getEngineerStats(engineerId) {
    const oid =
      toObjectId(
        engineerId,
        'engineer ID'
      );

    const completedStatus =
      enumValue(
        BOOKING_STATUS,
        'COMPLETED',
        'completed'
      );

    const cancelledStatus =
      enumValue(
        BOOKING_STATUS,
        'CANCELLED',
        'cancelled'
      );

    const pendingStatus =
      enumValue(
        BOOKING_STATUS,
        'PENDING',
        'pending'
      );

    const approvedDesignStatus =
      enumValue(
        DESIGN_STATUS,
        'APPROVED',
        'approved'
      );

    const [
      totalDesigns,
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalReviews,
    ] = await Promise.all([
      Design.countDocuments({
        engineerId: oid,
        status: approvedDesignStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: completedStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: cancelledStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: pendingStatus,
      }),

      Review.countDocuments({
        engineerId: oid,
      }),
    ]);

    const ratingBreakdown =
      await Review.aggregate([
        {
          $match: {
            engineerId: oid,
          },
        },
        {
          $group: {
            _id: '$rating',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ]);

    const sixMonthsAgo =
      new Date();

    sixMonthsAgo.setMonth(
      sixMonthsAgo.getMonth() - 6
    );

    const monthlyBookings =
      await Booking.aggregate([
        {
          $match: {
            engineerId: oid,
            createdAt: {
              $gte: sixMonthsAgo,
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: '$createdAt',
              },
              month: {
                $month: '$createdAt',
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ]);

    return {
      designs: {
        total: totalDesigns,
      },

      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,

        completionRate:
          totalBookings > 0
            ? Number(
                (
                  (completedBookings /
                    totalBookings) *
                  100
                ).toFixed(2)
              )
            : 0,
      },

      reviews: {
        total: totalReviews,
        breakdown: ratingBreakdown,
      },

      monthlyBookings,
    };
  }

  /**
   * Get complete engineer dashboard.
   */
  async getEngineerDashboard(
    engineerId
  ) {
    const oid =
      toObjectId(
        engineerId,
        'engineer ID'
      );

    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      })
        .select('-password -refreshToken')
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const ep =
      engineer.engineerProfile || {};

    const approvedBlueprintStatus =
      enumValue(
        BLUEPRINT_STATUS,
        'APPROVED',
        'approved'
      );

    const draftBlueprintStatus =
      enumValue(
        BLUEPRINT_STATUS,
        'DRAFT',
        'draft'
      );

    const pendingBookingStatus =
      enumValue(
        BOOKING_STATUS,
        'PENDING',
        'pending'
      );

    const confirmedBookingStatus =
      enumValue(
        BOOKING_STATUS,
        'CONFIRMED',
        'confirmed'
      );

    const rejectedBookingStatus =
      enumValue(
        BOOKING_STATUS,
        'REJECTED',
        'rejected'
      );

    const completedBookingStatus =
      enumValue(
        BOOKING_STATUS,
        'COMPLETED',
        'completed'
      );

    /*
     * Appointment statuses.
     */
    const pendingAppointmentStatus =
      enumValue(
        APPOINTMENT_STATUS,
        'PENDING',
        'pending'
      );

    const acceptedAppointmentStatus =
      enumValue(
        APPOINTMENT_STATUS,
        'ACCEPTED',
        'accepted'
      );

    const completedAppointmentStatus =
      enumValue(
        APPOINTMENT_STATUS,
        'COMPLETED',
        'completed'
      );

    const [
      profileViews,
      totalBlueprints,
      draftBlueprints,
      publishedBlueprints,
      portfolioMetrics,
      totalDesigns,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      rejectedBookings,
      completedBookings,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalProjects,
      activeProjects,
      completedProjects,
      totalReviews,
      avgRating,
      totalFollowers,
      totalFavorites,
      totalChats,
      unreadNotifications,
    ] = await Promise.all([
      /*
       * RecentlyViewed is optional.
       */
      (async () => {
        try {
          const RecentlyViewed =
            require(
              '../recentlyViewed/recentlyViewed.model'
            );

          return RecentlyViewed.countDocuments({
            itemType: 'engineer',
            itemId: oid,
          });
        } catch (error) {
          logger.warn(
            `RecentlyViewed unavailable: ${error.message}`
          );

          return 0;
        }
      })(),

      /*
       * Blueprint statistics.
       */
      Blueprint.countDocuments({
        engineerId: oid,
      }),

      Blueprint.countDocuments({
        engineerId: oid,
        status: draftBlueprintStatus,
      }),

      Blueprint.countDocuments({
        engineerId: oid,
        status: approvedBlueprintStatus,
      }),

      /*
       * Blueprint metrics.
       */
      (async () => {
        try {
          const aggregation =
            await Blueprint.aggregate([
              {
                $match: {
                  engineerId: oid,
                },
              },
              {
                $group: {
                  _id: null,
                  views: {
                    $sum: {
                      $ifNull: [
                        '$metrics.views',
                        0,
                      ],
                    },
                  },
                  saves: {
                    $sum: {
                      $ifNull: [
                        '$metrics.saves',
                        0,
                      ],
                    },
                  },
                  likes: {
                    $sum: {
                      $ifNull: [
                        '$metrics.likes',
                        0,
                      ],
                    },
                  },
                  downloads: {
                    $sum: {
                      $ifNull: [
                        '$metrics.downloads',
                        0,
                      ],
                    },
                  },
                },
              },
            ]);

          return (
            aggregation[0] || {
              views: 0,
              saves: 0,
              likes: 0,
              downloads: 0,
            }
          );
        } catch (error) {
          logger.warn(
            `Blueprint metrics failed: ${error.message}`
          );

          return {
            views: 0,
            saves: 0,
            likes: 0,
            downloads: 0,
          };
        }
      })(),

      /*
       * Legacy Design statistics.
       */
      Design.countDocuments({
        engineerId: oid,
      }),

      /*
       * Booking statistics.
       */
      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: pendingBookingStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: confirmedBookingStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: rejectedBookingStatus,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: completedBookingStatus,
      }),

      /*
       * Appointment statistics.
       */
      Appointment.countDocuments({
        engineerId: oid,
      }),

      Appointment.countDocuments({
        engineerId: oid,
        startAt: {
          $gte: new Date(),
        },
        status: {
          $in: [
            pendingAppointmentStatus,
            acceptedAppointmentStatus,
          ],
        },
      }),

      Appointment.countDocuments({
        engineerId: oid,
        status: completedAppointmentStatus,
      }),

      /*
       * Project statistics.
       */
      Project.countDocuments({
        isActive: true,
        $or: [
          {
            engineerId: oid,
          },
          {
            'members.userId': oid,
          },
        ],
      }),

      Project.countDocuments({
        isActive: true,
        status: {
          $in: [
            'planning',
            'design_approval',
            'permit_pending',
            'construction_ready',
            'under_construction',
            'on_hold',
          ],
        },
        $or: [
          {
            engineerId: oid,
          },
          {
            'members.userId': oid,
          },
        ],
      }),

      Project.countDocuments({
        isActive: true,
        status: 'completed',
        $or: [
          {
            engineerId: oid,
          },
          {
            'members.userId': oid,
          },
        ],
      }),

      /*
       * Reviews.
       */
      Review.countDocuments({
        engineerId: oid,
      }),

      Review.aggregate([
        {
          $match: {
            engineerId: oid,
          },
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: '$rating',
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]).then(
        (result) =>
          result[0] || {
            average: 0,
            count: 0,
          }
      ),

      /*
       * Followers.
       */
      Follow.countDocuments({
        engineerId: oid,
      }),

      /*
       * Favorites of engineer's blueprints.
       */
      (async () => {
        try {
          const blueprints =
            await Blueprint.find({
              engineerId: oid,
            })
              .select('_id')
              .lean();

          const blueprintIds =
            blueprints.map(
              (item) => item._id
            );

          if (
            blueprintIds.length === 0
          ) {
            return 0;
          }

          const result =
            await Favorite.aggregate([
              {
                $match: {
                  blueprintId: {
                    $in: blueprintIds,
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ]);

          return result[0]?.count || 0;
        } catch (error) {
          logger.warn(
            `Favorite statistics failed: ${error.message}`
          );

          return 0;
        }
      })(),

      /*
       * Chats.
       */
      Chat.countDocuments({
        participants: oid,
        isActive: true,
      }),

      /*
       * Notifications.
       */
      Notification.countDocuments({
        userId: oid,
        isRead: false,
        isArchived: false,
      }),
    ]);

    /*
     * Profile completion.
     */
    const completionParts = [
      {
        done: Boolean(
          engineer.firstName &&
          engineer.lastName
        ),
        weight: 10,
      },

      {
        done: Boolean(
          engineer.avatar
        ),
        weight: 10,
      },

      {
        done: Boolean(ep.bio),
        weight: 10,
      },

      {
        done: Boolean(ep.title),
        weight: 10,
      },

      {
        done:
          Array.isArray(
            ep.specializations
          ) &&
          ep.specializations.length > 0,
        weight: 15,
      },

      {
        done:
          Number(
            ep.yearsOfExperience || 0
          ) > 0,
        weight: 10,
      },

      {
        done:
          Array.isArray(
            ep.serviceAreas
          ) &&
          ep.serviceAreas.length > 0,
        weight: 10,
      },

      {
        done:
          Array.isArray(
            ep.availability
          ) &&
          ep.availability.length > 0,
        weight: 10,
      },

      {
        done:
          Boolean(
            ep.licenseNumber ||
            ep.licenseFile?.url
          ),
        weight: 15,
      },
    ];

    const completion =
      completionParts.reduce(
        (sum, part) =>
          sum +
          (part.done
            ? part.weight
            : 0),
        0
      );

    const completionLabel =
      completion === 100
        ? 'Complete'
        : completion >= 80
        ? 'Almost Complete'
        : completion >= 50
        ? 'Developing'
        : 'Incomplete';

    const reviewCount =
      avgRating?.count ||
      totalReviews ||
      0;

    const bookingCompletionRate =
      totalBookings > 0
        ? Math.round(
            (completedBookings /
              totalBookings) *
              100
          )
        : 0;

    /*
     * Recent dashboard activity.
     */
    const [
      recentNotifications,
      recentReviews,
      recentMessages,
      recentBookings,
      recentAppointments,
    ] = await Promise.all([
      Notification.find({
        userId: oid,
        isArchived: false,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Review.find({
        engineerId: oid,
      })
        .sort({
          createdAt: -1,
        })
        .limit(3)
        .populate(
          'userId',
          'firstName lastName avatar'
        )
        .lean(),

      Chat.find({
        participants: oid,
        isActive: true,
      })
        .sort({
          updatedAt: -1,
        })
        .limit(4)
        .populate(
          'participants',
          'firstName lastName avatar'
        )
        .lean(),

      Booking.find({
        engineerId: oid,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .populate(
          'userId',
          'firstName lastName avatar'
        )
        .lean(),

      Appointment.find({
        engineerId: oid,
        status: pendingAppointmentStatus,
      })
        .sort({
          startAt: 1,
        })
        .limit(5)
        .populate(
          'clientId',
          'firstName lastName avatar'
        )
        .lean(),
    ]);

    /*
     * Alerts.
     */
    const alerts = [];

    if (pendingBookings > 0) {
      alerts.push({
        type: 'booking',
        message: `${pendingBookings} pending booking request(s)`,
      });
    }

    const pendingVerificationStatus =
      enumValue(
        require('../../constants/enums')
          .VERIFICATION_STATUS,
        'PENDING',
        'pending'
      );

    if (
      ep.verificationStatus ===
      pendingVerificationStatus
    ) {
      alerts.push({
        type: 'verification',
        message:
          'Your verification is pending admin review',
      });
    }

    if (unreadNotifications > 0) {
      alerts.push({
        type: 'notification',
        message: `${unreadNotifications} unread notification(s)`,
      });
    }

    return {
      profile: {
        name: `${engineer.firstName || ''} ${
          engineer.lastName || ''
        }`.trim(),

        avatar:
          engineer.avatar || null,

        title:
          ep.title || null,

        isVerified:
          ep.isVerified || false,

        verificationStatus:
          ep.verificationStatus ||
          pendingVerificationStatus,

        yearsOfExperience:
          ep.yearsOfExperience || 0,

        specializations:
          ep.specializations || [],

        rating:
          Number(
            avgRating?.average || 0
          ),

        ratingCount:
          reviewCount,

        followers:
          totalFollowers,

        profileViews,

        completion,

        completionLabel,

        availability:
          ep.availability || [],
      },

      work: {
        totalProjects,
        activeProjects,
        completedProjects,

        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        completedBookings,

        bookingCompletionRate,

        totalAppointments,
        upcomingAppointments,
        completedAppointments,

        approvedBlueprints:
          publishedBlueprints,

        draftBlueprints,
      },

      portfolio: {
        totalBlueprints,
        draftBlueprints,
        publishedBlueprints,

        portfolioViews,

        totalDesigns,

        blueprintViews:
          portfolioMetrics.views || 0,

        blueprintSaves:
          portfolioMetrics.saves || 0,

        blueprintLikes:
          portfolioMetrics.likes || 0,

        blueprintDownloads:
          portfolioMetrics.downloads || 0,

        favorites:
          totalFavorites,

        views:
          portfolioMetrics.views || 0,

        totalFavorites,
      },

      reviews: {
        average:
          Number(
            avgRating?.average || 0
          ),

        total:
          reviewCount,

        recent:
          recentReviews,
      },

      activity: {
        recentNotifications,
        recentBookings,
        recentAppointments,
        recentMessages,
      },

      alerts,

      chat: {
        totalChats,
        unreadCount: 0,
      },

      notifications: {
        unread:
          unreadNotifications,
      },
    };
  }

  /**
   * Search engineers by name or specialization.
   */
  async searchEngineers(
    searchQuery,
    options = {}
  ) {
    if (
      !searchQuery ||
      typeof searchQuery !== 'string' ||
      searchQuery.trim().length < 2
    ) {
      throw new ApiError(
        400,
        'Search query must be at least 2 characters'
      );
    }

    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      options.page,
      options.limit
    );

    const search =
      searchQuery.trim();

    /*
     * Escape regex characters so user input
     * cannot create an unintended regex.
     */
    const escapedSearch =
      search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

    const query = {
      role: ROLE.ENGINEER,
      isActive: true,

      $or: [
        {
          firstName: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },

        {
          lastName: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },

        {
          'engineerProfile.specializations':
            {
              $regex: escapedSearch,
              $options: 'i',
            },
        },

        {
          'engineerProfile.title': {
            $regex: escapedSearch,
            $options: 'i',
          },
        },

        {
          'engineerProfile.company': {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
      ],
    };

    const [
      engineers,
      total,
    ] = await Promise.all([
      User.find(query)
        .select(
          'firstName lastName avatar engineerProfile'
        )
        .sort({
          'engineerProfile.rating.average':
            -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(query),
    ]);

    return {
      engineers,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        ),
      },
    };
  }
}

module.exports =
  new EngineerService();