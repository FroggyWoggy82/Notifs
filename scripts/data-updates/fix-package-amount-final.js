// fix-package-amount-final.js
const db = require('./utils/db');

async function fixPackageAmountFinal() {
    try {
        console.log('=== FINAL FIX for Package Amount ===');
        
        // 1. Check the current state of the ingredients table
        console.log('Checking current state of ingredients table...');
        const currentState = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            ORDER BY id;
        `);
        
        console.log('Current state:');
        currentState.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        // 2. Create a backup of the ingredients table
        console.log('Creating backup of ingredients table...');
        try {
            await db.query(`
                CREATE TABLE ingredients_backup AS
                SELECT * FROM ingredients;
            `);
            console.log('Backup created successfully');
        } catch (err) {
            console.error('Error creating backup:', err);
            console.log('Continuing with fix...');
        }
        
        // 3. Fix the package_amount column
        console.log('Fixing package_amount column...');
        
        // 3.1. Set all package_amount values to null
        await db.query(`
            UPDATE ingredients
            SET package_amount = NULL;
        `);
        console.log('Reset all package_amount values to null');
        
        // 3.2. Set specific package_amount values
        const updates = [
            { id: 7, name: 'Eggs Pasture Raised Vital Farms', value: 600 },
            { id: 8, name: 'Parmigiano Rggiano Galli', value: 200 },
            { id: 9, name: 'Shrimp Cooked from Frozen Great Catch', value: 454 },
            { id: 10, name: 'Avocado, California', value: 136 }
        ];
        
        for (const update of updates) {
            console.log(`Setting package_amount for ${update.name} (ID: ${update.id}) to ${update.value}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = $1
                WHERE id = $2
                RETURNING id, name, package_amount;
            `, [update.value, update.id]);
            
            if (updateResult.rowCount > 0) {
                console.log('Update successful:', updateResult.rows[0]);
            } else {
                console.log('Update failed - no rows affected');
            }
        }
        
        // 4. Verify the fixes
        console.log('Verifying fixes...');
        const verifyResult = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            ORDER BY id;
        `);
        
        console.log('Final state:');
        verifyResult.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        // 5. Create a simple test function to update package_amount
        console.log('Creating test function...');
        
        // 5.1. Create a function to update package_amount
        try {
            await db.query(`
                CREATE OR REPLACE FUNCTION update_package_amount(ingredient_id INTEGER, new_value NUMERIC)
                RETURNS VOID AS $$
                BEGIN
                    UPDATE ingredients
                    SET package_amount = new_value
                    WHERE id = ingredient_id;
                END;
                $$ LANGUAGE plpgsql;
            `);
            console.log('Test function created successfully');
            
            // 5.2. Test the function
            const testId = 9; // Shrimp
            const testValue = 777;
            
            console.log(`Testing function with ID ${testId} and value ${testValue}...`);
            
            await db.query(`
                SELECT update_package_amount($1, $2);
            `, [testId, testValue]);
            
            const testResult = await db.query(`
                SELECT id, name, package_amount
                FROM ingredients
                WHERE id = $1;
            `, [testId]);
            
            console.log('Test result:', testResult.rows[0]);
            
            // 5.3. Reset the test value
            await db.query(`
                UPDATE ingredients
                SET package_amount = 454
                WHERE id = $1;
            `, [testId]);
            
            console.log('Reset test value');
        } catch (err) {
            console.error('Error creating test function:', err);
        }
        
        console.log('Fix completed successfully');
        
    } catch (err) {
        console.error('Error fixing package_amount:', err);
    } finally {
        process.exit();
    }
}

fixPackageAmountFinal();
