
// update-package-amount.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updatePackageAmount() {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node update-package-amount.js <ingredient_id> <package_amount>');
        process.exit(1);
    }
    
    const ingredientId = parseInt(args[0]);
    const packageAmount = parseFloat(args[1]);
    
    if (isNaN(ingredientId) || isNaN(packageAmount)) {
        console.error('Invalid arguments. Both ingredient_id and package_amount must be numbers.');
        process.exit(1);
    }
    
    const client = await pool.connect();
    
    try {
        console.log(`Updating package amount for ingredient ${ingredientId} to ${packageAmount}...`);
        
        // Get current value
        const currentResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        if (currentResult.rows.length === 0) {
            console.error(`Ingredient with ID ${ingredientId} not found.`);
            process.exit(1);
        }
        
        console.log('Current ingredient:', currentResult.rows[0]);
        
        // Update the package_amount
        const updateResult = await client.query(
            'UPDATE ingredients SET package_amount = $1 WHERE id = $2 RETURNING id, name, package_amount',
            [packageAmount, ingredientId]
        );
        
        console.log('Update result:', updateResult.rows[0]);
        
        // Verify the update
        const verifyResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        console.log('Verified result:', verifyResult.rows[0]);
        
        console.log('Update completed successfully');
    } catch (err) {
        console.error('Error updating package amount:', err);
    } finally {
        client.release();
        process.exit();
    }
}

updatePackageAmount();
