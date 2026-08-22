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
 * Supports:
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
  VERIFICATION_STATUS,
} = require('../../constants/enums');

/**
 * Convert an ID into a MongoDB ObjectId.
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
 * Normalize pagination values.
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

  normalizedLimit = Math.min(normalizedLimit, 100);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

/**
 * Safely parse an optional number.
 */
const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Safely get enum value.
 *
 * Supports projects where enums are exported as:
 *
 * {
 *   PENDING: 'pending'
 * }
 *
 * or where a fallback value is required.
 */
const enumValue = (enumObject, key, fallback) => {
  if (enumObject && enumObject[key] !== undefined) {
    return enumObject[key];
  }

  return fallback;
};

const STATUS = {
  designApproved: enumValue(
    DESIGN_STATUS,
    'APPROVED',
    'approved'
  ),

  blueprintApproved: enumValue(
    BLUEPRINT_STATUS,
    'APPROVED',
    'approved'
  ),

  blueprintDraft: enumValue(
    BLUEPRINT_STATUS,
    'DRAFT',
    'draft'
  ),

  bookingPending: enumValue(
    BOOKING_STATUS,
    'PENDING',
    'pending'
  ),

  bookingConfirmed: enumValue(
    BOOKING_STATUS,
    'CONFIRMED',
    'confirmed'
  ),

  bookingRejected: enumValue(
    BOOKING_STATUS,
    'REJECTED',
    'rejected'
  ),

  bookingCompleted: enumValue(
    BOOKING_STATUS,
    'COMPLETED',
    'completed'
  ),

  bookingCancelled: enumValue(
    BOOKING_STATUS,
    'CANCELLED',
    'cancelled'
  ),

  appointmentPending: enumValue(
    APPOINTMENT_STATUS,
    'PENDING',
    'pending'
  ),

  appointmentAccepted: enumValue(
    APPOINTMENT_STATUS,
    'ACCEPTED',
    'accepted'
  ),

  appointmentCompleted: enumValue(
    APPOINTMENT_STATUS,
    'COMPLETED',
    'completed'
  ),

  verificationPending: enumValue(
    VERIFICATION_STATUS,
    'PENDING',
    'pending'
  ),

  verificationApproved: enumValue(
    VERIFICATION_STATUS,
    'APPROVED',
    'approved'
  ),
};

class EngineerService {
  /**
   * ============================================================
   * ENGINEER DISCOVERY
   * ============================================================
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

    const latitude = parseOptionalNumber(lat);
    const longitude = parseOptionalNumber(lng);

    /*
     * Geographic filtering.
     */
    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const radius = parseOptionalNumber(radiusKm) || 50;

