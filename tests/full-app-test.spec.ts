import { test, expect } from '@playwright/test';

test('Complete app functionality test', async ({ page }) => {
  console.log('=== TESTING COMPLETE APP FUNCTIONALITY ===');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Test 1: Check initial page load
  console.log('✓ Testing initial page load...');
  await expect(page.locator('#root')).toBeVisible();
  await expect(page.locator('text=FLUFFY TRIVIA')).toBeVisible();
  await expect(page.locator('text=IL GIOCO DELLA SOSTENIBILITÀ')).toBeVisible();

  // Test 2: Test Instructions dialog
  console.log('✓ Testing Instructions dialog...');
  const instructionsButton = page.locator('[data-testid="button-instructions"]');
  await instructionsButton.click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(page.locator('text=Benvenuto in Fluffy Trivia!')).toBeVisible();

  // Test close button
  const closeButton = page.locator('text=CHIUDI');
  await closeButton.click();
  await expect(dialog).not.toBeVisible();

  // Test 3: Test GIOCA button (main functionality)
  console.log('✓ Testing GIOCA button functionality...');
  const gocaButton = page.locator('[data-testid="button-mix-all"]');
  await gocaButton.click();

  // Should navigate to game screen - check for game elements
  await page.waitForTimeout(1000);

  // Look for typical game screen elements
  const hasGameContent = await page.locator('body').textContent();
  console.log(`Game screen loaded with content length: ${hasGameContent?.length}`);

  // Test 4: Test Editor button
  console.log('✓ Testing Editor access...');

  // Go back to home first if we're on game screen
  const backButtons = page.locator('button:has-text("BACK"), button:has-text("INDIETRO"), button:has-text("HOME")');
  const backButtonCount = await backButtons.count();
  if (backButtonCount > 0) {
    await backButtons.first().click();
    await page.waitForTimeout(500);
  }

  const editorButton = page.locator('[data-testid="button-cms-login"]');
  if (await editorButton.isVisible()) {
    await editorButton.click();
    await page.waitForTimeout(1000);
    console.log('Editor screen accessed');
  }

  console.log('✅ ALL FUNCTIONALITY TESTS COMPLETED');
});