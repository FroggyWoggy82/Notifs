/**
 * Ultimate Habit Level Flash Fix
 * This script completely prevents any level flashing by intercepting ALL textContent changes
 * to habit level elements and filtering out unwanted "Level 1" or "Level 0" values.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Ultimate Habit Level Fix] Initializing comprehensive flash prevention...');
    
    // Store original textContent descriptor
    const originalTextContentDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'textContent');
    const originalSetter = originalTextContentDescriptor.set;
    
    // Override textContent setter for all elements
    Object.defineProperty(Element.prototype, 'textContent', {
        set: function(value) {
            // Only intercept for habit level elements
            if (this.classList && this.classList.contains('habit-level')) {
                const currentValue = this.textContent;
                
                // If trying to set to Level 1 or Level 0, check if we should prevent it
                if ((value === 'Level 1' || value === 'Level 0') && 
                    currentValue && currentValue !== 'Level 1' && currentValue !== 'Level 0') {
                    
                    const currentLevelMatch = currentValue.match(/Level (\d+)/);
                    const currentLevel = currentLevelMatch ? parseInt(currentLevelMatch[1], 10) : 0;
                    
                    // Only prevent if the current level is higher than what we're trying to set
                    if (currentLevel > 1) {
                        console.log(`[Ultimate Habit Level Fix] Prevented flash: ${currentValue} -> ${value}`);
                        
                        // Store the attempted value for later correction
                        this.setAttribute('data-attempted-level', value);
                        
                        // Don't change the text, keep the current level
                        return;
                    }
                }
                
                // For all other cases, proceed normally
                originalSetter.call(this, value);
                
                // If we just set a proper level, clear any attempted level
                if (value && value.match(/Level \d+/) && !value.match(/Level [01]$/)) {
                    this.removeAttribute('data-attempted-level');
                }
            } else {
                // For non-habit-level elements, proceed normally
                originalSetter.call(this, value);
            }
        },
        get: originalTextContentDescriptor.get,
        configurable: true
    });
    
    // Add periodic correction for any levels that might have slipped through
    setInterval(() => {
        const levelElements = document.querySelectorAll('.habit-level');
        levelElements.forEach(levelEl => {
            const currentText = levelEl.textContent;
            
            // If we see Level 1 or Level 0, try to correct it
            if (currentText === 'Level 1' || currentText === 'Level 0') {
                // Check if we have title information to correct it
                const titleText = levelEl.title || '';
                const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
                
                if (totalCompletionsMatch) {
                    const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                    if (totalCompletions > 1) {
                        console.log(`[Ultimate Habit Level Fix] Periodic correction: ${currentText} -> Level ${totalCompletions}`);
                        
                        // Use the original setter to bypass our override
                        originalSetter.call(levelEl, `Level ${totalCompletions}`);
                    }
                }
            }
        });
    }, 500);
    
    // Add CSS to make any remaining flashes invisible
    const style = document.createElement('style');
    style.textContent = `
        /* Hide any Level 1 or Level 0 that might slip through */
        .habit-level {
            transition: all 0.1s ease !important;
        }
        
        /* Temporarily hide elements showing Level 1 or Level 0 when they shouldn't */
        .habit-level[title*="total completions"]:not([title^="1 total"]):not([title^="0 total"]) {
            position: relative;
        }
        
        .habit-level[title*="total completions"]:not([title^="1 total"]):not([title^="0 total"])::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: inherit;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.1s ease;
        }
        
        /* Show overlay when text is Level 1 or Level 0 but title indicates higher */
        .habit-level[title*="total completions"]:not([title^="1 total"]):not([title^="0 total"]):has-text("Level 1")::after,
        .habit-level[title*="total completions"]:not([title^="1 total"]):not([title^="0 total"]):has-text("Level 0")::after {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[Ultimate Habit Level Fix] Comprehensive flash prevention active');
});

// Also add a global function to manually fix any habit levels
window.fixAllHabitLevels = function() {
    console.log('[Ultimate Habit Level Fix] Manual fix triggered');
    
    const levelElements = document.querySelectorAll('.habit-level');
    let fixedCount = 0;
    
    levelElements.forEach(levelEl => {
        const currentText = levelEl.textContent;
        const titleText = levelEl.title || '';
        const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
        
        if (totalCompletionsMatch) {
            const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
            const expectedText = `Level ${totalCompletions}`;
            
            if (currentText !== expectedText) {
                console.log(`[Ultimate Habit Level Fix] Manual fix: ${currentText} -> ${expectedText}`);
                levelEl.textContent = expectedText;
                fixedCount++;
            }
        }
    });
    
    console.log(`[Ultimate Habit Level Fix] Manual fix complete. Fixed ${fixedCount} levels.`);
    return fixedCount;
};
