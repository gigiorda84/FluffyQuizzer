import { test, expect } from '@playwright/test';

test('Diagnose app functionality issues', async ({ page }) => {
  const consoleLogs: any[] = [];
  const networkErrors: any[] = [];

  // Capture console logs including errors
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(error.stack);
  });

  // Capture network failures
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`[NETWORK ERROR] ${response.status()} - ${response.url()}`);
    }
  });

  console.log('=== LOADING APP AND CHECKING FUNCTIONALITY ===');

  try {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('=== CHECKING WHAT\'S VISIBLE ON PAGE ===');

    // Check if React app loaded
    const root = page.locator('#root');
    const rootVisible = await root.isVisible();
    console.log(`Root element visible: ${rootVisible}`);

    if (rootVisible) {
      const rootContent = await root.innerHTML();
      console.log(`Root element has content: ${rootContent.length > 0}`);

      if (rootContent.length < 100) {
        console.log(`Root content: ${rootContent}`);
      }
    }

    // Check for common app elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const headings = await page.locator('h1, h2, h3').count();

    console.log(`Found ${buttons} buttons, ${links} links, ${headings} headings`);

    // Check if there are any visible text elements
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      console.log(`Page has text content: ${bodyText.length} characters`);
      if (bodyText.length < 200) {
        console.log(`Body text: "${bodyText}"`);
      }
    } else {
      console.log('No text content found on page');
    }

    // Try to interact with the app
    console.log('=== ATTEMPTING INTERACTIONS ===');

    const clickableElements = await page.locator('button, [role="button"], a').all();
    console.log(`Found ${clickableElements.length} clickable elements`);

    if (clickableElements.length > 0) {
      for (let i = 0; i < Math.min(clickableElements.length, 2); i++) {
        try {
          const element = clickableElements[i];
          const text = await element.textContent();
          console.log(`Attempting to click: "${text}"`);
          await element.click({ timeout: 5000 });
          await page.waitForTimeout(1000);
          console.log(`Successfully clicked: "${text}"`);
        } catch (error) {
          console.log(`Failed to click element: ${error.message}`);
        }
      }
    }

    // Check for API calls
    console.log('=== CHECKING FOR API ACTIVITY ===');
    await page.waitForTimeout(2000);

    // Look for any fetch or XHR requests
    const hasApiCalls = consoleLogs.some(log =>
      log.text.includes('fetch') ||
      log.text.includes('xhr') ||
      log.text.includes('api') ||
      log.text.includes('error')
    );

    console.log(`API-related console activity: ${hasApiCalls}`);

  } catch (error) {
    console.log(`Error during app testing: ${error.message}`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Console messages: ${consoleLogs.length}`);
  console.log(`Network errors: ${networkErrors.length}`);

  const errors = consoleLogs.filter(log => log.type === 'error');
  const warnings = consoleLogs.filter(log => log.type === 'warning');

  console.log(`JavaScript errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n=== JAVASCRIPT ERRORS ===');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.text}`);
    });
  }

  if (networkErrors.length > 0) {
    console.log('\n=== NETWORK ERRORS ===');
    networkErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.status} - ${error.url}`);
    });
  }
});