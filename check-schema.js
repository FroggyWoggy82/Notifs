// check-schema.js
const db = require('./utils/db');

async function checkSchema() {
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
            result.rows.forEach(row => {
                console.log(`${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
            });
            
            // Check for sample data
            const sampleData = await db.query(`
                SELECT id, recipe_id, name, calories, amount, package_amount, protein, fats, carbohydrates, price
                FROM ingredients
                LIMIT 5;
            `);
            
            console.log('Sample data:');
            sampleData.rows.forEach(row => {
                console.log(JSON.stringify(row));
            });
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
