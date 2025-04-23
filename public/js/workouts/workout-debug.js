/**
 * Workout Debug Script
 * This script adds diagnostic functions to help debug workout data persistence issues
 */

// Add this to the window object so we can call it from the console
window.debugWorkoutStorage = function() {
    console.group('🔍 WORKOUT STORAGE DEBUG');

    // Check all localStorage keys
    console.log('All localStorage keys:');
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
    }
    console.table(allKeys);

    // Check specific workout keys
    const workoutKeys = [
        'workout_tracker_current_workout',
        'workout_tracker_input_values',
        'workout_tracker_timer',
        'workout_tracker_data'
    ];

    console.log('Workout specific localStorage values:');
    const workoutValues = {};

    workoutKeys.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            workoutValues[key] = {
                exists: value !== null,
                isEmpty: value === '',
                isJSON: value && (value.startsWith('{') || value.startsWith('[')),
                length: value ? value.length : 0,
                value: value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : null
            };

            if (workoutValues[key].isJSON) {
                try {
                    const parsed = JSON.parse(value);
                    workoutValues[key].parsedType = Array.isArray(parsed) ? 'array' : 'object';
                    workoutValues[key].parsedLength = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
                    workoutValues[key].parsedPreview = JSON.stringify(parsed, null, 2).substring(0, 200) + '...';
                } catch (e) {
                    workoutValues[key].parseError = e.message;
                }
            }
        } catch (e) {
            workoutValues[key] = { error: e.message };
        }
    });

    console.table(workoutValues);

    // Check DOM state
    console.log('Current DOM state:');
    const domState = {
        currentPage: window.currentPage || 'unknown',
        exerciseItemsCount: document.querySelectorAll('.exercise-item').length,
        setRowsCount: document.querySelectorAll('.set-row').length,
        weightInputsCount: document.querySelectorAll('.weight-input').length,
        repsInputsCount: document.querySelectorAll('.reps-input').length,
        completedSetsCount: document.querySelectorAll('.set-complete-toggle.completed').length
    };

    console.table(domState);

    console.groupEnd();

    return 'Debug information logged to console.';
};

// Add debug functions to window object but don't auto-run
window.saveAllInputsNow = function() {
    if (typeof saveWorkoutData === 'function') {
        console.log('Manually saving workout data...');
        return saveWorkoutData();
    } else {
        console.error('saveWorkoutData function not found');
        return false;
    }
};

window.restoreAllInputsNow = function() {
    if (typeof restoreWorkoutData === 'function') {
        console.log('Manually restoring workout data...');
        return restoreWorkoutData();
    } else {
        console.error('restoreWorkoutData function not found');
        return false;
    }
};
