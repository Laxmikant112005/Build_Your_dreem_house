const app = require('./app');
const config = require('./config');

const {
  connectDatabase,
  disconnectDatabase,
} = require('./config/database');

const {
  connectRedis,
  disconnectRedis,
} = require('./config/redis');

const { initializeSocket } = require('./sockets');

const logger = require('./utils/logger');

let server = null;
let redisClient = null;
let socketInitialized = false;
let isShuttingDown = false;

/**
 * Sleep helper.
 */
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check whether Redis is enabled.
 */
const isRedisEnabled = () => {
  const value = String(
    process.env.REDIS_ENABLED ?? 'true'
  ).toLowerCase();

  return !['false', '0', 'no', 'off'].includes(value);
};


const isRedisConnected = () => {
  return (
    redisClient &&
    redisClient.status === 'ready'
  );
};


const tryConnectRedis = async ({
  maxAttempts = 3,
  initialBackoff = 500,
} = {}) => {
  if (!isRedisEnabled()) {
    logger.info(
      'Redis: disabled via REDIS_ENABLED; continuing without Redis'
    );

    return null;
  }

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      logger.info(
        `Redis: connection attempt ${attempt}/${maxAttempts}`
      );

      const client = await connectRedis();

      if (
        client &&
        client.status === 'ready'
      ) {
        logger.info('Redis: connected');
        return client;
      }

      throw new Error(
        'Redis connection returned without a ready client'
      );
    } catch (error) {
      lastError = error;

      logger.warn(
        `Redis: connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      );

      try {
        await disconnectRedis();
      } catch (disconnectError) {
        logger.debug(
          `Redis: cleanup after failed connection failed: ${disconnectError.message}`
        );
      }

      if (attempt < maxAttempts) {
        const backoff = Math.min(
          3000,
          initialBackoff * Math.pow(2, attempt - 1)
        );

        const jitter =
          Math.floor(Math.random() * 250);

        await sleep(backoff + jitter);
      }
    }
  }

  logger.warn(
    `Redis: unavailable after ${maxAttempts} attempts. Continuing without Redis.`,
    lastError?.message || ''
  );

  return null;
};

/**
 * Close the HTTP server.
 */
const closeHttpServer = () => {
  return new Promise((resolve) => {
    if (!server) {
      return resolve();
    }

    server.close((error) => {
      if (error) {
        logger.error(
          'HTTP server close error:',
          error
        );
      } else {
        logger.info(
          'HTTP server closed'
        );
      }

      resolve();
    });
  });
};

/**
 * Gracefully shut down the application.
 */
const shutdown = async (
  signal = 'UNKNOWN',
  exitCode = 0
) => {
  /**
   * Prevent multiple shutdown attempts.
   */
  if (isShuttingDown) {
    logger.warn(
      'Shutdown already in progress'
    );

    return;
  }

  isShuttingDown = true;

  logger.info(
    `${signal} received — starting graceful shutdown`
  );

  /**
   * Stop accepting new HTTP requests first.
   */
  try {
    await closeHttpServer();
  } catch (error) {
    logger.error(
      'Error while closing HTTP server:',
      error
    );
  }

  /**
   * Close Redis.
   */
  try {
    await disconnectRedis();

    redisClient = null;

    logger.info(
      'Redis: shutdown complete'
    );
  } catch (error) {
    logger.error(
      'Redis: shutdown error:',
      error
    );
  }

  /**
   * Close MongoDB.
   */
  try {
    await disconnectDatabase();

    logger.info(
      'MongoDB: shutdown complete'
    );
  } catch (error) {
    logger.error(
      'MongoDB: shutdown error:',
      error
    );
  }

  logger.info(
    `Planova shutdown complete. Exit code: ${exitCode}`
  );

  process.exitCode = exitCode;
};

/**
 * Handle unexpected errors.
 *
 * These handlers should not attempt to continue running
 * after an uncaught exception because application state
 * may be corrupted.
 */
const registerProcessHandlers = () => {
  process.once(
    'unhandledRejection',
    async (reason) => {
      logger.error(
        'Unhandled Promise Rejection:',
        reason
      );

      await shutdown(
        'UNHANDLED_REJECTION',
        1
      );
    }
  );

  process.once(
    'uncaughtException',
    async (error) => {
      logger.error(
        'Uncaught Exception:',
        error
      );

      await shutdown(
        'UNCAUGHT_EXCEPTION',
        1
      );
    }
  );

  process.once(
    'SIGTERM',
    async () => {
      await shutdown(
        'SIGTERM',
        0
      );
    }
  );

  process.once(
    'SIGINT',
    async () => {
      await shutdown(
        'SIGINT',
        0
      );
    }
  );
};

/**
 * Start HTTP server.
 */
const startHttpServer = () => {
  return new Promise((resolve, reject) => {
    server = app.listen(
      config.port,
      () => {
        resolve(server);
      }
    );

    server.once(
      'error',
      reject
    );
  });
};

/**
 * Start application.
 */
const startServer = async () => {
  try {
    registerProcessHandlers();

    logger.info(
      '------------------------------------------------------------'
    );

    logger.info(
      'Starting Planova backend...'
    );

    logger.info(
      `Environment : ${config.env}`
    );

    logger.info(
      `Node        : ${process.version}`
    );

    /**
     * 1. MongoDB
     *
     * MongoDB is required.
     */
    logger.info(
      'MongoDB: connecting...'
    );

    await connectDatabase();

    logger.info(
      'MongoDB: connected'
    );

    /**
     * 2. Redis
     *
     * Redis is optional.
     */
    redisClient =
      await tryConnectRedis({
        maxAttempts: 3,
        initialBackoff: 500,
      });

    /**
     * 3. HTTP server
     */
    await startHttpServer();

    /**
     * 4. Socket.IO
     */
    try {
      initializeSocket(server);

      socketInitialized = true;

      logger.info(
        'Socket.io: initialized'
      );
    } catch (error) {
      socketInitialized = false;

      logger.warn(
        `Socket.io: failed to initialize. Continuing without real-time features: ${error.message}`
      );
    }

    /**
     * Startup status.
     */
    logger.info(
      '------------------------------------------------------------'
    );

    logger.info(
      'Planova API Server started successfully'
    );

    logger.info(
      `Environment : ${config.env}`
    );

    logger.info(
      `Port        : ${config.port}`
    );

    logger.info(
      `Server URL  : ${config.apiUrl || `http://localhost:${config.port}`}`
    );

    logger.info(
      'MongoDB     : connected'
    );

    logger.info(
      `Redis       : ${
        !isRedisEnabled()
          ? 'disabled'
          : isRedisConnected()
            ? 'connected'
            : 'unavailable'
      }`
    );

    logger.info(
      `Socket.io   : ${
        socketInitialized
          ? 'initialized'
          : 'unavailable'
      }`
    );

    logger.info(
      '------------------------------------------------------------'
    );

    return server;
  } catch (error) {
    logger.error(
      'Failed to start Planova server:',
      error
    );

    try {
      await disconnectRedis();
    } catch (redisError) {
      logger.error(
        'Redis cleanup failed:',
        redisError
      );
    }

    try {
      await disconnectDatabase();
    } catch (databaseError) {
      logger.error(
        'MongoDB cleanup failed:',
        databaseError
      );
    }

    process.exitCode = 1;

    return null;
  }
};


startServer();