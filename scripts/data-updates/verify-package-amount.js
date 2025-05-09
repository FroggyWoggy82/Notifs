// verify-package-amount.js
const db = require('./utils/db');

async function verifyPackageAmount() {
    try {
        console.log('=== Verify Package Amount ===');
        
        // Get the ingredient ID from command line arguments
        const args = process.argv.slice(2);
        const ingredientId = args[0] || 10; // Default to ingredient ID 10 if not provided
        
        console.log(`Verifying package_amount for ingredient ID ${ingredientId}`);
        
        // Get the current package_amount
        const currentResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE id = $1;
        `, [ingredientId]);
        
        if (currentResult.rowCount > 0) {
            console.log('Current ingredient:', currentResult.rows[0]);
            
            // Update the package_amount to a new value
            const newPackageAmount = 150; // Use a different value to verify the update
            console.log(`Updating package_amount to ${newPackageAmount}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = $1
                WHERE id = $2
                RETURNING id, name, package_amount;
            `, [newPackageAmount, ingredientId]);
            
            if (updateResult.rowCount > 0) {
                console.log('Updated ingredient:', updateResult.rows[0]);
                
                // Verify the update
                const verifyResult = await db.query(`
                    SELECT id, name, package_amount
                    FROM ingredients
                    WHERE id = $1;
                `, [ingredientId]);
                
                console.log('Verified updated ingredient:', verifyResult.rows[0]);
                
                // Check if the update was successful
                const success = verifyResult.rows[0].package_amount == newPackageAmount;
                console.log('Update successful?', success);
                
                if (!success) {
                    console.log('WARNING: The package_amount was not updated correctly!');
                }
            } else {
                console.log(`No ingredient with ID ${ingredientId} found`);
            }
        } else {
            console.log(`No ingredient with ID ${ingredientId} found`);
        }
    } catch (err) {
        console.error('Error verifying package_amount:', err);
    } finally {
        process.exit();
    }
}

verifyPackageAmount();
