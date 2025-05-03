// update-trans-fat.js
const db = require('./utils/db');

async function updateTransFat() {
    try {
        console.log('Starting to update trans_fat values...');
        
        // Get a list of ingredients
        const ingredients = await db.query('SELECT id, name, trans_fat FROM ingredients LIMIT 10');
        console.log('Found ingredients:', ingredients.rows);
        
        // Update each ingredient with a test value
        for (const ingredient of ingredients.rows) {
            console.log(`Updating ingredient ${ingredient.id} (${ingredient.name})...`);
            console.log(`Current trans_fat value: ${ingredient.trans_fat}`);
            
            // Set a new value (toggle between 0 and 2)
            const newValue = ingredient.trans_fat > 0 ? 0 : 2;
            console.log(`Setting new trans_fat value to: ${newValue}`);
            
            // Update the trans_fat value
            const updateResult = await db.query(
                'UPDATE ingredients SET trans_fat = $1 WHERE id = $2 RETURNING id, name, trans_fat',
                [newValue, ingredient.id]
            );
            
            console.log('Update result:', updateResult.rows[0]);
            
            // Verify the update
            const verifyResult = await db.query(
                'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
                [ingredient.id]
            );
            
            console.log('Verification result:', verifyResult.rows[0]);
            
            // Check if the update was successful
            if (verifyResult.rows[0].trans_fat == newValue) {
                console.log('SUCCESS: Trans fat value was updated successfully!');
            } else {
                console.log('FAILURE: Trans fat value was not updated!');
                console.log('Expected:', newValue);
                console.log('Actual:', verifyResult.rows[0].trans_fat);
            }
            
            console.log('---');
        }
        
        console.log('All updates completed!');
    } catch (error) {
        console.error('Error updating trans_fat values:', error);
    } finally {
        process.exit();
    }
}

updateTransFat();
