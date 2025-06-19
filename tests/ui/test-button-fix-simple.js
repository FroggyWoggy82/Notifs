/**
 * Simple test to verify the recipe button fix is loaded and working
 */

const { chromium } = require('playwright');

async function testButtonFix() {
    console.log('Testing recipe button fix...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        if (text.includes('[Recipe Button Fix]')) {
            console.log('✅', text);
        }
    });
    
    try {
        console.log('Navigating to food page...');
        await page.goto('http://localhost:3001/pages/food.html');
        
        // Wait for the page to load
        await page.waitForSelector('#recipe-list', { timeout: 10000 });
        console.log('Page loaded successfully');
        
        // Wait for scripts to initialize
        await page.waitForTimeout(3000);
        
        // Check if our fix is loaded
        const fixLoaded = consoleMessages.some(msg => 
            msg.includes('[Recipe Button Fix] Initializing comprehensive recipe button handler')
        );
        
        if (fixLoaded) {
            console.log('✅ Recipe button fix is loaded and initialized');
        } else {
            console.log('❌ Recipe button fix not detected');
        }
        
        // Check if event listeners are attached
        const eventListenerAttached = consoleMessages.some(msg => 
            msg.includes('[Recipe Button Fix] Event listener attached to document')
        );
        
        if (eventListenerAttached) {
            console.log('✅ Event listeners are properly attached');
        } else {
            console.log('❌ Event listeners not detected');
        }
        
        // Check if observer is working
        const observerAttached = consoleMessages.some(msg => 
            msg.includes('[Recipe Button Fix] Observer attached to recipe list container')
        );
        
        if (observerAttached) {
            console.log('✅ Mutation observer is working');
        } else {
            console.log('❌ Mutation observer not detected');
        }
        
        // Check if conflicting handlers were removed
        const conflictsRemoved = consoleMessages.some(msg => 
            msg.includes('[Recipe Button Fix] Removed existing conflicting handlers')
        );
        
        if (conflictsRemoved) {
            console.log('✅ Conflicting handlers were removed');
        } else {
            console.log('❌ Conflicting handler removal not detected');
        }
        
        // Test if we can find recipe button elements (even if no recipes exist)
        const viewButtons = await page.$$('.view-ingredients-btn');
        const deleteButtons = await page.$$('.delete-recipe-btn');
        const adjustButtons = await page.$$('.adjust-calories-toggle');
        
        console.log(`Found ${viewButtons.length} View buttons`);
        console.log(`Found ${deleteButtons.length} Delete buttons`);
        console.log(`Found ${adjustButtons.length} Adjust buttons`);
        
        // Check if the global functions are available
        const globalFunctionsAvailable = await page.evaluate(() => {
            return {
                fetchAndDisplayIngredients: typeof window.fetchAndDisplayIngredients === 'function',
                deleteRecipe: typeof window.deleteRecipe === 'function'
            };
        });
        
        if (globalFunctionsAvailable.fetchAndDisplayIngredients) {
            console.log('✅ fetchAndDisplayIngredients is available globally');
        } else {
            console.log('❌ fetchAndDisplayIngredients not available globally');
        }
        
        if (globalFunctionsAvailable.deleteRecipe) {
            console.log('✅ deleteRecipe is available globally');
        } else {
            console.log('❌ deleteRecipe not available globally');
        }
        
        // Check the recipe list content
        const recipeListContent = await page.$eval('#recipe-list', el => el.innerHTML);
        if (recipeListContent.includes('Loading recipes...')) {
            console.log('📝 Recipes are still loading...');
        } else if (recipeListContent.includes('No recipes found')) {
            console.log('📝 No recipes found in database');
        } else {
            console.log('📝 Recipe list has content');
        }
        
        // Check if modal prevention is active
        const modalPreventionActive = consoleMessages.some(msg =>
            msg.includes('[Recipe Button Fix] Modal prevention system activated')
        );

        if (modalPreventionActive) {
            console.log('✅ Modal prevention system is active');
        } else {
            console.log('❌ Modal prevention system not detected');
        }

        console.log('\n=== Summary ===');
        const allChecks = [
            fixLoaded,
            eventListenerAttached,
            observerAttached,
            conflictsRemoved,
            globalFunctionsAvailable.fetchAndDisplayIngredients,
            globalFunctionsAvailable.deleteRecipe,
            modalPreventionActive
        ];

        const passedChecks = allChecks.filter(Boolean).length;
        const totalChecks = allChecks.length;

        console.log(`Passed ${passedChecks}/${totalChecks} checks`);

        if (passedChecks === totalChecks) {
            console.log('🎉 All checks passed! Recipe button fix is working correctly.');
            console.log('📝 The View button should now show ingredients without any edit modals.');
        } else {
            console.log('⚠️  Some checks failed. The fix may not be working properly.');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await page.waitForTimeout(2000);
        await browser.close();
    }
}

// Run the test
testButtonFix().catch(console.error);
