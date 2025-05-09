// check-package-amount.js
const db = require('./utils/db');

async function checkPackageAmount() {
    try {
        console.log('Connecting to database...');

        // Check if ingredients table exists
        const tableExists = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'ingredients'
            );
        `);

        console.log('Ingredients table exists:', tableExists.rows[0].exists);

        if (tableExists.rows[0].exists) {
            // Check for package_amount column
            const columnExists = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'ingredients'
                    AND column_name = 'package_amount'
                );
            `);

            console.log('package_amount column exists:', columnExists.rows[0].exists);

            if (columnExists.rows[0].exists) {
                // Check for ingredients with non-null package_amount
                const nonNullCount = await db.query(`
                    SELECT COUNT(*) FROM ingredients
                    WHERE package_amount IS NOT NULL;
                `);

                console.log('Ingredients with non-null package_amount:', nonNullCount.rows[0].count);

                // Get all ingredients with their package_amount
                const ingredients = await db.query(`
                    SELECT id, recipe_id, name, package_amount
                    FROM ingredients
                    ORDER BY id ASC;
                `);

                console.log('All ingredients with package_amount:');
                ingredients.rows.forEach(ing => {
                    console.log(`ID: ${ing.id}, Recipe ID: ${ing.recipe_id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}`);
                });

                // Try to update an ingredient with a package_amount
                const updateResult = await db.query(`
                    UPDATE ingredients
                    SET package_amount = 600
                    WHERE id = 7
                    RETURNING id, name, package_amount;
                `);

                if (updateResult.rowCount > 0) {
                    console.log('Updated ingredient:', updateResult.rows[0]);

                    // Verify the update
                    const verifyResult = await db.query(`
                        SELECT id, name, package_amount
                        FROM ingredients
                        WHERE id = 7;
                    `);

                    console.log('Verified updated ingredient:', verifyResult.rows[0]);
                } else {
                    console.log('No ingredient with ID 1 found');
                }
            }
        }
    } catch (err) {
        console.error('Error checking package_amount:', err);
    } finally {
        process.exit();
    }
}

checkPackageAmount();
