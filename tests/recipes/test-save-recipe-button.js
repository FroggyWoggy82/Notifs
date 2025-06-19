const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Save Recipe Button Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for debugging
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
    console.log('📄 Navigating to food page...');
    await page.goto('http://localhost:3000/pages/food.html');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(5000); // Wait for all scripts to load
    
    console.log('🔍 Looking for Save Recipe button...');
    // Look specifically for the recipe form submit button, not the meal form button
    const saveButton = await page.locator('#create-recipe-form button[type="submit"]');
    
    if (await saveButton.isVisible()) {
      console.log('✅ Save Recipe button found!');
      
      // Fill in some test data first
      console.log('📝 Filling in test recipe data...');
      
      // Recipe name
      await page.fill('#recipeName', 'Test Recipe');
      
      // Add an ingredient
      const addIngredientBtn = page.locator('text=Add Ingredient').first();
      if (await addIngredientBtn.isVisible()) {
        await addIngredientBtn.click();
        await page.waitForTimeout(1000);
      }
      
      // Fill ingredient data
      const ingredientName = page.locator('.ingredient-name').first();
      if (await ingredientName.isVisible()) {
        await ingredientName.fill('Test Ingredient');
      }
      
      const ingredientAmount = page.locator('.ingredient-amount').first();
      if (await ingredientAmount.isVisible()) {
        await ingredientAmount.fill('100');
      }
      
      const ingredientPrice = page.locator('.ingredient-price').first();
      if (await ingredientPrice.isVisible()) {
        await ingredientPrice.fill('2.50');
      }
      
      // Add some nutrition data manually
      const caloriesInput = page.locator('input.ingredient-calories[type="hidden"]').first();
      if (await caloriesInput.count() > 0) {
        await page.evaluate(() => {
          const input = document.querySelector('input.ingredient-calories[type="hidden"]');
          if (input) input.value = '100';
        });
      }
      
      const proteinInput = page.locator('input.ingredient-protein[type="hidden"]').first();
      if (await proteinInput.count() > 0) {
        await page.evaluate(() => {
          const input = document.querySelector('input.ingredient-protein[type="hidden"]');
          if (input) input.value = '5';
        });
      }
      
      const fatInput = page.locator('input.ingredient-fat[type="hidden"]').first();
      if (await fatInput.count() > 0) {
        await page.evaluate(() => {
          const input = document.querySelector('input.ingredient-fat[type="hidden"]');
          if (input) input.value = '2';
        });
      }
      
      const carbsInput = page.locator('input.ingredient-carbs[type="hidden"]').first();
      if (await carbsInput.count() > 0) {
        await page.evaluate(() => {
          const input = document.querySelector('input.ingredient-carbs[type="hidden"]');
          if (input) input.value = '10';
        });
      }
      
      console.log('🖱️ Clicking Save Recipe button...');
      await saveButton.click();
      
      console.log('⏳ Waiting for response...');
      await page.waitForTimeout(3000);
      
      // Check for success message
      const statusElement = page.locator('#create-recipe-status');
      if (await statusElement.isVisible()) {
        const statusText = await statusElement.textContent();
        console.log(`📊 Status: ${statusText}`);
      }
      
    } else {
      console.log('❌ Save Recipe button not found!');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
  
  console.log('⏳ Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('✅ Test completed!');
})();
