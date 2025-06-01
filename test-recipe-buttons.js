const { chromium } = require('playwright');

async function testRecipeButtons() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to food page...');
        await page.goto('http://localhost:3001/pages/food.html');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        console.log('Taking screenshot...');
        await page.screenshot({ path: 'food-page.png' });
        
        // Check console logs
        console.log('Checking console logs...');
        page.on('console', msg => {
            console.log(`BROWSER: ${msg.text()}`);
        });
        
        // Look for recipe cards
        console.log('Looking for recipe cards...');
        const recipeCards = await page.locator('.recipe-card').count();
        console.log(`Found ${recipeCards} recipe cards`);
        
        if (recipeCards > 0) {
            // Try to click the first View button
            console.log('Trying to click first View button...');
            const firstViewButton = page.locator('.recipe-card .view-ingredients-btn').first();
            
            if (await firstViewButton.count() > 0) {
                console.log('View button found, clicking...');
                await firstViewButton.click();
                await page.waitForTimeout(1000);
                console.log('View button clicked');
            } else {
                console.log('No View button found');
            }
            
            // Check for any recipe buttons
            const allButtons = await page.locator('.recipe-card button').count();
            console.log(`Found ${allButtons} buttons in recipe cards`);
            
            // Get button text
            const buttonTexts = await page.locator('.recipe-card button').allTextContents();
            console.log('Button texts:', buttonTexts);
        }
        
        // Wait a bit more to see any effects
        await page.waitForTimeout(2000);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testRecipeButtons();
