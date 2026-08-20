const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;
let connectionPromise = null;
let redisEnabled = true;

/**
 * Check whether Redis is enabled.
 */
const isRedisEnabled = () => {
  const value = String(
    process.env.REDIS_ENABLED ?? 'true'
  ).toLowerCase();

  return !['false', '0', 'no', 'off'].includes(value);
};

const connectRedis = async () => {
  if (!isRedisEnabled()) {
    redisEnabled = false;
    logger.info('Redis: disabled via REDIS_ENABLED');
    return null;
  }

  redisEnabled = true;

  // Already connected.
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  // Connection already in progress.
  if (connectionPromise) {
    return connectionPromise;
  }

  const redisOptions = {
    lazyConnect: true,

    password: config.redis.password || undefined,

    maxRetriesPerRequest: 3,

    retryStrategy: (times) => {
      if (times > 5) {
        logger.warn(
          'Redis: maximum reconnect attempts reached'
        );

        return null;
      }

      return Math.min(times * 100, 2000);
    },
  };

  try {
    if (process.env.REDIS_URL) {
      redisClient = new Redis(
        process.env.REDIS_URL,
        redisOptions
      );
    } else {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        ...redisOptions,
      });
    }

    /**
     * Redis events.
     */
    redisClient.on('ready', () => {
      logger.info('Redis: ready');
    });

    redisClient.on('connect', () => {
      logger.debug('Redis: connecting');
    });

    redisClient.on('reconnecting', (delay) => {
      logger.debug(
        `Redis: reconnecting in ${delay}ms`
      );
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', {
        message: error.message,
      });
    });

    connectionPromise = redisClient.connect();

    await connectionPromise;

    if (redisClient.status !== 'ready') {
      throw new Error(
        `Redis not ready (status=${redisClient.status})`
      );
    }

    return redisClient;
  } catch (error) {
    logger.error('Redis: Failed to connect', {
      message: error.message,
    });

    if (redisClient) {
      try {
        redisClient.disconnect();
      } catch (_) {
        // Ignore cleanup errors.
      }
    }

    redisClient = null;

    throw error;
  } finally {
    connectionPromise = null;
  }
};

/**
 * Get Redis client.
 */
const getRedisClient = () => {
  if (!redisEnabled) {
    return null;
  }

  if (!redisClient || redisClient.status !== 'ready') {
    throw new Error(
      'Redis client is not connected'
    );
  }

  return redisClient;
};

/**
 * Check Redis availability without throwing.
 */
const isRedisReady = () => {
  return (
    redisEnabled &&
    redisClient !== null &&
    redisClient.status === 'ready'
  );
};

/**
 * Disconnect from Redis.
 */
const disconnectRedis = async () => {
  if (!redisClient) {
    return;
  }

  const client = redisClient;
  redisClient = null;
  connectionPromise = null;

  try {
    if (
      client.status !== 'end' &&
      client.status !== 'wait'
    ) {
      await client.quit();
    }

    logger.info('Redis: disconnected');
  } catch (error) {
    logger.error('Redis: disconnect error', {
      message: error.message,
    });

    try {
      client.disconnect();
    } catch (_) {
      // Ignore forced disconnect errors.
    }

    throw error;
  }
};

/**
 * Validate cache key.
 */
const validateKey = (key) => {
  if (
    typeof key !== 'string' ||
    key.trim() === ''
  ) {
    throw new TypeError(
      'Redis cache key must be a non-empty string'
    );
  }
};

/**
 * Validate TTL.
 */
const validateTTL = (seconds) => {
  if (
    !Number.isInteger(seconds) ||
    seconds <= 0
  ) {
    throw new TypeError(
      'Redis TTL must be a positive integer'
    );
  }
};

/**
 * Cache operations.
 */
const cache = {
  /**
   * Set cache value.
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      validateKey(key);
      validateTTL(ttlSeconds);

      if (!isRedisReady()) {
        return false;
      }

      const serialized = JSON.stringify(value);

      await redisClient.set(
        key,
        serialized,
        'EX',
        ttlSeconds
      );

      return true;
    } catch (error) {
      logger.error('Redis cache set error:', {
        message: error.message,
        key,
      });

      return false;
    }
  },

  /**
   * Get cache value.
   */
  async get(key) {
    try {
      validateKey(key);

      if (!isRedisReady()) {
        return null;
      }

      const value = await redisClient.get(key);

      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch (parseError) {
        logger.warn(
          `Redis cache contains invalid JSON for key: ${key}`
        );

        return null;
      }
    } catch (error) {
      logger.error('Redis cache get error:', {
        message: error.message,
        key,
      });

      return null;
    }
  },

  /**
   * Delete cache value.
   */
  async del(key) {
    try {
      validateKey(key);

      if (!isRedisReady()) {
        return false;
      }

      await redisClient.del(key);

      return true;
    } catch (error) {
      logger.error('Redis cache delete error:', {
        message: error.message,
        key,
      });

      return false;
    }
  },

  async delByPattern(pattern) {
    try {
      validateKey(pattern);

      if (!isRedisReady()) {
        return false;
      }

      let cursor = '0';
      let deleted = 0;

      do {
        const [nextCursor, keys] =
          await redisClient.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100
          );

        cursor = nextCursor;

        if (keys.length > 0) {
          await redisClient.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== '0');

      logger.debug(
        `Redis: deleted ${deleted} keys matching ${pattern}`
      );

      return true;
    } catch (error) {
      logger.error(
        'Redis cache delete by pattern error:',
        {
          message: error.message,
          pattern,
        }
      );

      return false;
    }
  },

  /**
   * Increment counter.
   */
  async incr(key) {
    try {
      validateKey(key);

      if (!isRedisReady()) {
        return null;
      }

      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Redis increment error:', {
        message: error.message,
        key,
      });

      return null;
    }
  },

  /**
   * Set expiration.
   */
  async expire(key, seconds) {
    try {
      validateKey(key);
      validateTTL(seconds);

      if (!isRedisReady()) {
        return false;
      }

      return await redisClient.expire(
        key,
        seconds
      );
    } catch (error) {
      logger.error('Redis expire error:', {
        message: error.message,
        key,
      });

      return false;
    }
  },
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  isRedisReady,
  cache,
};
