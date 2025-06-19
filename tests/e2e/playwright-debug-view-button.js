/**
 * Comprehensive Playwright test to debug the View button issue
 */

const { chromium } = require('playwright');

async function debugViewButton() {
    console.log('🔍 Starting comprehensive View button debug...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const page = await browser.newPage();
    
    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        console.log('🖥️ Console:', text);
    });
    
    // Capture network requests
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            console.log('📡 Request:', request.method(), request.url());
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            console.log('📡 Response:', response.status(), response.url());
        }
    });
    
    try {
        console.log('🌐 Navigating to food page...');
        await page.goto('http://localhost:3001/pages/food.html');
        
        // Wait for page to load
        await page.waitForSelector('#recipe-list', { timeout: 10000 });
        console.log('✅ Page loaded');
        
        // Wait for recipes to load
        await page.waitForTimeout(3000);
        
        // Check recipe cards
        const recipeCards = await page.$$('.recipe-card');
        console.log(`📋 Found ${recipeCards.length} recipe cards`);
        
        if (recipeCards.length === 0) {
            console.log('❌ No recipe cards found');
            return;
        }
        
        // Get the first recipe card
        const firstCard = recipeCards[0];
        
        // Get recipe info
        const recipeName = await firstCard.$eval('.recipe-card-title', el => el.textContent.trim());
        const recipeId = await firstCard.getAttribute('data-id');
        console.log(`🍽️ Testing recipe: "${recipeName}" (ID: ${recipeId})`);
        
        // Check if View button exists
        const viewButton = await firstCard.$('.view-ingredients-btn');
        if (!viewButton) {
            console.log('❌ View button not found');
            return;
        }
        
        console.log('✅ View button found');
        
        // Check initial button text
        const initialButtonText = await viewButton.textContent();
        console.log(`🔘 Initial button text: "${initialButtonText}"`);
        
        // Check if ingredient details div exists
        const ingredientDetails = await firstCard.$('.ingredient-details');
        if (!ingredientDetails) {
            console.log('❌ Ingredient details div not found');
            return;
        }
        
        console.log('✅ Ingredient details div found');
        
        // Check initial state of ingredient details
        const initialDisplay = await ingredientDetails.evaluate(el => el.style.display);
        const initialContent = await ingredientDetails.evaluate(el => el.innerHTML.trim());
        console.log(`📄 Initial details display: "${initialDisplay}"`);
        console.log(`📄 Initial details content length: ${initialContent.length}`);
        
        // Test API endpoint directly first
        console.log(`🧪 Testing API endpoint directly: /api/recipes/${recipeId}`);
        const apiResponse = await page.evaluate(async (recipeId) => {
            try {
                const response = await fetch(`/api/recipes/${recipeId}`);
                const data = await response.json();
                return {
                    status: response.status,
                    ok: response.ok,
                    hasIngredients: !!data.ingredients,
                    ingredientsLength: data.ingredients ? data.ingredients.length : 0,
                    firstIngredientName: data.ingredients && data.ingredients[0] ? data.ingredients[0].name : null
                };
            } catch (error) {
                return { error: error.message };
            }
        }, recipeId);
        
        console.log('🧪 API Test Result:', apiResponse);
        
        // Now click the View button
        console.log('🖱️ Clicking View button...');
        await viewButton.click();
        
        // Wait for any changes
        await page.waitForTimeout(3000);
        
        // Check what happened after clicking
        const afterClickButtonText = await viewButton.textContent();
        const afterClickDisplay = await ingredientDetails.evaluate(el => el.style.display);
        const afterClickContent = await ingredientDetails.evaluate(el => el.innerHTML.trim());
        
        console.log(`🔘 Button text after click: "${afterClickButtonText}"`);
        console.log(`📄 Details display after click: "${afterClickDisplay}"`);
        console.log(`📄 Details content length after click: ${afterClickContent.length}`);
        
        if (afterClickContent.length > 0) {
            console.log(`📄 Details content preview: ${afterClickContent.substring(0, 200)}...`);
            
            // Check if it shows "No ingredients found"
            if (afterClickContent.includes('No ingredients found')) {
                console.log('❌ Showing "No ingredients found" message');
                
                // Let's check what the fetchIngredientsDirectly function is actually receiving
                const debugInfo = await page.evaluate(async (recipeId) => {
                    try {
                        const response = await fetch(`/api/recipes/${recipeId}`);
                        const recipeData = await response.json();
                        return {
                            responseOk: response.ok,
                            responseStatus: response.status,
                            recipeDataKeys: Object.keys(recipeData),
                            hasIngredientsProperty: 'ingredients' in recipeData,
                            ingredientsType: typeof recipeData.ingredients,
                            ingredientsIsArray: Array.isArray(recipeData.ingredients),
                            ingredientsLength: recipeData.ingredients ? recipeData.ingredients.length : 'null/undefined',
                            fullRecipeData: recipeData
                        };
                    } catch (error) {
                        return { error: error.message };
                    }
                }, recipeId);
                
                console.log('🔍 Debug Info:', JSON.stringify(debugInfo, null, 2));
            } else {
                console.log('✅ Ingredients are being displayed');
            }
        } else {
            console.log('❌ No content in details div after click');
        }
        
        // Check for any JavaScript errors
        const jsErrors = consoleMessages.filter(msg => 
            msg.includes('error') || msg.includes('Error') || msg.includes('undefined')
        );
        
        if (jsErrors.length > 0) {
            console.log('⚠️ JavaScript errors detected:');
            jsErrors.forEach(error => console.log('  ❌', error));
        }
        
        // Test clicking again to hide
        console.log('🖱️ Clicking View button again to test hide...');
        await viewButton.click();
        await page.waitForTimeout(1000);
        
        const finalButtonText = await viewButton.textContent();
        const finalDisplay = await ingredientDetails.evaluate(el => el.style.display);
        const finalContent = await ingredientDetails.evaluate(el => el.innerHTML.trim());
        
        console.log(`🔘 Final button text: "${finalButtonText}"`);
        console.log(`📄 Final details display: "${finalDisplay}"`);
        console.log(`📄 Final details content length: ${finalContent.length}`);
        
        console.log('\n📊 Summary:');
        console.log(`- Recipe: ${recipeName} (ID: ${recipeId})`);
        console.log(`- API Response: ${apiResponse.ok ? 'OK' : 'Failed'}`);
        console.log(`- Ingredients in API: ${apiResponse.ingredientsLength || 'Unknown'}`);
        console.log(`- Button functionality: ${afterClickButtonText !== initialButtonText ? 'Working' : 'Not working'}`);
        console.log(`- Content displayed: ${afterClickContent.length > 0 ? 'Yes' : 'No'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await page.waitForTimeout(5000); // Keep browser open for inspection
        await browser.close();
    }
}

// Run the debug
debugViewButton().catch(console.error);
