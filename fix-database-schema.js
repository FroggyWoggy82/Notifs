// fix-database-schema.js
const db = require('./utils/db');

async function fixDatabaseSchema() {
    try {
        console.log('=== Fixing Database Schema ===');
        
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
            
            // Drop the package_amount column
            console.log('Dropping package_amount column...');
            await db.query(`
                ALTER TABLE ingredients
                DROP COLUMN IF EXISTS package_amount;
            `);
            console.log('package_amount column dropped successfully');
        } else {
            console.log('package_amount column does not exist in the ingredients table');
        }
        
        // Add the package_amount column as a REAL type
        console.log('Adding package_amount column as REAL type...');
        await db.query(`
            ALTER TABLE ingredients
            ADD COLUMN package_amount REAL;
        `);
        console.log('package_amount column added successfully');
        
        // Set package_amount values for specific ingredients
        console.log('Setting package_amount values...');
        
        // Update Eggs
        const eggsResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 600.0
            WHERE name LIKE '%Eggs%'
            RETURNING id, name, package_amount;
        `);
        
        if (eggsResult.rowCount > 0) {
            console.log('Updated Eggs:', eggsResult.rows);
        } else {
            console.log('No Eggs ingredients found');
        }
        
        // Update Parmigiano
        const parmResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 200.0
            WHERE name LIKE '%Parmigiano%' OR name LIKE '%Parmesan%'
            RETURNING id, name, package_amount;
        `);
        
        if (parmResult.rowCount > 0) {
            console.log('Updated Parmigiano:', parmResult.rows);
        } else {
            console.log('No Parmigiano ingredients found');
        }
        
        // Update Shrimp
        const shrimpResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 454.0
            WHERE name LIKE '%Shrimp%'
            RETURNING id, name, package_amount;
        `);
        
        if (shrimpResult.rowCount > 0) {
            console.log('Updated Shrimp:', shrimpResult.rows);
        } else {
            console.log('No Shrimp ingredients found');
        }
        
        // Update Avocado
        const avocadoResult = await db.query(`
            UPDATE ingredients
            SET package_amount = 136.0
            WHERE name LIKE '%Avocado%'
            RETURNING id, name, package_amount;
        `);
        
        if (avocadoResult.rowCount > 0) {
            console.log('Updated Avocado:', avocadoResult.rows);
        } else {
            console.log('No Avocado ingredients found');
        }
        
        // Verify the schema changes
        console.log('Verifying schema changes...');
        const updatedSchema = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'package_amount';
        `);
        
        if (updatedSchema.rowCount > 0) {
            console.log('Updated package_amount column:', updatedSchema.rows[0]);
        } else {
            console.log('package_amount column not found after update');
        }
        
        // Verify the data changes
        console.log('Verifying data changes...');
        const updatedData = await db.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE package_amount IS NOT NULL
            ORDER BY id;
        `);
        
        console.log('Ingredients with package_amount values:');
        updatedData.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        console.log('Database schema fixed successfully');
    } catch (err) {
        console.error('Error fixing database schema:', err);
    } finally {
        process.exit();
    }
}

fixDatabaseSchema();
