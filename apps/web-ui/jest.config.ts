export default {
  displayName: 'web-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/web-ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.config.{js,ts}',
    '!src/test-setup.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/**',
    '!src/**/index.ts',
    '!src/**/*.module.ts',
    '!src/**/*.routes.ts',
    '!src/**/*-routing.module.ts',
    '!src/app/features/examples/**',
    '!src/app/core/decorators/**',
    // Utility services that are hard to test
    '!src/app/core/services/form-group.service.ts',
    '!src/app/core/services/form-group-error-messages.ts',
    '!src/app/core/services/fingerprint.service.ts',
    '!src/app/shared/components/form-debug/**',
    '!src/app/shared/utils/**',
    // Infrastructure services
    '!src/app/core/services/server-side-events.service.ts',
    '!src/app/core/sockets/socket.service.ts',
    '!src/app/core/services/notification.service.ts',
    // Presentational components (mostly template/UI logic)
    '!src/app/layout/header/**',
    '!src/app/layout/footer/**',
  ],
};
