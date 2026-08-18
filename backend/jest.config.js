module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['./tests/setup.js'],
  // All test files share a single MongoDB test database. Each test file's
  // setup.js wipes ALL collections in beforeAll and drops the DB in afterAll.
  // Running suites in parallel (the Jest default) causes cross-file races
  // where one file deletes another file's registered users/tokens, producing
  // spurious 401s. Run suites sequentially so each file owns the database
  // state for its duration.
  maxWorkers: 1,
};

