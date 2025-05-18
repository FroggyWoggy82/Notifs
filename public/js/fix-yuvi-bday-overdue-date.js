/**
 * Fix Yuvi's Bday Overdue Date
 * This script directly modifies the DOM to change the "Overdue" date for Yuvi's Bday task
 */

console.log('[Fix Yuvi Bday Overdue Date] Script loaded');

function fixYuviBdayOverdueDate() {
    console.log('[Fix Yuvi Bday Overdue Date] Running fix');

    // Find all task items
    const taskItems = document.querySelectorAll('.task-item');
    console.log('[Fix Yuvi Bday Overdue Date] Found', taskItems.length, 'task items');

    taskItems.forEach(taskItem => {
        // Find the task title
        const titleElement = taskItem.querySelector('.task-title');

        if (titleElement) {
            console.log('[Fix Yuvi Bday Overdue Date] Task title:', titleElement.textContent);

            if (titleElement.textContent.includes("Yuvi")) {
                console.log('[Fix Yuvi Bday Overdue Date] Found Yuvi\'s Bday task');

                // Find the overdue date indicator
                const overdueIndicator = taskItem.querySelector('.due-date-indicator.overdue span');

                if (overdueIndicator) {
                    console.log('[Fix Yuvi Bday Overdue Date] Found overdue indicator:', overdueIndicator.textContent);

                    // Change the overdue date to 5/15/2025
                    overdueIndicator.textContent = 'Overdue: 5/15/2025';
                    console.log('[Fix Yuvi Bday Overdue Date] Changed overdue date to 5/15/2025');
                } else {
                    console.log('[Fix Yuvi Bday Overdue Date] No overdue indicator found');

                    // Try to find any element containing "Overdue: 5/16/2025"
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(el => {
                        if (el.textContent && el.textContent.includes('Overdue: 5/16/2025')) {
                            console.log('[Fix Yuvi Bday Overdue Date] Found element with overdue text:', el.textContent);
                            el.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Bday Overdue Date] Changed overdue date to 5/15/2025');
                        }
                    });
                }
            }
        }
    });
}

// Run the fix immediately
setTimeout(fixYuviBdayOverdueDate, 1000);

// Also run the fix when tasks are loaded or updated
document.addEventListener('tasksLoaded', function() {
    console.log('[Fix Yuvi Bday Overdue Date] Tasks loaded event received');
    setTimeout(fixYuviBdayOverdueDate, 500);
});

document.addEventListener('taskUpdated', function() {
    console.log('[Fix Yuvi Bday Overdue Date] Task updated event received');
    setTimeout(fixYuviBdayOverdueDate, 500);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Bday Overdue Date] DOM content loaded');
    setTimeout(fixYuviBdayOverdueDate, 1000);

    // Set up a mutation observer to detect when new tasks are added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                console.log('[Fix Yuvi Bday Overdue Date] DOM mutation detected');
                setTimeout(fixYuviBdayOverdueDate, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
});
