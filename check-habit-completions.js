// Script to check the total completions for the Social Media Rejection habit
const db = require('./db');

async function checkHabitCompletions() {
    try {
        console.log('Connecting to database...');
        
        // Get the habit data
        const habitResult = await db.query(
            'SELECT id, title, total_completions FROM habits WHERE title LIKE $1',
            ['Social Media Rejection%']
        );
        
        if (habitResult.rows.length === 0) {
            console.log('No habit found with title "Social Media Rejection"');
            return;
        }
        
        const habit = habitResult.rows[0];
        console.log('Habit data:', habit);
        
        // Get all completions for this habit
        const completionsResult = await db.query(
            'SELECT COUNT(*) as completion_count FROM habit_completions WHERE habit_id = $1',
            [habit.id]
        );
        
        const completionCount = parseInt(completionsResult.rows[0].completion_count, 10);
        console.log(`Total completions in habit_completions table: ${completionCount}`);
        
        // Calculate what the level should be
        const calculatedLevel = Math.max(1, Math.floor((habit.total_completions || 0) / 5) + 1);
        console.log(`Current total_completions: ${habit.total_completions}, Calculated level: ${calculatedLevel}`);
        
        // Get daily completions
        const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const todayResult = await db.query(
            'SELECT COUNT(*) as today_count FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habit.id, todayKey]
        );
        
        const todayCount = parseInt(todayResult.rows[0].today_count, 10);
        console.log(`Completions today (${todayKey}): ${todayCount}`);
        
    } catch (err) {
        console.error('Error checking habit completions:', err);
    } finally {
        process.exit();
    }
}

checkHabitCompletions();
