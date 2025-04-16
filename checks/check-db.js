// check-db.js
const db = require('../utils/db');

async function checkDatabase() {
    try {
        // Check the habits table
        console.log('Checking habits table...');
        const habitsResult = await db.query('SELECT * FROM habits WHERE id = 22');
        console.log('Habit 22:', habitsResult.rows[0]);

        // Check the habit_completions table
        console.log('\nChecking habit_completions table...');
        const completionsResult = await db.query('SELECT * FROM habit_completions WHERE habit_id = 22 ORDER BY created_at DESC LIMIT 10');
        console.log('Habit 22 completions (last 10):', completionsResult.rows);

        // Check completions for today
        const todayKey = new Date().toISOString().split('T')[0];
        console.log(`\nChecking completions for today (${todayKey})...`);
        const todayCompletionsResult = await db.query('SELECT * FROM habit_completions WHERE habit_id = 22 AND completion_date = $1', [todayKey]);
        console.log(`Habit 22 completions for today (${todayKey}):`, todayCompletionsResult.rows);

        // Check if the deleted_at column exists
        console.log('\nChecking if deleted_at column exists...');
        try {
            const columnCheckResult = await db.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'habit_completions' AND column_name = 'deleted_at'
            `);
            console.log('deleted_at column exists:', columnCheckResult.rows.length > 0);
        } catch (err) {
            console.error('Error checking for deleted_at column:', err);
        }
    } catch (err) {
        console.error('Error checking database:', err);
    } finally {
        process.exit();
    }
}

checkDatabase();
