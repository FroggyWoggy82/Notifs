/**
 * Recurrence Indicator Redesign
 * Replaces the circular arrow with a more compact and visually appealing indicator
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update task recurrence indicators
    function updateRecurrenceIndicators() {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(taskItem => {
            // Find the title container and recurring icon
            const titleContainer = taskItem.querySelector('.task-title-container');
            const recurringIcon = taskItem.querySelector('.recurring-icon');
            const taskTitle = taskItem.querySelector('.task-title');

            if (recurringIcon && titleContainer && taskTitle) {
                // Skip adding recurring indicators for "Progress Photo" task
                if (taskTitle.textContent === "Progress Photo") {
                    // Just hide the original recurring icon
                    recurringIcon.style.display = 'none';
                    return;
                }

                // Get the recurrence type from the icon's class
                const recurrenceType = recurringIcon.className.match(/daily|weekly|monthly|yearly/i)?.[0] || '';

                // Get the interval from the badge if it exists
                const intervalBadge = recurringIcon.querySelector('.interval-badge');
                const interval = intervalBadge ? intervalBadge.textContent : '1';

                // Add the recurring class to the title container
                titleContainer.classList.add('recurring');

                // Add the recurrence type class to the title container
                if (recurrenceType) {
                    titleContainer.classList.add(recurrenceType.toLowerCase());
                }

                // Add the recurring class to the task title
                taskTitle.classList.add('recurring');

                // Create a short recurrence text
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

                // Set the recurrence text as a data attribute
                taskTitle.setAttribute('data-recurrence-text', recurrenceText);

                // If the interval is greater than 1, add a small badge
                if (interval !== '1') {
                    // Check if we already added an interval badge
                    if (!titleContainer.querySelector('.recurrence-interval')) {
                        const intervalElement = document.createElement('span');
                        intervalElement.className = `recurrence-interval ${recurrenceType.toLowerCase()}`;
                        intervalElement.textContent = `×${interval}`;
                        intervalElement.title = `Repeats every ${interval} ${recurrenceType.toLowerCase()}`;
                        titleContainer.appendChild(intervalElement);
                    }
                }

                // Hide the original recurring icon
                recurringIcon.style.display = 'none';
            }
        });
    }

    // Run the function on page load
    updateRecurrenceIndicators();

    // Also run it when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateRecurrenceIndicators);
    document.addEventListener('taskUpdated', updateRecurrenceIndicators);

    // Create a MutationObserver to watch for new task elements
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a task item or contains task items
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

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Override the createTaskElement function to use our new recurrence indicator
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;

        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);

            // Apply our recurrence indicator redesign
            const titleContainer = taskElement.querySelector('.task-title-container');
            const recurringIcon = taskElement.querySelector('.recurring-icon');
            const taskTitle = taskElement.querySelector('.task-title');

            if (recurringIcon && titleContainer && taskTitle) {
                // Skip adding recurring indicators for "Progress Photo" task
                if (taskTitle.textContent === "Progress Photo") {
                    // Just hide the original recurring icon
                    recurringIcon.style.display = 'none';
                    return taskElement;
                }

                // Get the recurrence type from the icon's class
                const recurrenceType = recurringIcon.className.match(/daily|weekly|monthly|yearly/i)?.[0] || '';

                // Get the interval from the badge if it exists
                const intervalBadge = recurringIcon.querySelector('.interval-badge');
                const interval = intervalBadge ? intervalBadge.textContent : '1';

                // Add the recurring class to the title container
                titleContainer.classList.add('recurring');

                // Add the recurrence type class to the title container
                if (recurrenceType) {
                    titleContainer.classList.add(recurrenceType.toLowerCase());
                }

                // Add the recurring class to the task title
                taskTitle.classList.add('recurring');

                // Create a short recurrence text
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

                // Set the recurrence text as a data attribute
                taskTitle.setAttribute('data-recurrence-text', recurrenceText);

                // If the interval is greater than 1, add a small badge
                if (interval !== '1') {
                    // Check if we already added an interval badge
                    if (!titleContainer.querySelector('.recurrence-interval')) {
                        const intervalElement = document.createElement('span');
                        intervalElement.className = `recurrence-interval ${recurrenceType.toLowerCase()}`;
                        intervalElement.textContent = `×${interval}`;
                        intervalElement.title = `Repeats every ${interval} ${recurrenceType.toLowerCase()}`;
                        titleContainer.appendChild(intervalElement);
                    }
                }

                // Hide the original recurring icon
                recurringIcon.style.display = 'none';
            }

            return taskElement;
        };
    }

    // Dispatch a custom event to notify that the recurrence indicators have been updated
    document.dispatchEvent(new CustomEvent('recurrenceIndicatorsUpdated'));
});