      query['engineerProfile.serviceAreas.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              longitude,
              latitude,
            ],
          },
          $maxDistance: radius * 1000,
        },
      };
    }

    /*
     * City filtering.
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
      query[
        'engineerProfile.specializations'
      ] = {
        $regex: String(style),
        $options: 'i',
      };
    }

    /*
     * Rating.
     */
    const rating = parseOptionalNumber(minRating);

    if (rating !== undefined) {
      query[
        'engineerProfile.rating.average'
      ] = {
        $gte: rating,
      };
    }

    /*
     * Experience.
     */
    const experience =
      parseOptionalNumber(minExperience);

    if (experience !== undefined) {
      query[
        'engineerProfile.yearsOfExperience'
      ] = {
        $gte: experience,
      };
    }

    /*
     * Sorting.
     */
    const sortBy = options.sortBy || 'rating';

    const sortOrder =
      String(
        options.sortOrder || 'desc'
      ).toLowerCase() === 'asc'
        ? 1
        : -1;

    const sortOptions = {};

    switch (sortBy) {
      case 'rating':
        sortOptions[
          'engineerProfile.rating.average'
        ] = sortOrder;
        break;

      case 'experience':
        sortOptions[
          'engineerProfile.yearsOfExperience'
        ] = sortOrder;
        break;

      case 'name':
        sortOptions.firstName = sortOrder;
        sortOptions.lastName = sortOrder;
        break;

      case 'createdAt':
        sortOptions.createdAt = sortOrder;
        break;

      case 'hourlyRate':
        sortOptions[
          'engineerProfile.hourlyRate'
        ] = sortOrder;
        break;

      default:
        sortOptions[
          'engineerProfile.rating.average'
        ] = -1;
    }

    const [
      engineers,
      total,
    ] = await Promise.all([
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
        pages:
          Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get engineer by ID.
   */
  async getEngineerById(engineerId) {
    const oid = toObjectId(
      engineerId,
      'engineer ID'
    );

    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
        isActive: true,
      })
        .select(
          '-password -refreshToken'
        )
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const [
      totalDesigns,
      totalBookings,
      completedBookings,
    ] = await Promise.all([
      Design.countDocuments({
        engineerId: oid,
        status: STATUS.designApproved,
      }),

      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status: STATUS.bookingCompleted,
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
      Math.max(
        Number.parseInt(limit, 10) || 10,
        1
      ),
      100
    );

    return User.find({
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
  }

  /**
   * ============================================================
   * DESIGNS
   * ============================================================
   */

  async getEngineerDesigns(
    engineerId,
    options = {}
  ) {
    const oid = toObjectId(
      engineerId,
      'engineer ID'
    );

    const {
      page,
      limit,
      skip,
    } = normalizePagination(
      options.page,
      options.limit
    );

    const requestedStatus =
      options.status || 'approved';

    const query = {
      engineerId: oid,
    };

    if (requestedStatus !== 'all') {
      query.status = requestedStatus;
    } else {
      query.status = {
        $in: Object.values(
          DESIGN_STATUS || {}
        ),
      };
    }

    const [
      designs,
      total,
    ] = await Promise.all([
      Design.find(query)
        .populate(
          'category',
          'name slug'
        )
        .sort({
          createdAt: -1,
        })
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
        pages:
          Math.ceil(total / limit),
      },
    };
  }

  /**
   * ============================================================
   * REVIEWS
   * ============================================================
   */

  async getEngineerReviews(
    engineerId,
    options = {}
  ) {
    const oid = toObjectId(
      engineerId,
      'engineer ID'
    );

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
        .sort({
          createdAt: -1,
        })
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

      rating:
        ratingStats[0] || {
          average: 0,
          count: 0,
        },

      pagination: {
        page,
        limit,
        total,
        pages:
          Math.ceil(total / limit),
      },
    };
  }

  /**
   * ============================================================
   * PROFILE
   * ============================================================
   */

  async updateProfile(
    userId,
    updateData = {}
  ) {
    const oid = toObjectId(
      userId,
      'user ID'
    );

    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      });

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const updates = {};

    const allowedUserFields = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
    ];

    for (
      const field of allowedUserFields
    ) {
      if (
        updateData[field] !== undefined
      ) {
        updates[field] =
          updateData[field];
      }
    }

    /*
     * Do not allow engineers to directly
     * modify verification state.
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
      typeof updateData.engineerProfile ===
        'object'
    ) {
      for (
        const field of allowedProfileFields
      ) {
        if (
          updateData.engineerProfile[
            field
          ] === undefined
        ) {
          continue;
        }

        if (field === 'serviceAreas') {
          const areas =
            Array.isArray(
              updateData
                .engineerProfile
                .serviceAreas
            )
              ? updateData
                  .engineerProfile
                  .serviceAreas
              : [];

          updates[
            'engineerProfile.serviceAreas'
          ] = areas.map(
            (area) => {
              if (
                area?.location &&
                Array.isArray(
                  area.location
                    .coordinates
                )
              ) {
                return {
                  location: {
                    type: 'Point',
                    coordinates:
                      area.location
                        .coordinates,
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
                area?.lng !==
                  undefined &&
                area?.lat !==
                  undefined
              ) {
                const areaLng =
                  Number(area.lng);

                const areaLat =
                  Number(area.lat);

                if (
                  !Number.isFinite(
                    areaLng
                  ) ||
                  !Number.isFinite(
                    areaLat
                  )
                ) {
                  throw new ApiError(
                    400,
                    'Invalid service area coordinates'
                  );
                }

                return {
                  location: {
                    type: 'Point',
                    coordinates: [
                      areaLng,
                      areaLat,
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
            }
          );
        } else {
          updates[
            `engineerProfile.${field}`
          ] =
            updateData
              .engineerProfile[field];
        }
      }
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return User.findById(oid)
        .select(
          '-password -refreshToken'
        )
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
        .select(
          '-password -refreshToken'
        )
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
   * ============================================================
   * AVAILABILITY
   * ============================================================
   */

  async updateAvailability(
    userId,
    availability
  ) {
    const oid = toObjectId(
      userId,
      'user ID'
    );

    if (!Array.isArray(availability)) {
      throw new ApiError(
        400,
        'Availability must be an array'
      );
    }

    for (
      const slot of availability
    ) {
      if (
        slot.dayOfWeek ===
          undefined ||
        !slot.startTime ||
        !slot.endTime
      ) {
        throw new ApiError(
          400,
          'Each availability slot must have dayOfWeek, startTime, and endTime'
        );
      }

      const day =
        Number(slot.dayOfWeek);

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
        .select(
          '-password -refreshToken'
        )
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
   * ============================================================
   * PORTFOLIO
   * ============================================================
   */

  async addPortfolioItem(
    userId,
    portfolioItem = {}
  ) {
    const oid = toObjectId(
      userId,
      'user ID'
    );

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
        .select(
          '-password -refreshToken'
        )
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const portfolio =
      engineer.engineerProfile
        ?.portfolio || [];

    return portfolio[
      portfolio.length - 1
    ];
  }

  async removePortfolioItem(
    userId,
    portfolioId
  ) {
    const userOid =
      toObjectId(
        userId,
        'user ID'
      );

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
        .select(
          '-password -refreshToken'
        )
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
   * ============================================================
   * VERIFICATION
   * ============================================================
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
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      });

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const currentStatus =
      engineer.engineerProfile
        ?.verificationStatus;

    if (
      currentStatus ===
      STATUS.verificationApproved
    ) {
      throw new ApiError(
        400,
        'Your profile is already verified'
      );
    }

    const updates = {};

    if (
      data.licenseNumber !==
      undefined
    ) {
      updates[
        'engineerProfile.licenseNumber'
      ] = data.licenseNumber;
    }

    if (
      data.licenseFile !==
      undefined
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
        ] =
          data.licenseFile.url;

        if (
          data.licenseFile.name
        ) {
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
      data.yearsOfExperience !==
      undefined
    ) {
      const years = Number(
        data.yearsOfExperience
      );

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
      data.education !==
      undefined
    ) {
      updates[
        'engineerProfile.education'
      ] = data.education;
    }

    if (
      data.certifications !==
      undefined
    ) {
      updates[
        'engineerProfile.certifications'
      ] =
        data.certifications;
    }

    updates[
      'engineerProfile.verificationStatus'
    ] = STATUS.verificationPending;

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
        .select(
          '-password -refreshToken'
        )
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
        STATUS.verificationPending,

      isVerified:
        updated.engineerProfile
          ?.isVerified || false,

      rejectionReason:
        updated.engineerProfile
          ?.rejectionReason ||
        null,

      submittedAt: new Date(),
    };
  }

  async getVerificationStatus(
    userId
  ) {
    const oid = toObjectId(
      userId,
      'user ID'
    );

    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      })
        .select(
          '-password -refreshToken'
        )
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
        STATUS.verificationPending,

      isVerified:
        engineer.engineerProfile
          ?.isVerified || false,

      rejectionReason:
        engineer.engineerProfile
          ?.rejectionReason ||
        null,

      licenseNumber:
        engineer.engineerProfile
          ?.licenseNumber || null,

      licenseFile:
        engineer.engineerProfile
          ?.licenseFile || null,
    };
  }

  /**
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  async getEngineerStats(
    engineerId
  ) {
    const oid = toObjectId(
      engineerId,
      'engineer ID'
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
        status: STATUS.designApproved,
      }),

      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingCompleted,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingCancelled,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingPending,
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
                $year:
                  '$createdAt',
              },

              month: {
                $month:
                  '$createdAt',
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
        completed:
          completedBookings,
        cancelled:
          cancelledBookings,
        pending:
          pendingBookings,

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
        breakdown:
          ratingBreakdown,
      },

      monthlyBookings,
    };
  }

  /**
   * ============================================================
   * ENGINEER DASHBOARD
   * ============================================================
   */

  async getEngineerDashboard(
    engineerId
  ) {
    const oid = toObjectId(
      engineerId,
      'engineer ID'
    );

    /*
     * IMPORTANT:
     *
     * Dashboard access is based on role,
     * not verification status.
     *
     * An engineer can access the dashboard
     * while waiting for admin verification.
     */
    const engineer =
      await User.findOne({
        _id: oid,
        role: ROLE.ENGINEER,
      })
        .select(
          '-password -refreshToken'
        )
        .lean();

    if (!engineer) {
      throw new ApiError(
        404,
        'Engineer not found'
      );
    }

    const ep =
      engineer.engineerProfile || {};

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
       * Profile views.
       */
      (async () => {
        try {
          const RecentlyViewed =
            require(
              '../recentlyViewed/recentlyViewed.model'
            );

          return RecentlyViewed.countDocuments(
            {
              itemType: 'engineer',
              itemId: oid,
            }
          );
        } catch (error) {
          logger.warn(
            `RecentlyViewed unavailable: ${error.message}`
          );

          return 0;
        }
      })(),

      /*
       * Blueprint counts.
       */
      Blueprint.countDocuments({
        engineerId: oid,
      }),

      Blueprint.countDocuments({
        engineerId: oid,
        status:
          STATUS.blueprintDraft,
      }),

      Blueprint.countDocuments({
        engineerId: oid,
        status:
          STATUS.blueprintApproved,
      }),

      /*
       * Blueprint metrics.
       */
      (async () => {
        try {
          const result =
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
            result[0] || {
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
       * Legacy designs.
       */
      Design.countDocuments({
        engineerId: oid,
      }),

      /*
       * Bookings.
       */
      Booking.countDocuments({
        engineerId: oid,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingPending,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingConfirmed,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingRejected,
      }),

      Booking.countDocuments({
        engineerId: oid,
        status:
          STATUS.bookingCompleted,
      }),

      /*
       * Appointments.
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
            STATUS.appointmentPending,
            STATUS.appointmentAccepted,
          ],
        },
      }),

      Appointment.countDocuments({
        engineerId: oid,
        status:
          STATUS.appointmentCompleted,
      }),

      /*
       * Projects.
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
       * Favorites.
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
              (blueprint) =>
                blueprint._id
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

          return (
            result[0]?.count || 0
          );
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
          ep.specializations.length >
            0,
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
          ep.serviceAreas.length >
            0,
        weight: 10,
      },

      {
        done:
          Array.isArray(
            ep.availability
          ) &&
          ep.availability.length >
            0,
        weight: 10,
      },

      {
        done: Boolean(
          ep.licenseNumber ||
            ep.licenseFile?.url
        ),
        weight: 15,
      },
    ];

    const completion =
      completionParts.reduce(
        (sum, item) =>
          sum +
          (item.done
            ? item.weight
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
     * Recent activity.
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
        status:
          STATUS.appointmentPending,
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
        message:
          `${pendingBookings} pending booking request(s)`,
      });
    }

    if (
      ep.verificationStatus ===
      STATUS.verificationPending
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
        message:
          `${unreadNotifications} unread notification(s)`,
      });
    }

    return {
      profile: {
        name:
          `${engineer.firstName || ''} ${
            engineer.lastName || ''
          }`.trim(),

        avatar:
          engineer.avatar || null,

        title:
          ep.title || null,

        isVerified:
          Boolean(ep.isVerified),

        verificationStatus:
          ep.verificationStatus ||
          STATUS.verificationPending,

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
   * ============================================================
   * SEARCH
   * ============================================================
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
     * Escape regex characters.
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
        pages:
          Math.ceil(
            total / limit
          ),
      },
    };
  }
}

module.exports =
  new EngineerService();