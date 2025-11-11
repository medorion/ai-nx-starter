import { Page } from '@playwright/test';

/**
 * Wait for the application to be ready
 */
export async function waitForApp(page: Page) {
  // Wait for Angular to be loaded
  await page.waitForLoadState('networkidle');

  // Wait for any initial loaders to disappear
  const loader = page.locator('[data-testid="loading"]').first();
  if (await loader.isVisible().catch(() => false)) {
    await loader.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

/**
 * Get the API base URL
 * Default port is 3030 (from web-server project.json)
 */
export function getApiUrl(): string {
  return process.env.API_URL || 'http://localhost:3030';
}

/**
 * Get the full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const apiUrl = getApiUrl();
  const apiPrefix = 'ai-nx-starter/rest/api/v2';
  return `${apiUrl}/${apiPrefix}${path}`;
}

/**
 * Login helper
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/');

  // Wait for app to load
  await waitForApp(page);

  // Check if already logged in
  const logoutButton = page.locator('[data-testid="logout-button"]').first();
  if (await logoutButton.isVisible().catch(() => false)) {
    // Already logged in
    return;
  }

  // Fill login form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');

  // Wait for login to complete
  await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
  await waitForApp(page);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  const logoutButton = page.locator('[data-testid="logout-button"]').first();

  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  }
}

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForApp(page);
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}
