/**
 * Fix Social Media Rejection Habit Level
 * 
 * This script diagnoses and fixes issues with the "Social Media Rejection" habit level
 * not being saved properly. It ensures that:
 * 1. The habit exists in the database
 * 2. The total_completions value is correct
 * 3. The level is properly displayed
 */

const db = require('../utils/db');

async function fixSocialMediaRejectionHabit() {
    try {
        console.log('Starting Social Media Rejection habit fix...');
        
        // 1. Find the Social Media Rejection habit
        const habitResult = await db.query(
            "SELECT * FROM habits WHERE title LIKE 'Social Media Rejection%'"
        );
        
        if (habitResult.rows.length === 0) {
            console.log('No habit found with title containing "Social Media Rejection"');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Found habit:', habit);
        
        // 2. Check completions in the habit_completions table
        const completionsResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND deleted_at IS NULL',
            [habit.id]
        );
        
        const completionsCount = parseInt(completionsResult.rows[0].count, 10);
        console.log(`Found ${completionsCount} completions for habit ID ${habit.id}`);
        
        // 3. Check if total_completions matches the actual completions count
        if (habit.total_completions !== completionsCount) {
            console.log(`Mismatch detected: total_completions (${habit.total_completions}) != actual completions (${completionsCount})`);
            
            // 4. Update the total_completions to match the actual count
            await db.query(
                'UPDATE habits SET total_completions = $1 WHERE id = $2 RETURNING *',
                [completionsCount, habit.id]
            );
            
            console.log(`Updated total_completions to ${completionsCount}`);
        } else {
            console.log('total_completions matches actual completions count');
        }
        
        // 5. Ensure the habit has the correct format for a counter habit
        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
        if (!counterMatch) {
            console.log('Habit title does not have counter format. Adding counter format...');
            
            // Add counter format (0/8) to the title if it doesn't have it
            const newTitle = `Social Media Rejection (0/8)`;
            await db.query(
                'UPDATE habits SET title = $1, completions_per_day = 8 WHERE id = $2 RETURNING *',
                [newTitle, habit.id]
            );
            
            console.log(`Updated habit title to "${newTitle}" and set completions_per_day to 8`);
        } else {
            // Ensure completions_per_day matches the counter target
            const targetCount = parseInt(counterMatch[2], 10);
            if (habit.completions_per_day !== targetCount) {
                console.log(`Mismatch detected: completions_per_day (${habit.completions_per_day}) != target count (${targetCount})`);
                
                await db.query(
                    'UPDATE habits SET completions_per_day = $1 WHERE id = $2 RETURNING *',
                    [targetCount, habit.id]
                );
                
                console.log(`Updated completions_per_day to ${targetCount}`);
            }
        }
        
        // 6. Get the updated habit
        const updatedHabitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habit.id]
        );
        
        console.log('Updated habit:', updatedHabitResult.rows[0]);
        console.log('Fix completed successfully!');
    } catch (error) {
        console.error('Error fixing Social Media Rejection habit:', error);
    } finally {
        process.exit();
    }
}

fixSocialMediaRejectionHabit();
