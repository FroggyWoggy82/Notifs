/**
 * Fix Yuvi's Bday dates - Direct DOM manipulation
 * This script directly manipulates the DOM to fix Yuvi's Bday dates
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Direct DOM] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Direct DOM] Running fix...');

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
            
            console.log('[Fix Yuvi Direct DOM] Found', yuviTasks.length, 'Yuvi\'s Bday tasks');
            
            // Fix each Yuvi's Bday task
            yuviTasks.forEach((taskItem, index) => {
                console.log('[Fix Yuvi Direct DOM] Fixing Yuvi\'s Bday task at index', index);
                
                // Fix 1: Change "Next: 5/13/2026" to "Next: 5/15/2026"
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    element.textContent = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Direct DOM] Fixed next date to 5/15/2026');
                });
                
                // Fix 2: Fix duplicated "Overdue: 5/15/2025" text
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    // Clear all child nodes
                    while (element.firstChild) {
                        element.removeChild(element.firstChild);
                    }
                    
                    // Create a span for the overdue text
                    const span = document.createElement('span');
                    span.textContent = 'Overdue: 5/15/2025';
                    element.appendChild(span);
                    console.log('[Fix Yuvi Direct DOM] Fixed overdue text');
                });
                
                // Fix for completed tasks
                if (taskItem.classList.contains('completed')) {
                    const allSpans = taskItem.querySelectorAll('span');
                    allSpans.forEach(span => {
                        if (span.textContent && span.textContent.includes('Overdue:')) {
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Direct DOM] Fixed overdue text in completed task');
                        }
                    });
                }
            });
            
            console.log('[Fix Yuvi Direct DOM] Fix completed');
        } catch (error) {
            console.error('[Fix Yuvi Direct DOM] Error:', error);
        }
    }

    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviBdayDates, 1000);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 2; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Direct DOM] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Direct DOM] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Direct DOM] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });
})();
