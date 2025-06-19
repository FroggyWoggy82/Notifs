/**
 * Test the API endpoint directly
 */

async function testAPI() {
    console.log('Testing API endpoints...');
    
    try {
        // Test getting all recipes
        console.log('\n=== Testing GET /api/recipes ===');
        const recipesResponse = await fetch('http://localhost:3001/api/recipes');
        console.log('Status:', recipesResponse.status);
        
        if (recipesResponse.ok) {
            const recipes = await recipesResponse.json();
            console.log(`Found ${recipes.length} recipes`);
            
            if (recipes.length > 0) {
                const firstRecipe = recipes[0];
                console.log(`First recipe: "${firstRecipe.name}" (ID: ${firstRecipe.id})`);
                
                // Test getting specific recipe with ingredients
                console.log(`\n=== Testing GET /api/recipes/${firstRecipe.id} ===`);
                const recipeResponse = await fetch(`http://localhost:3001/api/recipes/${firstRecipe.id}`);
                console.log('Status:', recipeResponse.status);
                
                if (recipeResponse.ok) {
                    const recipeData = await recipeResponse.json();
                    console.log('Recipe data received:');
                    console.log('- Name:', recipeData.name);
                    console.log('- Total calories:', recipeData.total_calories);
                    console.log('- Ingredients count:', recipeData.ingredients ? recipeData.ingredients.length : 'No ingredients property');
                    
                    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
                        console.log('First ingredient:', recipeData.ingredients[0].name);
                        console.log('✅ API endpoint is working correctly');
                    } else {
                        console.log('⚠️  Recipe has no ingredients');
                    }
                } else {
                    const errorText = await recipeResponse.text();
                    console.log('❌ Error getting recipe:', errorText);
                }
            } else {
                console.log('No recipes found in database');
                
                // Try to create a test recipe
                console.log('\n=== Creating test recipe ===');
                const createResponse = await fetch('http://localhost:3001/api/recipes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Test Recipe for Button Fix',
                        groceryStore: 'Test Store',
                        ingredients: [
                            {
                                name: 'Test Ingredient 1',
                                amount: 100,
                                calories: 200,
                                protein: 10,
                                fats: 5,
                                carbohydrates: 20,
                                price: 2.50
                            },
                            {
                                name: 'Test Ingredient 2',
                                amount: 50,
                                calories: 100,
                                protein: 5,
                                fats: 2,
                                carbohydrates: 15,
                                price: 1.25
                            }
                        ]
                    })
                });
                
                console.log('Create recipe status:', createResponse.status);
                
                if (createResponse.ok) {
                    const newRecipe = await createResponse.json();
                    console.log('✅ Test recipe created:', newRecipe.name);
                    console.log('Recipe ID:', newRecipe.id);
                    
                    // Test the new recipe endpoint
                    console.log(`\n=== Testing new recipe GET /api/recipes/${newRecipe.id} ===`);
                    const testResponse = await fetch(`http://localhost:3001/api/recipes/${newRecipe.id}`);
                    
                    if (testResponse.ok) {
                        const testData = await testResponse.json();
                        console.log('✅ New recipe endpoint works');
                        console.log('Ingredients count:', testData.ingredients ? testData.ingredients.length : 'No ingredients');
                    } else {
                        console.log('❌ New recipe endpoint failed');
                    }
                } else {
                    const errorText = await createResponse.text();
                    console.log('❌ Failed to create test recipe:', errorText);
                }
            }
        } else {
            const errorText = await recipesResponse.text();
            console.log('❌ Error getting recipes:', errorText);
        }
        
    } catch (error) {
        console.error('API test failed:', error);
    }
}

// Run the test
testAPI().catch(console.error);
