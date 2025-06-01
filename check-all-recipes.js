/**
 * Check all recipes to see which ones have ingredients
 */

async function checkAllRecipes() {
    console.log('🔍 Checking all recipes for ingredients...');
    
    try {
        // Get all recipes
        const recipesResponse = await fetch('http://localhost:3001/api/recipes');
        if (!recipesResponse.ok) {
            throw new Error(`Failed to get recipes: ${recipesResponse.status}`);
        }
        
        const recipes = await recipesResponse.json();
        console.log(`📋 Found ${recipes.length} recipes total`);
        
        for (const recipe of recipes) {
            console.log(`\n🍽️ Checking recipe: "${recipe.name}" (ID: ${recipe.id})`);
            
            // Get detailed recipe data
            const detailResponse = await fetch(`http://localhost:3001/api/recipes/${recipe.id}`);
            if (!detailResponse.ok) {
                console.log(`❌ Failed to get details for recipe ${recipe.id}`);
                continue;
            }
            
            const detailData = await detailResponse.json();
            
            if (!detailData.ingredients) {
                console.log(`❌ No ingredients property`);
            } else if (!Array.isArray(detailData.ingredients)) {
                console.log(`❌ Ingredients is not an array: ${typeof detailData.ingredients}`);
            } else if (detailData.ingredients.length === 0) {
                console.log(`❌ Empty ingredients array`);
            } else {
                console.log(`✅ Has ${detailData.ingredients.length} ingredients:`);
                detailData.ingredients.forEach((ing, index) => {
                    console.log(`   ${index + 1}. ${ing.name} (${ing.amount}g)`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking recipes:', error);
    }
}

// Run the check
checkAllRecipes().catch(console.error);
