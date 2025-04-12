// Script to update the "Thinking about food" habit to allow unlimited completions
const db = require('./db');

async function updateHabit() {
    try {
        console.log('Connecting to database...');
        const result = await db.query(
            'UPDATE habits SET title = $1, completions_per_day = $2 WHERE title LIKE $3 RETURNING *',
            ['Thinking about food', 999, 'Thinking about food%']
        );
        
        if (result.rows.length > 0) {
            console.log('Updated habit:', result.rows[0]);
        } else {
            console.log('No habit found with title "Thinking about food"');
        }
    } catch (err) {
        console.error('Error updating habit:', err);
    } finally {
        process.exit();
    }
}

updateHabit();
