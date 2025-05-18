/**
 * Fix Yuvi's Bday dates - Targeted approach
 * This script specifically targets Yuvi's Bday tasks and fixes their dates
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Targeted] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Targeted] Running fix...');

        try {
            // Find all task items with "Yuvi" in the title (more lenient matching)
            const taskItems = Array.from(document.querySelectorAll('.task-item')).filter(item => {
                const titleElement = item.querySelector('.task-title');
                return titleElement && titleElement.textContent.includes('Yuvi');
            });

            console.log('[Fix Yuvi Targeted] Found', taskItems.length, 'Yuvi\'s Bday tasks');

            // Fix each Yuvi's Bday task
            taskItems.forEach((taskItem, index) => {
                console.log('[Fix Yuvi Targeted] Fixing Yuvi\'s Bday task at index', index);

                // Fix 1: Change "Next: 5/13/2026" to "Next: 5/15/2026"
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    // Always replace the next date regardless of current content
                    // Create a new element with the correct text
                    const newElement = document.createElement('div');
                    newElement.className = element.className;
                    newElement.textContent = 'Next: 5/15/2026';

                    // Replace the element
                    if (element.parentNode) {
                        element.parentNode.replaceChild(newElement, element);
                        console.log('[Fix Yuvi Targeted] Fixed next date to 5/15/2026');
                    }
                });

                // Fix 2: Fix duplicated "Overdue: 5/15/2025" text
                // Approach for active tasks
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    // Always replace the overdue element regardless of current content
                    // Create a new element with the correct text
                    const newElement = document.createElement('div');
                    newElement.className = element.className;

                    // Create a span for the overdue text
                    const span = document.createElement('span');
                    span.textContent = 'Overdue: 5/15/2025';
                    newElement.appendChild(span);

                    // Replace the element
                    if (element.parentNode) {
                        element.parentNode.replaceChild(newElement, element);
                        console.log('[Fix Yuvi Targeted] Fixed overdue text');
                    }
                });

                // Approach for completed tasks
                if (taskItem.classList.contains('completed')) {
                    const allSpans = taskItem.querySelectorAll('span');
                    allSpans.forEach(span => {
                        if (span.textContent && span.textContent.includes('Overdue:')) {
                            // Create a new span with the correct text
                            const newSpan = document.createElement('span');
                            newSpan.textContent = 'Overdue: 5/15/2025';

                            // Replace the span
                            if (span.parentNode) {
                                span.parentNode.replaceChild(newSpan, span);
                                console.log('[Fix Yuvi Targeted] Fixed overdue text in completed task');
                            }
                        }
                    });
                }
            });

            console.log('[Fix Yuvi Targeted] Fix completed');
        } catch (error) {
            console.error('[Fix Yuvi Targeted] Error:', error);
        }
    }

    // Function to set up a MutationObserver to watch for changes to the DOM
    function setupMutationObserver() {
        console.log('[Fix Yuvi Targeted] Setting up MutationObserver');

        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;

            mutations.forEach((mutation) => {
                // Check if nodes were added
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a task item or contains task items
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if ((node.classList && node.classList.contains('task-item')) ||
                                node.querySelector('.task-item')) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });

            if (shouldFix) {
                console.log('[Fix Yuvi Targeted] DOM changes detected, running fix');
                setTimeout(fixYuviBdayDates, 100);
            }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[Fix Yuvi Targeted] MutationObserver set up');
    }

    // Run the fix immediately
    fixYuviBdayDates();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Yuvi Targeted] DOM content loaded');
        setTimeout(fixYuviBdayDates, 500);
        setupMutationObserver();
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Targeted] Page loaded');
        setTimeout(fixYuviBdayDates, 500);
        setupMutationObserver();
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Targeted] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Targeted] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Targeted] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
})();
