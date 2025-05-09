// check-ingredient-data.js
const db = require('./utils/db');

async function checkIngredientData() {
    try {
        console.log('=== Checking Ingredient Data ===');
        
        // Get all ingredients
        const allIngredients = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            ORDER BY id;
        `);
        
        console.log(`Found ${allIngredients.rowCount} ingredients`);
        
        // Print each ingredient with its package_amount
        allIngredients.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        // Check if there are any ingredients with non-null package_amount
        const ingredientsWithPackageAmount = allIngredients.rows.filter(ing => ing.package_amount !== null);
        console.log(`Found ${ingredientsWithPackageAmount.length} ingredients with non-null package_amount`);
        
        // Try to update the package_amount for a specific ingredient
        if (allIngredients.rowCount > 0) {
            const ingredient = allIngredients.rows[0];
            console.log(`Selected ingredient for test: ID ${ingredient.id}, Name: ${ingredient.name}, Current package_amount: ${ingredient.package_amount}`);
            
            // Try to update the package_amount
            const testValue = 888;
            console.log(`Attempting to update package_amount to ${testValue}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = $1
                WHERE id = $2
                RETURNING id, name, package_amount;
            `, [testValue, ingredient.id]);
            
            if (updateResult.rowCount > 0) {
                console.log('Update successful!');
                console.log('Updated ingredient:', updateResult.rows[0]);
                
                // Verify the update with a separate query
                const verifyResult = await db.query(`
                    SELECT id, name, package_amount
                    FROM ingredients
                    WHERE id = $1;
                `, [ingredient.id]);
                
                console.log('Verified ingredient:', verifyResult.rows[0]);
                
                // Reset the value
                await db.query(`
                    UPDATE ingredients
                    SET package_amount = $1
                    WHERE id = $2;
                `, [ingredient.package_amount, ingredient.id]);
                
                console.log('Reset package_amount to original value');
            } else {
                console.log('Update failed - no rows affected');
            }
        }
        
    } catch (err) {
        console.error('Error checking ingredient data:', err);
    } finally {
        process.exit();
    }
}

checkIngredientData();
