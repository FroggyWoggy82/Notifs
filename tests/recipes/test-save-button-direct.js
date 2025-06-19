/**
 * Direct test of the Save Recipe button to see what's actually happening
 */

const puppeteer = require('puppeteer');

async function testSaveButton() {
    console.log('🔍 Testing Save Recipe Button...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Log all console messages
        page.on('console', msg => {
            console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
        });
        
        // Log errors
        page.on('pageerror', error => {
            console.error(`[PAGE ERROR] ${error.message}`);
        });
        
        console.log('📄 Loading page...');
        await page.goto('http://localhost:3002/pages/food.html', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        console.log('🔍 Checking form elements...');
        
        // Check if form exists
        const formExists = await page.$('#create-recipe-form');
        console.log(`Form exists: ${!!formExists}`);
        
        // Check if Save Recipe button exists
        const buttonExists = await page.$('button[type="submit"]');
        console.log(`Save Recipe button exists: ${!!buttonExists}`);
        
        // Check button text
        const buttonText = await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            return btn ? btn.textContent : 'Button not found';
        });
        console.log(`Button text: "${buttonText}"`);
        
        // Fill the form with test data
        console.log('📝 Filling form...');
        
        // Recipe name
        await page.type('#recipeName', 'Test Recipe');
        
        // Check if ingredients exist
        const ingredientItems = await page.$$('.ingredient-item');
        console.log(`Found ${ingredientItems.length} ingredient items`);
        
        if (ingredientItems.length > 0) {
            const item = ingredientItems[0];
            
            // Fill basic fields
            await item.$eval('.ingredient-name', el => el.value = 'Test Ingredient');
            await item.$eval('.ingredient-amount', el => el.value = '100');
            await item.$eval('.ingredient-price', el => el.value = '2.99');
            
            // Fill hidden nutrition fields directly
            await item.$eval('.ingredient-calories', el => el.value = '150');
            await item.$eval('.ingredient-protein', el => el.value = '5');
            await item.$eval('.ingredient-fat', el => el.value = '2');
            await item.$eval('.ingredient-carbs', el => el.value = '30');
            
            console.log('✅ Form filled');
        }
        
        // Check if event listeners are attached
        const hasListeners = await page.evaluate(() => {
            const form = document.getElementById('create-recipe-form');
            const button = document.querySelector('button[type="submit"]');
            
            // Try to get event listeners (Chrome DevTools specific)
            if (window.getEventListeners) {
                const formListeners = getEventListeners(form);
                const buttonListeners = getEventListeners(button);
                return {
                    formSubmit: formListeners.submit ? formListeners.submit.length : 0,
                    buttonClick: buttonListeners.click ? buttonListeners.click.length : 0
                };
            }
            return { formSubmit: 'unknown', buttonClick: 'unknown' };
        });
        console.log('Event listeners:', hasListeners);
        
        // Try clicking the button
        console.log('🖱️ Clicking Save Recipe button...');
        
        await page.click('button[type="submit"]');
        
        // Wait and check for any response
        await page.waitForTimeout(5000);
        
        // Check for status messages
        const statusMessage = await page.evaluate(() => {
            const status = document.getElementById('create-recipe-status');
            return status ? status.textContent : 'No status element';
        });
        console.log(`Status: ${statusMessage}`);
        
        // Check network requests
        const requests = await page.evaluate(() => {
            return window.performance.getEntriesByType('resource')
                .filter(entry => entry.name.includes('/api/recipes'))
                .map(entry => ({ url: entry.name, method: 'unknown' }));
        });
        console.log('API requests:', requests);
        
        console.log('✅ Test complete - check browser for manual inspection');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSaveButton().catch(console.error);
