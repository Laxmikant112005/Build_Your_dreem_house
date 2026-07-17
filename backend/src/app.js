/**
 * BuildMyHome - Express Application
 * Main application setup with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
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
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'X-Timezone', 'Accept-Language'],
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use(`/${config.apiVersion}`, routes);


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

