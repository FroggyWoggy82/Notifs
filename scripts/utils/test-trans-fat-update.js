// test-trans-fat-update.js
const db = require('./utils/db');

async function testTransFatUpdate() {
    try {
        console.log('Starting trans fat update test...');
        
        // Get a list of ingredients to test with
        const ingredients = await db.query('SELECT id, name, trans FROM ingredients LIMIT 5');
        console.log('Found ingredients:', ingredients.rows);
        
        if (ingredients.rows.length === 0) {
            console.log('No ingredients found to test with');
            return;
        }
        
        // Pick the first ingredient
        const testIngredient = ingredients.rows[0];
        console.log('Testing with ingredient:', testIngredient);
        
        // Current trans fat value
        console.log('Current trans fat value:', testIngredient.trans);
        
        // Set a new trans fat value (toggle between 0 and 1)
        const newTransFatValue = testIngredient.trans === 0 ? 1 : 0;
        console.log('Setting new trans fat value to:', newTransFatValue);
        
        // Update the trans fat value directly
        const updateResult = await db.query(
            'UPDATE ingredients SET trans = $1 WHERE id = $2 RETURNING id, name, trans',
            [newTransFatValue, testIngredient.id]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await db.query(
            'SELECT id, name, trans FROM ingredients WHERE id = $1',
            [testIngredient.id]
        );
        
        console.log('Verification result:', verifyResult.rows[0]);
        
        // Check if the update was successful
        if (verifyResult.rows[0].trans === newTransFatValue) {
            console.log('SUCCESS: Trans fat value was updated successfully!');
        } else {
            console.log('FAILURE: Trans fat value was not updated!');
            console.log('Expected:', newTransFatValue);
            console.log('Actual:', verifyResult.rows[0].trans);
        }
        
        // Show the column definition
        const columnDef = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'trans'
        `);
        
        console.log('Trans column definition:', columnDef.rows[0]);
        
    } catch (error) {
        console.error('Error testing trans fat update:', error);
    } finally {
        process.exit();
    }
}

testTransFatUpdate();
