/**
 * Planova - Main Configuration
 */

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const getNumber = (name, fallback, { min, max } = {}) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }

  if (min !== undefined && value < min) {
    throw new Error(`${name} must be >= ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`${name} must be <= ${max}`);
  }

  return value;
};

const jwtSecret =
  process.env.JWT_SECRET ||
  (!isProduction ? 'development-jwt-secret-change-me' : null);

const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET ||
  (!isProduction ? 'development-refresh-secret-change-me' : null);

if (!jwtSecret) throw new Error('JWT_SECRET is required');
if (!jwtRefreshSecret) throw new Error('JWT_REFRESH_SECRET is required');

const mongoUri =
  process.env.MONGODB_URI ||
  (!isProduction ? 'mongodb://localhost:27017/planova' : null);

if (!mongoUri) throw new Error('MONGODB_URI is required');

module.exports = {
  env,

  port: getNumber('PORT', 5000, {
    min: 1,
    max: 65535,
  }),

  apiVersion: process.env.API_VERSION || 'v1',

  apiUrl:
    process.env.API_URL || 'http://localhost:5000/api/v1',

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

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: getNumber('REDIS_PORT', 6379, {
      min: 1,
      max: 65535,
    }),
    password: process.env.REDIS_PASSWORD || '',
  },

  jwt: {
    secret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
    expiresIn: process.env.JWT_EXPIRE_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_IN || '7d',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
    region: process.env.AWS_REGION || 'ap-south-1',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || null,
    },
    endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || null,
    secret: process.env.RAZORPAY_SECRET || null,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || null,
  },

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

      secure: process.env.EMAIL_SECURE === 'true',

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

  clientUrl:
    process.env.CLIENT_URL ||
    'http://localhost:3000',

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

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  cache: {
    short: 300,
    medium: 1800,
    long: 3600,
    veryLong: 86400,
  },
};