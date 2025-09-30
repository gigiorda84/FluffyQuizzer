import { test, expect } from '@playwright/test';

test.describe('Console Logs and Network Requests Analysis', () => {
  test('should capture console logs and network requests', async ({ page }) => {
    const consoleLogs: any[] = [];
    const networkRequests: any[] = [];
    const networkResponses: any[] = [];

    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // Capture network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    });

    // Capture network responses
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      });
    });

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to fully load
    await page.waitForLoadState('networkidle');

    // Wait a bit more to capture any delayed requests
    await page.waitForTimeout(2000);

    // Log all captured information
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.text}`);
    });

    console.log('\n=== NETWORK REQUESTS ===');
    networkRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url} (${req.resourceType})`);
    });

    console.log('\n=== NETWORK RESPONSES ===');
    networkResponses.forEach((res, index) => {
      console.log(`${index + 1}. ${res.status} ${res.statusText} - ${res.url}`);
    });

    // Check for any errors in console
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    const warningLogs = consoleLogs.filter(log => log.type === 'warning');

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`Warnings: ${warningLogs.length}`);
    console.log(`Network requests: ${networkRequests.length}`);
    console.log(`Network responses: ${networkResponses.length}`);

    // Check for failed network requests
    const failedResponses = networkResponses.filter(res => res.status >= 400);
    if (failedResponses.length > 0) {
      console.log('\n=== FAILED REQUESTS ===');
      failedResponses.forEach(res => {
        console.log(`${res.status} ${res.statusText} - ${res.url}`);
      });
    }

    // Basic assertions
    expect(networkResponses.some(res => res.url.includes('localhost:8080'))).toBeTruthy();
  });

  test('should check API endpoints', async ({ page }) => {
    const apiRequests: any[] = [];

    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('/ws')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== API REQUESTS ===');
    if (apiRequests.length > 0) {
      apiRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.method} ${req.url}`);
      });
    } else {
      console.log('No API requests detected');
    }

    // Try to interact with the app to trigger more requests
    try {
      // Look for clickable elements and try to interact
      const buttons = await page.locator('button, [role="button"], a').all();
      if (buttons.length > 0) {
        console.log(`\nFound ${buttons.length} interactive elements`);
        // Click the first visible button if any
        for (const button of buttons.slice(0, 3)) {
          if (await button.isVisible()) {
            await button.click();
            await page.waitForTimeout(1000);
            break;
          }
        }
      }
    } catch (error) {
      console.log('Could not interact with elements:', error);
    }

    // Check for WebSocket connections
    const wsRequests = apiRequests.filter(req => req.url.includes('/ws') || req.url.startsWith('ws://') || req.url.startsWith('wss://'));
    if (wsRequests.length > 0) {
      console.log('\n=== WEBSOCKET CONNECTIONS ===');
      wsRequests.forEach(req => console.log(req.url));
    }
  });
});