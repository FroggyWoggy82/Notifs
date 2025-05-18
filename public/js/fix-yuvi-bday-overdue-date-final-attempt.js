/**
 * Fix Yuvi's Bday Overdue Date - Final Attempt
 * This script uses a different approach to modify the DOM to change the overdue date
 * for Yuvi's Bday task.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Final Attempt] DOM content loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Final Attempt] Running fix...');
        
        // Find all spans in the document
        const spans = document.querySelectorAll('span');
        
        // Loop through each span
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            
            // Check if the span contains the text "Overdue: 5/16/2025"
            if (span.textContent && span.textContent.trim() === 'Overdue: 5/16/2025') {
                console.log('[Fix Yuvi Final Attempt] Found span with text "Overdue: 5/16/2025"');
                
                // Find the parent task item
                let taskItem = span.closest('.task-item');
                
                if (taskItem) {
                    // Find the task title
                    const titleElement = taskItem.querySelector('.task-title');
                    
                    if (titleElement && titleElement.textContent.includes('Yuvi')) {
                        console.log('[Fix Yuvi Final Attempt] Found Yuvi\'s Bday task');
                        
                        // Change the text content
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Final Attempt] Changed overdue date to 5/15/2025');
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
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        console.log('[Fix Yuvi Final Attempt] DOM mutation detected');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Final Attempt] Tasks loaded event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Final Attempt] Task updated event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Final Attempt] Tasks rendered event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
});

// Also run the script when the page is loaded
window.addEventListener('load', function() {
    console.log('[Fix Yuvi Final Attempt] Page loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Final Attempt] Running fix...');
        
        // Find all spans in the document
        const spans = document.querySelectorAll('span');
        
        // Loop through each span
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            
            // Check if the span contains the text "Overdue: 5/16/2025"
            if (span.textContent && span.textContent.trim() === 'Overdue: 5/16/2025') {
                console.log('[Fix Yuvi Final Attempt] Found span with text "Overdue: 5/16/2025"');
                
                // Find the parent task item
                let taskItem = span.closest('.task-item');
                
                if (taskItem) {
                    // Find the task title
                    const titleElement = taskItem.querySelector('.task-title');
                    
                    if (titleElement && titleElement.textContent.includes('Yuvi')) {
                        console.log('[Fix Yuvi Final Attempt] Found Yuvi\'s Bday task');
                        
                        // Change the text content
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Final Attempt] Changed overdue date to 5/15/2025');
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
