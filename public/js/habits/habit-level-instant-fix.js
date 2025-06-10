/**
 * Instant Habit Level Flash Fix
 * This script runs a very fast interval to immediately correct any Level 1 or Level 0 flashes
 */

console.log('[Instant Flash Fix] Starting instant flash correction...');

// Run a very fast check every 10ms to catch and fix flashes immediately
const instantFix = setInterval(() => {
    const levelElements = document.querySelectorAll('.habit-level');
    
    levelElements.forEach(levelEl => {
        const currentText = levelEl.textContent;
        
        // If we see Level 1 or Level 0, check if it should be higher
        if (currentText === 'Level 1' || currentText === 'Level 0') {
            const titleText = levelEl.title || '';
            const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
            
            if (totalCompletionsMatch) {
                const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                
                // If the title says more than 1 completion but we're showing Level 1 or 0, fix it
                if (totalCompletions > 1) {
                    console.log(`[Instant Flash Fix] INSTANT CORRECTION: ${currentText} -> Level ${totalCompletions}`);
                    levelEl.textContent = `Level ${totalCompletions}`;
                }
            }
        }
    });
}, 10); // Check every 10 milliseconds

// Stop the instant fix after 30 seconds to avoid performance issues
setTimeout(() => {
    clearInterval(instantFix);
    console.log('[Instant Flash Fix] Instant fix interval stopped after 30 seconds');
    
    // Continue with a slower periodic check
    setInterval(() => {
        const levelElements = document.querySelectorAll('.habit-level');
        
        levelElements.forEach(levelEl => {
            const currentText = levelEl.textContent;
            
            if (currentText === 'Level 1' || currentText === 'Level 0') {
                const titleText = levelEl.title || '';
                const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
                
                if (totalCompletionsMatch) {
                    const totalCompletions = parseInt(totalCompletionsMatch[1], 10);
                    if (totalCompletions > 1) {
                        console.log(`[Instant Flash Fix] Periodic correction: ${currentText} -> Level ${totalCompletions}`);
                        levelEl.textContent = `Level ${totalCompletions}`;
                    }
                }
            }
        });
    }, 1000);
}, 30000);
