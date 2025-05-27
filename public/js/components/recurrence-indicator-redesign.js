/**
 * Recurrence Indicator Redesign
 * Replaces the circular arrow with a more compact and visually appealing indicator
 */

document.addEventListener('DOMContentLoaded', function() {

    function updateRecurrenceIndicators() {

        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(taskItem => {

            const titleContainer = taskItem.querySelector('.task-title-container');
            const recurringIcon = taskItem.querySelector('.recurring-icon');
            const taskTitle = taskItem.querySelector('.task-title');

            if (recurringIcon && titleContainer && taskTitle) {

                if (taskTitle.textContent === "Progress Photo") {

                    recurringIcon.style.display = 'none';
                    return;
                }

                const recurrenceType = recurringIcon.className.match(/daily|weekly|monthly|yearly/i)?.[0] || '';

                const intervalBadge = recurringIcon.querySelector('.interval-badge');
                const interval = intervalBadge ? intervalBadge.textContent : '1';

                titleContainer.classList.add('recurring');

                if (recurrenceType) {
                    titleContainer.classList.add(recurrenceType.toLowerCase());
                }

                taskTitle.classList.add('recurring');

                let recurrenceText = '';
                switch (recurrenceType.toLowerCase()) {
                    case 'daily':
                        recurrenceText = interval === '1' ? 'Daily' : `Every ${interval}d`;
                        break;
                    case 'weekly':
                        recurrenceText = interval === '1' ? 'Weekly' : `Every ${interval}w`;
                        break;
                    case 'monthly':
                        recurrenceText = interval === '1' ? 'Monthly' : `Every ${interval}m`;
                        break;
                    case 'yearly':
                        recurrenceText = interval === '1' ? 'Yearly' : `Every ${interval}y`;
                        break;
                    default:
                        recurrenceText = 'Recurring';
                }

                taskTitle.setAttribute('data-recurrence-text', recurrenceText);

                recurringIcon.style.display = 'none';
            }
        });
    }

    updateRecurrenceIndicators();

    document.addEventListener('tasksLoaded', updateRecurrenceIndicators);
    document.addEventListener('taskUpdated', updateRecurrenceIndicators);

    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node

                        if (node.classList && node.classList.contains('task-item') ||
                            node.querySelector && node.querySelector('.task-item')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            updateRecurrenceIndicators();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            const titleContainer = taskElement.querySelector('.task-title-container');
            const recurringIcon = taskElement.querySelector('.recurring-icon');
            const taskTitle = taskElement.querySelector('.task-title');

            if (recurringIcon && titleContainer && taskTitle) {

                if (taskTitle.textContent === "Progress Photo") {

                    recurringIcon.style.display = 'none';
                    return taskElement;
                }

                const recurrenceType = recurringIcon.className.match(/daily|weekly|monthly|yearly/i)?.[0] || '';

                const intervalBadge = recurringIcon.querySelector('.interval-badge');
                const interval = intervalBadge ? intervalBadge.textContent : '1';

                titleContainer.classList.add('recurring');

                if (recurrenceType) {
                    titleContainer.classList.add(recurrenceType.toLowerCase());
                }

                taskTitle.classList.add('recurring');

                let recurrenceText = '';
                switch (recurrenceType.toLowerCase()) {
                    case 'daily':
                        recurrenceText = interval === '1' ? 'Daily' : `Every ${interval}d`;
                        break;
                    case 'weekly':
                        recurrenceText = interval === '1' ? 'Weekly' : `Every ${interval}w`;
                        break;
                    case 'monthly':
                        recurrenceText = interval === '1' ? 'Monthly' : `Every ${interval}m`;
                        break;
                    case 'yearly':
                        recurrenceText = interval === '1' ? 'Yearly' : `Every ${interval}y`;
                        break;
                    default:
                        recurrenceText = 'Recurring';
                }

                taskTitle.setAttribute('data-recurrence-text', recurrenceText);

                recurringIcon.style.display = 'none';
            }

            return taskElement;
        };
    }

    document.dispatchEvent(new CustomEvent('recurrenceIndicatorsUpdated'));
});
