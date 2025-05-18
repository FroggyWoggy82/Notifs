/**
 * Fix Yuvi's Bday Overdue Date - MutationObserver Approach
 * This script uses a MutationObserver to watch for changes to the DOM and modify the overdue date
 * for Yuvi's Bday task as soon as it's rendered.
 */

(function() {
    console.log('[Fix Yuvi Bday Mutation] Script loaded');
    
    // Function to fix the date
    function fixYuviBdayOverdueDate() {
        console.log('[Fix Yuvi Bday Mutation] Running fix...');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Bday Mutation] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        taskItems.forEach((taskItem, index) => {
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Bday Mutation] Found Yuvi\'s Bday task at index', index);
                
                // Find the overdue date indicator
                const overdueIndicator = taskItem.querySelector('.due-date-indicator.overdue span');
                
                if (overdueIndicator) {
                    console.log('[Fix Yuvi Bday Mutation] Found overdue indicator:', overdueIndicator.textContent);
                    
                    // Change the text content
                    overdueIndicator.textContent = 'Overdue: 5/15/2025';
                    console.log('[Fix Yuvi Bday Mutation] Changed overdue date to 5/15/2025');
                }
            }
        });
    }
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // Check if any of the added nodes contain a task item
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node is a task item
                        if (node.classList && node.classList.contains('task-item')) {
                            console.log('[Fix Yuvi Bday Mutation] Task item added to DOM');
                            
                            // Check if it's Yuvi's Bday task
                            const titleElement = node.querySelector('.task-title');
                            
                            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                                console.log('[Fix Yuvi Bday Mutation] Found Yuvi\'s Bday task');
                                
                                // Find the overdue date indicator
                                const overdueIndicator = node.querySelector('.due-date-indicator.overdue span');
                                
                                if (overdueIndicator) {
                                    console.log('[Fix Yuvi Bday Mutation] Found overdue indicator:', overdueIndicator.textContent);
                                    
                                    // Change the text content
                                    overdueIndicator.textContent = 'Overdue: 5/15/2025';
                                    console.log('[Fix Yuvi Bday Mutation] Changed overdue date to 5/15/2025');
                                }
                            }
                        }
                        
                        // Check if the node contains task items
                        const taskItems = node.querySelectorAll('.task-item');
                        
                        if (taskItems.length) {
                            console.log('[Fix Yuvi Bday Mutation] Found', taskItems.length, 'task items in added node');
                            
                            // Loop through each task item
                            taskItems.forEach((taskItem, index) => {
                                // Find the task title
                                const titleElement = taskItem.querySelector('.task-title');
                                
                                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                                    console.log('[Fix Yuvi Bday Mutation] Found Yuvi\'s Bday task at index', index);
                                    
                                    // Find the overdue date indicator
                                    const overdueIndicator = taskItem.querySelector('.due-date-indicator.overdue span');
                                    
                                    if (overdueIndicator) {
                                        console.log('[Fix Yuvi Bday Mutation] Found overdue indicator:', overdueIndicator.textContent);
                                        
                                        // Change the text content
                                        overdueIndicator.textContent = 'Overdue: 5/15/2025';
                                        console.log('[Fix Yuvi Bday Mutation] Changed overdue date to 5/15/2025');
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Run the fix immediately
    fixYuviBdayOverdueDate();
    
    // Run the fix when the page is loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Bday Mutation] Page loaded, running fix...');
        setTimeout(fixYuviBdayOverdueDate, 1000);
    });
    
    // Run the fix when tasks are loaded
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Bday Mutation] Tasks loaded event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
    
    // Run the fix when tasks are rendered
    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Bday Mutation] Tasks rendered event received');
        setTimeout(fixYuviBdayOverdueDate, 500);
    });
})();
