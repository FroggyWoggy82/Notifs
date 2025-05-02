// fix-package-amount-column.js
const db = require('./utils/db');

async function fixPackageAmountColumn() {
    try {
        console.log('=== Fix Package Amount Column ===');
        
        // Check if package_amount column exists
        const columnExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'ingredients'
                AND column_name = 'package_amount'
            );
        `);
        
        console.log('package_amount column exists:', columnExists.rows[0].exists);
        
        if (!columnExists.rows[0].exists) {
            // Add the package_amount column if it doesn't exist
            console.log('Adding package_amount column to ingredients table...');
            await db.query(`
                ALTER TABLE ingredients
                ADD COLUMN package_amount NUMERIC;
            `);
            console.log('package_amount column added successfully');
        } else {
            // Drop and recreate the package_amount column to ensure it's properly configured
            console.log('Dropping and recreating package_amount column...');
            await db.query(`
                ALTER TABLE ingredients
                DROP COLUMN package_amount;
            `);
            
            await db.query(`
                ALTER TABLE ingredients
                ADD COLUMN package_amount NUMERIC;
            `);
            
            console.log('package_amount column recreated successfully');
        }
        
        // Update the Avocado ingredient with a package_amount of 136
        console.log('Updating package_amount for Avocado, California...');
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 136
            WHERE name = 'Avocado, California'
            RETURNING id, name, package_amount;
        `);
        
        if (updateResult.rowCount > 0) {
            console.log('Updated Avocado:', updateResult.rows[0]);
        } else {
            console.log('No Avocado ingredient found');
        }
        
        // Verify all ingredients have the correct package_amount
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

fixPackageAmountColumn();
