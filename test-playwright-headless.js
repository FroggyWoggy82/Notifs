const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing Playwright in headless mode...');
  
  const browser = await chromium.launch({ 
    headless: true  // Run in headless mode for server environments
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📄 Navigating to a test page...');
    await page.goto('https://example.com');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    console.log('✅ Playwright is working correctly in headless mode!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  await browser.close();
  console.log('🏁 Test completed!');
})();
