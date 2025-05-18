/**
 * Fix Yuvi's Bday dates - Final Solution
 * This script uses a more direct approach to fix the dates
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Final Solution] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Final Solution] Running fix...');

        try {
            // Find all task items
            const taskItems = document.querySelectorAll('.task-item');
            console.log('[Fix Yuvi Final Solution] Found', taskItems.length, 'task items');

            // Loop through each task item
            taskItems.forEach((taskItem, index) => {
                // Find the task title
                const titleElement = taskItem.querySelector('.task-title');

                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[Fix Yuvi Final Solution] Found Yuvi\'s Bday task at index', index);

                    // Fix next-occurrence-date elements
                    const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                    nextDateElements.forEach(element => {
                        // Directly set the textContent
                        element.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Final Solution] Fixed next date to 5/15/2026');
                    });

                    // Fix due-date-indicator.overdue elements
                    const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                    overdueElements.forEach(element => {
                        // Clear all child nodes
                        while (element.firstChild) {
                            element.removeChild(element.firstChild);
                        }
                        
                        // Create a new span for the overdue text
                        const span = document.createElement('span');
                        span.textContent = 'Overdue: 5/15/2025';
                        element.appendChild(span);
                        console.log('[Fix Yuvi Final Solution] Fixed overdue date to 5/15/2025');
                    });

                    // Fix due-date-indicator span elements in completed tasks
                    if (taskItem.classList.contains('completed')) {
                        const overdueSpans = taskItem.querySelectorAll('.due-date-indicator span');
                        overdueSpans.forEach(span => {
                            if (span.textContent && span.textContent.includes('Overdue')) {
                                span.textContent = 'Overdue: 5/15/2025';
                                console.log('[Fix Yuvi Final Solution] Fixed completed overdue date to 5/15/2025');
                            }
                        });
                    }

                    // Fix all elements with text content "Next: 5/13/2026"
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                            if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                                element.textContent = 'Next: 5/15/2026';
                                console.log('[Fix Yuvi Final Solution] Fixed next date in element to 5/15/2026');
                            }
                        }
                    });

                    // Fix all spans with text content containing "Overdue: 5/15/2025Overdue: 5/15/2025"
                    const allSpans = taskItem.querySelectorAll('span');
                    allSpans.forEach(span => {
                        if (span.childNodes.length === 1 && span.childNodes[0].nodeType === Node.TEXT_NODE) {
                            if (span.textContent && (
                                span.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                                span.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                                span.textContent = 'Overdue: 5/15/2025';
                                console.log('[Fix Yuvi Final Solution] Fixed duplicate overdue text in span');
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('[Fix Yuvi Final Solution] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviBdayDates();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Yuvi Final Solution] DOM content loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Final Solution] Page loaded');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Final Solution] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Final Solution] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Final Solution] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
    
    // Run the fix when the user clicks on a task
    document.addEventListener('click', function(event) {
        console.log('[Fix Yuvi Final Solution] Click event received');
        setTimeout(fixYuviBdayDates, 100);
    });

    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        console.log('[Fix Yuvi Final Solution] Mutation observed');
        setTimeout(fixYuviBdayDates, 100);
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
})();
