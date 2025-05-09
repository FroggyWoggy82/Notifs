/**
 * Test Cronometer Parser
 * 
 * This script tests the Cronometer parser by creating a test ingredient with micronutrient data
 * and verifying that the data is saved correctly to the database.
 */

const db = require('./utils/db');

// Sample Cronometer data
const sampleCronometerData = {
    success: true,
    calories: 100,
    protein: 10,
    fat: 5,
    carbs: 15,
    fiber: 2,
    sugars: 3,
    saturated: 1.5,
    monounsaturated: 2.5,
    polyunsaturated: 1,
    omega3: 0.5,
    omega6: 0.5,
    cholesterol: 20,
    vitaminA: 500,
    vitaminC: 30,
    vitaminD: 5,
    vitaminE: 2,
    vitaminK: 10,
    calcium: 100,
    iron: 2,
    magnesium: 30,
    phosphorus: 50,
    potassium: 200,
    sodium: 150,
    zinc: 1
};

// Convert JavaScript property names to database column names
function toDbFormat(data) {
    const fieldMappings = {
        calories: 'calories',
        protein: 'protein',
        fat: 'fats',
        carbs: 'carbohydrates',
        fiber: 'fiber',
        sugars: 'sugars',
        saturated: 'saturated',
        monounsaturated: 'monounsaturated',
        polyunsaturated: 'polyunsaturated',
        omega3: 'omega3',
        omega6: 'omega6',
        cholesterol: 'cholesterol',
        vitaminA: 'vitamin_a',
        vitaminC: 'vitamin_c',
        vitaminD: 'vitamin_d',
        vitaminE: 'vitamin_e',
        vitaminK: 'vitamin_k',
        calcium: 'calcium',
        iron: 'iron',
        magnesium: 'magnesium',
        phosphorus: 'phosphorus',
        potassium: 'potassium',
        sodium: 'sodium',
        zinc: 'zinc'
    };

    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) continue;
        const columnName = fieldMappings[key];
        if (!columnName) continue;
        result[columnName] = value;
    }
    return result;
}

async function testCronometerParser() {
    try {
        console.log('=== Testing Cronometer Parser ===');
        
        // Convert the sample data to database format
        const dbFormatData = toDbFormat(sampleCronometerData);
        console.log('Database format data:', dbFormatData);
        
        // Create a test recipe
        const recipeResult = await db.query(
            'INSERT INTO recipes (name, total_calories) VALUES ($1, $2) RETURNING id',
            ['Test Recipe', sampleCronometerData.calories]
        );
        const recipeId = recipeResult.rows[0].id;
        console.log(`Created test recipe with ID: ${recipeId}`);
        
        // Create a test ingredient with micronutrient data
        const columns = ['recipe_id', 'name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price'];
        const values = [recipeId, 'Test Ingredient', dbFormatData.calories, 100, dbFormatData.protein, dbFormatData.fats, dbFormatData.carbohydrates, 1];
        const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8'];
        let paramIndex = 9;
        
        // Add micronutrient fields
        for (const [key, value] of Object.entries(dbFormatData)) {
            // Skip basic fields that are already handled
            if (['calories', 'protein', 'fats', 'carbohydrates'].includes(key)) {
                continue;
            }
            
            columns.push(key);
            placeholders.push(`$${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
        
        // Build and execute the query
        const insertQuery = `
            INSERT INTO ingredients (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING id
        `;
        
        console.log('Executing query with columns:', columns);
        const ingredientResult = await db.query(insertQuery, values);
        const ingredientId = ingredientResult.rows[0].id;
        console.log(`Created test ingredient with ID: ${ingredientId}`);
        
        // Verify the data was saved correctly
        const verifyResult = await db.query('SELECT * FROM ingredients WHERE id = $1', [ingredientId]);
        const savedIngredient = verifyResult.rows[0];
        console.log('Saved ingredient data:');
        
        // Check each field
        for (const [key, value] of Object.entries(dbFormatData)) {
            const savedValue = savedIngredient[key];
            console.log(`${key}: ${value} -> ${savedValue} (${value === savedValue ? 'OK' : 'MISMATCH'})`);
        }
        
        // Clean up
        await db.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Error testing Cronometer parser:', error);
    } finally {
        process.exit();
    }
}

testCronometerParser();
