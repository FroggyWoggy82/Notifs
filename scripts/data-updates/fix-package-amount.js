// fix-package-amount.js
const db = require('./utils/db');

async function fixPackageAmount() {
    try {
        console.log('=== Fix Package Amount ===');
        
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
            // Check the data type of the package_amount column
            const columnType = await db.query(`
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'ingredients'
                AND column_name = 'package_amount';
            `);
            
            console.log('package_amount column type:', columnType.rows[0].data_type);
            
            // If the column type is not numeric, alter it
            if (columnType.rows[0].data_type !== 'numeric') {
                console.log('Altering package_amount column to NUMERIC type...');
                await db.query(`
                    ALTER TABLE ingredients
                    ALTER COLUMN package_amount TYPE NUMERIC USING package_amount::numeric;
                `);
                console.log('package_amount column type altered successfully');
            }
        }
        
        // Update all ingredients with ID 10 (Avocado, California) to have package_amount = 136
        console.log('Updating package_amount for ingredient ID 10...');
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 136
            WHERE id = 10
            RETURNING id, name, package_amount;
        `);
        
        if (updateResult.rowCount > 0) {
            console.log('Updated ingredient:', updateResult.rows[0]);
        } else {
            console.log('No ingredient with ID 10 found');
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
        console.error('Error fixing package_amount:', err);
    } finally {
        process.exit();
    }
}

fixPackageAmount();
