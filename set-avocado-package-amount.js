// set-avocado-package-amount.js
const db = require('./utils/db');

async function setAvocadoPackageAmount() {
    try {
        console.log('=== Setting Avocado Package Amount to 136 ===');
        
        // Update the package_amount for Avocado, California (ID 10)
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 136
            WHERE id = 10 AND name = 'Avocado, California'
            RETURNING id, name, package_amount;
        `);
        
        if (updateResult.rowCount > 0) {
            console.log('Updated Avocado:', updateResult.rows[0]);
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = 10;
            `);
            
            console.log('Verified Avocado:', verifyResult.rows[0]);
            
            // Check if the update was successful
            const success = verifyResult.rows[0].package_amount == 136;
            console.log('Update successful?', success);
            
            if (!success) {
                console.log('WARNING: The package_amount was not updated correctly!');
            }
        } else {
            console.log('No Avocado ingredient found with ID 10');
            
            // Try to find the Avocado ingredient
            const findResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE name LIKE '%Avocado%';
            `);
            
            if (findResult.rowCount > 0) {
                console.log('Found Avocado ingredients:', findResult.rows);
                
                // Update the first Avocado ingredient found
                const avocadoId = findResult.rows[0].id;
                console.log(`Updating Avocado with ID ${avocadoId}...`);
                
                const updateResult2 = await db.query(`
                    UPDATE ingredients
                    SET package_amount = 136
                    WHERE id = $1
                    RETURNING id, name, package_amount;
                `, [avocadoId]);
                
                if (updateResult2.rowCount > 0) {
                    console.log('Updated Avocado:', updateResult2.rows[0]);
                }
            } else {
                console.log('No Avocado ingredients found');
            }
        }
    } catch (err) {
        console.error('Error setting Avocado package amount:', err);
    } finally {
        process.exit();
    }
}

setAvocadoPackageAmount();
