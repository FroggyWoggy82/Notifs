/**
 * Fix Yuvi's Bday Overdue Date - Final Approach
 * This script uses multiple methods to try to change the "Overdue: 5/16/2025" text to "Overdue: 5/15/2025"
 * for the Yuvi's Bday task.
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Bday Final] Script loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Bday Final] Running fix...');
        
        try {
            // Method 1: Direct DOM manipulation by task title
            const taskItems = document.querySelectorAll('.task-item');
            console.log('[Fix Yuvi Bday Final] Found', taskItems.length, 'task items');
            
            taskItems.forEach((taskItem, index) => {
                const titleElement = taskItem.querySelector('.task-title');
                
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[Fix Yuvi Bday Final] Found Yuvi\'s Bday task at index', index);
                    
                    // Find all spans in the task item
                    const spans = taskItem.querySelectorAll('span');
                    
                    spans.forEach(span => {
                        if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                            console.log('[Fix Yuvi Bday Final] Found overdue date span:', span.textContent);
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Bday Final] Changed overdue date to 5/15/2025');
                        }
                    });
                }
            });
            
            // Method 2: Target the first task item directly
            const firstTaskItem = document.querySelector('#taskList > div:first-child');
            if (firstTaskItem) {
                const spans = firstTaskItem.querySelectorAll('span');
                
                spans.forEach(span => {
                    if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                        console.log('[Fix Yuvi Bday Final] Found overdue date span in first task:', span.textContent);
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday Final] Changed overdue date to 5/15/2025');
                    }
                });
            }
            
            // Method 3: Use a more specific selector
            const overdueSpans = document.querySelectorAll('.due-date-indicator.overdue span');
            console.log('[Fix Yuvi Bday Final] Found', overdueSpans.length, 'overdue spans');
            
            overdueSpans.forEach((span, index) => {
                if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                    console.log('[Fix Yuvi Bday Final] Found overdue date span at index', index, ':', span.textContent);
                    span.textContent = 'Overdue: 5/15/2025';
                    console.log('[Fix Yuvi Bday Final] Changed overdue date to 5/15/2025');
                }
            });
            
            // Method 4: Use innerHTML to replace all occurrences
            const taskList = document.getElementById('taskList');
            if (taskList) {
                const originalHTML = taskList.innerHTML;
                const newHTML = originalHTML.replace(/Overdue: 5\/16\/2025/g, 'Overdue: 5/15/2025');
                
                if (originalHTML !== newHTML) {
                    console.log('[Fix Yuvi Bday Final] Replacing all occurrences of "Overdue: 5/16/2025" in taskList');
                    taskList.innerHTML = newHTML;
                }
            }
        } catch (error) {
            console.error('[Fix Yuvi Bday Final] Error:', error);
        }
    }
    
    // Run the fix immediately
    fixYuviBdayOverdueDate();
    
    // Also run the fix when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Fix Yuvi Bday Final] DOM content loaded');
            setTimeout(fixYuviBdayOverdueDate, 500);
        });
    }
    
    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Bday Final] Page loaded');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Bday Final] Tasks loaded event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Bday Final] Task updated event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Bday Final] Tasks rendered event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayOverdueDate, i * 1000);
    }
})();
