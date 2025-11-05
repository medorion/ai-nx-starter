import 'jest-preset-angular/setup-jest';
import 'reflect-metadata';

// Mock uuid to avoid ESM import issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  v1: jest.fn(() => '00000000-0000-0000-0000-000000000000'),
  validate: jest.fn(() => true),
  version: jest.fn(() => 4),
}));

// Mock Angular locale data
jest.mock('@angular/common/locales/en', () => ({ default: ['en'] }), { virtual: true });

// Mock Angular registerLocaleData function to prevent it from processing the mock
jest.mock('@angular/common', () => ({
  ...jest.requireActual('@angular/common'),
  registerLocaleData: jest.fn(),
}));
