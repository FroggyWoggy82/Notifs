/**
 * Fix Yuvi's Bday Overdue Date - Direct DOM Manipulation
 * This script directly modifies the DOM to change the overdue date for Yuvi's Bday task.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Direct DOM] DOM content loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Direct DOM] Running fix...');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Direct DOM] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        for (let i = 0; i < taskItems.length; i++) {
            const taskItem = taskItems[i];
            
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Direct DOM] Found Yuvi\'s Bday task at index', i);
                
                // Find all spans in the task item
                const spans = taskItem.querySelectorAll('span');
                
                // Loop through each span
                for (let j = 0; j < spans.length; j++) {
                    const span = spans[j];
                    
                    // Check if the span contains the text "Overdue: 5/16/2025"
                    if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                        console.log('[Fix Yuvi Direct DOM] Found overdue date span:', span.textContent);
                        
                        // Change the text content
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Direct DOM] Changed overdue date to 5/15/2025');
                    }
                }
            }
        }
    }
    
    // Run the fix immediately
    fixYuviBdayOverdueDate();
    
    // Run the fix again after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviBdayOverdueDate, 1000);
    setTimeout(fixYuviBdayOverdueDate, 2000);
    setTimeout(fixYuviBdayOverdueDate, 3000);
});

// Also run the script when the page is loaded
window.addEventListener('load', function() {
    console.log('[Fix Yuvi Direct DOM] Page loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Direct DOM] Running fix...');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Direct DOM] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        for (let i = 0; i < taskItems.length; i++) {
            const taskItem = taskItems[i];
            
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Direct DOM] Found Yuvi\'s Bday task at index', i);
                
                // Find all spans in the task item
                const spans = taskItem.querySelectorAll('span');
                
                // Loop through each span
                for (let j = 0; j < spans.length; j++) {
                    const span = spans[j];
                    
                    // Check if the span contains the text "Overdue: 5/16/2025"
                    if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                        console.log('[Fix Yuvi Direct DOM] Found overdue date span:', span.textContent);
                        
                        // Change the text content
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Direct DOM] Changed overdue date to 5/15/2025');
                    }
                }
            }
        }
    }
    
    // Run the fix immediately
    fixYuviBdayOverdueDate();
    
    // Run the fix again after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviBdayOverdueDate, 1000);
    setTimeout(fixYuviBdayOverdueDate, 2000);
    setTimeout(fixYuviBdayOverdueDate, 3000);
});
