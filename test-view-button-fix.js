/**
 * Test the View button fix specifically
 */

const { chromium } = require('playwright');

async function testViewButton() {
    console.log('Testing View button fix...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[Recipe Button Fix]')) {
            console.log('🔧', text);
        }
    });
    
    // Listen for network requests to see API calls
    page.on('request', request => {
        if (request.url().includes('/api/recipes/')) {
            console.log('📡 API Request:', request.method(), request.url());
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/recipes/')) {
            console.log('📡 API Response:', response.status(), response.url());
        }
    });
    
    try {
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
        
        if (recipeCards.length > 0) {
            console.log('\n=== Testing View Button ===');
            const firstCard = recipeCards[0];
            
            // Get recipe name for context
            const recipeName = await firstCard.$eval('.recipe-card-title', el => el.textContent);
            console.log(`Testing with recipe: "${recipeName}"`);
            
            // Find and click the View button
            const viewButton = await firstCard.$('.view-ingredients-btn');
            if (viewButton) {
                console.log('Clicking View button...');
                await viewButton.click();
                
                // Wait for the API call and response
                await page.waitForTimeout(3000);
                
                // Check if ingredients are displayed
                const ingredientDetails = await firstCard.$('.ingredient-details');
                if (ingredientDetails) {
                    const isVisible = await ingredientDetails.evaluate(el => 
                        el.style.display !== 'none' && el.innerHTML.trim() !== ''
                    );
                    
                    if (isVisible) {
                        console.log('✅ Ingredients are now visible');
                        
                        // Check the content
                        const content = await ingredientDetails.evaluate(el => el.innerHTML);
                        if (content.includes('Error loading ingredients')) {
                            console.log('❌ Error message displayed in ingredients');
                            console.log('Error content:', content.substring(0, 200) + '...');
                        } else if (content.includes('ingredients-list-readonly')) {
                            console.log('✅ Read-only ingredients list displayed correctly');
                        } else {
                            console.log('📝 Ingredients content:', content.substring(0, 100) + '...');
                        }
                        
                        // Check button text
                        const buttonText = await viewButton.evaluate(el => el.textContent);
                        console.log(`Button text is now: "${buttonText}"`);
                        
                        // Test hiding ingredients
                        console.log('Clicking View button again to hide...');
                        await viewButton.click();
                        await page.waitForTimeout(1000);
                        
                        const isHidden = await ingredientDetails.evaluate(el => 
                            el.style.display === 'none' || el.innerHTML.trim() === ''
                        );
                        
                        if (isHidden) {
                            console.log('✅ Ingredients are now hidden');
                        } else {
                            console.log('❌ Ingredients are still visible');
                        }
                        
                    } else {
                        console.log('❌ Ingredients are not visible after clicking View');
                    }
                } else {
                    console.log('❌ No ingredient details div found');
                }
            } else {
                console.log('❌ View button not found');
            }
        } else {
            console.log('No recipe cards found to test with');
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

// Run the test
testViewButton().catch(console.error);
