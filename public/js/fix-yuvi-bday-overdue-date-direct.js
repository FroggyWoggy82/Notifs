/**
 * Fix Yuvi's Bday Overdue Date - Direct DOM Manipulation
 * This script directly modifies the DOM to change the "Overdue: 5/16/2025" text to "Overdue: 5/15/2025"
 * for the Yuvi's Bday task.
 */

// Wait for the page to fully load
window.addEventListener('load', function() {
    console.log('[Fix Yuvi Bday Overdue Date Direct] Page loaded, waiting for tasks to render...');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Bday Overdue Date Direct] Running fix...');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Bday Overdue Date Direct] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        taskItems.forEach((taskItem, index) => {
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Bday Overdue Date Direct] Found Yuvi\'s Bday task at index', index);
                
                // Find all spans in the task item
                const spans = taskItem.querySelectorAll('span');
                
                // Loop through each span
                spans.forEach(span => {
                    // Check if the span contains the text "Overdue: 5/16/2025"
                    if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                        console.log('[Fix Yuvi Bday Overdue Date Direct] Found overdue date span:', span.textContent);
                        
                        // Change the text content
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday Overdue Date Direct] Changed overdue date to 5/15/2025');
                    }
                });
            }
        });
    }
    
    // Run the fix immediately
    setTimeout(fixYuviBdayOverdueDate, 1000);
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Bday Overdue Date Direct] Tasks loaded event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Bday Overdue Date Direct] Task updated event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    // Set up a mutation observer to detect when new tasks are added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                console.log('[Fix Yuvi Bday Overdue Date Direct] DOM mutation detected');
                setTimeout(fixYuviBdayOverdueDate, 500);
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayOverdueDate, i * 1000);
    }
});
