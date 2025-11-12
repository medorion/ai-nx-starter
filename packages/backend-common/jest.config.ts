export default {
  displayName: 'backend-common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/backend-common',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.config.{js,ts}',
    '!src/**/index.ts',
    '!src/decorators/**',
    '!src/core-services.module.ts',
    '!src/services/crypto.service.ts',
    '!src/services/sync-events.service.ts',
    '!src/services/utils.ts',
  ],
};
