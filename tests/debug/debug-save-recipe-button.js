/**
 * Debug script to test Save Recipe button functionality
 * This script will help identify why the Save Recipe button isn't working
 */

const puppeteer = require('puppeteer');

async function debugSaveRecipeButton() {
    console.log('🔍 Starting Save Recipe Button Debug...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, 
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
        });
        
        // Enable error logging
        page.on('pageerror', error => {
            console.error(`[PAGE ERROR] ${error.message}`);
        });
        
        // Navigate to the food page
        console.log('📄 Navigating to food page...');
        await page.goto('http://localhost:3002/pages/food.html', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for the page to load
        await page.waitForTimeout(2000);
        
        // Check if the form exists
        console.log('🔍 Checking form structure...');
        const formExists = await page.$('#create-recipe-form');
        console.log(`Form exists: ${!!formExists}`);
        
        // Check if the Save Recipe button exists
        const saveButtonExists = await page.$('button[type="submit"]');
        console.log(`Save Recipe button exists: ${!!saveButtonExists}`);
        
        // Check if the simple-save-recipe-handler.js script loaded
        const scriptLoaded = await page.evaluate(() => {
            return window.location.href.includes('food.html');
        });
        console.log(`Page loaded correctly: ${scriptLoaded}`);
        
        // Check for JavaScript errors
        const jsErrors = await page.evaluate(() => {
            return window.jsErrors || [];
        });
        console.log(`JavaScript errors: ${jsErrors.length}`);
        
        // Fill out the form with test data
        console.log('📝 Filling out form with test data...');
        
        // Fill recipe name
        await page.type('#recipeName', 'Test Recipe Debug');
        console.log('✅ Recipe name filled');
        
        // Check if ingredients section exists
        const ingredientsSection = await page.$('#ingredients-list');
        console.log(`Ingredients section exists: ${!!ingredientsSection}`);
        
        // Look for ingredient items
        const ingredientItems = await page.$$('.ingredient-item');
        console.log(`Found ${ingredientItems.length} ingredient items`);
        
        if (ingredientItems.length > 0) {
            // Fill first ingredient
            const firstItem = ingredientItems[0];
            
            // Fill ingredient name
            const nameInput = await firstItem.$('.ingredient-name');
            if (nameInput) {
                await nameInput.type('Test Ingredient');
                console.log('✅ Ingredient name filled');
            }
            
            // Fill amount
            const amountInput = await firstItem.$('.ingredient-amount');
            if (amountInput) {
                await amountInput.type('100');
                console.log('✅ Amount filled');
            }
            
            // Fill price
            const priceInput = await firstItem.$('.ingredient-price');
            if (priceInput) {
                await priceInput.type('2.99');
                console.log('✅ Price filled');
            }
            
            // Fill nutrition values
            const caloriesInput = await firstItem.$('.ingredient-calories');
            if (caloriesInput) {
                await caloriesInput.type('150');
                console.log('✅ Calories filled');
            }
            
            const proteinInput = await firstItem.$('.ingredient-protein');
            if (proteinInput) {
                await proteinInput.type('5');
                console.log('✅ Protein filled');
            }
            
            const fatInput = await firstItem.$('.ingredient-fat');
            if (fatInput) {
                await fatInput.type('2');
                console.log('✅ Fat filled');
            }
            
            const carbsInput = await firstItem.$('.ingredient-carbs');
            if (carbsInput) {
                await carbsInput.type('30');
                console.log('✅ Carbs filled');
            }
        }
        
        // Wait a moment for any dynamic updates
        await page.waitForTimeout(1000);
        
        // Check if the Save Recipe button is enabled
        const buttonEnabled = await page.evaluate(() => {
            const button = document.querySelector('button[type="submit"]');
            return button && !button.disabled;
        });
        console.log(`Save Recipe button enabled: ${buttonEnabled}`);
        
        // Check if event listeners are attached
        const eventListenersAttached = await page.evaluate(() => {
            const form = document.getElementById('create-recipe-form');
            if (!form) return false;
            
            // Check if form has event listeners
            const listeners = getEventListeners ? getEventListeners(form) : null;
            return listeners && listeners.submit && listeners.submit.length > 0;
        });
        console.log(`Event listeners attached: ${eventListenersAttached}`);
        
        // Try to click the Save Recipe button
        console.log('🖱️ Attempting to click Save Recipe button...');
        
        try {
            await page.click('button[type="submit"]');
            console.log('✅ Save Recipe button clicked');
            
            // Wait for any response
            await page.waitForTimeout(3000);
            
            // Check for success/error messages
            const statusMessage = await page.evaluate(() => {
                const statusElement = document.getElementById('create-recipe-status');
                return statusElement ? statusElement.textContent : 'No status element found';
            });
            console.log(`Status message: ${statusMessage}`);
            
        } catch (error) {
            console.error(`❌ Error clicking Save Recipe button: ${error.message}`);
        }
        
        // Check network requests
        console.log('🌐 Checking network activity...');
        
        // Keep the browser open for manual inspection
        console.log('🔍 Browser will remain open for manual inspection...');
        console.log('Press Ctrl+C to close when done debugging');
        
        // Wait indefinitely
        await new Promise(() => {});
        
    } catch (error) {
        console.error(`❌ Debug failed: ${error.message}`);
        console.error(error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the debug
debugSaveRecipeButton().catch(console.error);
