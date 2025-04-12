// Script to update the "Thinking about food" habit title to remove the counter
const db = require('./db');

async function updateHabit() {
    try {
        console.log('Connecting to database...');
        const result = await db.query(
            'UPDATE habits SET title = $1 WHERE title LIKE $2 RETURNING *',
            ['Thinking about food', 'Thinking about food%']
        );
        
        if (result.rows.length > 0) {
            console.log('Updated habit title:', result.rows[0]);
        } else {
            console.log('No habit found with title "Thinking about food"');
        }
    } catch (err) {
        console.error('Error updating habit title:', err);
    } finally {
        process.exit();
    }
}

updateHabit();
