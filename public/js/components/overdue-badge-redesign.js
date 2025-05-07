/**
 * Date Badge Redesign
 * Removes the calendar icon from date indicators (Overdue, Due Today) and styles them like the Weekly badge
 */

document.addEventListener('DOMContentLoaded', function() {

    function updateDateIndicators() {

        const dateIndicators = document.querySelectorAll('.due-date-indicator.overdue, .due-date-indicator.due-soon, .next-occurrence-indicator.overdue, .next-occurrence-indicator.due-soon');

        dateIndicators.forEach(indicator => {

            const calendarIcon = indicator.querySelector('i');
            if (calendarIcon) {
                calendarIcon.remove();
            }
        });
    }

    updateDateIndicators();

    document.addEventListener('tasksLoaded', updateDateIndicators);
    document.addEventListener('taskUpdated', updateDateIndicators);

    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node

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

    observer.observe(document.body, { childList: true, subtree: true });

    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            const dateIndicators = taskElement.querySelectorAll('.due-date-indicator.overdue, .due-date-indicator.due-soon, .next-occurrence-indicator.overdue, .next-occurrence-indicator.due-soon');

            dateIndicators.forEach(indicator => {

                const calendarIcon = indicator.querySelector('i');
                if (calendarIcon) {
                    calendarIcon.remove();
                }
            });

            return taskElement;
        };
    }
});
