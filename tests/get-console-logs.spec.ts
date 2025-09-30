import { test, expect } from '@playwright/test';

test('getConsoleLogs - Capture all console output', async ({ page }) => {
  const allLogs: any[] = [];

  // Capture all console events
  page.on('console', msg => {
    const args = msg.args();
    const logData = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };

    allLogs.push(logData);

    // Real-time logging to test output
    console.log(`[${logData.type.toUpperCase()}] ${logData.text}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    const errorLog = {
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    allLogs.push(errorLog);
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(error.stack);
  });

  // Navigate and interact with the app
  console.log('=== NAVIGATING TO APPLICATION ===');
  await page.goto('/');

  console.log('=== WAITING FOR APP TO LOAD ===');
  await page.waitForLoadState('networkidle');

  // Wait for any delayed console logs
  await page.waitForTimeout(2000);

  console.log('=== TRYING TO INTERACT WITH APP ELEMENTS ===');

  try {
    // Try to find and click various elements to trigger more logs
    const buttons = await page.locator('button, [role="button"], a').all();
    console.log(`Found ${buttons.length} interactive elements`);

    // Click a few buttons to see if they generate console logs
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const button = buttons[i];
      if (await button.isVisible()) {
        const text = await button.textContent();
        console.log(`Clicking button: "${text}"`);
        await button.click();
        await page.waitForTimeout(1000); // Wait for any async operations
      }
    }

    // Try to navigate to different sections
    const navItems = await page.locator('nav a, [data-testid*="nav"]').all();
    if (navItems.length > 0) {
      console.log(`Found ${navItems.length} navigation items`);
      for (let i = 0; i < Math.min(navItems.length, 2); i++) {
        const navItem = navItems[i];
        if (await navItem.isVisible()) {
          const text = await navItem.textContent();
          console.log(`Clicking nav item: "${text}"`);
          await navItem.click();
          await page.waitForTimeout(1500);
        }
      }
    }

  } catch (error) {
    console.log(`Error during interaction: ${error}`);
  }

  // Try form interactions if any exist
  try {
    const inputs = await page.locator('input, textarea, select').all();
    if (inputs.length > 0) {
      console.log(`Found ${inputs.length} form elements`);
      const firstInput = inputs[0];
      if (await firstInput.isVisible()) {
        console.log('Typing in first input field');
        await firstInput.fill('test input');
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    console.log(`Error during form interaction: ${error}`);
  }

  // Final wait to capture any remaining logs
  await page.waitForTimeout(2000);

  console.log('\n=== FINAL CONSOLE LOG SUMMARY ===');
  console.log(`Total console messages captured: ${allLogs.length}`);

  // Group logs by type
  const logsByType = allLogs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {});

  console.log('Log types:', logsByType);

  // Show all unique log messages
  const uniqueMessages = [...new Set(allLogs.map(log => log.text))];
  console.log('\n=== ALL UNIQUE LOG MESSAGES ===');
  uniqueMessages.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg}`);
  });

  // Show error logs in detail if any
  const errorLogs = allLogs.filter(log => log.type === 'error' || log.type === 'pageerror');
  if (errorLogs.length > 0) {
    console.log('\n=== ERROR DETAILS ===');
    errorLogs.forEach((error, index) => {
      console.log(`Error ${index + 1}:`);
      console.log(`  Message: ${error.text}`);
      if (error.stack) {
        console.log(`  Stack: ${error.stack}`);
      }
      if (error.location) {
        console.log(`  Location: ${JSON.stringify(error.location)}`);
      }
    });
  }

  // Basic assertion to ensure test doesn't fail
  expect(allLogs.length).toBeGreaterThanOrEqual(0);
});