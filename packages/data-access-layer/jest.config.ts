export default {
  displayName: 'data-access-layer',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/data-access-layer',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.config.{js,ts}',
    '!src/test-setup.ts',
    '!src/**/migrations/**',
    '!src/**/index.ts',
  ],
};
