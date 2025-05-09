/**
 * Add Micronutrient Data
 * 
 * This script adds micronutrient data to an existing ingredient.
 */

const db = require('./utils/db');

async function addMicronutrientData() {
    try {
        console.log('=== Adding Micronutrient Data ===');
        
        // Get the most recently added ingredient
        const recentIngredientResult = await db.query(
            'SELECT * FROM ingredients ORDER BY id DESC LIMIT 1'
        );
        
        if (recentIngredientResult.rows.length === 0) {
            console.log('No ingredients found in the database.');
            return;
        }
        
        const recentIngredient = recentIngredientResult.rows[0];
        console.log(`Most recently added ingredient: ${recentIngredient.name} (ID: ${recentIngredient.id})`);
        
        // Add micronutrient data
        const micronutrientData = {
            water: 25.4,
            fiber: 2.0,
            sugars: 2.8,
            saturated: 0.1,
            monounsaturated: 0.1,
            polyunsaturated: 0.0,
            omega3: 0.0,
            omega6: 0.0,
            cholesterol: 1.5,
            vitamin_a: 53.4,
            vitamin_c: 0.5,
            vitamin_d: 13.2,
            vitamin_e: 0.0,
            vitamin_k: 0.4,
            calcium: 35.7,
            iron: 0.0,
            magnesium: 3.3,
            phosphorus: 28.8,
            potassium: 46.2,
            sodium: 11.1,
            zinc: 0.1,
            folate: 6.6,
            vitamin_b12: 0.1,
            riboflavin: 0.1,
            pantothenic_acid: 0.1
        };
        
        // Build the update query
        const columns = [];
        const values = [];
        let placeholderIndex = 1;
        
        for (const [key, value] of Object.entries(micronutrientData)) {
            columns.push(`${key} = $${placeholderIndex}`);
            values.push(value);
            placeholderIndex++;
        }
        
        const updateQuery = `
            UPDATE ingredients
            SET ${columns.join(', ')}
            WHERE id = $${placeholderIndex}
            RETURNING id, name
        `;
        
        values.push(recentIngredient.id);
        
        // Execute the update query
        const updateResult = await db.query(updateQuery, values);
        
        if (updateResult.rows.length === 0) {
            console.log('Failed to update ingredient.');
            return;
        }
        
        console.log(`Updated ingredient: ${updateResult.rows[0].name} (ID: ${updateResult.rows[0].id})`);
        
        // Verify the update
        const verifyResult = await db.query(
            'SELECT * FROM ingredients WHERE id = $1',
            [recentIngredient.id]
        );
        
        if (verifyResult.rows.length === 0) {
            console.log('Failed to verify update.');
            return;
        }
        
        const updatedIngredient = verifyResult.rows[0];
        
        // Log micronutrient data
        console.log('Updated micronutrient data:');
        for (const [key, value] of Object.entries(micronutrientData)) {
            console.log(`- ${key}: ${updatedIngredient[key]}`);
        }
        
        console.log('');
        console.log('Micronutrient data added successfully!');
    } catch (error) {
        console.error('Error adding micronutrient data:', error);
    } finally {
        process.exit();
    }
}

addMicronutrientData();
