// Script to check the habit_completions table schema
const db = require('./db');

async function checkHabitCompletionsTable() {
    try {
        console.log('Checking habit_completions table schema...');
        
        // Check if the habit_completions table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'habit_completions'
            )
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('habit_completions table exists:', tableExists);
        
        if (tableExists) {
            // Get the table schema
            const schemaResult = await db.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'habit_completions'
                ORDER BY ordinal_position
            `);
            
            console.log('habit_completions table schema:');
            schemaResult.rows.forEach(row => {
                console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
            });
            
            // Check if there are any records in the table
            const countResult = await db.query('SELECT COUNT(*) FROM habit_completions');
            console.log(`Total habit_completions records: ${countResult.rows[0].count}`);
            
            // Get a sample of the records
            const sampleResult = await db.query('SELECT * FROM habit_completions LIMIT 5');
            console.log('Sample habit_completions records:');
            sampleResult.rows.forEach(row => {
                console.log(`  ${JSON.stringify(row)}`);
            });
            
            // Check if there are any records for today
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const todayResult = await db.query(
                'SELECT * FROM habit_completions WHERE DATE(completed_at) = $1 LIMIT 5',
                [today]
            );
            console.log(`habit_completions records for today (${today}):`);
            todayResult.rows.forEach(row => {
                console.log(`  ${JSON.stringify(row)}`);
            });
        }
    } catch (err) {
        console.error('Error checking habit_completions table:', err);
    }
}

checkHabitCompletionsTable();
