export default {
  displayName: 'web-server',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/web-server',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.config.{js,ts}',
    '!src/test-setup.ts',
    '!src/main.ts', // Entry point
    '!src/app/app-initializer-service.ts', // Startup service
    '!src/app/features/exceptions/**', // Exception module (for testing)
    '!src/app/features/sync-events/**', // SSE infrastructure
    '!src/common/all-exceptions.filter.ts', // Global exception filter
    '!src/common/base.mapper.ts', // Abstract base class
  ],
};
