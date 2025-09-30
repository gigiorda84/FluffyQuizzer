import { test } from '@playwright/test';

test('Simple Console Log Capture', async ({ page }) => {
  const allLogs: string[] = [];

  // Capture all console messages
  page.on('console', msg => {
    const logMessage = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    allLogs.push(logMessage);
    console.log(logMessage);
  });

  // Capture page errors
  page.on('pageerror', error => {
    const errorMessage = `[PAGE ERROR] ${error.message}`;
    allLogs.push(errorMessage);
    console.log(errorMessage);
    if (error.stack) {
      console.log(`Stack trace: ${error.stack}`);
    }
  });

  console.log('=== STARTING CONSOLE LOG CAPTURE ===');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait a moment for any delayed logs
  await page.waitForTimeout(3000);

  console.log('\n=== CONSOLE LOG SUMMARY ===');
  console.log(`Total messages: ${allLogs.length}`);

  if (allLogs.length > 0) {
    console.log('\n=== ALL CAPTURED LOGS ===');
    allLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
  } else {
    console.log('No console logs captured');
  }

  // Check for any React errors or warnings specifically
  const reactLogs = allLogs.filter(log =>
    log.toLowerCase().includes('react') ||
    log.toLowerCase().includes('warning') ||
    log.toLowerCase().includes('error')
  );

  if (reactLogs.length > 0) {
    console.log('\n=== REACT/WARNING/ERROR LOGS ===');
    reactLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
  }
});