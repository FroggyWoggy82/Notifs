// add-test-completion.js
const db = require('./db');

async function addTestCompletion() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Adding test completion for habit 22 on', today);
        
        const result = await db.query(
            'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2) RETURNING *',
            [22, today]
        );
        
        console.log('Added completion:', result.rows[0]);
        
        // Update the habit's total_completions
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
            [22]
        );
        
        console.log('Updated total_completions:', updateResult.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

addTestCompletion();
