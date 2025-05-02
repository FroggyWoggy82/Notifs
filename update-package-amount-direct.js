// update-package-amount-direct.js
const db = require('./utils/db');

async function updatePackageAmountDirect() {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node update-package-amount-direct.js <ingredient_id> <package_amount>');
        process.exit(1);
    }
    
    const ingredientId = parseInt(args[0]);
    const packageAmount = parseFloat(args[1]);
    
    if (isNaN(ingredientId) || isNaN(packageAmount)) {
        console.error('Invalid arguments. Both ingredient_id and package_amount must be numbers.');
        process.exit(1);
    }
    
    try {
        console.log(`=== Updating Package Amount for Ingredient ${ingredientId} to ${packageAmount} ===`);
        
        // Get current value
        const currentResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE id = $1;
        `, [ingredientId]);
        
        if (currentResult.rowCount === 0) {
            console.error(`Ingredient with ID ${ingredientId} not found.`);
            process.exit(1);
        }
        
        console.log('Current ingredient:', currentResult.rows[0]);
        
        // Update the package_amount
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = $1
            WHERE id = $2
            RETURNING id, name, package_amount;
        `, [packageAmount, ingredientId]);
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE id = $1;
        `, [ingredientId]);
        
        console.log('Verified result:', verifyResult.rows[0]);
        
        console.log('Update completed successfully');
    } catch (err) {
        console.error('Error updating package amount:', err);
    } finally {
        process.exit();
    }
}

updatePackageAmountDirect();
