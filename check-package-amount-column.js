// check-package-amount-column.js
const db = require('./utils/db');

async function checkPackageAmountColumn() {
    try {
        console.log('Connecting to database...');

        // Check if package_amount column exists and its data type
        const columnInfo = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'ingredients'
                AND column_name = 'package_amount';
        `);

        if (columnInfo.rowCount === 0) {
            console.log('package_amount column does not exist in the ingredients table');
            return;
        }

        console.log('package_amount column info:', columnInfo.rows[0]);

        // Check if there are any ingredients with non-null package_amount
        const nonNullCount = await db.query(`
            SELECT COUNT(*) FROM ingredients
            WHERE package_amount IS NOT NULL;
        `);
        
        console.log('Ingredients with non-null package_amount:', nonNullCount.rows[0].count);

        // Try to update an ingredient with a package_amount
        const updateResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 130
            WHERE id = 4
            RETURNING id, name, package_amount;
        `);
        
        if (updateResult.rowCount > 0) {
            console.log('Updated ingredient:', updateResult.rows[0]);
            
            // Verify the update
            const verifyResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = 4;
            `);
            
            console.log('Verified updated ingredient:', verifyResult.rows[0]);
        } else {
            console.log('No ingredient with ID 4 found');
        }

    } catch (err) {
        console.error('Error checking package_amount column:', err);
    } finally {
        process.exit();
    }
}

checkPackageAmountColumn();
