/**
 * BuildMyHome - Test Setup
 * Jest configuration for API tests
 */

const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Connect to test database before all tests
beforeAll(async () => {
  try {
    // Use test database
    const testUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/buildmyhome_test';
    await mongoose.connect(testUri);
    console.log('✓ Connected to test database');
  } catch (error) {
    console.error('✗ Failed to connect to test database:', error);
    throw error;
  }
});

// Disconnect and cleanup after all tests
afterAll(async () => {
  try {
    // Drop test database
    await mongoose.connection.dropDatabase();
    await disconnectDatabase();
    console.log('✓ Test database cleanup complete');
  } catch (error) {
    console.error('✗ Cleanup error:', error);
  }
});

// Clear all collections once per test file (before any test in the file runs).
//
// IMPORTANT: This must run as `beforeAll`, NOT `beforeEach`. Many test files
// register users (and receive JWTs) in their own `beforeAll` and then rely on
// those users/tokens remaining valid across every `it()` in the file. A
// `beforeEach` wipe would delete those users before the very first test after
// registration, invalidating their JWTs and causing spurious 401s.
//
// Using `beforeAll` keeps the database clean between test files (isolation)
// while preserving the auth state that each file's own `beforeAll` establishes.
beforeAll(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

