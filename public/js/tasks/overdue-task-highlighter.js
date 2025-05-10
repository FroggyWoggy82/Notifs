/**
 * Overdue Task Highlighter
 *
 * This script ensures all overdue tasks are consistently highlighted with a red background
 * and red border, matching the styling of the first task in the screenshot.
 *
 * It periodically checks for overdue tasks and applies the appropriate styling.
 */

(function() {
    'use strict';

    // Function to check if a task is overdue
    function isTaskOverdue(task) {
        // Skip completed tasks
        if (task.classList.contains('complete')) return false;

        // Check if task has a due date indicator
        const dueDateIndicator = task.querySelector('.due-date-indicator');
        if (!dueDateIndicator) return false;

        // Check if the due date indicator contains "Overdue"
        return dueDateIndicator.textContent.includes('Overdue');
    }

    // Function to apply overdue styling to a task
    function applyOverdueStyling(taskElement) {
        // Add overdue class
        taskElement.classList.add('overdue');

        // Add data attribute
        taskElement.setAttribute('data-overdue', 'true');

        // Apply subtle inline styles for maximum compatibility
        taskElement.style.backgroundColor = 'rgba(244, 67, 54, 0.05)';
        taskElement.style.borderLeft = '2px solid #f44336';
        taskElement.style.borderColor = 'rgba(244, 67, 54, 0.2)';
        taskElement.style.boxShadow = 'none';

        // Style the due date indicator
        const dueDateIndicator = taskElement.querySelector('.due-date-indicator');
        if (dueDateIndicator) {
            dueDateIndicator.classList.add('overdue');
        }
    }

    // Function to check all tasks and apply styling
    function refreshOverdueStyling() {
        const taskElements = document.querySelectorAll('.task-item');

        taskElements.forEach(taskElement => {
            // Skip completed tasks
            if (taskElement.classList.contains('complete')) return;

            // Check if task is overdue
            if (isTaskOverdue(taskElement) ||
                taskElement.getAttribute('data-recurring-overdue') === 'true') {
                applyOverdueStyling(taskElement);
            }
        });
    }

    // Apply styling when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial application of styling
        setTimeout(refreshOverdueStyling, 1000);

        // Set up periodic refresh
        setInterval(refreshOverdueStyling, 5000);

        // Refresh styling when tasks are updated
        document.addEventListener('tasksRendered', refreshOverdueStyling);
        document.addEventListener('taskUpdated', refreshOverdueStyling);
    });

    // Apply styling when tasks are rendered
    document.addEventListener('tasksRendered', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when a task is updated
    document.addEventListener('taskUpdated', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when a task is completed
    document.addEventListener('taskCompleted', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when a task is added
    document.addEventListener('taskAdded', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when the page is shown (for mobile browsers)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(refreshOverdueStyling, 500);
        }
    });

    // Apply styling when the window is focused
    window.addEventListener('focus', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when the window is resized
    window.addEventListener('resize', function() {
        setTimeout(refreshOverdueStyling, 500);
    });

    // Apply styling when the user scrolls
    window.addEventListener('scroll', function() {
        setTimeout(refreshOverdueStyling, 500);
    }, { passive: true });

    console.log('Overdue task highlighter initialized');
})();
