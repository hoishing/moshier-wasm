export default {
  // Test environment
  testEnvironment: "node",

  // Module file extensions
  moduleFileExtensions: ["js", "json"],

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js", "**/__tests__/**/*.js"],

  // Coverage settings
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],

  // Setup files
  setupFilesAfterEnv: [],

  // Transform settings
  transform: {},

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,
};
