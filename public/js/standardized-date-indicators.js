/**
 * Standardized Date Indicators
 * This script ensures consistent formatting and styling for all date indicators
 * and fixes issues with the "Yuvi's Bday" task
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Standardized Date Indicators] Initializing...');

    // Disable all the individual Yuvi's Bday fix scripts by setting a global flag
    window.yuviBdayFixApplied = true;

    // Function to standardize all date indicators
    function standardizeDateIndicators() {
        console.log('[Standardized Date Indicators] Standardizing date indicators...');

        // Find all next occurrence indicators
        const nextDateIndicators = document.querySelectorAll('.next-occurrence-indicator, .next-occurrence-date');

        nextDateIndicators.forEach(indicator => {
            // Remove any inline styles that might be causing inconsistencies
            if (indicator.hasAttribute('style')) {
                indicator.removeAttribute('style');
            }

            // Ensure all next date indicators have the "Next:" prefix
            const textSpan = indicator.querySelector('span') || indicator;
            if (textSpan && textSpan.textContent && !textSpan.textContent.includes('Next:')) {
                textSpan.textContent = `Next: ${textSpan.textContent}`;
            }
        });

        // Find all overdue indicators
        const overdueIndicators = document.querySelectorAll('.due-date-indicator.overdue');

        overdueIndicators.forEach(indicator => {
            // Remove any inline styles
            if (indicator.hasAttribute('style')) {
                indicator.removeAttribute('style');
            }

            // Remove this problematic code that was adding duplicate "Overdue:" prefixes
            // The main task creation script already handles the "Overdue:" prefix correctly
        });

        // Removed fixYuviBdayTask call as it was causing duplicate overdue text
    }

    // Removed fixYuviBdayTask function as it was causing duplicate overdue text
    // The main task creation script already handles overdue dates correctly

    // Run the standardization immediately
    standardizeDateIndicators();

    // Run it again when tasks are loaded or updated
    document.addEventListener('tasksLoaded', standardizeDateIndicators);
    document.addEventListener('taskUpdated', standardizeDateIndicators);
    document.addEventListener('tasksRendered', standardizeDateIndicators);

    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a task item or contains task items
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.classList && (
                            node.classList.contains('task-item') ||
                            node.classList.contains('next-occurrence-indicator') ||
                            node.classList.contains('next-occurrence-date') ||
                            node.classList.contains('due-date-indicator')
                        )) ||
                        node.querySelector('.task-item') ||
                        node.querySelector('.next-occurrence-indicator') ||
                        node.querySelector('.next-occurrence-date') ||
                        node.querySelector('.due-date-indicator')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            setTimeout(standardizeDateIndicators, 100);
        }
    });

    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Override the createTaskElement function if it exists
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            // Standardize date indicators in the task element
            const nextDateIndicators = taskElement.querySelectorAll('.next-occurrence-indicator, .next-occurrence-date');

            nextDateIndicators.forEach(indicator => {
                // Remove any inline styles
                if (indicator.hasAttribute('style')) {
                    indicator.removeAttribute('style');
                }

                // Remove this problematic code that was adding duplicate "Next:" prefixes
                // The main task creation script already handles the "Next:" prefix correctly
            });

            return taskElement;
        };
    }

    console.log('[Standardized Date Indicators] Initialization complete');
});
