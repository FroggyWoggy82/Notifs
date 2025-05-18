/**
 * Calendar Overdue Task Fix
 * Ensures overdue tasks in the calendar have proper styling that matches index.html
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to fix overdue task styling
    function fixOverdueTasks() {
        // Fix overdue tasks in the calendar grid
        const overdueTaskItems = document.querySelectorAll('.calendar-task-item.overdue');
        overdueTaskItems.forEach(item => {
            // Apply our styling to match index.html
            item.style.backgroundColor = '#1e1e1e';
            item.style.color = 'white';
            item.style.borderColor = '#ff5555';
            item.style.fontWeight = 'normal';
            item.style.boxShadow = '0 0 5px rgba(255, 85, 85, 0.3)';
        });

        // Fix recurring overdue tasks
        const recurringOverdueItems = document.querySelectorAll('.calendar-task-item.recurring.overdue');
        recurringOverdueItems.forEach(item => {
            item.style.backgroundColor = '#1e1e1e';
            item.style.color = 'white';
            item.style.borderColor = '#ff5555';
            item.style.borderLeft = '3px solid #ff5555';
            item.style.fontWeight = 'normal';
            item.style.boxShadow = '0 0 5px rgba(255, 85, 85, 0.3)';
        });

        // Fix overdue tasks in the selected date view
        const selectedOverdueItems = document.querySelectorAll('#selectedTaskList li.overdue');
        selectedOverdueItems.forEach(item => {
            item.style.backgroundColor = '#1e1e1e';
            item.style.color = 'white';
            item.style.borderColor = '#ff5555';
            item.style.borderLeft = '3px solid #ff5555';
            item.style.fontWeight = 'normal';
            item.style.boxShadow = '0 0 5px rgba(255, 85, 85, 0.3)';
        });

        // Remove animation from recurring indicators
        const recurringItems = document.querySelectorAll('.calendar-task-item.recurring::after');
        recurringItems.forEach(item => {
            if (item.style) {
                item.style.animation = 'none';
            }
        });
    }

    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Check if any of the added nodes are overdue tasks
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // If the node itself is an overdue task
                        if ((node.classList &&
                            (node.classList.contains('overdue') ||
                             (node.classList.contains('recurring') && node.classList.contains('overdue'))))) {
                            fixOverdueTasks();
                        }
                        // If the node contains overdue tasks
                        else if (node.querySelectorAll) {
                            const overdueElements = node.querySelectorAll('.overdue');
                            if (overdueElements.length) {
                                fixOverdueTasks();
                            }
                        }
                    }
                });
            }
        });
    });

    // Start observing the document
    observer.observe(document.body, { childList: true, subtree: true });

    // Run the fix immediately
    fixOverdueTasks();

    // Also run the fix when the calendar is refreshed
    document.addEventListener('calendarRefreshed', fixOverdueTasks);
});
