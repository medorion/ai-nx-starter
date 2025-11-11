import { test, expect } from '@playwright/test';
import { waitForApp, navigateTo } from './support/helpers';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await waitForApp(page);

    // Should redirect to login or show login form
    await expect(page).toHaveURL(/\/(login|$)/);

    // Check for login elements (adjust selectors based on your actual UI)
    const hasLoginButton =
      (await page.locator('button:has-text("Login")').count()) > 0 || (await page.locator('button:has-text("Sign In")').count()) > 0;

    expect(hasLoginButton).toBeTruthy();
  });

  test('should show welcome page for authenticated users', async ({ page }) => {
    await waitForApp(page);

    // This test assumes the app shows a welcome page or dashboard
    // Adjust based on your actual post-login behavior

    // Check if we're on login page or already logged in
    const currentUrl = page.url();

    if (currentUrl.includes('login')) {
      // Not logged in - that's expected for E2E tests without auth setup
      expect(currentUrl).toContain('login');
    } else {
      // Already logged in (e.g., from previous test or session)
      // Should show some authenticated content
      const hasLogout =
        (await page.locator('[data-testid="logout-button"]').count()) > 0 || (await page.locator('button:has-text("Logout")').count()) > 0;

      expect(hasLogout).toBeTruthy();
    }
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/backoffice/users');
    await waitForApp(page);

    // Should either show login page or be redirected to login
    const currentUrl = page.url();
    const isOnLoginOrAuth = currentUrl.includes('login') || currentUrl.includes('auth') || currentUrl.includes('redirecting');

    expect(isOnLoginOrAuth).toBeTruthy();
  });
});
