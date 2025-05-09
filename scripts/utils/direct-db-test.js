/**
 * Direct Database Test
 * 
 * This script directly tests the database connection and inserts a test ingredient with micronutrient data.
 */

const db = require('./utils/db');

async function testDirectDbInsert() {
    try {
        console.log('=== Testing Direct Database Insert ===');
        
        // Create a test recipe
        const recipeResult = await db.query(
            'INSERT INTO recipes (name, total_calories) VALUES ($1, $2) RETURNING id',
            ['Direct DB Test Recipe', 100]
        );
        const recipeId = recipeResult.rows[0].id;
        console.log(`Created test recipe with ID: ${recipeId}`);
        
        // Create a test ingredient with micronutrient data
        const insertQuery = `
            INSERT INTO ingredients (
                recipe_id, name, calories, amount, protein, fats, carbohydrates, price,
                fiber, sugars, saturated, monounsaturated, polyunsaturated, omega3, omega6,
                cholesterol, vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_k,
                calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, water
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21,
                $22, $23, $24, $25, $26, $27, $28, $29
            ) RETURNING id
        `;
        
        const values = [
            recipeId, 'Direct DB Test Ingredient', 18.6, 100, 1, 0.3, 3.1, 1,
            2, 2.8, 0.1, 0.1, 0, 0, 0,
            1.5, 53.4, 0.5, 13.2, 0, 0.4,
            35.7, 0, 3.3, 28.8, 46.2, 11.1, 0.1, 25.4
        ];
        
        const ingredientResult = await db.query(insertQuery, values);
        const ingredientId = ingredientResult.rows[0].id;
        console.log(`Created test ingredient with ID: ${ingredientId}`);
        
        // Verify the data was saved correctly
        const verifyResult = await db.query('SELECT * FROM ingredients WHERE id = $1', [ingredientId]);
        const savedIngredient = verifyResult.rows[0];
        console.log('Saved ingredient data:');
        console.log(JSON.stringify(savedIngredient, null, 2));
        
        // Check specific micronutrient fields
        const fields = [
            'fiber', 'sugars', 'saturated', 'monounsaturated', 'polyunsaturated',
            'omega3', 'omega6', 'cholesterol', 'vitamin_a', 'vitamin_c', 'vitamin_d',
            'vitamin_e', 'vitamin_k', 'calcium', 'iron', 'magnesium', 'phosphorus',
            'potassium', 'sodium', 'zinc', 'water'
        ];
        
        console.log('Checking micronutrient fields:');
        fields.forEach(field => {
            console.log(`${field}: ${savedIngredient[field]}`);
        });
        
        // Clean up
        await db.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Error testing direct database insert:', error);
    } finally {
        process.exit();
    }
}

testDirectDbInsert();
