/**
 * Habit Level Simple Fix
 * 
 * This script fixes the issue where habit levels temporarily show level 1
 * when transitioning from the current level to the new level after completion.
 * It uses a simple approach to prevent the level from being set to level 1.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Habit Level Simple Fix] Initializing...');
    
    // Function to patch all habit level elements
    function patchHabitLevels() {
        // Find all habit level elements
        const habitLevelElements = document.querySelectorAll('.habit-level');
        
        habitLevelElements.forEach(function(levelElement) {
            // Skip if we've already patched this element
            if (levelElement.dataset.patched === 'true') {
                return;
            }
            
            // Mark as patched
            levelElement.dataset.patched = 'true';
            
            // Get the current level
            const currentText = levelElement.textContent || '';
            const levelMatch = currentText.match(/Level (\d+)/);
            if (!levelMatch) {
                return;
            }
            
            const currentLevel = parseInt(levelMatch[1], 10);
            
            // Store the original textContent setter
            const originalTextContentDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
            const originalSetter = originalTextContentDescriptor.set;
            
            // Override the textContent setter
            Object.defineProperty(levelElement, 'textContent', {
                set: function(value) {
                    // If the value is "Level 1" and the current level is higher, ignore it
                    if (value === 'Level 1' && currentLevel > 1) {
                        console.log(`[Habit Level Simple Fix] Prevented setting level to "Level 1" for a level ${currentLevel} habit`);
                        return;
                    }
                    
                    // For all other values, use the original setter
                    originalSetter.call(this, value);
                },
                get: originalTextContentDescriptor.get
            });
            
            console.log(`[Habit Level Simple Fix] Patched level element for level ${currentLevel}`);
        });
    }
    
    // Patch habit levels immediately
    patchHabitLevels();
    
    // Also patch habit levels periodically
    setInterval(patchHabitLevels, 1000);
    
    // And patch habit levels when the DOM changes
    const observer = new MutationObserver(function(mutations) {
        patchHabitLevels();
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('[Habit Level Simple Fix] Initialization complete');
});
