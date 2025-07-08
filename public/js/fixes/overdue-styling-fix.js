/**
 * Overdue Styling Fix
 * 
 * This script ensures overdue tasks are properly highlighted even when other
 * JavaScript errors prevent the normal overdue styling functions from working.
 */

(function() {
    'use strict';

    console.log('[Overdue Styling Fix] Initializing...');

    function applyOverdueStyling() {
        console.log('[Overdue Styling Fix] Applying overdue styling...');
        
        if (typeof allTasks === 'undefined' || !allTasks) {
            console.log('[Overdue Styling Fix] allTasks not available yet');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find overdue tasks
        const overdueTasks = allTasks.filter(task => {
            if (task.is_complete) return false;
            if (!task.due_date) return false;
            
            try {
                const dueDate = new Date(task.due_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
            } catch (e) {
                return false;
            }
        });
        
        console.log(`[Overdue Styling Fix] Found ${overdueTasks.length} overdue tasks`);
        
        // Apply styling to overdue tasks
        overdueTasks.forEach(task => {
            const taskEl = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskEl) {
                console.log(`[Overdue Styling Fix] Styling task: ${task.title}`);
                taskEl.style.backgroundColor = '#ffebee';
                taskEl.style.borderLeft = '4px solid #f44336';
                taskEl.style.borderColor = '#ef9a9a';
                taskEl.classList.add('overdue');
                taskEl.setAttribute('data-overdue', 'true');
            }
        });
    }

    // Apply styling when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(applyOverdueStyling, 1000);
            setTimeout(applyOverdueStyling, 3000);
            setInterval(applyOverdueStyling, 10000);
        });
    } else {
        setTimeout(applyOverdueStyling, 1000);
        setTimeout(applyOverdueStyling, 3000);
        setInterval(applyOverdueStyling, 10000);
    }

    // Apply styling when tasks are loaded/rendered
    document.addEventListener('tasksLoaded', function() {
        setTimeout(applyOverdueStyling, 500);
    });

    document.addEventListener('tasksRendered', function() {
        setTimeout(applyOverdueStyling, 500);
    });

    // Apply styling when tasks are updated
    document.addEventListener('taskUpdated', function() {
        setTimeout(applyOverdueStyling, 500);
    });

    console.log('[Overdue Styling Fix] Initialized successfully');
})();
