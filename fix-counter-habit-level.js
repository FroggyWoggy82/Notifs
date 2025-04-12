// Script to fix the counter habit level calculation
const db = require('./db');

async function fixCounterHabitLevel() {
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

        // Extract the current count from the title
        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
        if (!counterMatch) {
            console.log('Habit title does not contain a counter pattern');
            return;
        }

        const currentCount = parseInt(counterMatch[1], 10) || 0;
        const maxCount = parseInt(counterMatch[2], 10) || 0;

        // Calculate what the total_completions should be based on the counter value
        // For counter habits, we want the total_completions to be at least 5 times the desired level
        // If we want level 3, we need at least 10 total_completions (Math.floor(10/5) + 1 = 3)
        const desiredLevel = 3; // Set this to the desired level
        const minTotalCompletions = (desiredLevel - 1) * 5;

        // Use the higher of the current total_completions or the minimum needed for the desired level
        const newTotalCompletions = Math.max(habit.total_completions || 0, minTotalCompletions);

        console.log(`Setting total_completions to ${newTotalCompletions} to achieve level ${desiredLevel}`);

        // Update the total_completions in the database
        const updateResult = await db.query(
            'UPDATE habits SET total_completions = $1 WHERE id = $2 RETURNING *',
            [newTotalCompletions, habit.id]
        );

        if (updateResult.rows.length > 0) {
            console.log('Updated habit:', updateResult.rows[0]);

            // Calculate the new level
            const newLevel = Math.max(1, Math.floor(newTotalCompletions / 5) + 1);
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

fixCounterHabitLevel();
