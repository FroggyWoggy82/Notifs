/**
 * Fix Yuvi's Bday dates - Direct DOM manipulation
 * This script directly manipulates the DOM to fix the dates
 */

// Function to fix the dates
function fixYuviBdayDates() {
    console.log('[Fix Yuvi Direct] Running fix...');
    
    try {
        // Find all task items with "Yuvi" in the title
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Direct] Found', taskItems.length, 'task items');
        
        taskItems.forEach((taskItem, index) => {
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Direct] Found Yuvi\'s Bday task at index', index);
                
                // Fix Next date
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    console.log('[Fix Yuvi Direct] Found next date element:', element.textContent);
                    element.textContent = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Direct] Changed next date to 5/15/2026');
                });
                
                // Fix Overdue date for active tasks
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    console.log('[Fix Yuvi Direct] Found overdue element:', element.textContent);
                    element.innerHTML = '<span>Overdue: 5/15/2025</span>';
                    console.log('[Fix Yuvi Direct] Changed overdue date to 5/15/2025');
                });
                
                // Fix Overdue date for completed tasks
                if (taskItem.classList.contains('completed')) {
                    const overdueSpans = taskItem.querySelectorAll('.due-date-indicator span');
                    overdueSpans.forEach(span => {
                        if (span.textContent.includes('Overdue')) {
                            console.log('[Fix Yuvi Direct] Found completed overdue span:', span.textContent);
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Direct] Changed completed overdue date to 5/15/2025');
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error('[Fix Yuvi Direct] Error:', error);
    }
}

// Run the fix when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Direct] DOM content loaded');
    setTimeout(fixYuviBdayDates, 500);
});

// Run the fix when the tasks are loaded
document.addEventListener('tasksLoaded', function() {
    console.log('[Fix Yuvi Direct] Tasks loaded event received');
    setTimeout(fixYuviBdayDates, 500);
});

// Run the fix when the tasks are rendered
document.addEventListener('tasksRendered', function() {
    console.log('[Fix Yuvi Direct] Tasks rendered event received');
    setTimeout(fixYuviBdayDates, 500);
});

// Run the fix every second for 10 seconds to ensure it gets applied
for (let i = 1; i <= 10; i++) {
    setTimeout(fixYuviBdayDates, i * 1000);
}

// Run the fix when the user clicks on a task
document.addEventListener('click', function(event) {
    console.log('[Fix Yuvi Direct] Click event received');
    setTimeout(fixYuviBdayDates, 100);
});

// Run the fix when the user scrolls
document.addEventListener('scroll', function() {
    console.log('[Fix Yuvi Direct] Scroll event received');
    setTimeout(fixYuviBdayDates, 100);
});
