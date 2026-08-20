/**
 * BuildMyHome / Planova - Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let isConnecting = false;

/**
 * Configure MongoDB debugging.
 * Only enabled in development.
 */
if (config.env === 'development') {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.debug(`MongoDB: ${collectionName}.${method}`, {
      query,
      doc,
    });
  });
}

/**
 * Register MongoDB connection event listeners once.
 */
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.once('open', () => {
  const dbName = mongoose.connection.name;

  logger.info(
    `MongoDB: connected${dbName ? ` to database '${dbName}'` : ''}`
  );
});

/**
 * Connect to MongoDB.
 */
const connectDatabase = async () => {
  if (!config.database || !config.database.uri) {
    throw new Error(
      'MongoDB configuration is missing: config.database.uri'
    );
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB: already connected');
    return mongoose.connection;
  }

  // Connection is already in progress
  if (isConnecting) {
    logger.info('MongoDB: connection already in progress');
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    const options = {
      ...(config.database.options || {}),

      writeConcern: {
        w: config.env === 'production' ? 'majority' : 1,
        j: config.env === 'production',
        wtimeoutMS: 5000,
      },
    };

    await mongoose.connect(config.database.uri, options);

    logger.info('MongoDB connection established');

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', {
      message: error.message,
      name: error.name,
    });

    throw error;
  } finally {
    isConnecting = false;
  }
};

/**
 * Disconnect from MongoDB.
 */
const disconnectDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    logger.info('MongoDB: already disconnected');
    return;
  }

  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', {
      message: error.message,
      name: error.name,
    });

    throw error;
  }
};

/**
 * Gracefully close MongoDB during application shutdown.
 */
const setupDatabaseShutdown = () => {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Closing MongoDB connection...`);

    try {
      await disconnectDatabase();
      logger.info('MongoDB connection closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Failed to close MongoDB connection:', {
        message: error.message,
      });

      process.exit(1);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  setupDatabaseShutdown,
  mongoose,
};