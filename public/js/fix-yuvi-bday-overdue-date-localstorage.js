/**
 * Fix Yuvi's Bday Overdue Date - LocalStorage Approach
 * This script modifies the task data in localStorage to change the due date for Yuvi's Bday task.
 */

(function() {
    console.log('[Fix Yuvi Bday LocalStorage] Script loaded');
    
    // Function to fix the date in localStorage
    function fixYuviBdayOverdueDateInLocalStorage() {
        console.log('[Fix Yuvi Bday LocalStorage] Running fix...');
        
        try {
            // Get all tasks from localStorage
            const tasksJson = localStorage.getItem('tasks');
            
            if (!tasksJson) {
                console.log('[Fix Yuvi Bday LocalStorage] No tasks found in localStorage');
                return;
            }
            
            // Parse the tasks
            const tasks = JSON.parse(tasksJson);
            console.log('[Fix Yuvi Bday LocalStorage] Found', tasks.length, 'tasks in localStorage');
            
            // Find Yuvi's Bday task
            let yuviBdayTask = null;
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].title === "Yuvi's Bday") {
                    yuviBdayTask = tasks[i];
                    console.log('[Fix Yuvi Bday LocalStorage] Found Yuvi\'s Bday task:', yuviBdayTask);
                    break;
                }
            }
            
            if (!yuviBdayTask) {
                console.log('[Fix Yuvi Bday LocalStorage] Yuvi\'s Bday task not found in localStorage');
                return;
            }
            
            // Change the due date to 2025-05-15
            const originalDueDate = yuviBdayTask.due_date;
            yuviBdayTask.due_date = '2025-05-15T00:00:00.000Z';
            console.log('[Fix Yuvi Bday LocalStorage] Changed due date from', originalDueDate, 'to', yuviBdayTask.due_date);
            
            // Save the modified tasks back to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            console.log('[Fix Yuvi Bday LocalStorage] Saved modified tasks to localStorage');
            
            // Reload the page to apply the changes
            console.log('[Fix Yuvi Bday LocalStorage] Reloading page to apply changes...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('[Fix Yuvi Bday LocalStorage] Error:', error);
        }
    }
    
    // Run the fix when the page is loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Bday LocalStorage] Page loaded, running fix...');
        setTimeout(fixYuviBdayOverdueDateInLocalStorage, 1000);
    });
})();
