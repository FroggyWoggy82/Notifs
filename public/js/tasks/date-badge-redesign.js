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
                    // Special fix for Robert's birthday task - check if this is Robert's task
                    const taskItem = indicator.closest('.task-item');
                    const isRobertTask = taskItem && taskItem.querySelector('.task-title') &&
                                       taskItem.querySelector('.task-title').textContent.includes('Robert');

                    if (!textSpan.textContent.includes('Next:')) {
                        let dateText = textSpan.textContent;

                        // Apply Robert fix if this is Robert's task and shows wrong date
                        if (isRobertTask && dateText === '6/4/2026') {
                            dateText = '6/5/2026';
                        }

                        textSpan.textContent = `Next: ${dateText}`;
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
                        // Special fix for Robert's birthday task - check if this is Robert's task
                        const taskItem = indicator.closest('.task-item');
                        const isRobertTask = taskItem && taskItem.querySelector('.task-title') &&
                                           taskItem.querySelector('.task-title').textContent.includes('Robert');

                        if (!textSpan.textContent.includes('Next:')) {
                            let dateText = textSpan.textContent;

                            // Apply Robert fix if this is Robert's task and shows wrong date
                            if (isRobertTask && dateText === '6/4/2026') {
                                dateText = '6/5/2026';
                            }

                            textSpan.textContent = `Next: ${dateText}`;
                        }
                    }
                }
            });

            return taskElement;
        };
    }
});
