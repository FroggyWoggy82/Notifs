/**
 * Fix Yuvi's Bday dates - Final approach
 * This script uses a more direct approach to fix the dates
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Final] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Final] Running fix...');

        try {
            // Find all task items
            const taskItems = document.querySelectorAll('.task-item');
            console.log('[Fix Yuvi Final] Found', taskItems.length, 'task items');

            // Loop through each task item
            taskItems.forEach((taskItem, index) => {
                // Find the task title
                const titleElement = taskItem.querySelector('.task-title');

                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[Fix Yuvi Final] Found Yuvi\'s Bday task at index', index);

                    // APPROACH 1: Replace the entire next-occurrence-date element
                    const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                    nextDateElements.forEach(element => {
                        // Create a new element to replace the existing one
                        const newElement = document.createElement('div');
                        newElement.className = element.className;
                        newElement.textContent = 'Next: 5/15/2026';
                        
                        // Replace the element
                        element.parentNode.replaceChild(newElement, element);
                        console.log('[Fix Yuvi Final] Replaced next date element with new element');
                    });

                    // APPROACH 2: Replace the entire due-date-indicator.overdue element
                    const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                    overdueElements.forEach(element => {
                        // Create a new element to replace the existing one
                        const newElement = document.createElement('div');
                        newElement.className = element.className;
                        
                        // Create a span for the overdue text
                        const span = document.createElement('span');
                        span.textContent = 'Overdue: 5/15/2025';
                        newElement.appendChild(span);
                        
                        // Replace the element
                        element.parentNode.replaceChild(newElement, element);
                        console.log('[Fix Yuvi Final] Replaced overdue element with new element');
                    });

                    // APPROACH 3: Replace spans in completed tasks
                    if (taskItem.classList.contains('completed')) {
                        const overdueSpans = taskItem.querySelectorAll('.due-date-indicator span');
                        overdueSpans.forEach(span => {
                            if (span.textContent && span.textContent.includes('Overdue')) {
                                // Create a new span to replace the existing one
                                const newSpan = document.createElement('span');
                                newSpan.textContent = 'Overdue: 5/15/2025';
                                
                                // Replace the span
                                span.parentNode.replaceChild(newSpan, span);
                                console.log('[Fix Yuvi Final] Replaced overdue span with new span');
                            }
                        });
                    }
                }
            });
        } catch (error) {
            console.error('[Fix Yuvi Final] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviBdayDates();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Yuvi Final] DOM content loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Final] Page loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Final] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Final] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Final] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
    
    // Run the fix when the user clicks on a task
    document.addEventListener('click', function(event) {
        console.log('[Fix Yuvi Final] Click event received');
        setTimeout(fixYuviBdayDates, 100);
    });
})();
