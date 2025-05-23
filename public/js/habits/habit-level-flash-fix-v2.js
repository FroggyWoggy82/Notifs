/**
 * Habit Level Flash Fix V2
 * 
 * This script fixes the issue where habit levels flash to level 1 before showing the true level
 * when a habit is checked. It ensures the level is updated correctly without flashing.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Flash Fix V2] Initializing...');
    
    // Function to patch the habit level display
    function patchHabitLevelDisplay() {
        // Find all habit level elements
        const habitLevelElements = document.querySelectorAll('.habit-level');
        
        // For each habit level element, override its setter for textContent
        habitLevelElements.forEach(levelElement => {
            const habitElement = levelElement.closest('.habit-item');
            if (!habitElement) return;
            
            const habitId = habitElement.dataset.habitId;
            if (!habitId) return;
            
            // Store the original textContent value
            const originalTextContent = levelElement.textContent;
            const originalTitle = levelElement.title;
            
            // Extract the current level
            const levelMatch = originalTextContent.match(/Level (\d+)/);
            if (!levelMatch) return;
            
            const currentLevel = parseInt(levelMatch[1], 10);
            console.log(`[Habit Level Flash Fix V2] Found habit ${habitId} with level ${currentLevel}`);
            
            // Override the textContent setter
            Object.defineProperty(levelElement, 'textContent', {
                set: function(newValue) {
                    // If the new value is "Level 1", ignore it
                    if (newValue === 'Level 1' && currentLevel > 1) {
                        console.log(`[Habit Level Flash Fix V2] Prevented level flash to Level 1 for habit ${habitId}`);
                        return;
                    }
                    
                    // Otherwise, set the value normally
                    Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set.call(this, newValue);
                },
                get: function() {
                    return Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get.call(this);
                }
            });
        });
    }
    
    // Apply the patch when habits are loaded
    const originalDisplayHabits = window.displayHabits;
    if (originalDisplayHabits) {
        window.displayHabits = function(...args) {
            const result = originalDisplayHabits.apply(this, args);
            
            // Apply the patch after a short delay to ensure all elements are rendered
            setTimeout(patchHabitLevelDisplay, 100);
            
            return result;
        };
        
        console.log('[Habit Level Flash Fix V2] Successfully patched displayHabits function');
    }
    
    // Also apply the patch periodically to catch any newly added habits
    setInterval(patchHabitLevelDisplay, 2000);
    
    // Apply the patch immediately
    setTimeout(patchHabitLevelDisplay, 500);
    setTimeout(patchHabitLevelDisplay, 1000);
    
    console.log('[Habit Level Flash Fix V2] Initialization complete');
});
