/**
 * BuildMyHome - Redis Configuration
 * Redis client setup for caching and session management
 */

const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  // Respect REDIS_ENABLED flag at top-level too
  const enabled = (process.env.REDIS_ENABLED || 'true').toString().toLowerCase();
  if (enabled === 'false' || enabled === '0' || enabled === 'no') {
    logger.info('Redis: disabled via REDIS_ENABLED');
    return null;
  }

  try {
    // Support full REDIS_URL or host/port configuration
    const redisOptions = {
      password: config.redis.password || undefined,
      lazyConnect: true,
      // limit retries to avoid reconnect flood
      maxRetriesPerRequest: 3,
      // custom retry strategy: stop after ~5 attempts
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 100, 2000);
      },
    };

    if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL, redisOptions);
    } else {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        ...redisOptions,
      });
    }

    // Minimal event logging to avoid spam. Detailed events at debug level only.
    redisClient.on('ready', () => logger.info('Redis: ready'));
    redisClient.on('error', (err) => logger.debug('Redis: error', err && err.message));
    // Do not log reconnect events repeatedly; let higher-level startup logic handle retries

    await redisClient.connect();
    if (redisClient.status !== 'ready') {
      throw new Error(`Redis not ready (status=${redisClient.status})`);
    }
    return redisClient;
  } catch (error) {
    // Log at debug to avoid flooding; higher-level code will emit a single warning when appropriate
    logger.debug('Redis: Failed to connect', error && error.message);
    throw error;
  }
};

/**
 * Get Redis client
 */
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

/**
 * Disconnect from Redis
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis: Disconnected');
  }
};

/**
 * Cache operations
 */
const cache = {
  /**
   * Set cache value
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return false;
      const serialized = JSON.stringify(value);
      // use generic SET with EX to be compatible across clients
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (error) {
      logger.error('Redis cache set error:', error.message);
      return false;
    }
  },

  /**
   * Get cache value
   */
  async get(key) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return null;
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error('Redis cache get error:', error.message);
      return null;
    }
  },

  /**
   * Delete cache value
   */
  async del(key) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis cache delete error:', error.message);
      return false;
    }
  },

  /**
   * Delete cache by pattern
   */
  async delByPattern(pattern) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return false;
      // Use SCAN stream to avoid blocking Redis
      const stream = redisClient.scanStream({ match: pattern, count: 100 });
      const pipeline = redisClient.pipeline();
      let keysFound = 0;
      return new Promise((resolve) => {
        stream.on('data', (keys) => {
          if (keys.length) {
            keysFound += keys.length;
            keys.forEach((k) => pipeline.del(k));
          }
        });
        stream.on('end', async () => {
          if (keysFound > 0) {
            await pipeline.exec();
          }
          resolve(true);
        });
        stream.on('error', (err) => {
          logger.error('Redis scanStream error:', err.message);
          resolve(false);
        });
      });
    } catch (error) {
      logger.error('Redis cache delete by pattern error:', error.message);
      return false;
    }
  },

  /**
   * Increment counter
   */
  async incr(key) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return null;
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Redis increment error:', error.message);
      return null;
    }
  },

  /**
   * Set expiration
   */
  async expire(key, seconds) {
    try {
      if (!redisClient || redisClient.status !== 'ready') return false;
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error('Redis expire error:', error.message);
      return false;
    }
  },
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  cache,
};

