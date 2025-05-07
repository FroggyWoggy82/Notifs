/**
 * High Completion Habit Fix
 * 
 * This script adds special handling for habits with very high completion targets
 * (like "Thinking about food" with 999 completions per day)
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHighCompletionHabitFix);
    } else {
        initHighCompletionHabitFix();
    }

    const HIGH_COMPLETION_HABITS = [2]; // Habit ID 2 is "Thinking about food" with 999 completions per day

    function initHighCompletionHabitFix() {
        console.log('[High Completion Habit Fix] Initializing...');

        const originalHandleHabitIncrementClick = window.handleHabitIncrementClick;
        
        if (!originalHandleHabitIncrementClick) {
            console.error('[High Completion Habit Fix] Could not find handleHabitIncrementClick function');
            return;
        }
        
        window.handleHabitIncrementClick = async function(event) {
            const habitItem = event.currentTarget.closest('.habit-item');
            if (!habitItem) return;
            
            const habitId = habitItem.dataset.habitId;
            if (!habitId) return;

            if (HIGH_COMPLETION_HABITS.includes(parseInt(habitId, 10))) {
                console.log(`[High Completion Habit Fix] Using special handling for high-completion habit ${habitId}`);
                await handleHighCompletionHabitIncrement(habitId, habitItem);
            } else {

                await originalHandleHabitIncrementClick.call(this, event);
            }
        };
        
        console.log('[High Completion Habit Fix] Initialized successfully');
    }
    
    /**
     * Handle incrementing a high-completion habit
     * @param {string} habitId - The habit ID
     * @param {HTMLElement} habitItem - The habit item element
     */
    async function handleHighCompletionHabitIncrement(habitId, habitItem) {
        try {

            const progressDisplay = habitItem.querySelector('.habit-progress');
            if (!progressDisplay) return;

            const progressText = progressDisplay.textContent;
            const match = progressText.match(/(\d+)\/(\d+)/);
            if (!match) return;
            
            const currentCount = parseInt(match[1], 10);
            const targetCount = parseInt(match[2], 10);

            const newCount = currentCount + 1;
            progressDisplay.textContent = `${newCount}/${targetCount}`;

            const levelDisplay = habitItem.querySelector('.habit-level');
            if (levelDisplay) {
                const levelMatch = levelDisplay.textContent.match(/Level (\d+)/);
                if (levelMatch) {
                    const currentLevel = parseInt(levelMatch[1], 10);
                    const newLevel = currentLevel + 1;
                    levelDisplay.textContent = `Level ${newLevel}`;
                }
            }
            
            console.log(`[High Completion Habit Fix] Incrementing high-completion habit ${habitId} from ${currentCount} to ${newCount} (target: ${targetCount})`);

            console.log(`[High Completion Habit Fix] Sending high-completion increment request for habit ${habitId}`);
            
            const timestamp = Date.now();
            const response = await fetch(`/api/habits/${habitId}/high-completion-increment?_=${timestamp}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[High Completion Habit Fix] Error response from server: ${response.status} ${response.statusText}`);
                console.error(`[High Completion Habit Fix] Response body: ${errorText}`);

                progressDisplay.textContent = progressText;
                
                if (levelDisplay && levelMatch) {
                    levelDisplay.textContent = `Level ${levelMatch[1]}`;
                }
                
                throw new Error(`Server returned ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`[High Completion Habit Fix] Increment successful:`, result);

            progressDisplay.textContent = `${result.completions_today}/${targetCount}`;
            
            if (levelDisplay) {
                levelDisplay.textContent = `Level ${result.total_completions}`;
            }
        } catch (error) {
            console.error(`[High Completion Habit Fix] Error incrementing high-completion habit ${habitId}:`, error);

            try {
                const timestamp = Date.now();
                const response = await fetch(`/api/habits/${habitId}/high-completion-count?_=${timestamp}`);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`[High Completion Habit Fix] Fetched current habit data for ${habitId} after error:`, result);

                    if (progressDisplay) {
                        const match = progressDisplay.textContent.match(/\d+\/(\d+)/);
                        if (match) {
                            const targetCount = match[1];
                            progressDisplay.textContent = `${result.completions_today}/${targetCount}`;
                        }
                    }
                    
                    if (levelDisplay) {
                        console.log(`[High Completion Habit Fix] Updated level display to ${result.total_completions} level after error`);
                        levelDisplay.textContent = `Level ${result.total_completions}`;
                    }
                }
            } catch (fetchError) {
                console.error(`[High Completion Habit Fix] Error fetching habit data after increment error:`, fetchError);
            }
        }
    }
})();
