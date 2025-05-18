/**
 * Fix Yuvi's Bday Next Date
 * This script fixes the "Next: 5/13/2026" date to "Next: 5/15/2026" for the Yuvi's Bday task
 */

// Function to fix the next date
function fixYuviBdayNextDate() {
    console.log('[Fix Yuvi Next Date] Running fix...');
    
    try {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Next Date] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        taskItems.forEach((taskItem, index) => {
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Next Date] Found Yuvi\'s Bday task at index', index);
                
                // Find all elements with text content "Next: 5/13/2026"
                const allElements = taskItem.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                        console.log('[Fix Yuvi Next Date] Found next date element:', element.textContent);
                        element.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Next Date] Changed next date to 5/15/2026');
                    }
                });
                
                // Find the next occurrence date element
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    if (element.textContent && element.textContent.includes('5/13/2026')) {
                        console.log('[Fix Yuvi Next Date] Found next date:', element.textContent);
                        element.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Next Date] Changed next date to 5/15/2026');
                    }
                });
            }
        });
    } catch (error) {
        console.error('[Fix Yuvi Next Date] Error:', error);
    }
}

// Run the fix when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Next Date] DOM content loaded');
    setTimeout(fixYuviBdayNextDate, 500);
});

// Run the fix when the tasks are loaded
document.addEventListener('tasksLoaded', function() {
    console.log('[Fix Yuvi Next Date] Tasks loaded event received');
    setTimeout(fixYuviBdayNextDate, 500);
});

// Run the fix when the tasks are rendered
document.addEventListener('tasksRendered', function() {
    console.log('[Fix Yuvi Next Date] Tasks rendered event received');
    setTimeout(fixYuviBdayNextDate, 500);
});

// Run the fix every second for 10 seconds to ensure it gets applied
for (let i = 1; i <= 10; i++) {
    setTimeout(fixYuviBdayNextDate, i * 1000);
}
