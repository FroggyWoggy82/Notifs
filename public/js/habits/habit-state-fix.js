/**
 * Habit State Fix
 * This script ensures habit checkbox states are properly maintained and refreshed
 * Fixes the issue where completed habits show as unchecked
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit State Fix] Initializing...');
    
    // Wait for the main habit loading function to be available
    function waitForHabitFunctions() {
        if (typeof window.loadHabits !== 'function') {
            console.log('[Habit State Fix] Waiting for loadHabits function...');
            setTimeout(waitForHabitFunctions, 100);
            return;
        }
        
        console.log('[Habit State Fix] Found loadHabits function, setting up fixes...');
        setupHabitStateFix();
    }
    
    function setupHabitStateFix() {
        // 1. Override the habit completion handler to ensure proper state persistence
        if (typeof window.handleHabitCheckboxClick === 'function') {
            const originalHandleHabitCheckboxClick = window.handleHabitCheckboxClick;
            
            window.handleHabitCheckboxClick = async function(habitId, isChecked) {
                console.log(`[Habit State Fix] Handling habit ${habitId} checkbox click: ${isChecked}`);
                
                try {
                    // Store the intended state before API call
                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            // Store the intended state
                            checkbox.setAttribute('data-intended-state', isChecked ? 'true' : 'false');
                            console.log(`[Habit State Fix] Stored intended state for habit ${habitId}: ${isChecked}`);
                        }
                    }
                    
                    // Call the original function
                    await originalHandleHabitCheckboxClick(habitId, isChecked);
                    
                    // Verify the state was properly saved by refreshing after a short delay
                    setTimeout(() => {
                        console.log(`[Habit State Fix] Verifying state for habit ${habitId}...`);
                        verifyHabitState(habitId, isChecked);
                    }, 1000);
                    
                } catch (error) {
                    console.error(`[Habit State Fix] Error handling habit ${habitId}:`, error);
                    
                    // Revert checkbox state on error
                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = !isChecked;
                            console.log(`[Habit State Fix] Reverted checkbox state for habit ${habitId}`);
                        }
                    }
                }
            };
            
            console.log('[Habit State Fix] Enhanced handleHabitCheckboxClick function');
        }
        
        // 2. Add a function to verify habit state against server
        window.verifyHabitState = async function(habitId, expectedState) {
            try {
                console.log(`[Habit State Fix] Verifying habit ${habitId} state...`);
                
                const response = await fetch(`/api/habits/${habitId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const habit = await response.json();
                const completionsToday = parseInt(habit.completions_today, 10) || 0;
                const completionsTarget = parseInt(habit.completions_per_day, 10) || 1;
                const shouldBeChecked = completionsToday >= completionsTarget;
                
                console.log(`[Habit State Fix] Server state for habit ${habitId}:`, {
                    completions_today: completionsToday,
                    completions_target: completionsTarget,
                    should_be_checked: shouldBeChecked,
                    expected_state: expectedState
                });
                
                // Update UI if there's a mismatch
                const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                if (habitElement) {
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox && checkbox.checked !== shouldBeChecked) {
                        console.log(`[Habit State Fix] Correcting checkbox state for habit ${habitId}: ${checkbox.checked} -> ${shouldBeChecked}`);
                        checkbox.checked = shouldBeChecked;
                        checkbox.setAttribute('data-completed', shouldBeChecked ? 'true' : 'false');
                        
                        // Update visual state
                        if (shouldBeChecked) {
                            habitElement.classList.add('complete');
                            habitElement.dataset.completed = 'true';
                        } else {
                            habitElement.classList.remove('complete');
                            habitElement.dataset.completed = 'false';
                        }
                    }
                    
                    // Update level display
                    const levelElement = habitElement.querySelector('.habit-level');
                    if (levelElement && habit.total_completions) {
                        const currentLevel = levelElement.textContent.replace('Level ', '');
                        if (parseInt(currentLevel, 10) !== habit.total_completions) {
                            console.log(`[Habit State Fix] Updating level for habit ${habitId}: ${currentLevel} -> ${habit.total_completions}`);
                            levelElement.textContent = `Level ${habit.total_completions}`;
                        }
                    }
                }
                
            } catch (error) {
                console.error(`[Habit State Fix] Error verifying habit ${habitId} state:`, error);
            }
        };
        
        // 3. Add periodic state verification for all habits
        function verifyAllHabitStates() {
            const habitElements = document.querySelectorAll('.habit-item[data-habit-id]');
            habitElements.forEach(habitElement => {
                const habitId = habitElement.dataset.habitId;
                const checkbox = habitElement.querySelector('.habit-checkbox');
                if (habitId && checkbox) {
                    // Only verify if the habit has an intended state or seems inconsistent
                    const intendedState = checkbox.getAttribute('data-intended-state');
                    if (intendedState || checkbox.checked) {
                        verifyHabitState(habitId, checkbox.checked);
                    }
                }
            });
        }
        
        // 4. Set up periodic verification (every 30 seconds)
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('[Habit State Fix] Performing periodic state verification...');
                verifyAllHabitStates();
            }
        }, 30000);
        
        // 5. Verify states when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[Habit State Fix] Page became visible, verifying states...');
                setTimeout(verifyAllHabitStates, 1000);
            }
        });
        
        // 6. Add a manual refresh function for debugging
        window.refreshHabitStates = function() {
            console.log('[Habit State Fix] Manual refresh requested...');
            verifyAllHabitStates();
        };
        
        console.log('[Habit State Fix] Setup complete!');
    }
    
    waitForHabitFunctions();
});

// Add CSS to highlight habits with state issues
const style = document.createElement('style');
style.textContent = `
    .habit-item[data-state-mismatch="true"] {
        border-left: 3px solid #ff6b6b !important;
        background-color: rgba(255, 107, 107, 0.1) !important;
    }
    
    .habit-item[data-state-verified="true"] {
        border-left: 3px solid #51cf66 !important;
    }
`;
document.head.appendChild(style);
