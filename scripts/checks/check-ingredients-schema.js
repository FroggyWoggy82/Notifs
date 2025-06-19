// check-ingredients-schema.js
const db = require('../utils/db');

async function checkIngredientsSchema() {
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
            // Query to check the schema of the ingredients table
            const result = await db.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'ingredients'
                ORDER BY ordinal_position;
            `);

            console.log('Ingredients table schema:');
            console.table(result.rows);
            
            // Check for foreign keys
            const foreignKeys = await db.query(`
                SELECT
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM
                    information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = 'ingredients';
            `);
            
            console.log('Foreign keys:');
            console.table(foreignKeys.rows);
            
            // Check for sample data
            const sampleData = await db.query(`
                SELECT * FROM ingredients LIMIT 5;
            `);
            
            console.log('Sample data:');
            console.table(sampleData.rows);
        }
    } catch (err) {
        console.error('Error checking ingredients schema:', err);
    } finally {
        process.exit();
    }
}

checkIngredientsSchema();
