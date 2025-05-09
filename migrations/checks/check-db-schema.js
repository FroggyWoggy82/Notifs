// check-db-schema.js
const db = require('./utils/db');

async function checkDatabaseSchema() {
    try {
        console.log('=== Checking Database Schema ===');
        
        // Check the ingredients table schema
        console.log('Checking ingredients table schema...');
        const tableSchema = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'ingredients'
            ORDER BY ordinal_position;
        `);
        
        console.log('Ingredients table schema:');
        tableSchema.rows.forEach(column => {
            console.log(`Column: ${column.column_name}, Type: ${column.data_type}, Nullable: ${column.is_nullable}, Default: ${column.column_default}`);
        });
        
        // Check if package_amount column exists
        const packageAmountColumn = tableSchema.rows.find(col => col.column_name === 'package_amount');
        if (packageAmountColumn) {
            console.log('package_amount column exists with type:', packageAmountColumn.data_type);
        } else {
            console.log('package_amount column does not exist in the ingredients table');
        }
        
        // Check for any constraints on the package_amount column
        console.log('Checking constraints on package_amount column...');
        const constraints = await db.query(`
            SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'ingredients'
              AND kcu.column_name = 'package_amount';
        `);
        
        if (constraints.rowCount > 0) {
            console.log('Constraints on package_amount column:');
            constraints.rows.forEach(constraint => {
                console.log(`Constraint: ${constraint.constraint_name}, Type: ${constraint.constraint_type}`);
            });
        } else {
            console.log('No constraints found on package_amount column');
        }
        
        // Check for any triggers on the ingredients table
        console.log('Checking triggers on ingredients table...');
        const triggers = await db.query(`
            SELECT trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers
            WHERE event_object_table = 'ingredients';
        `);
        
        if (triggers.rowCount > 0) {
            console.log('Triggers on ingredients table:');
            triggers.rows.forEach(trigger => {
                console.log(`Trigger: ${trigger.trigger_name}, Event: ${trigger.event_manipulation}, Action: ${trigger.action_statement}`);
            });
        } else {
            console.log('No triggers found on ingredients table');
        }
        
        // Try to directly update the package_amount column for a specific ingredient
        console.log('Attempting direct update of package_amount...');
        
        // First, find an ingredient to update
        const ingredients = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            LIMIT 5;
        `);
        
        if (ingredients.rowCount > 0) {
            const ingredient = ingredients.rows[0];
            console.log(`Selected ingredient for test: ID ${ingredient.id}, Name: ${ingredient.name}, Current package_amount: ${ingredient.package_amount}`);
            
            // Try to update the package_amount
            const testValue = 999;
            console.log(`Attempting to update package_amount to ${testValue}...`);
            
            const updateResult = await db.query(`
                UPDATE ingredients
                SET package_amount = $1
                WHERE id = $2
                RETURNING id, name, package_amount;
            `, [testValue, ingredient.id]);
            
            if (updateResult.rowCount > 0) {
                console.log('Update successful!');
                console.log('Updated ingredient:', updateResult.rows[0]);
                
                // Verify the update with a separate query
                const verifyResult = await db.query(`
                    SELECT id, name, package_amount
                    FROM ingredients
                    WHERE id = $1;
                `, [ingredient.id]);
                
                console.log('Verified ingredient:', verifyResult.rows[0]);
                
                // Reset the value
                await db.query(`
                    UPDATE ingredients
                    SET package_amount = $1
                    WHERE id = $2;
                `, [ingredient.package_amount, ingredient.id]);
                
                console.log('Reset package_amount to original value');
            } else {
                console.log('Update failed - no rows affected');
            }
        } else {
            console.log('No ingredients found for testing');
        }
        
        // Check if there are any database functions or procedures that might be interfering
        console.log('Checking for database functions...');
        const functions = await db.query(`
            SELECT routine_name, routine_type
            FROM information_schema.routines
            WHERE routine_schema = 'public';
        `);
        
        if (functions.rowCount > 0) {
            console.log('Database functions:');
            functions.rows.forEach(func => {
                console.log(`Function: ${func.routine_name}, Type: ${func.routine_type}`);
            });
        } else {
            console.log('No database functions found');
        }
        
    } catch (err) {
        console.error('Error checking database schema:', err);
    } finally {
        process.exit();
    }
}

checkDatabaseSchema();
