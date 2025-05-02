// direct-update-package-amount.js
const db = require('./utils/db');

async function directUpdatePackageAmount() {
    try {
        console.log('=== Direct Update Package Amount ===');
        
        // Get the ingredient ID from command line arguments
        const args = process.argv.slice(2);
        const ingredientId = args[0] || 4; // Default to ingredient ID 4 if not provided
        const packageAmount = args[1] || 130; // Default to 130 if not provided
        
        console.log(`Updating ingredient ID ${ingredientId} with package_amount ${packageAmount}`);
        
        // Update the package_amount directly in the database
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = $1
            WHERE id = $2
            RETURNING id, name, package_amount;
        `, [packageAmount, ingredientId]);
        
        if (updateResult.rowCount > 0) {
            console.log('Updated ingredient:', updateResult.rows[0]);
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = $1;
            `, [ingredientId]);
            
            console.log('Verified updated ingredient:', verifyResult.rows[0]);
        } else {
            console.log(`No ingredient with ID ${ingredientId} found`);
        }
    } catch (err) {
        console.error('Error updating package_amount:', err);
    } finally {
        process.exit();
    }
}

directUpdatePackageAmount();
