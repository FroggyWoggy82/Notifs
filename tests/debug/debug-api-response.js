/**
 * Debug the API response to see the actual structure
 */

async function debugAPIResponse() {
    console.log('Debugging API response structure...');
    
    try {
        // Test getting all recipes first
        console.log('\n=== Testing GET /api/recipes ===');
        const recipesResponse = await fetch('http://localhost:3001/api/recipes');
        
        if (recipesResponse.ok) {
            const recipes = await recipesResponse.json();
            console.log(`Found ${recipes.length} recipes`);
            
            if (recipes.length > 0) {
                const firstRecipe = recipes[0];
                console.log(`\nFirst recipe: "${firstRecipe.name}" (ID: ${firstRecipe.id})`);
                
                // Test getting specific recipe
                console.log(`\n=== Testing GET /api/recipes/${firstRecipe.id} ===`);
                const recipeResponse = await fetch(`http://localhost:3001/api/recipes/${firstRecipe.id}`);
                
                if (recipeResponse.ok) {
                    const recipeData = await recipeResponse.json();
                    
                    console.log('\n=== FULL API RESPONSE ===');
                    console.log(JSON.stringify(recipeData, null, 2));
                    
                    console.log('\n=== ANALYSIS ===');
                    console.log('Recipe properties:', Object.keys(recipeData));
                    console.log('Has ingredients property:', 'ingredients' in recipeData);
                    console.log('Ingredients type:', typeof recipeData.ingredients);
                    console.log('Ingredients is array:', Array.isArray(recipeData.ingredients));
                    
                    if (recipeData.ingredients) {
                        console.log('Ingredients length:', recipeData.ingredients.length);
                        
                        if (recipeData.ingredients.length > 0) {
                            console.log('\nFirst ingredient structure:');
                            console.log(JSON.stringify(recipeData.ingredients[0], null, 2));
                            
                            console.log('\nFirst ingredient properties:', Object.keys(recipeData.ingredients[0]));
                        }
                    }
                    
                    // Check for other possible ingredient properties
                    const possibleIngredientKeys = Object.keys(recipeData).filter(key => 
                        key.toLowerCase().includes('ingredient')
                    );
                    console.log('Possible ingredient keys:', possibleIngredientKeys);
                    
                } else {
                    console.log('Error getting recipe:', await recipeResponse.text());
                }
            }
        } else {
            console.log('Error getting recipes:', await recipesResponse.text());
        }
        
    } catch (error) {
        console.error('Debug failed:', error);
    }
}

// Run the debug
debugAPIResponse().catch(console.error);
