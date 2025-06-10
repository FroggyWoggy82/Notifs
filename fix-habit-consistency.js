const db = require('./utils/db');

async function fixHabitConsistency() {
    try {
        console.log('=== HABIT CONSISTENCY CHECK & FIX ===\n');
        
        // Get all habits
        const habitsResult = await db.query('SELECT * FROM habits ORDER BY id');
        const habits = habitsResult.rows;
        
        console.log(`Checking ${habits.length} habits for consistency issues...\n`);
        
        let issuesFound = 0;
        let issuesFixed = 0;
        
        for (const habit of habits) {
            console.log(`Checking habit ${habit.id}: "${habit.title}"`);
            
            // Count actual completions in the database
            const actualCompletionsResult = await db.query(
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND deleted_at IS NULL',
                [habit.id]
            );
            const actualCompletions = parseInt(actualCompletionsResult.rows[0].count, 10);
            const storedCompletions = habit.total_completions || 0;
            
            console.log(`  Stored total_completions: ${storedCompletions}`);
            console.log(`  Actual completion records: ${actualCompletions}`);
            
            if (actualCompletions !== storedCompletions) {
                issuesFound++;
                console.log(`  ❌ INCONSISTENCY DETECTED!`);
                console.log(`  Difference: ${storedCompletions - actualCompletions}`);
                
                // Fix the inconsistency by updating the stored counter
                const updateResult = await db.query(
                    'UPDATE habits SET total_completions = $1 WHERE id = $2 RETURNING total_completions',
                    [actualCompletions, habit.id]
                );
                
                const newStoredCompletions = updateResult.rows[0].total_completions;
                console.log(`  ✅ FIXED: Updated total_completions from ${storedCompletions} to ${newStoredCompletions}`);
                issuesFixed++;
            } else {
                console.log(`  ✅ Consistent`);
            }
            
            // Check today's completions
            const today = new Date().toISOString().split('T')[0];
            const todayCompletionsResult = await db.query(
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                [habit.id, today]
            );
            const todayCompletions = parseInt(todayCompletionsResult.rows[0].count, 10);
            
            if (todayCompletions > 0) {
                console.log(`  📅 Today's completions: ${todayCompletions}/${habit.completions_per_day}`);
            }
            
            console.log('');
        }
        
        console.log('=== SUMMARY ===');
        console.log(`Total habits checked: ${habits.length}`);
        console.log(`Inconsistencies found: ${issuesFound}`);
        console.log(`Inconsistencies fixed: ${issuesFixed}`);
        
        if (issuesFound === 0) {
            console.log('✅ All habits are consistent!');
        } else if (issuesFixed === issuesFound) {
            console.log('✅ All inconsistencies have been fixed!');
        } else {
            console.log('⚠️  Some inconsistencies could not be fixed.');
        }
        
    } catch (error) {
        console.error('Error checking habit consistency:', error);
    } finally {
        process.exit(0);
    }
}

fixHabitConsistency();
