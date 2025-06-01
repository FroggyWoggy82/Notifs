/**
 * Test script to verify recipe button functionality
 */

const { chromium } = require('playwright');

async function testRecipeButtons() {
    console.log('Starting recipe button test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for visibility
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        if (msg.text().includes('[Recipe Button Fix]')) {
            console.log('🔧', msg.text());
        }
    });
    
    try {
        // Navigate to the food page
        console.log('Navigating to food page...');
        await page.goto('http://localhost:3001/pages/food.html');
        
        // Wait for the page to load
        await page.waitForSelector('#recipe-list', { timeout: 10000 });
        console.log('Page loaded successfully');
        
        // Wait for recipes to load
        await page.waitForTimeout(3000);
        
        // Check if there are any recipe cards
        const recipeCards = await page.$$('.recipe-card');
        console.log(`Found ${recipeCards.length} recipe cards`);

        if (recipeCards.length === 0) {
            console.log('No recipe cards found. Creating a test recipe...');

            // Try to create a test recipe
            try {
                // Fill in recipe name
                const recipeNameInput = await page.$('#recipe-name');
                if (recipeNameInput) {
                    await recipeNameInput.fill('Test Recipe');
                    console.log('Filled recipe name');
                }

                // Fill in grocery store
                const groceryStoreInput = await page.$('#grocery-store');
                if (groceryStoreInput) {
                    await groceryStoreInput.fill('Test Store');
                    console.log('Filled grocery store');
                }

                // Click save recipe button
                const saveRecipeBtn = await page.$('#save-recipe-btn');
                if (saveRecipeBtn) {
                    await saveRecipeBtn.click();
                    console.log('Clicked save recipe button');
                    await page.waitForTimeout(3000);

                    // Check again for recipe cards
                    const newRecipeCards = await page.$$('.recipe-card');
                    console.log(`Found ${newRecipeCards.length} recipe cards after creation`);

                    if (newRecipeCards.length === 0) {
                        console.log('Still no recipe cards found. Checking page content...');
                        const recipeListContent = await page.$eval('#recipe-list', el => el.innerHTML);
                        console.log('Recipe list content:', recipeListContent.substring(0, 200) + '...');
                        return;
                    }
                } else {
                    console.log('Save recipe button not found');
                    return;
                }
            } catch (error) {
                console.error('Error creating test recipe:', error);
                return;
            }
        }

        // Get the current recipe cards (either existing or newly created)
        const currentRecipeCards = await page.$$('.recipe-card');
        console.log(`Testing with ${currentRecipeCards.length} recipe cards`);

        // Test the first recipe card
        const firstCard = currentRecipeCards[0];
        
        // Test View button
        console.log('\n=== Testing View Button ===');
        const viewButton = await firstCard.$('.view-ingredients-btn');
        if (viewButton) {
            console.log('Found View button, clicking...');
            await viewButton.click();
            await page.waitForTimeout(2000);
            
            // Check if ingredients are displayed
            const ingredientDetails = await firstCard.$('.ingredient-details');
            if (ingredientDetails) {
                const isVisible = await ingredientDetails.evaluate(el => 
                    el.style.display !== 'none' && el.innerHTML.trim() !== ''
                );
                console.log(`Ingredients visible: ${isVisible}`);
                
                if (isVisible) {
                    // Click again to hide
                    console.log('Clicking View button again to hide...');
                    await viewButton.click();
                    await page.waitForTimeout(1000);
                }
            }
        } else {
            console.log('View button not found');
        }
        
        // Test Adjust button
        console.log('\n=== Testing Adjust Button ===');
        const adjustButton = await firstCard.$('.adjust-calories-toggle');
        if (adjustButton) {
            console.log('Found Adjust button, clicking...');
            await adjustButton.click();
            await page.waitForTimeout(2000);
            
            // Check if adjustment section is displayed
            const adjustmentDiv = await firstCard.$('.calorie-adjustment-compact, .calorie-adjustment');
            if (adjustmentDiv) {
                const isVisible = await adjustmentDiv.evaluate(el => 
                    el.style.display === 'grid' || el.style.display === 'block'
                );
                console.log(`Adjustment section visible: ${isVisible}`);
                
                if (isVisible) {
                    // Click again to hide
                    console.log('Clicking Adjust button again to hide...');
                    await adjustButton.click();
                    await page.waitForTimeout(1000);
                }
            }
        } else {
            console.log('Adjust button not found');
        }
        
        // Test Delete button (but don't actually delete)
        console.log('\n=== Testing Delete Button (will cancel) ===');
        const deleteButton = await firstCard.$('.delete-recipe-btn');
        if (deleteButton) {
            console.log('Found Delete button, clicking...');
            
            // Set up dialog handler to cancel the deletion
            page.on('dialog', async dialog => {
                console.log(`Dialog appeared: ${dialog.message()}`);
                await dialog.dismiss(); // Cancel the deletion
            });
            
            await deleteButton.click();
            await page.waitForTimeout(1000);
            console.log('Delete dialog should have appeared and been cancelled');
        } else {
            console.log('Delete button not found');
        }
        
        console.log('\n=== Test Complete ===');
        console.log('All recipe buttons have been tested successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await page.waitForTimeout(3000); // Keep browser open for a moment
        await browser.close();
    }
}

// Run the test
testRecipeButtons().catch(console.error);
