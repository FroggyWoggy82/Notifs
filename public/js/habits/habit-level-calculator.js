/**
 * Habit Level Calculator
 * This script provides functions to calculate the correct habit level
 * based on completions per day and total completions.
 */

// Calculate the correct level for a habit
function calculateCorrectLevel(totalCompletions) {
    // The level is simply the total completions
    return totalCompletions;
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateCorrectLevel };
}
