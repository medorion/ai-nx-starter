import { test, expect } from '@playwright/test';
import { getHealthUrl } from './fixtures/test-data';

test.describe('API Health Check', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    const response = await request.get(getHealthUrl());

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });

  test('should have backend server running', async ({ request }) => {
    const response = await request.get(getHealthUrl());

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers).toHaveProperty('content-type');
    expect(headers['content-type']).toContain('application/json');
  });

  test('should respond within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(getHealthUrl());
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });
});
