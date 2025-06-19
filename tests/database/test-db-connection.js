const db = require('./utils/db');

async function testDatabaseConnection() {
    console.log('=== Testing Database Connection ===');

    try {
        // Test basic connection
        console.log('Testing basic database connection...');
        const result = await db.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);

        // Test recipes table
        console.log('\nTesting recipes table...');
        const recipesResult = await db.query('SELECT COUNT(*) FROM recipes');
        console.log('Recipe count:', recipesResult.rows[0].count);

        // Get all recipes
        console.log('\nGetting all recipes...');
        const allRecipes = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name');
        console.log('Recipes found:', allRecipes.rows);

        // Test the exact same query as the model (fixed)
        console.log('\nTesting exact model query (fixed)...');
        const modelQuery = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name ASC');
        console.log('Model query result:', modelQuery.rows);

        // Test the RecipeModel directly
        console.log('\nTesting RecipeModel.getAllRecipes()...');
        const RecipeModel = require('./models/recipeModel');
        const recipes = await RecipeModel.getAllRecipes();
        console.log('RecipeModel.getAllRecipes() result:', recipes);

    } catch (error) {
        console.error('Database test failed:', error);
    }

    process.exit(0);
}

testDatabaseConnection();
