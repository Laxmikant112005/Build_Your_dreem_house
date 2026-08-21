const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const ROLE = {
  USER: 'user',
  ENGINEER: 'engineer',
  ADMIN: 'admin',
};

const extractBearerToken = (req) => {
  const header = req.headers.authorization;

  if (!header) return null;

  const [scheme, token] = header.trim().split(/\s+/);

  return scheme?.toLowerCase() === 'bearer' && token
    ? token.trim()
    : null;
};

const verifyToken = async (token) => {
  if (!token) throw new ApiError(401, 'Invalid token');

  let decoded;

  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }

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

    if (!user) throw new ApiError(401, 'Invalid token');

    if (user.isActive === false) {
      throw new ApiError(401, 'Account is inactive');
    }

    return { user, decoded };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    logger.error(`Failed to load user: ${error.message}`);
    throw new ApiError(401, 'Authentication failed');
  }
};

const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new ApiError(401, 'Access denied. No valid token provided.');
    }

    const { user } = await verifyToken(token);

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(401, 'Authentication failed')
    );
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) return next();

    const { user } = await verifyToken(token);

    req.user = user;
    req.userId = user._id.toString();
  } catch {
    req.user = undefined;
    req.userId = undefined;
  }

  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.length) {
      return next(new ApiError(500, 'Authorization roles are not configured'));
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const allowedRoles = roles.map((role) =>
      String(role).toLowerCase()
    );

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(403, 'Access denied. Insufficient permissions.')
      );
    }

    next();
  };
};

const requireVerifiedEngineer = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (String(req.user.role).toLowerCase() !== ROLE.ENGINEER) {
      throw new ApiError(403, 'Access denied. Engineer role required.');
    }

    if (!req.user.engineerProfile) {
      throw new ApiError(403, 'Engineer profile not found.');
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
        : new ApiError(403, 'Engineer authorization failed')
    );
  }
};

const checkOwnership = (getOwnerIdFromReq) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'Authentication required'));
      }

      const ownerId = getOwnerIdFromReq(req);
      const userId = req.user._id?.toString();
      const role = String(req.user.role || '').toLowerCase();

      if (role === ROLE.ADMIN) return next();

      if (!ownerId || !userId || ownerId.toString() !== userId) {
        return next(
          new ApiError(
            403,
            'Access denied. You can only modify your own resources.'
          )
        );
      }

      next();
    } catch (error) {
      logger.error(`Ownership error: ${error.message}`);
      next(new ApiError(403, 'Unable to verify resource ownership.'));
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