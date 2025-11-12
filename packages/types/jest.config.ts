export default {
  displayName: 'types',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/types',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.spec.{js,ts}', '!src/**/*.config.{js,ts}', '!src/**/index.ts'],
};
