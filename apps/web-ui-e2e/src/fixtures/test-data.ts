/**
 * Test data for E2E tests
 */

export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
  },
  user: {
    email: 'user@test.com',
    password: 'User123!',
    name: 'Regular User',
    role: 'user',
  },
};

export const TEST_EXAMPLES = {
  example1: {
    name: 'Test Example 1',
    description: 'This is a test example',
  },
  example2: {
    name: 'Test Example 2',
    description: 'Another test example',
  },
};

export const API_ENDPOINTS = {
  health: '/health', // Health endpoint doesn't use the full API prefix
  login: '/auth/login',
  users: '/users',
  examples: '/examples/examples',
};

// Base API URL (without prefix, used by health check)
export const getHealthUrl = () => {
  const apiUrl = process.env.API_URL || 'http://localhost:3030';
  return `${apiUrl}/health`;
};
