// Script to fix the Social Media Rejection habit level
const db = require('./db');

async function fixSocialMediaHabitLevel() {
    try {
        console.log('Connecting to database...');
        
        // Get the Social Media Rejection habit
        const habitResult = await db.query(
            'SELECT id, title, total_completions FROM habits WHERE title LIKE $1',
            ['Social Media Rejection%']
        );
        
        if (habitResult.rows.length === 0) {
            console.log('No habit found with title "Social Media Rejection"');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Current habit data:', habit);
        
        // Set the desired level (3)
        const desiredLevel = 3;
        const requiredCompletions = (desiredLevel - 1) * 5 + 1; // Level 3 requires at least 11 completions
        
        console.log(`Setting total_completions to ${requiredCompletions} to achieve level ${desiredLevel}`);
        
        // Update the total_completions in the database
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = $1 WHERE id = $2 RETURNING *',
            [requiredCompletions, habit.id]
        );
        
        if (updateResult.rows.length > 0) {
            console.log('Updated habit:', updateResult.rows[0]);
            
            // Calculate the new level
            const newLevel = Math.max(1, Math.floor(requiredCompletions / 5) + 1);
            console.log(`New level should be: ${newLevel}`);
        } else {
            console.log(`Failed to update habit with ID ${habit.id}`);
        }
        
    } catch (err) {
        console.error('Error fixing habit level:', err);
    } finally {
        process.exit();
    }
}

fixSocialMediaHabitLevel();
