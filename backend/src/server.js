/**
 * BuildMyHome - Server Entry Point
 * Main server initialization and configuration
 */

const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const { initializeSocket } = require('./sockets');
const logger = require('./utils/logger');

// simple sleep helper
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Try to connect to Redis with limited retries and backoff.
 * If REDIS_ENABLED is false, skip immediately. On permanent failure,
 * ensure any partially-created client is disconnected to prevent reconnect spam.
 */
const tryConnectRedis = async ({ maxAttempts = 3, initialBackoff = 200 } = {}) => {
  const enabled = (process.env.REDIS_ENABLED || 'true').toString().toLowerCase();
  if (enabled === 'false' || enabled === '0' || enabled === 'no') {
    logger.info('Redis: disabled via REDIS_ENABLED; continuing without Redis');
    return null;
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // connectRedis reads host/port/password from config which sources env vars
      const client = await connectRedis();
      logger.info('Redis: connected');
      return client;
    } catch (err) {
      lastErr = err;
      logger.debug(`Redis: connection attempt ${attempt}/${maxAttempts} failed: ${err && err.message}`);

      // If there's a partially initialized client, disconnect to avoid reconnect loops
      try {
        await disconnectRedis();
      } catch (e) {
        // ignore
      }

      if (attempt < maxAttempts) {
        const backoff = Math.min(2000, initialBackoff * Math.pow(2, attempt - 1));
        await sleep(backoff + Math.floor(Math.random() * 100));
        continue;
      }
    }
  }

  logger.warn('Redis: unavailable after retries — continuing without Redis', lastErr ? lastErr.message : '');
  return null;
};

/**
 * Start the server safely.
 * - MongoDB is required; exit on failure
 * - Redis is optional and non-blocking; continue if unavailable
 * - Socket.io initialized but protected from crashing the server
 */
const startServer = async () => {
  let server;
  try {
    // 1) Connect to MongoDB (critical). connectDatabase should use process.env.MONGODB_URI
    await connectDatabase();
    logger.info('MongoDB: connected');

    // 2) Try Redis (optional)
    let redisClient = null;
    try {
      redisClient = await tryConnectRedis({ maxAttempts: 3 });
    } catch (redisUnexpected) {
      // tryConnectRedis handles retries and logging; this is a guard
      logger.warn('Redis: unexpected error during connection attempts', redisUnexpected && redisUnexpected.message);
    }

    // 3) Start HTTP server
    server = app.listen(config.port, () => {
      // Clean startup banner
      logger.info('------------------------------------------------------------');
      logger.info(`BuildMyHome API Server`);
      logger.info(`Environment : ${config.env}`);
      logger.info(`Port        : ${config.port}`);
      logger.info(`Node        : ${process.version}`);
      logger.info(`Server URL  : http://localhost:${config.port}`);
      const redisEnabled = (process.env.REDIS_ENABLED || 'true').toString().toLowerCase();
      let redisStatus = 'unknown';
      if (redisEnabled === 'false' || redisEnabled === '0' || redisEnabled === 'no') redisStatus = 'disabled';
      else redisStatus = redisClient ? 'connected' : 'unavailable';

      logger.info(`MongoDB     : connected`);
      logger.info(`Redis       : ${redisStatus}`);
      logger.info('------------------------------------------------------------');
    });

    // 4) Initialize Socket.io (wrapped)
    try {
      const io = initializeSocket(server);
      // Optional: log each new connection in socket handler (sockets module already logs)
      logger.info('Socket.io: initialized');
    } catch (sockErr) {
      logger.warn('Socket.io: failed to initialize (continuing without real-time features)', sockErr && sockErr.message);
    }

    // Global error handlers
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      if (server) server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      if (server) server.close(() => process.exit(1));
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received — shutting down gracefully');
      if (server) server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    // MongoDB failure or other fatal errors
    logger.error('Failed to start server (fatal):', err && err.message ? err.message : err);
    process.exit(1);
  }
};

startServer();

