// Script to update the Social Media Rejection habit to include a counter
const db = require('./db');

async function updateHabit() {
    try {
        console.log('Connecting to database...');
        const result = await db.query(
            'UPDATE habits SET title = $1 WHERE title = $2 RETURNING *',
            ['Social Media Rejection (0/10)', 'Social Media Rejection']
        );
        
        if (result.rows.length > 0) {
            console.log('Updated habit:', result.rows[0]);
        } else {
            console.log('No habit found with title "Social Media Rejection"');
        }
    } catch (err) {
        console.error('Error updating habit:', err);
    } finally {
        process.exit();
    }
}

updateHabit();
