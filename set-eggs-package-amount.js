// set-eggs-package-amount.js
const db = require('./utils/db');

async function setEggsPackageAmount() {
    try {
        console.log('=== Setting Eggs Package Amount to 600 ===');
        
        // Find the Eggs ingredient
        const findResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE name LIKE '%Eggs%';
        `);
        
        if (findResult.rowCount > 0) {
            console.log('Found Eggs ingredients:', findResult.rows);
            
            // Update all Eggs ingredients to have package_amount = 600
            for (const egg of findResult.rows) {
                console.log(`Updating Eggs with ID ${egg.id}...`);
                
                const updateResult = await db.query(`
                    UPDATE ingredients
                    SET package_amount = 600
                    WHERE id = $1
                    RETURNING id, name, package_amount;
                `, [egg.id]);
                
                if (updateResult.rowCount > 0) {
                    console.log('Updated Eggs:', updateResult.rows[0]);
                }
            }
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE name LIKE '%Eggs%';
            `);
            
            console.log('Verified Eggs ingredients:', verifyResult.rows);
        } else {
            console.log('No Eggs ingredients found');
            
            // Try to find any ingredients
            const allResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                ORDER BY id;
            `);
            
            console.log('All ingredients:', allResult.rows);
        }
    } catch (err) {
        console.error('Error setting Eggs package amount:', err);
    } finally {
        process.exit();
    }
}

setEggsPackageAmount();
