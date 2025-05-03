// check-trans-fat-column.js
const db = require('./utils/db');

async function checkTransFatColumn() {
    try {
        console.log('Starting to check trans_fat column in ingredients table...');
        
        // Check if the trans_fat column exists
        const columnCheck = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'trans_fat'
        `);
        
        if (columnCheck.rows.length > 0) {
            console.log('trans_fat column exists:', columnCheck.rows[0]);
            
            // Check if there are any values in the column
            const valueCheck = await db.query(`
                SELECT COUNT(*) as count
                FROM ingredients
                WHERE trans_fat IS NOT NULL AND trans_fat != 0
            `);
            
            console.log(`Found ${valueCheck.rows[0].count} ingredients with non-zero trans_fat values`);
            
            // Try to update a sample ingredient with a trans_fat value
            const updateTest = await db.query(`
                UPDATE ingredients
                SET trans_fat = 3.5
                WHERE id = (SELECT id FROM ingredients LIMIT 1)
                RETURNING id, name, trans_fat
            `);
            
            if (updateTest.rows.length > 0) {
                console.log('Successfully updated trans_fat for ingredient:', updateTest.rows[0]);
            } else {
                console.log('Failed to update trans_fat for any ingredient');
            }
            
            // Check if the update was successful
            const verifyUpdate = await db.query(`
                SELECT id, name, trans_fat
                FROM ingredients
                WHERE id = ${updateTest.rows[0].id}
            `);
            
            console.log('Verification result:', verifyUpdate.rows[0]);
        } else {
            console.log('trans_fat column does not exist. Adding it now...');
            
            // Add the trans_fat column
            await db.query(`
                ALTER TABLE ingredients
                ADD COLUMN trans_fat NUMERIC(10, 2) DEFAULT 0
            `);
            
            console.log('trans_fat column added successfully!');
            
            // Verify the column was added
            const verifyColumn = await db.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'ingredients' AND column_name = 'trans_fat'
            `);
            
            console.log('Verification result:', verifyColumn.rows[0]);
        }
        
        // Create a direct update function for trans_fat
        console.log('Creating a direct update function for trans_fat...');
        
        // Get a list of ingredients to test with
        const ingredients = await db.query('SELECT id, name, trans_fat FROM ingredients LIMIT 5');
        console.log('Sample ingredients:', ingredients.rows);
        
        if (ingredients.rows.length > 0) {
            // Pick the first ingredient
            const testIngredient = ingredients.rows[0];
            console.log('Testing with ingredient:', testIngredient);
            
            // Current trans_fat value
            console.log('Current trans_fat value:', testIngredient.trans_fat);
            
            // Set a new trans_fat value
            const newTransFatValue = 2.5;
            console.log('Setting new trans_fat value to:', newTransFatValue);
            
            // Update the trans_fat value directly
            const updateResult = await db.query(
                'UPDATE ingredients SET trans_fat = $1 WHERE id = $2 RETURNING id, name, trans_fat',
                [newTransFatValue, testIngredient.id]
            );
            
            console.log('Update result:', updateResult.rows[0]);
            
            // Verify the update
            const verifyResult = await db.query(
                'SELECT id, name, trans_fat FROM ingredients WHERE id = $1',
                [testIngredient.id]
            );
            
            console.log('Verification result:', verifyResult.rows[0]);
            
            // Check if the update was successful
            if (verifyResult.rows[0].trans_fat === newTransFatValue) {
                console.log('SUCCESS: Trans fat value was updated successfully!');
            } else {
                console.log('FAILURE: Trans fat value was not updated!');
                console.log('Expected:', newTransFatValue);
                console.log('Actual:', verifyResult.rows[0].trans_fat);
            }
        }
        
    } catch (error) {
        console.error('Error checking trans_fat column:', error);
    } finally {
        process.exit();
    }
}

checkTransFatColumn();
