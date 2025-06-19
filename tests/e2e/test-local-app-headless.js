const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing local app with Playwright (headless)...');
  
  const browser = await chromium.launch({ 
    headless: true  // Run in headless mode
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log(`[BROWSER ERROR] ${error.message}`);
  });
  
  try {
    console.log('📄 Checking if local server is running...');
    
    // Try different common ports
    const ports = [3000, 3001, 3002, 8000, 8080];
    let serverFound = false;
    let workingPort = null;
    
    for (const port of ports) {
      try {
        console.log(`🔍 Trying port ${port}...`);
        await page.goto(`http://localhost:${port}`, { timeout: 5000 });
        console.log(`✅ Server found on port ${port}!`);
        serverFound = true;
        workingPort = port;
        break;
      } catch (error) {
        console.log(`❌ No server on port ${port}`);
      }
    }
    
    if (serverFound) {
      console.log(`🌐 Testing food page on port ${workingPort}...`);
      await page.goto(`http://localhost:${workingPort}/pages/food.html`);
      
      console.log('⏳ Waiting for page to load...');
      await page.waitForTimeout(3000);
      
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      
      // Check if recipe list exists
      const recipeList = await page.locator('#recipe-list').count();
      console.log(`📋 Recipe list found: ${recipeList > 0 ? 'Yes' : 'No'}`);
      
      // Check if create recipe form exists
      const createForm = await page.locator('#create-recipe-form').count();
      console.log(`📝 Create recipe form found: ${createForm > 0 ? 'Yes' : 'No'}`);
      
      console.log('✅ Local app test completed successfully!');
    } else {
      console.log('❌ No local server found. Please start your server first.');
      console.log('💡 Try running: npm start or node server.js');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  await browser.close();
  console.log('🏁 Test completed!');
})();
