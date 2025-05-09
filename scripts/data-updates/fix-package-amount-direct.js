// fix-package-amount-direct.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load database configuration from .env file
require('dotenv').config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixPackageAmount() {
    const client = await pool.connect();
    
    try {
        console.log('=== DIRECT FIX for Package Amount ===');
        
        // 1. Check the current schema
        console.log('Checking current schema...');
        const schemaResult = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'package_amount';
        `);
        
        if (schemaResult.rows.length > 0) {
            console.log('Current package_amount column:', schemaResult.rows[0]);
        } else {
            console.log('package_amount column does not exist');
        }
        
        // 2. Drop the package_amount column if it exists
        console.log('Dropping package_amount column...');
        await client.query(`
            ALTER TABLE ingredients
            DROP COLUMN IF EXISTS package_amount;
        `);
        console.log('package_amount column dropped');
        
        // 3. Add the package_amount column as DOUBLE PRECISION
        console.log('Adding package_amount column as DOUBLE PRECISION...');
        await client.query(`
            ALTER TABLE ingredients
            ADD COLUMN package_amount DOUBLE PRECISION;
        `);
        console.log('package_amount column added');
        
        // 4. Set package_amount values for specific ingredients
        console.log('Setting package_amount values...');
        
        // 4.1. Update Eggs
        const eggsResult = await client.query(`
            UPDATE ingredients
            SET package_amount = 600.0
            WHERE name LIKE '%Eggs%'
            RETURNING id, name, package_amount;
        `);
        
        console.log('Updated Eggs:', eggsResult.rows);
        
        // 4.2. Update Parmigiano
        const parmResult = await client.query(`
            UPDATE ingredients
            SET package_amount = 200.0
            WHERE name LIKE '%Parmigiano%' OR name LIKE '%Parmesan%'
            RETURNING id, name, package_amount;
        `);
        
        console.log('Updated Parmigiano:', parmResult.rows);
        
        // 4.3. Update Shrimp
        const shrimpResult = await client.query(`
            UPDATE ingredients
            SET package_amount = 454.0
            WHERE name LIKE '%Shrimp%'
            RETURNING id, name, package_amount;
        `);
        
        console.log('Updated Shrimp:', shrimpResult.rows);
        
        // 4.4. Update Avocado
        const avocadoResult = await client.query(`
            UPDATE ingredients
            SET package_amount = 136.0
            WHERE name LIKE '%Avocado%'
            RETURNING id, name, package_amount;
        `);
        
        console.log('Updated Avocado:', avocadoResult.rows);
        
        // 5. Verify the schema changes
        console.log('Verifying schema changes...');
        const verifySchemaResult = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'package_amount';
        `);
        
        console.log('Verified package_amount column:', verifySchemaResult.rows[0]);
        
        // 6. Verify the data changes
        console.log('Verifying data changes...');
        const verifyDataResult = await client.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE package_amount IS NOT NULL
            ORDER BY id;
        `);
        
        console.log('Verified ingredients with package_amount values:');
        verifyDataResult.rows.forEach(row => {
            console.log(`ID: ${row.id}, Name: ${row.name}, Package Amount: ${row.package_amount}, Type: ${typeof row.package_amount}`);
        });
        
        // 7. Create a function to update package_amount
        console.log('Creating update_package_amount function...');
        await client.query(`
            CREATE OR REPLACE FUNCTION update_package_amount(ingredient_id INTEGER, package_amount_value DOUBLE PRECISION)
            RETURNS VOID AS $$
            BEGIN
                UPDATE ingredients
                SET package_amount = package_amount_value
                WHERE id = ingredient_id;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('update_package_amount function created');
        
        // 8. Test the function
        console.log('Testing update_package_amount function...');
        const testIngredientId = 9; // Shrimp
        const testPackageAmount = 777.0;
        
        await client.query(`
            SELECT update_package_amount($1, $2);
        `, [testIngredientId, testPackageAmount]);
        
        const testResult = await client.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE id = $1;
        `, [testIngredientId]);
        
        console.log('Test result:', testResult.rows[0]);
        
        // 9. Reset the test value
        await client.query(`
            UPDATE ingredients
            SET package_amount = 454.0
            WHERE id = $1;
        `, [testIngredientId]);
        
        console.log('Test value reset');
        
        // 10. Create a simple update script
        console.log('Creating update script...');
        
        const updateScriptContent = `
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
        console.log(\`Updating package amount for ingredient \${ingredientId} to \${packageAmount}...\`);
        
        // Get current value
        const currentResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );
        
        if (currentResult.rows.length === 0) {
            console.error(\`Ingredient with ID \${ingredientId} not found.\`);
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
`;
        
        fs.writeFileSync(path.join(__dirname, 'update-package-amount.js'), updateScriptContent);
        console.log('Update script created: update-package-amount.js');
        
        console.log('DIRECT FIX completed successfully');
    } catch (err) {
        console.error('Error fixing package amount:', err);
    } finally {
        client.release();
        process.exit();
    }
}

fixPackageAmount();
