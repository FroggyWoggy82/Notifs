// Script to update the Social Media Rejection habit title to match the new completions_per_day
const db = require('./db');

async function updateHabitTitle() {
    try {
        console.log('Connecting to database...');
        
        // First, get the current habit data
        const habitResult = await db.query(
            'SELECT id, title, completions_per_day FROM habits WHERE title LIKE $1',
            ['Social Media Rejection%']
        );
        
        if (habitResult.rows.length === 0) {
            console.log('No habit found with title "Social Media Rejection"');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Found habit:', habit);
        
        // Extract the current count from the title
        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
        if (!counterMatch) {
            console.log('Habit title does not contain a counter pattern');
            return;
        }
        
        const currentCount = parseInt(counterMatch[1], 10) || 0;
        const newCompletionsPerDay = habit.completions_per_day;
        
        // Create the new title with the updated counter
        const newTitle = habit.title.replace(
            /\(\d+\/\d+\)/,
            `(${currentCount}/${newCompletionsPerDay})`
        );
        
        console.log(`Updating title from "${habit.title}" to "${newTitle}"`);
        
        // Update the habit title
        const updateResult = await db.query(
            'UPDATE habits SET title = $1 WHERE id = $2 RETURNING *',
            [newTitle, habit.id]
        );
        
        if (updateResult.rows.length > 0) {
            console.log('Updated habit title:', updateResult.rows[0]);
        } else {
            console.log(`Failed to update habit with ID ${habit.id}`);
        }
    } catch (err) {
        console.error('Error updating habit title:', err);
    } finally {
        process.exit();
    }
}

updateHabitTitle();
