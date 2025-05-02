/**
 * Date Badge Redesign
 * Removes the calendar icon from date indicators (Overdue, Due Today) and styles them like the Weekly badge
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update date indicators
    function updateDateIndicators() {
        // Find all date indicators (overdue and due today)
        const dateIndicators = document.querySelectorAll('.due-date-indicator.overdue, .due-date-indicator.due-soon, .next-occurrence-indicator.overdue, .next-occurrence-indicator.due-soon');

        dateIndicators.forEach(indicator => {
            // Remove any existing calendar icons
            const calendarIcon = indicator.querySelector('i');
            if (calendarIcon) {
                calendarIcon.remove();
            }
        });
    }

    // Run the function on page load
    updateDateIndicators();

    // Also run it when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateDateIndicators);
    document.addEventListener('taskUpdated', updateDateIndicators);

    // Create a MutationObserver to watch for new date indicators
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are date indicators or contain them
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a date indicator or contains one
                        if ((node.classList && (node.classList.contains('due-date-indicator') || node.classList.contains('next-occurrence-indicator'))) ||
                            node.querySelector && (
                                node.querySelector('.due-date-indicator.overdue') ||
                                node.querySelector('.due-date-indicator.due-soon') ||
                                node.querySelector('.next-occurrence-indicator.overdue') ||
                                node.querySelector('.next-occurrence-indicator.due-soon')
                            )) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            updateDateIndicators();
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Override the createTaskElement function to modify how date indicators are created
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            // Find and update any date indicators in the task element
            const dateIndicators = taskElement.querySelectorAll('.due-date-indicator.overdue, .due-date-indicator.due-soon, .next-occurrence-indicator.overdue, .next-occurrence-indicator.due-soon');

            dateIndicators.forEach(indicator => {
                // Remove any existing calendar icons
                const calendarIcon = indicator.querySelector('i');
                if (calendarIcon) {
                    calendarIcon.remove();
                }
            });

            return taskElement;
        };
    }
});
