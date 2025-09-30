import { test, expect } from '@playwright/test';

test.describe('Fluffy Trivia Quiz App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads
    await expect(page).toHaveTitle(/Fluffy Trivia/);

    // Check if the root element is present
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should display quiz interface', async ({ page }) => {
    await page.goto('/');

    // Wait for the React app to load
    await page.waitForLoadState('networkidle');

    // Look for common quiz interface elements
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check if we can find typical quiz game elements
    // These selectors might need adjustment based on your actual component structure
    const hasQuizElements = await page.locator('[class*="quiz"], [class*="card"], [class*="trivia"]').count();
    expect(hasQuizElements).toBeGreaterThan(0);
  });

  test('should have responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Basic check that content is still visible on mobile
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should load fonts correctly', async ({ page }) => {
    await page.goto('/');

    // Check if Fredoka font is loaded
    const computedStyle = await page.evaluate(() => {
      const element = document.body;
      return window.getComputedStyle(element).fontFamily;
    });

    expect(computedStyle).toContain('Fredoka');
  });
});