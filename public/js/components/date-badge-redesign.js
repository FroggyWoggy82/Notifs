/**
 * Date Badge Redesign
 * Removes the calendar icon from all date indicators and styles them like the Weekly badge
 */

document.addEventListener('DOMContentLoaded', function() {

    function updateDateIndicators() {

        const dateIndicators = document.querySelectorAll('.due-date-indicator, .next-occurrence-indicator');

        dateIndicators.forEach(indicator => {

            const calendarIcon = indicator.querySelector('i');
            if (calendarIcon) {
                calendarIcon.remove();
            }

            if (indicator.classList.contains('next-occurrence-indicator') && !indicator.classList.contains('overdue') && !indicator.classList.contains('due-soon')) {
                const textSpan = indicator.querySelector('span');
                if (textSpan) {

                    if (!textSpan.textContent.includes('Next:')) {
                        textSpan.textContent = `Next: ${textSpan.textContent}`;
                    }
                }
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

    observer.observe(document.body, { childList: true, subtree: true });

    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            const dateIndicators = taskElement.querySelectorAll('.due-date-indicator, .next-occurrence-indicator');

            dateIndicators.forEach(indicator => {

                const calendarIcon = indicator.querySelector('i');
                if (calendarIcon) {
                    calendarIcon.remove();
                }

                if (indicator.classList.contains('next-occurrence-indicator') && !indicator.classList.contains('overdue') && !indicator.classList.contains('due-soon')) {
                    const textSpan = indicator.querySelector('span');
                    if (textSpan) {

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
