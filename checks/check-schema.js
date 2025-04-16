const db = require('./db');

async function checkSchema() {
    try {
        console.log('Connecting to database...');

        // Query to check the schema of the exercise_preferences table
        const result = await db.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'exercise_preferences'
            ORDER BY ordinal_position;
        `);

        console.log('Exercise preferences table schema:');
        console.table(result.rows);
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
