/**
 * Reset Habit Completions
 * This script resets the daily habit completions at midnight
 */

const db = require('../utils/db');

/**
 * Reset all habit completions for today
 * @returns {Promise<Object>} Result of the reset operation
 */
async function resetHabitCompletions() {
    console.log('Starting daily habit completion reset...');

    try {
        // Get today's date in YYYY-MM-DD format using Central Time
        const now = new Date();
        const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
        const year = centralTime.getFullYear();
        const month = String(centralTime.getMonth() + 1).padStart(2, '0');
        const day = String(centralTime.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        console.log(`Resetting habit completions for date: ${todayString}`);

        // Use simple queries instead of transactions to avoid issues
        const result = {
            date: todayString,
            timestamp: new Date().toISOString(),
            completionsDeleted: 0,
            habitsReset: 0,
            habitsResetDetails: []
        };

        try {
            // 1. Delete all habit completions for today
            console.log('Deleting all habit completions for today...');
            const deleteResult = await db.query(
                'DELETE FROM habit_completions WHERE completion_date = $1 RETURNING habit_id',
                [todayString]
            );

            result.completionsDeleted = deleteResult.rowCount;
            console.log(`Deleted ${deleteResult.rowCount} habit completions for today`);

            // 2. Get all habits to reset their daily progress
            console.log('Getting all habits...');
            const allHabitsResult = await db.query(
                'SELECT id, title, completions_per_day FROM habits'
            );

            console.log(`Found ${allHabitsResult.rowCount} habits to process`);

            // 3. Reset all habits (both counter habits and regular habits)
            for (const habit of allHabitsResult.rows) {
                try {
                    // For counter habits (those with pattern like (X/Y) in title)
                    const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                    if (counterMatch) {
                        const totalCount = parseInt(counterMatch[2], 10) || 0;
                        const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                        console.log(`Updating counter habit ${habit.id}: ${habit.title} -> ${newTitle}`);

                        await db.query(
                            'UPDATE habits SET title = $1 WHERE id = $2',
                            [newTitle, habit.id]
                        );

                        result.habitsReset++;
                        result.habitsResetDetails.push({
                            id: habit.id,
                            oldTitle: habit.title,
                            newTitle: newTitle,
                            type: 'counter'
                        });

                        console.log(`Reset counter for habit ${habit.id}: ${habit.title} -> ${newTitle}`);
                    } else {
                        // For regular habits, we don't need to update the title
                        // but we'll count them as reset for reporting purposes
                        result.habitsReset++;
                        result.habitsResetDetails.push({
                            id: habit.id,
                            title: habit.title,
                            type: 'regular'
                        });

                        console.log(`Processed regular habit ${habit.id}: ${habit.title}`);
                    }
                } catch (habitError) {
                    console.error(`Error processing habit ${habit.id}:`, habitError);
                    // Continue with other habits even if one fails
                }
            }

            console.log('Habit completion reset completed successfully!');
            return result;
        } catch (err) {
            console.error('Error during habit completion reset:', err);
            throw err;
        }
    } catch (err) {
        console.error('Error resetting habit completions:', err);
        throw err;
    }
}

// Export for use in cron job
module.exports = resetHabitCompletions;

// If this script is run directly, execute the reset
if (require.main === module) {
    resetHabitCompletions()
        .then(result => {
            console.log('Reset result:', result);
            process.exit(0);
        })
        .catch(err => {
            console.error('Reset failed:', err);
            process.exit(1);
        });
}
