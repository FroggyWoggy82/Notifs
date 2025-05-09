/**
 * Reset Habits Now
 * This script manually resets all habit completions immediately
 */

const resetHabitCompletions = require('./utils/reset-habit-completions');

console.log('Starting manual habit reset...');

resetHabitCompletions()
    .then(() => {
        console.log('Manual habit reset completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error in manual habit reset:', error);
        process.exit(1);
    });
