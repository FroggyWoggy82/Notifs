// add-trans-column.js
const db = require('./utils/db');

async function addTransColumn() {
    try {
        console.log('Starting to add trans column to ingredients table...');
        
        // Check if the trans column already exists
        const columnCheck = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'trans'
        `);
        
        if (columnCheck.rows.length > 0) {
            console.log('Trans column already exists:', columnCheck.rows[0]);
            return;
        }
        
        console.log('Trans column does not exist. Adding it now...');
        
        // Add the trans column
        await db.query(`
            ALTER TABLE ingredients
            ADD COLUMN trans NUMERIC(10, 2) DEFAULT 0
        `);
        
        console.log('Trans column added successfully!');
        
        // Verify the column was added
        const verifyColumn = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'trans'
        `);
        
        console.log('Verification result:', verifyColumn.rows[0]);
        
        // Show all columns in the ingredients table
        const allColumns = await db.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'ingredients'
            ORDER BY ordinal_position
        `);
        
        console.log('All columns in ingredients table:');
        allColumns.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });
        
    } catch (error) {
        console.error('Error adding trans column:', error);
    } finally {
        process.exit();
    }
}

addTransColumn();
