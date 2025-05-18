/**
 * Fix Yuvi's Bday Overdue Date - Click Event
 * This script adds a click event listener to the Yuvi's Bday task to change the overdue date.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Click] DOM content loaded');
    
    // Function to add click event listeners to all task items
    function addClickListeners() {
        console.log('[Fix Yuvi Click] Adding click listeners to task items');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Click] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        taskItems.forEach((taskItem, index) => {
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Click] Found Yuvi\'s Bday task at index', index);
                
                // Add click event listener to the task item
                taskItem.addEventListener('click', function() {
                    console.log('[Fix Yuvi Click] Yuvi\'s Bday task clicked');
                    
                    // Find all spans in the task item
                    const spans = taskItem.querySelectorAll('span');
                    
                    // Loop through each span
                    spans.forEach(span => {
                        // Check if the span contains the text "Overdue: 5/16/2025"
                        if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                            console.log('[Fix Yuvi Click] Found overdue date span:', span.textContent);
                            
                            // Change the text content
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Click] Changed overdue date to 5/15/2025');
                        }
                    });
                });
                
                console.log('[Fix Yuvi Click] Added click event listener to Yuvi\'s Bday task');
            }
        });
    }
    
    // Run the function immediately
    addClickListeners();
    
    // Run the function again after a delay to ensure the DOM is fully loaded
    setTimeout(addClickListeners, 1000);
    setTimeout(addClickListeners, 2000);
    setTimeout(addClickListeners, 3000);
    
    // Also run the function when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Click] Tasks loaded event received');
        setTimeout(addClickListeners, 500);
    });
    
    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Click] Task updated event received');
        setTimeout(addClickListeners, 500);
    });
    
    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Click] Tasks rendered event received');
        setTimeout(addClickListeners, 500);
    });
});

// Also run the script when the page is loaded
window.addEventListener('load', function() {
    console.log('[Fix Yuvi Click] Page loaded');
    
    // Function to add click event listeners to all task items
    function addClickListeners() {
        console.log('[Fix Yuvi Click] Adding click listeners to task items');
        
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        console.log('[Fix Yuvi Click] Found', taskItems.length, 'task items');
        
        // Loop through each task item
        taskItems.forEach((taskItem, index) => {
            // Find the task title
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Click] Found Yuvi\'s Bday task at index', index);
                
                // Add click event listener to the task item
                taskItem.addEventListener('click', function() {
                    console.log('[Fix Yuvi Click] Yuvi\'s Bday task clicked');
                    
                    // Find all spans in the task item
                    const spans = taskItem.querySelectorAll('span');
                    
                    // Loop through each span
                    spans.forEach(span => {
                        // Check if the span contains the text "Overdue: 5/16/2025"
                        if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                            console.log('[Fix Yuvi Click] Found overdue date span:', span.textContent);
                            
                            // Change the text content
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Click] Changed overdue date to 5/15/2025');
                        }
                    });
                });
                
                console.log('[Fix Yuvi Click] Added click event listener to Yuvi\'s Bday task');
            }
        });
    }
    
    // Run the function immediately
    addClickListeners();
    
    // Run the function again after a delay to ensure the DOM is fully loaded
    setTimeout(addClickListeners, 1000);
    setTimeout(addClickListeners, 2000);
    setTimeout(addClickListeners, 3000);
});
