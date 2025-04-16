// Script to update the Social Media Rejection habit completions_per_day
const db = require('./db');

async function updateHabitCompletions() {
    try {
        console.log('Connecting to database...');
        const result = await db.query(
            'UPDATE habits SET completions_per_day = $1 WHERE title = $2 RETURNING *',
            [10, 'Social Media Rejection (0/10)']
        );
        
        if (result.rows.length > 0) {
            console.log('Updated habit completions_per_day:', result.rows[0]);
        } else {
            console.log('No habit found with title "Social Media Rejection (0/10)"');
        }
    } catch (err) {
        console.error('Error updating habit completions:', err);
    } finally {
        process.exit();
    }
}

updateHabitCompletions();
