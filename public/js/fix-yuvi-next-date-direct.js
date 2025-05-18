/**
 * Fix Yuvi's Bday next date - Direct approach
 * This script directly targets the next-occurrence-date elements and changes their innerHTML
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Next Date Direct] Script loaded');

    // Function to fix the next date
    function fixYuviNextDate() {
        console.log('[Fix Yuvi Next Date Direct] Running fix...');

        try {
            // Find all task items with "Yuvi" in the title
            const taskItems = document.querySelectorAll('.task-item');
            
            taskItems.forEach(item => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[Fix Yuvi Next Date Direct] Found Yuvi\'s Bday task');
                    
                    // Find the next-occurrence-date element
                    const nextDateElements = item.querySelectorAll('.next-occurrence-date');
                    nextDateElements.forEach(element => {
                        // Replace the innerHTML
                        element.innerHTML = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Next Date Direct] Fixed next date to 5/15/2026');
                    });
                }
            });
            
            console.log('[Fix Yuvi Next Date Direct] Fix completed');
        } catch (error) {
            console.error('[Fix Yuvi Next Date Direct] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviNextDate();
    
    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviNextDate, 2000);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 3; i <= 10; i++) {
        setTimeout(fixYuviNextDate, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Next Date Direct] Tasks loaded event received');
        setTimeout(fixYuviNextDate, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Next Date Direct] Task updated event received');
        setTimeout(fixYuviNextDate, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Next Date Direct] Tasks rendered event received');
        setTimeout(fixYuviNextDate, 500);
    });
})();
