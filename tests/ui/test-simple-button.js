const { chromium } = require('playwright');

(async () => {
    console.log('Testing Save Recipe button click...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    // Listen to console messages
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    
    try {
        console.log('Navigating to food page...');
        await page.goto('http://localhost:3000/pages/food.html');
        
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        console.log('Page loaded');
        
        // Wait a bit for scripts to initialize
        await page.waitForTimeout(3000);
        console.log('Scripts initialized');
        
        // Wait for the form to be ready
        await page.waitForSelector('#create-recipe-form', { timeout: 5000 });
        console.log('Form found');
        
        // Wait for the Save Recipe button
        await page.waitForSelector('#create-recipe-form button[type="submit"]', { timeout: 5000 });
        console.log('Save Recipe button found');
        
        // Fill out the form with minimal test data
        console.log('Filling out form...');
        
        // Fill recipe name
        await page.fill('#recipe-name', 'Test Recipe');
        
        // Fill ingredient data
        await page.fill('.ingredient-name', 'Test Ingredient');
        await page.fill('.ingredient-amount', '100');
        await page.fill('.ingredient-price', '5.00');
        
        // Fill nutrition data (required fields)
        await page.fill('.nutrition-energy', '200');
        await page.fill('.nutrition-protein-total', '10');
        await page.fill('.nutrition-fat-total', '5');
        await page.fill('.nutrition-carbs-total', '30');
        
        console.log('Form filled out');
        
        // Get the Save Recipe button
        const saveButton = await page.$('#create-recipe-form button[type="submit"]');
        
        if (!saveButton) {
            throw new Error('Save Recipe button not found');
        }
        
        console.log('Save Recipe button located');
        
        // Click Save Recipe button
        console.log('Clicking Save Recipe button...');
        await saveButton.click();
        
        // Wait to see what happens
        await page.waitForTimeout(3000);
        
        console.log('Test completed - check console logs above for form submission');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
})();
