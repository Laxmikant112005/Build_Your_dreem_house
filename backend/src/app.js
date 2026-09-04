/**
 * BuildMyHome - Express Application
 * Main application setup with middleware and routes
 * 
 * PHASE 1 HARDENING:
 * - express-mongo-sanitize: prevents NoSQL injection via $ ops in JSON/URL-encoded bodies
 * - hpp: protects against HTTP parameter pollution
 * - helmet: comprehensive security headers (CSP, HSTS, X-Frame, etc.)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { rateLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');

const app = express();

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      mediaSrc: ["'self'", 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS configuration
// origin supports multiple allowed origins (string, array, or function)
// for flexibility across dev, staging, production environments
const corsOrigin = config.clientUrl || 'http://localhost:3000';
const allowedOrigins = [
  corsOrigin,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : []),
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origin is not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'X-Timezone', 'Accept-Language'],
  exposedHeaders: ['X-Refresh-Token'],
};
app.use(cors(corsOptions));
// Log allowed CORS origins at startup for debugging
logger.info(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- NoSQL Injection Prevention ---
// Strips $ and . from req.body, req.query, req.params to prevent
// MongoDB injection attacks via malicious query operators.
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`mongoSanitize: stripped prohibited key "${key}" from ${req.method} ${req.originalUrl}`);
  },
}));

// --- HTTP Parameter Pollution Prevention ---
// Whitelist known duplicate-safe query params used for filtering.
app.use(hpp({
  whitelist: [
    'price', 'rating', 'status', 'role', 'category', 'style',
    'city', 'page', 'limit', 'sortBy', 'sortOrder',
    'minCost', 'maxCost', 'minArea', 'maxArea', 'floors',
    'startDate', 'endDate', 'search', 'tags',
  ],
}));

// Compression middleware
app.use(compression());

// Logging middleware (HTTP requests)
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting
app.use('/api', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: '1.0.0',
  });
});

// Debug endpoint - test if server & middleware working
app.get('/api/v1/debug', (req, res) => {
  console.log("DEBUG ROUTE HIT - server and middleware OK");
  res.status(200).json({ 
    success: true, 
    message: 'Debug route working - server healthy', 
    timestamp: new Date().toISOString(),
    userId: req.userId || null 
  });
});

// API Routes
app.use('/api', routes);

// Convenience aliases (older frontend/service paths)
// These help prevent "connection refused" / "route not found" issues when clients call `/api/v1/auth/...`.
// The canonical frontend base URL is `/api/v1`; mounting the router at `/v1`
// would produce an invalid `/v1/v1/...` path because the router already owns
// the version prefix.


// API documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.json({
    message: 'BuildMyHome API Documentation',
    version: config.apiVersion,
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      engineers: '/api/v1/engineers',
      designs: '/api/v1/designs',
      bookings: '/api/v1/bookings',
      reviews: '/api/v1/reviews',
      chats: '/api/v1/chats',
      notifications: '/api/v1/notifications',
      uploads: '/api/v1/uploads',
      admin: '/api/v1/admin',
    },
  });
});


// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

