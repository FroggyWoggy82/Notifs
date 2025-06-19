const { chromium } = require('playwright');

async function debugSaveRecipe() {
    console.log('Starting Save Recipe debug test...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for network requests
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log(`[Network Request] ${request.method()} ${request.url()}`);
        }
    });
    
    // Listen for network responses
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            console.log(`[Network Response] ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        // Navigate to the food page
        console.log('Navigating to food page...');
        await page.goto('http://localhost:3000/food');
        await page.waitForLoadState('domcontentloaded');

        // Check what page we're actually on
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);

        const pageTitle = await page.title();
        console.log(`Page title: ${pageTitle}`);

        // Check if we're on the right page by looking for food-specific elements
        const foodPageElements = await page.locator('h1, h2, h3').allTextContents();
        console.log('Page headings:', foodPageElements);

        // Wait for the form to be visible
        console.log('Waiting for recipe form...');
        await page.waitForSelector('#create-recipe-form', { timeout: 10000 });
        
        // Fill out the recipe form
        console.log('Filling recipe name...');
        await page.fill('#recipeName', 'Debug Test Recipe');
        
        // The ingredient form should already be visible, let's fill it directly
        console.log('Filling ingredient details...');
        await page.fill('.ingredient-name', 'Debug Ingredient');
        await page.fill('.ingredient-amount', '100');
        await page.fill('.ingredient-price', '2.50');
        await page.fill('.grocery-store-input', 'Debug Store');
        
        // Show detailed nutrition and fill values
        console.log('Showing detailed nutrition...');
        await page.click('button:has-text("Show Detailed Nutrition")');

        // Wait for nutrition panel to appear and check what fields are available
        await page.waitForSelector('.nutrition-panel[style*="display: block"]', { timeout: 5000 });

        // Check what nutrition fields are actually available
        const nutritionFields = await page.locator('.nutrition-panel input[type="number"]').count();
        console.log(`Found ${nutritionFields} nutrition input fields`);

        // Try to find the energy field with different selectors
        const energyField = await page.locator('#energy').count();
        const energyFieldAlt = await page.locator('.nutrition-energy').count();
        console.log(`Energy field by ID: ${energyField}, by class: ${energyFieldAlt}`);

        // Fill nutrition values using the hidden fields that are required
        console.log('Setting hidden nutrition field values...');
        await page.evaluate(() => {
            const caloriesField = document.querySelector('.ingredient-calories');
            const proteinField = document.querySelector('.ingredient-protein');
            const carbsField = document.querySelector('.ingredient-carbs');
            const fatField = document.querySelector('.ingredient-fat');

            if (caloriesField) caloriesField.value = '200';
            if (proteinField) proteinField.value = '10';
            if (carbsField) carbsField.value = '30';
            if (fatField) fatField.value = '5';

            console.log('Hidden field values set:', {
                calories: caloriesField?.value,
                protein: proteinField?.value,
                carbs: carbsField?.value,
                fat: fatField?.value
            });
        });
        
        // Take a screenshot before clicking save
        await page.screenshot({ path: 'before-save.png' });
        
        // Check if Save Recipe button exists and its properties
        const saveButton = page.locator('#create-recipe-form button[type="submit"]');
        const saveButtonCount = await saveButton.count();
        console.log(`Save Recipe buttons found: ${saveButtonCount}`);

        if (saveButtonCount === 0) {
            // Try to find any button in the form
            const anyButton = page.locator('#create-recipe-form button');
            const anyButtonCount = await anyButton.count();
            console.log(`Any buttons in form: ${anyButtonCount}`);

            if (anyButtonCount > 0) {
                const buttonText = await anyButton.first().textContent();
                const buttonType = await anyButton.first().getAttribute('type');
                console.log(`First button text: "${buttonText}", type: "${buttonType}"`);
            }

            await browser.close();
            return;
        }

        const isDisabled = await saveButton.getAttribute('disabled');
        console.log(`Save Recipe button disabled: ${isDisabled !== null}`);
        
        if (isDisabled !== null) {
            console.log('Save Recipe button is disabled! Investigating why...');
            
            // Check form validation
            const formData = await page.evaluate(() => {
                const form = document.querySelector('#create-recipe-form');
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                return data;
            });
            console.log('Form data:', formData);
            
            // Check for any validation errors
            const validationErrors = await page.locator('.error, .invalid, [aria-invalid="true"]').count();
            console.log(`Validation errors found: ${validationErrors}`);
            
            await browser.close();
            return;
        }
        
        // Set up network monitoring to catch the save request
        const saveRequests = [];
        page.on('request', request => {
            if (request.method() === 'POST' && request.url().includes('/api/recipes')) {
                saveRequests.push({
                    url: request.url(),
                    method: request.method(),
                    postData: request.postData()
                });
                console.log(`POST request to: ${request.url()}`);
                console.log(`POST data: ${request.postData()}`);
            }
        });

        page.on('response', response => {
            if (response.request().method() === 'POST' && response.url().includes('/api/recipes')) {
                console.log(`POST response status: ${response.status()}`);
                console.log(`POST response URL: ${response.url()}`);
            }
        });

        // Add a test event listener to see if form submit is triggered
        await page.evaluate(() => {
            const form = document.getElementById('create-recipe-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    console.log('TEST: Form submit event triggered!');
                });
            }
        });

        // Click Save Recipe button
        console.log('Clicking Save Recipe button...');
        await saveButton.click();

        // Also try triggering form submission directly
        console.log('Also trying to trigger form submission directly...');
        await page.evaluate(() => {
            const form = document.getElementById('create-recipe-form');
            if (form) {
                console.log('TEST: Manually triggering form submit event');
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
        });

        // Wait for response or error
        console.log('Waiting for save response...');
        await page.waitForTimeout(5000);

        console.log(`Total POST requests captured: ${saveRequests.length}`);

        // Check if form was cleared (indicating success) - use correct selector
        const recipeNameAfterSave = await page.inputValue('#recipeName');
        console.log(`Recipe name after save: "${recipeNameAfterSave}"`);

        // Check if recipe appears in "Your Recipes" section
        const recipesList = await page.locator('#your-recipes .recipe-item').count();
        console.log(`Recipes in "Your Recipes" section: ${recipesList}`);

        // Take a screenshot after save attempt
        await page.screenshot({ path: 'after-save.png' });

        // Check for any error messages
        const errorMessages = await page.locator('.error-message, .alert-danger, .toast-error').count();
        console.log(`Error messages found: ${errorMessages}`);

        if (errorMessages > 0) {
            const errorText = await page.locator('.error-message, .alert-danger, .toast-error').first().textContent();
            console.log(`Error message: ${errorText}`);
        }
        
        console.log('Debug test completed');
        
    } catch (error) {
        console.error('Error during debug test:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
    } finally {
        await browser.close();
    }
}

debugSaveRecipe().catch(console.error);
