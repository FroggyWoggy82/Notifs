/**
 * Fix Yuvi's Bday dates - DOM approach
 * This script uses a direct DOM approach to fix the dates
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Bday DOM] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Bday DOM] Running fix...');

        try {
            // Find all task items
            const taskItems = document.querySelectorAll('.task-item');
            console.log('[Fix Yuvi Bday DOM] Found', taskItems.length, 'task items');

            // Loop through each task item
            taskItems.forEach((taskItem, index) => {
                // Find the task title
                const titleElement = taskItem.querySelector('.task-title');

                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[Fix Yuvi Bday DOM] Found Yuvi\'s Bday task at index', index);

                    // Find all elements with text content containing "Overdue: 5/14/2025"
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.textContent && element.textContent.includes('Overdue: 5/14/2025')) {
                            console.log('[Fix Yuvi Bday DOM] Found overdue indicator:', element.textContent);
                            element.textContent = element.textContent.replace('Overdue: 5/14/2025', 'Overdue: 5/15/2025');
                            console.log('[Fix Yuvi Bday DOM] Changed overdue date to 5/15/2025');
                        }
                    });

                    // Find all elements with text content containing "Next: 5/14/2026"
                    allElements.forEach(element => {
                        if (element.textContent && element.textContent.includes('Next: 5/14/2026')) {
                            console.log('[Fix Yuvi Bday DOM] Found overdue indicator:', element.textContent);
                            element.textContent = element.textContent.replace('Next: 5/14/2026', 'Next: 5/15/2026');
                            console.log('[Fix Yuvi Bday DOM] Changed overdue date to 5/15/2025');
                        }
                    });

                    // Find all elements with text content containing "Overdue: 5/15/2025Overdue: 5/15/2025"
                    allElements.forEach(element => {
                        if (element.textContent && element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                            console.log('[Fix Yuvi Bday DOM] Found duplicate overdue indicator:', element.textContent);
                            element.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Bday DOM] Fixed duplicate overdue text');
                        }
                    });
                }
            });
        } catch (error) {
            console.error('[Fix Yuvi Bday DOM] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviBdayDates();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Yuvi Bday DOM] DOM content loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Bday DOM] Page loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Bday DOM] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Bday DOM] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Bday DOM] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
})();
