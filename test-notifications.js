/**
 * Test script for notification functionality
 * 
 * This script tests the notification functionality by:
 * 1. Opening the settings page
 * 2. Checking if notifications are supported
 * 3. Requesting notification permission
 * 4. Subscribing to push notifications
 * 5. Sending a test notification
 */

const { chromium } = require('playwright');

async function testNotifications() {
  console.log('Starting notification test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--allow-insecure-localhost']
  });
  
  const context = await browser.newContext({
    permissions: ['notifications'],
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the settings page
    console.log('Navigating to settings page...');
    await page.goto('http://localhost:3000/pages/settings.html');
    
    // Wait for the page to load
    await page.waitForSelector('#notifyBtn', { state: 'visible' });
    
    // Check if notifications are supported
    const notSupported = await page.evaluate(() => {
      return !('Notification' in window) || !('PushManager' in window);
    });
    
    if (notSupported) {
      console.log('Notifications are not supported in this browser.');
      await browser.close();
      return;
    }
    
    console.log('Notifications are supported. Checking permission...');
    
    // Check current permission
    const permission = await page.evaluate(() => Notification.permission);
    console.log(`Current notification permission: ${permission}`);
    
    if (permission === 'granted') {
      console.log('Permission already granted. Sending test notification...');
      
      // Click the test notification button
      await page.click('#notifyBtn');
      
      // Wait for the status message
      await page.waitForSelector('.status.success', { state: 'visible' });
      
      // Get the status message
      const statusMessage = await page.textContent('.status.success');
      console.log(`Status message: ${statusMessage}`);
      
    } else if (permission === 'default') {
      console.log('Permission not set. Requesting permission...');
      
      // Click the enable notifications button
      await page.click('#notifyBtn');
      
      // Wait for the permission dialog and accept it
      console.log('Waiting for permission dialog...');
      
      // This will automatically be accepted due to the permissions setting in the context
      
      // Wait for the status message
      await page.waitForSelector('.status.success', { state: 'visible' });
      
      // Get the status message
      const statusMessage = await page.textContent('.status.success');
      console.log(`Status message: ${statusMessage}`);
      
    } else {
      console.log('Permission denied. Cannot proceed with test.');
    }
    
    // Wait a bit to see any notifications
    console.log('Waiting for notifications to appear...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Test completed.');
  }
}

testNotifications().catch(console.error);
