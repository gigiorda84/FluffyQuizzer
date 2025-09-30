import { test, expect } from '@playwright/test';

test('Test dialog interaction and fix', async ({ page }) => {
  console.log('=== TESTING DIALOG FUNCTIONALITY ===');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check initial state
  const gocaButton = page.locator('[data-testid="button-mix-all"]');
  const istruzioniButton = page.locator('[data-testid="button-instructions"]');

  console.log('Checking if buttons are visible...');
  await expect(gocaButton).toBeVisible();
  await expect(istruzioniButton).toBeVisible();

  console.log('Clicking ISTRUZIONI button...');
  await istruzioniButton.click();

  // Wait for dialog to open
  await page.waitForTimeout(1000);

  const dialog = page.locator('[role="dialog"]');
  console.log('Checking if dialog opened...');
  await expect(dialog).toBeVisible();

  // Try to close dialog by clicking outside or pressing ESC
  console.log('Attempting to close dialog with ESC key...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Check if dialog closed
  const dialogVisible = await dialog.isVisible();
  console.log(`Dialog still visible after ESC: ${dialogVisible}`);

  if (dialogVisible) {
    console.log('Trying to click outside dialog to close...');
    // Click outside the dialog
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);
  }

  // Check if dialog is now closed
  const dialogStillVisible = await dialog.isVisible();
  console.log(`Dialog still visible after outside click: ${dialogStillVisible}`);

  // Now try to click GIOCA button
  console.log('Attempting to click GIOCA button...');
  try {
    await gocaButton.click({ timeout: 2000 });
    console.log('✅ GIOCA button clicked successfully!');
  } catch (error) {
    console.log('❌ GIOCA button still not clickable:', error.message);

    // If still blocked, let's inspect what's blocking it
    const blockingElement = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="button-mix-all"]');
      if (button) {
        const rect = button.getBoundingClientRect();
        const element = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        return {
          tagName: element?.tagName,
          className: element?.className,
          id: element?.id,
          textContent: element?.textContent?.slice(0, 50)
        };
      }
      return null;
    });

    console.log('Element blocking the button:', blockingElement);
  }
});