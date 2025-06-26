/**
 * Habit Checkbox Persistence Fix
 * This script ensures that habit checkboxes maintain their state and don't randomly uncheck
 * It addresses the issue where habits would lose their checked state during the day
 */

console.log('[Habit Checkbox Persistence] Loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Checkbox Persistence] Initializing...');
    
    // Store habit states in memory to prevent loss
    let habitStates = new Map();
    
    // Function to save current habit states
    function saveHabitStates() {
        const habitElements = document.querySelectorAll('.habit-item');
        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            const checkbox = habitElement.querySelector('.habit-checkbox');
            
            if (habitId && checkbox) {
                const state = {
                    checked: checkbox.checked,
                    dataCompleted: checkbox.getAttribute('data-completed'),
                    timestamp: Date.now()
                };
                habitStates.set(habitId, state);
                console.log(`[Habit Checkbox Persistence] Saved state for habit ${habitId}: checked=${state.checked}`);
            }
        });
    }
    
    // Function to restore habit states
    function restoreHabitStates() {
        const habitElements = document.querySelectorAll('.habit-item');
        let restoredCount = 0;
        
        habitElements.forEach(habitElement => {
            const habitId = habitElement.dataset.habitId;
            const checkbox = habitElement.querySelector('.habit-checkbox');
            
            if (habitId && checkbox && habitStates.has(habitId)) {
                const savedState = habitStates.get(habitId);
                
                // Only restore if the saved state is from the same calendar day
                const savedDate = new Date(savedState.timestamp);
                const currentDate = new Date();

                // Get Central Time dates for comparison
                const savedCentralDate = new Date(savedDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
                const currentCentralDate = new Date(currentDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

                // Check if both dates are on the same calendar day
                const isSameDay = (
                    savedCentralDate.getFullYear() === currentCentralDate.getFullYear() &&
                    savedCentralDate.getMonth() === currentCentralDate.getMonth() &&
                    savedCentralDate.getDate() === currentCentralDate.getDate()
                );
                
                if (isSameDay && checkbox.checked !== savedState.checked) {
                    console.log(`[Habit Checkbox Persistence] Restoring habit ${habitId}: ${checkbox.checked} -> ${savedState.checked}`);
                    checkbox.checked = savedState.checked;
                    checkbox.setAttribute('data-completed', savedState.dataCompleted || 'false');
                    
                    // Update visual state
                    if (savedState.checked) {
                        habitElement.classList.add('complete');
                        habitElement.dataset.completed = 'true';
                    } else {
                        habitElement.classList.remove('complete');
                        habitElement.dataset.completed = 'false';
                    }
                    
                    restoredCount++;
                }
            }
        });
        
        if (restoredCount > 0) {
            console.log(`[Habit Checkbox Persistence] Restored ${restoredCount} habit states`);
        }
    }
    
    // Save states whenever a checkbox is clicked
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('habit-checkbox')) {
            setTimeout(saveHabitStates, 100); // Small delay to ensure state is updated
        }
    });
    
    // Override the displayHabits function to restore states after rendering
    function waitForDisplayHabits() {
        if (typeof window.displayHabits === 'function') {
            const originalDisplayHabits = window.displayHabits;
            
            window.displayHabits = function(...args) {
                console.log('[Habit Checkbox Persistence] displayHabits called, will restore states after rendering');
                
                // Call the original function
                const result = originalDisplayHabits.apply(this, args);
                
                // Restore states after a short delay
                setTimeout(() => {
                    restoreHabitStates();
                }, 200);
                
                return result;
            };
            
            console.log('[Habit Checkbox Persistence] Successfully overrode displayHabits function');
        } else {
            setTimeout(waitForDisplayHabits, 100);
        }
    }
    
    // Override the loadHabits function to save states before reloading
    function waitForLoadHabits() {
        if (typeof window.loadHabits === 'function') {
            const originalLoadHabits = window.loadHabits;
            
            window.loadHabits = async function(...args) {
                console.log('[Habit Checkbox Persistence] loadHabits called, saving current states');
                
                // Save current states before loading
                saveHabitStates();
                
                // Call the original function
                const result = await originalLoadHabits.apply(this, args);
                
                return result;
            };
            
            console.log('[Habit Checkbox Persistence] Successfully overrode loadHabits function');
        } else {
            setTimeout(waitForLoadHabits, 100);
        }
    }
    
    // Start the override process
    waitForDisplayHabits();
    waitForLoadHabits();
    
    // Save initial states
    setTimeout(saveHabitStates, 1000);
    
    // Periodically save states (but not too frequently)
    setInterval(saveHabitStates, 30000); // Every 30 seconds
    
    // Save states when the page is about to be hidden/unloaded
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            saveHabitStates();
        }
    });
    
    window.addEventListener('beforeunload', saveHabitStates);
    
    // Expose functions for debugging
    window.debugHabitPersistence = {
        saveStates: saveHabitStates,
        restoreStates: restoreHabitStates,
        getStates: () => habitStates,
        clearStates: () => habitStates.clear()
    };
    
    console.log('[Habit Checkbox Persistence] Initialization complete');
});

console.log('[Habit Checkbox Persistence] Script loaded');
