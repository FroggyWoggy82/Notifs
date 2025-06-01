/**
 * Test the cache-busted version of the View button fix
 */

const { chromium } = require('playwright');

async function testCacheBustedVersion() {
    console.log('🔍 Testing cache-busted version...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const page = await browser.newPage();
    
    // Clear cache first
    await page.context().clearCookies();
    
    // Listen for the new version console messages
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[Recipe Button Fix v2.0]')) {
            console.log('✅ v2.0:', text);
        } else if (text.includes('[Recipe Button Fix]') && !text.includes('v2.0')) {
            console.log('❌ Old version:', text);
        }
    });
    
    try {
        console.log('🌐 Navigating to food page with cache bypass...');
        await page.goto('http://localhost:3001/pages/food.html', {
            waitUntil: 'networkidle'
        });
        
        // Wait for page to load
        await page.waitForSelector('#recipe-list', { timeout: 10000 });
        console.log('✅ Page loaded');
        
        // Wait for scripts to initialize
        await page.waitForTimeout(3000);
        
        // Check recipe cards
        const recipeCards = await page.$$('.recipe-card');
        console.log(`📋 Found ${recipeCards.length} recipe cards`);
        
        if (recipeCards.length > 0) {
            const firstCard = recipeCards[0];
            const recipeName = await firstCard.$eval('.recipe-card-title', el => el.textContent.trim());
            console.log(`🍽️ Testing recipe: "${recipeName}"`);
            
            // Test View button
            const viewButton = await firstCard.$('.view-ingredients-btn');
            if (viewButton) {
                console.log('🖱️ Clicking View button...');
                await viewButton.click();
                
                await page.waitForTimeout(2000);
                
                // Check if ingredients are displayed
                const ingredientDetails = await firstCard.$('.ingredient-details');
                if (ingredientDetails) {
                    const content = await ingredientDetails.evaluate(el => el.innerHTML.trim());
                    
                    if (content.includes('No ingredients found')) {
                        console.log('❌ Still showing "No ingredients found"');
                        console.log('Content:', content.substring(0, 100));
                    } else if (content.includes('ingredients-list-readonly')) {
                        console.log('✅ New ingredient display is working!');
                        console.log('Content length:', content.length);
                    } else {
                        console.log('⚠️ Unknown content:', content.substring(0, 100));
                    }
                } else {
                    console.log('❌ No ingredient details div found');
                }
            } else {
                console.log('❌ View button not found');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

// Run the test
testCacheBustedVersion().catch(console.error);
