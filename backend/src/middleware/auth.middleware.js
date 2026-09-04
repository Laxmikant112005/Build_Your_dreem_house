const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { ROLE } = require('../constants/roles');

/**
 * Extract Bearer token from Authorization header.
 */
const extractBearerToken = (req) => {
  const header = req.headers.authorization;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
};

/**
 * Verify JWT and load the corresponding user.
 */
const verifyToken = async (token) => {
  if (!token) {
    throw new ApiError(401, 'Invalid token');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }

    logger.warn(`JWT verification failed: ${error.message}`);

    throw new ApiError(401, 'Invalid token');
  }

  const userId = decoded?.id || decoded?.userId;

  if (!userId) {
    throw new ApiError(401, 'Invalid token');
  }

  try {
    const user = await User.findById(userId).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }

    if (user.isActive === false) {
      throw new ApiError(401, 'Account is inactive');
    }

    return {
      user,
      decoded,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error(`Failed to load user: ${error.message}`);

    throw new ApiError(401, 'Authentication failed');
  }
};

/**
 * Required authentication middleware.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new ApiError(
        401,
        'Access denied. No valid token provided.'
      );
    }

    const { user } = await verifyToken(token);

    req.user = user;
    req.userId = user._id.toString();
    req.user.id = req.userId;
    req.user.verificationStatus = getVerificationStatus(user);

    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(401, 'Authentication failed')
    );
  }
};

/**
 * Optional authentication middleware.
 *
 * If a valid token is provided, req.user and req.userId are populated.
 * If no token or an invalid token is provided, the request continues
 * without an authenticated user.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return next();
    }

    const { user } = await verifyToken(token);

    req.user = user;
    req.userId = user._id.toString();
    req.user.id = req.userId;
    req.user.verificationStatus = getVerificationStatus(user);
  } catch (error) {
    logger.warn(
      `Optional authentication failed: ${error.message}`
    );

    req.user = undefined;
    req.userId = undefined;
  }

  next();
};

const getVerificationStatus = (user) => {
  if (user?.engineerProfile?.isVerified === true) return 'VERIFIED';

  return String(
    user?.engineerProfile?.verificationStatus || 'PENDING'
  ).toUpperCase();
};

/**
 * Authorize one or more roles.
 *
 * Role comparison is case-insensitive.
 * Database values remain lowercase:
 * user, engineer, admin.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, 'Authentication required')
      );
    }

    if (!roles.length) {
      return next(
        new ApiError(
          500,
          'Authorization roles are not configured'
        )
      );
    }

    const userRole = String(req.user.role || '')
      .trim()
      .toLowerCase();

    const allowedRoles = roles.map((role) =>
      String(role || '')
        .trim()
        .toLowerCase()
    );

    if (!allowedRoles.includes(userRole)) {
      logger.warn(
        `Authorization denied for user ${req.user._id}: ` +
          `role="${userRole}", allowed="${allowedRoles.join(', ')}"`
      );

      return next(
        new ApiError(
          403,
          'Access denied. Insufficient permissions.'
        )
      );
    }

    next();
  };
};

/**
 * Require an authenticated and verified engineer.
 *
 * NOTE:
 * This middleware is intentionally separate from authorize(ROLE.ENGINEER).
 * The engineer dashboard does NOT use this middleware.
 */
const requireVerifiedEngineer = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const userRole = String(req.user.role || '')
      .trim()
      .toLowerCase();

    if (userRole !== ROLE.ENGINEER.toLowerCase()) {
      throw new ApiError(
        403,
        'Access denied. Engineer role required.'
      );
    }

    if (!req.user.engineerProfile) {
      throw new ApiError(
        403,
        'Engineer profile not found.'
      );
    }

    if (req.user.engineerProfile.isVerified !== true) {
      throw new ApiError(
        403,
        'Your engineer profile is not verified yet.'
      );
    }

    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(
            403,
            'Engineer authorization failed'
          )
    );
  }
};

/**
 * Check whether the authenticated user owns a resource.
 *
 * Admin users bypass ownership checks.
 */
const checkOwnership = (getOwnerIdFromReq) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(
          new ApiError(401, 'Authentication required')
        );
      }

      if (typeof getOwnerIdFromReq !== 'function') {
        logger.error(
          'checkOwnership requires a function to retrieve owner ID'
        );

        return next(
          new ApiError(
            500,
            'Ownership configuration is invalid'
          )
        );
      }

      const ownerId = getOwnerIdFromReq(req);
      const userId = req.user._id?.toString();

      const role = String(req.user.role || '')
        .trim()
        .toLowerCase();

      if (role === ROLE.ADMIN.toLowerCase()) {
        return next();
      }

      if (
        !ownerId ||
        !userId ||
        ownerId.toString() !== userId
      ) {
        return next(
          new ApiError(
            403,
            'Access denied. You can only modify your own resources.'
          )
        );
      }

      next();
    } catch (error) {
      logger.error(
        `Ownership error: ${error.message}`
      );

      next(
        new ApiError(
          403,
          'Unable to verify resource ownership.'
        )
      );
    }
  };
};

module.exports = {
  ROLE,
  authenticate,
  optionalAuth,
  authorize,
  requireVerifiedEngineer,
  checkOwnership,
  verifyToken,
};