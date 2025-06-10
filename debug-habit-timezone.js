const db = require('./utils/db');

async function debugHabitTimezone() {
    try {
        console.log('=== HABIT TIMEZONE DEBUG ===\n');
        
        // Get current time info
        const now = new Date();
        console.log('Current UTC time:', now.toISOString());
        console.log('Current Central time:', now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
        
        // Different date calculation methods
        const utcDate = now.toISOString().split('T')[0];
        console.log('UTC-based date (toISOString):', utcDate);
        
        const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
        const centralYear = centralTime.getFullYear();
        const centralMonth = String(centralTime.getMonth() + 1).padStart(2, '0');
        const centralDay = String(centralTime.getDate()).padStart(2, '0');
        const centralDate = `${centralYear}-${centralMonth}-${centralDay}`;
        console.log('Central-based date (old method):', centralDate);
        
        // New correct method
        const centralTimeString = now.toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const [month, day, year] = centralTimeString.split('/');
        const newCentralDate = `${year}-${month}-${day}`;
        console.log('Central-based date (new method):', newCentralDate);
        
        console.log('\n=== HABIT 1 DATABASE STATE ===\n');
        
        // Check habit 1 details
        const habitResult = await db.query('SELECT * FROM habits WHERE id = 1');
        if (habitResult.rows.length > 0) {
            const habit = habitResult.rows[0];
            console.log('Habit details:', {
                id: habit.id,
                title: habit.title,
                total_completions: habit.total_completions
            });
        }
        
        // Check all completions for habit 1 (including soft-deleted)
        const allCompletionsResult = await db.query(
            'SELECT * FROM habit_completions WHERE habit_id = 1 ORDER BY created_at DESC LIMIT 20'
        );
        console.log('\nLast 20 completions for habit 1 (including deleted):');
        allCompletionsResult.rows.forEach((completion, index) => {
            const isDeleted = completion.deleted_at ? ' [DELETED]' : '';
            console.log(`${index + 1}. ID: ${completion.id}, Date: ${completion.completion_date || completion.completed_at}, Created: ${completion.created_at}, Deleted: ${completion.deleted_at || 'NULL'}${isDeleted}`);
        });

        // Check for today's completions including deleted ones
        console.log('\n=== TODAY\'S COMPLETIONS (INCLUDING DELETED) ===\n');
        const todayAllResult = await db.query(
            'SELECT * FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 ORDER BY created_at DESC',
            [utcDate]
        );
        console.log(`All completions for today (${utcDate}):`);
        if (todayAllResult.rows.length === 0) {
            console.log('No completions found for today.');
        } else {
            todayAllResult.rows.forEach((completion, index) => {
                const isDeleted = completion.deleted_at ? ' [DELETED]' : '';
                console.log(`${index + 1}. ID: ${completion.id}, Created: ${completion.created_at}, Deleted: ${completion.deleted_at || 'NULL'}${isDeleted}`);
            });
        }
        
        // Check completions for different date formats
        console.log('\n=== COMPLETION COUNTS BY DATE FORMAT ===\n');
        
        // UTC-based count
        const utcCountResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 AND deleted_at IS NULL',
            [utcDate]
        );
        console.log(`UTC date (${utcDate}) completions:`, utcCountResult.rows[0].count);
        
        // Central-based count (old method)
        const centralCountResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 AND deleted_at IS NULL',
            [centralDate]
        );
        console.log(`Central date old (${centralDate}) completions:`, centralCountResult.rows[0].count);
        
        // Central-based count (new method)
        const newCentralCountResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 AND deleted_at IS NULL',
            [newCentralDate]
        );
        console.log(`Central date new (${newCentralDate}) completions:`, newCentralCountResult.rows[0].count);
        
        // Check if there are completions for yesterday or tomorrow
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        
        const yesterdayCountResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 AND deleted_at IS NULL',
            [yesterdayDate]
        );
        console.log(`Yesterday (${yesterdayDate}) completions:`, yesterdayCountResult.rows[0].count);
        
        const tomorrowCountResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = 1 AND completion_date = $1 AND deleted_at IS NULL',
            [tomorrowDate]
        );
        console.log(`Tomorrow (${tomorrowDate}) completions:`, tomorrowCountResult.rows[0].count);
        
        console.log('\n=== ANALYSIS ===\n');
        
        if (utcDate !== centralDate || utcDate !== newCentralDate) {
            console.log('❌ TIMEZONE MISMATCH DETECTED!');
            console.log('This explains why habits appear unchecked after being completed.');
        } else {
            console.log('✅ No timezone mismatch detected.');
        }
        
    } catch (error) {
        console.error('Error debugging habit timezone:', error);
    } finally {
        process.exit(0);
    }
}

debugHabitTimezone();
