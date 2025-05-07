/**
 * Create Recipe with Micronutrients
 * 
 * This script creates a new recipe with ingredients that have micronutrient data.
 */

const db = require('./utils/db');

async function createRecipeWithMicronutrients() {
    try {
        console.log('=== Creating Recipe with Micronutrients ===');
        
        // Start a transaction
        await db.query('BEGIN');
        
        // Create a new recipe
        const recipeResult = await db.query(
            'INSERT INTO recipes (name, total_calories) VALUES ($1, $2) RETURNING id',
            ['Micronutrient Test Recipe', 100]
        );
        
        const recipeId = recipeResult.rows[0].id;
        console.log(`Created recipe with ID: ${recipeId}`);
        
        // Create ingredients with micronutrient data
        const ingredients = [
            {
                name: 'Egg',
                calories: 72,
                amount: 50,
                protein: 6.3,
                fats: 5.0,
                carbohydrates: 0.4,
                price: 0.25,
                water: 37.3,
                cholesterol: 186,
                vitamin_a: 160,
                vitamin_d: 1.1,
                vitamin_e: 0.5,
                vitamin_k: 0.1,
                calcium: 28,
                iron: 0.9,
                magnesium: 6,
                phosphorus: 99,
                potassium: 69,
                sodium: 71,
                zinc: 0.6,
                folate: 24,
                vitamin_b12: 0.6,
                riboflavin: 0.2,
                pantothenic_acid: 0.7
            },
            {
                name: 'Spinach',
                calories: 23,
                amount: 100,
                protein: 2.9,
                fats: 0.4,
                carbohydrates: 3.6,
                price: 0.50,
                water: 91.4,
                fiber: 2.2,
                vitamin_a: 469,
                vitamin_c: 28,
                vitamin_k: 483,
                calcium: 99,
                iron: 2.7,
                magnesium: 79,
                phosphorus: 49,
                potassium: 558,
                sodium: 79,
                folate: 194,
                vitamin_b6: 0.2,
                vitamin_b12: 0,
                riboflavin: 0.2
            }
        ];
        
        // Insert each ingredient
        for (const ingredient of ingredients) {
            // Build the columns and values for the query
            const columns = ['recipe_id', 'name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price'];
            const values = [recipeId, ingredient.name, ingredient.calories, ingredient.amount, ingredient.protein, ingredient.fats, ingredient.carbohydrates, ingredient.price];
            const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8'];
            let placeholderIndex = 9;
            
            // Add micronutrient data
            for (const [key, value] of Object.entries(ingredient)) {
                if (!['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price'].includes(key)) {
                    columns.push(key);
                    values.push(value);
                    placeholders.push(`$${placeholderIndex}`);
                    placeholderIndex++;
                }
            }
            
            // Build and execute the query
            const insertQuery = `
                INSERT INTO ingredients (${columns.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING id
            `;
            
            const ingredientResult = await db.query(insertQuery, values);
            const ingredientId = ingredientResult.rows[0].id;
            console.log(`Created ingredient ${ingredient.name} with ID: ${ingredientId}`);
            
            // Verify the data was saved correctly
            const verifyResult = await db.query('SELECT * FROM ingredients WHERE id = $1', [ingredientId]);
            const savedIngredient = verifyResult.rows[0];
            
            // Check micronutrient fields
            console.log(`Checking micronutrient fields for ${ingredient.name}:`);
            for (const [key, value] of Object.entries(ingredient)) {
                if (!['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price'].includes(key)) {
                    console.log(`- ${key}: ${savedIngredient[key]}`);
                }
            }
        }
        
        // Commit the transaction
        await db.query('COMMIT');
        
        console.log('Recipe with micronutrient data created successfully!');
    } catch (error) {
        // Rollback the transaction in case of error
        await db.query('ROLLBACK');
        console.error('Error creating recipe with micronutrients:', error);
    } finally {
        process.exit();
    }
}

createRecipeWithMicronutrients();
