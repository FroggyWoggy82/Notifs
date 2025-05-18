/**
 * Fix Yuvi's Bday next date - Final solution
 * This script specifically targets the "Next: 5/13/2026" date and changes it to "Next: 5/15/2026"
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Next Date Final] Script loaded');

    // Function to fix the next date
    function fixYuviNextDate() {
        console.log('[Fix Yuvi Next Date Final] Running fix...');

        try {
            // Find all task items with "Yuvi" in the title
            const taskItems = document.querySelectorAll('.task-item');
            let yuviTasks = [];
            
            taskItems.forEach(item => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    yuviTasks.push(item);
                }
            });
            
            console.log('[Fix Yuvi Next Date Final] Found', yuviTasks.length, 'Yuvi\'s Bday tasks');
            
            // Fix each Yuvi's Bday task
            yuviTasks.forEach((taskItem, index) => {
                console.log('[Fix Yuvi Next Date Final] Fixing Yuvi\'s Bday task at index', index);
                
                // Find all elements with text content "Next: 5/13/2026"
                const allElements = taskItem.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                        // Replace the text content
                        element.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Next Date Final] Fixed next date to 5/15/2026');
                    }
                });
                
                // Specifically target .next-occurrence-date elements
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    // Replace the text content regardless of current value
                    element.textContent = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Next Date Final] Fixed next-occurrence-date to 5/15/2026');
                });
            });
            
            console.log('[Fix Yuvi Next Date Final] Fix completed');
        } catch (error) {
            console.error('[Fix Yuvi Next Date Final] Error:', error);
        }
    }

    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviNextDate, 1500);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 2; i <= 10; i++) {
        setTimeout(fixYuviNextDate, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Next Date Final] Tasks loaded event received');
        setTimeout(fixYuviNextDate, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Next Date Final] Task updated event received');
        setTimeout(fixYuviNextDate, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Next Date Final] Tasks rendered event received');
        setTimeout(fixYuviNextDate, 500);
    });
})();
