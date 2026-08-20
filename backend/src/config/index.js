/**
 * Planova - Main Configuration
 * Central configuration management for the backend
 */

require('dotenv').config();

/**
 * Environment helpers
 */
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const requiredEnv = (name) => {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
};

const getNumber = (name, defaultValue, options = {}) => {
  const { min, max } = options;

  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === '') {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value)) {
    throw new Error(
      `Invalid ${name}: "${rawValue}". Expected an integer.`
    );
  }

  if (min !== undefined && value < min) {
    throw new Error(
      `Invalid ${name}: value must be >= ${min}.`
    );
  }

  if (max !== undefined && value > max) {
    throw new Error(
      `Invalid ${name}: value must be <= ${max}.`
    );
  }

  return value;
};

/**
 * JWT configuration
 *
 * JWT secrets are mandatory in production.
 */
const jwtSecret =
  process.env.JWT_SECRET ||
  (!isProduction ? 'development-jwt-secret-change-me' : null);

const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET ||
  (!isProduction
    ? 'development-refresh-secret-change-me'
    : null);

if (!jwtSecret) {
  throw new Error(
    'Missing required environment variable: JWT_SECRET'
  );
}

if (!jwtRefreshSecret) {
  throw new Error(
    'Missing required environment variable: JWT_REFRESH_SECRET'
  );
}

/**
 * MongoDB configuration
 */
const mongoUri =
  process.env.MONGODB_URI ||
  (!isProduction
    ? 'mongodb://localhost:27017/planova'
    : null);

if (!mongoUri) {
  throw new Error(
    'Missing required environment variable: MONGODB_URI'
  );
}

/**
 * Main configuration
 */
module.exports = {
  // --------------------------------------------------
  // Environment
  // --------------------------------------------------

  env: process.env.NODE_ENV || 'development',

  port: getNumber('PORT', 5000, {
    min: 1,
    max: 65535,
  }),

  apiVersion: process.env.API_VERSION || 'v1',

  apiUrl:
    process.env.API_URL ||
    'http://localhost:5000/api/v1',

  // --------------------------------------------------
  // Database
  // --------------------------------------------------

  database: {
    uri: mongoUri,

    options: {
      maxPoolSize: getNumber('MONGO_MAX_POOL_SIZE', 10, {
        min: 1,
        max: 100,
      }),

      serverSelectionTimeoutMS: getNumber(
        'MONGO_SERVER_SELECTION_TIMEOUT_MS',
        5000,
        { min: 1000 }
      ),

      socketTimeoutMS: getNumber(
        'MONGO_SOCKET_TIMEOUT_MS',
        45000,
        { min: 1000 }
      ),
    },
  },

  // --------------------------------------------------
  // Redis
  // --------------------------------------------------

  redis: {
    host: process.env.REDIS_HOST || 'localhost',

    port: getNumber('REDIS_PORT', 6379, {
      min: 1,
      max: 65535,
    }),

    password: process.env.REDIS_PASSWORD || '',
  },

  // --------------------------------------------------
  // JWT
  // --------------------------------------------------

  jwt: {
    secret: jwtSecret,

    refreshSecret: jwtRefreshSecret,

    expiresIn:
      process.env.JWT_EXPIRE_IN || '15m',

    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRE_IN || '7d',
  },

  // --------------------------------------------------
  // AWS S3
  // --------------------------------------------------

  aws: {
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID || null,

    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || null,

    region:
      process.env.AWS_REGION || 'ap-south-1',

    s3: {
      bucket:
        process.env.AWS_S3_BUCKET || null,
    },

    endpoint:
      process.env.AWS_S3_ENDPOINT || undefined,
  },

  // --------------------------------------------------
  // Payments
  // --------------------------------------------------

  razorpay: {
    keyId:
      process.env.RAZORPAY_KEY_ID || null,

    secret:
      process.env.RAZORPAY_SECRET || null,
  },

  stripe: {
    secretKey:
      process.env.STRIPE_SECRET_KEY || null,
  },

  // --------------------------------------------------
  // Email / SMTP
  // --------------------------------------------------

  email: {
    smtp: {
      host:
        process.env.EMAIL_HOST ||
        process.env.SMTP_HOST ||
        'smtp.gmail.com',

      port: getNumber(
        'EMAIL_PORT',
        getNumber('SMTP_PORT', 587, {
          min: 1,
          max: 65535,
        }),
        {
          min: 1,
          max: 65535,
        }
      ),

      secure:
        process.env.EMAIL_SECURE !== undefined
          ? process.env.EMAIL_SECURE === 'true'
          : false,

      auth: {
        user:
          process.env.EMAIL_USER ||
          process.env.SMTP_USER ||
          null,

        pass:
          process.env.EMAIL_PASS ||
          process.env.SMTP_PASS ||
          null,
      },
    },

    from:
      process.env.EMAIL_FROM ||
      'noreply@buildmyhome.com',

    fromName:
      process.env.EMAIL_FROM_NAME ||
      'BuildMyHome',
  },

  // --------------------------------------------------
  // Client
  // --------------------------------------------------

  clientUrl:
    process.env.CLIENT_URL ||
    'http://localhost:3000',

  // --------------------------------------------------
  // Rate Limiting
  // --------------------------------------------------

  rateLimit: {
    windowMs: getNumber(
      'RATE_LIMIT_WINDOW_MS',
      15 * 60 * 1000,
      { min: 1000 }
    ),

    maxRequests: getNumber(
      'RATE_LIMIT_MAX_REQUESTS',
      100,
      { min: 1 }
    ),
  },

  // --------------------------------------------------
  // File Upload
  // --------------------------------------------------

  upload: {
    maxFileSize: getNumber(
      'MAX_FILE_SIZE',
      50 * 1024 * 1024,
      { min: 1 }
    ),

    maxImages: getNumber(
      'MAX_IMAGES_PER_UPLOAD',
      10,
      { min: 1 }
    ),

    allowedImageTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],

    allowedDocumentTypes: [
      'application/pdf',
    ],

    allowedCadTypes: [
      'application/dwg',
      'application/x-dwg',
      'application/autocad_dwg',
    ],

    allowed3DTypes: [
      'model/gltf-binary',
      'model/gltf+json',
      'application/fbx',
    ],
  },

  // --------------------------------------------------
  // Logging
  // --------------------------------------------------

  logging: {
    level:
      process.env.LOG_LEVEL || 'info',

    dir:
      process.env.LOG_DIR || 'logs',
  },

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // --------------------------------------------------
  // Cache
  // --------------------------------------------------

  cache: {
    short: 300,
    medium: 1800,
    long: 3600,
    veryLong: 86400,
  },
};