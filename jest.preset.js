const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ['json', 'lcov', 'text', 'html', 'json-summary'],
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.spec.{js,ts}',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/.nx/**',
    '!**/test-setup.ts',
    '!**/jest.config.ts',
    '!**/migrations/**',
    '!**/*.d.ts',
    '!**/index.ts', // Export files only
    '!**/*.module.ts', // Angular modules (configuration)
    '!**/*.routes.ts', // Route configuration
    '!**/*-routing.module.ts', // Angular routing
    '!**/examples/**', // Demo/example code
    '!**/decorators/**', // Decorators
    '!**/main.ts', // Entry points
    '!**/polyfills.ts', // Polyfills
    '!**/environments/**', // Environment configs
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 60,
      lines: 70,
    },
  },
};
