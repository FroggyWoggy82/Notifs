// update-shrimp.js
const db = require('./utils/db');

async function updateShrimp() {
    try {
        console.log('=== Updating Shrimp Package Amount ===');
        
        // Find the Shrimp ingredient
        const findResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE name LIKE '%Shrimp%';
        `);
        
        if (findResult.rowCount > 0) {
            console.log('Found Shrimp ingredients:', findResult.rows);
            
            // Update the Shrimp ingredient
            const shrimpId = findResult.rows[0].id;
            console.log(`Updating Shrimp with ID ${shrimpId}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 454
                WHERE id = $1
                RETURNING id, name, package_amount;
            `, [shrimpId]);
            
            if (updateResult.rowCount > 0) {
                console.log('Updated Shrimp:', updateResult.rows[0]);
            }
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = $1;
            `, [shrimpId]);
            
            console.log('Verified Shrimp:', verifyResult.rows[0]);
        } else {
            console.log('No Shrimp ingredients found');
        }
    } catch (err) {
        console.error('Error updating Shrimp:', err);
    } finally {
        process.exit();
    }
}

updateShrimp();
