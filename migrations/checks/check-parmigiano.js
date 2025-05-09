// check-parmigiano.js
const db = require('./utils/db');

async function checkParmigiano() {
    try {
        console.log('=== Checking Parmigiano Ingredient ===');
        
        // Find the Parmigiano ingredient
        const findResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE name LIKE '%Parmigiano%' OR name LIKE '%Parmesan%';
        `);
        
        if (findResult.rowCount > 0) {
            console.log('Found Parmigiano ingredients:', findResult.rows);
            
            // Update the Parmigiano ingredient
            const parmId = findResult.rows[0].id;
            console.log(`Updating Parmigiano with ID ${parmId}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 200
                WHERE id = $1
                RETURNING id, name, package_amount;
            `, [parmId]);
            
            if (updateResult.rowCount > 0) {
                console.log('Updated Parmigiano:', updateResult.rows[0]);
            }
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = $1;
            `, [parmId]);
            
            console.log('Verified Parmigiano:', verifyResult.rows[0]);
        } else {
            console.log('No Parmigiano ingredients found');
            
            // Try a broader search
            const broadResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE name LIKE '%Cheese%' OR name LIKE '%Rggia%';
            `);
            
            if (broadResult.rowCount > 0) {
                console.log('Found cheese ingredients:', broadResult.rows);
                
                // Update the first cheese ingredient found
                const cheeseId = broadResult.rows[0].id;
                console.log(`Updating cheese with ID ${cheeseId}...`);
                
                const updateResult = await db.query(`
                    UPDATE ingredients
                    SET package_amount = 200
                    WHERE id = $1
                    RETURNING id, name, package_amount;
                `, [cheeseId]);
                
                if (updateResult.rowCount > 0) {
                    console.log('Updated cheese:', updateResult.rows[0]);
                }
            } else {
                console.log('No cheese ingredients found');
                
                // List all ingredients
                const allResult = await db.query(`
                    SELECT id, name, package_amount
                    FROM ingredients
                    ORDER BY id;
                `);
                
                console.log('All ingredients:', allResult.rows);
            }
        }
    } catch (err) {
        console.error('Error checking Parmigiano:', err);
    } finally {
        process.exit();
    }
}

checkParmigiano();
