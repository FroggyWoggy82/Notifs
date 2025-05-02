/**
 * Date Badge Redesign
 * Removes the calendar icon from all date indicators and styles them like the Weekly badge
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update date indicators
    function updateDateIndicators() {
        // Find all date indicators (overdue, due today, and next)
        const dateIndicators = document.querySelectorAll('.due-date-indicator, .next-occurrence-indicator');

        dateIndicators.forEach(indicator => {
            // Remove any existing calendar icons
            const calendarIcon = indicator.querySelector('i');
            if (calendarIcon) {
                calendarIcon.remove();
            }

            // Format the text for next occurrence indicators
            if (indicator.classList.contains('next-occurrence-indicator') && !indicator.classList.contains('overdue') && !indicator.classList.contains('due-soon')) {
                const textSpan = indicator.querySelector('span');
                if (textSpan) {
                    // Make sure it has the "Next:" prefix
                    if (!textSpan.textContent.includes('Next:')) {
                        textSpan.textContent = `Next: ${textSpan.textContent}`;
                    }
                }
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
                            node.querySelector && (node.querySelector('.due-date-indicator') || node.querySelector('.next-occurrence-indicator'))) {
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
            const dateIndicators = taskElement.querySelectorAll('.due-date-indicator, .next-occurrence-indicator');

            dateIndicators.forEach(indicator => {
                // Remove any existing calendar icons
                const calendarIcon = indicator.querySelector('i');
                if (calendarIcon) {
                    calendarIcon.remove();
                }

                // Format the text for next occurrence indicators
                if (indicator.classList.contains('next-occurrence-indicator') && !indicator.classList.contains('overdue') && !indicator.classList.contains('due-soon')) {
                    const textSpan = indicator.querySelector('span');
                    if (textSpan) {
                        // Make sure it has the "Next:" prefix
                        if (!textSpan.textContent.includes('Next:')) {
                            textSpan.textContent = `Next: ${textSpan.textContent}`;
                        }
                    }
                }
            });

            return taskElement;
        };
    }
});
