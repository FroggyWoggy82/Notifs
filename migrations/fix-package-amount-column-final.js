// fix-package-amount-column-final.js
const db = require('./utils/db');

async function fixPackageAmountColumnFinal() {
    try {
        console.log('=== FINAL FIX for Package Amount Column ===');
        
        // Drop and recreate the package_amount column
        console.log('Dropping package_amount column...');
        try {
            await db.query(`
                ALTER TABLE ingredients
                DROP COLUMN IF EXISTS package_amount;
            `);
            console.log('package_amount column dropped successfully');
        } catch (err) {
            console.error('Error dropping package_amount column:', err);
        }
        
        // Add the package_amount column
        console.log('Adding package_amount column...');
        try {
            await db.query(`
                ALTER TABLE ingredients
                ADD COLUMN package_amount NUMERIC;
            `);
            console.log('package_amount column added successfully');
        } catch (err) {
            console.error('Error adding package_amount column:', err);
        }
        
        // Set package_amount values for specific ingredients
        console.log('Setting package_amount values...');
        
        // Update Eggs
        try {
            const eggsResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 600
                WHERE name LIKE '%Eggs%'
                RETURNING id, name, package_amount;
            `);
            
            if (eggsResult.rowCount > 0) {
                console.log('Updated Eggs:', eggsResult.rows);
            } else {
                console.log('No Eggs ingredients found');
            }
        } catch (err) {
            console.error('Error updating Eggs:', err);
        }
        
        // Update Parmigiano
        try {
            const parmResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 200
                WHERE name LIKE '%Parmigiano%' OR name LIKE '%Parmesan%'
                RETURNING id, name, package_amount;
            `);
            
            if (parmResult.rowCount > 0) {
                console.log('Updated Parmigiano:', parmResult.rows);
            } else {
                console.log('No Parmigiano ingredients found');
            }
        } catch (err) {
            console.error('Error updating Parmigiano:', err);
        }
        
        // Update Shrimp
        try {
            const shrimpResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 454
                WHERE name LIKE '%Shrimp%'
                RETURNING id, name, package_amount;
            `);
            
            if (shrimpResult.rowCount > 0) {
                console.log('Updated Shrimp:', shrimpResult.rows);
            } else {
                console.log('No Shrimp ingredients found');
            }
        } catch (err) {
            console.error('Error updating Shrimp:', err);
        }
        
        // Update Avocado
        try {
            const avocadoResult = await db.query(`
                UPDATE ingredients
                SET package_amount = 136
                WHERE name LIKE '%Avocado%'
                RETURNING id, name, package_amount;
            `);
            
            if (avocadoResult.rowCount > 0) {
                console.log('Updated Avocado:', avocadoResult.rows);
            } else {
                console.log('No Avocado ingredients found');
            }
        } catch (err) {
            console.error('Error updating Avocado:', err);
        }
        
        // Verify all ingredients
        console.log('Verifying all ingredients...');
        const allIngredients = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            ORDER BY id;
        `);
        
        console.log('All ingredients:');
        allIngredients.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}`);
        });
        
    } catch (err) {
        console.error('Error fixing package_amount column:', err);
    } finally {
        process.exit();
    }
}

fixPackageAmountColumnFinal();
