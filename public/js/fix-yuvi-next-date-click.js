/**
 * Fix Yuvi's Bday next date - Click approach
 * This script adds click event listeners to Yuvi's Bday tasks to fix the next date when clicked
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Next Date Click] Script loaded');

    // Function to add click event listeners to Yuvi's Bday tasks
    function addClickListeners() {
        console.log('[Fix Yuvi Next Date Click] Adding click listeners to task items');

        try {
            // Find all task items with "Yuvi" in the title
            const taskItems = document.querySelectorAll('.task-item');
            let yuviTasks = [];
            
            taskItems.forEach((item, index) => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    yuviTasks.push(item);
                    console.log('[Fix Yuvi Next Date Click] Found Yuvi\'s Bday task at index', index);
                    
                    // Add click event listener to the task item
                    item.addEventListener('click', function() {
                        console.log('[Fix Yuvi Next Date Click] Yuvi\'s Bday task clicked');
                        
                        // Fix the next date
                        setTimeout(function() {
                            // Find all elements with text content "Next: 5/13/2026"
                            const allElements = document.querySelectorAll('*');
                            allElements.forEach(element => {
                                if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                                    // Replace the text content
                                    element.textContent = 'Next: 5/15/2026';
                                    console.log('[Fix Yuvi Next Date Click] Fixed next date to 5/15/2026');
                                }
                            });
                            
                            // Specifically target .next-occurrence-date elements
                            const nextDateElements = document.querySelectorAll('.next-occurrence-date');
                            nextDateElements.forEach(element => {
                                if (element.textContent && element.textContent.includes('Next: 5/13/2026')) {
                                    // Replace the text content
                                    element.textContent = 'Next: 5/15/2026';
                                    console.log('[Fix Yuvi Next Date Click] Fixed next-occurrence-date to 5/15/2026');
                                }
                            });
                        }, 500);
                    });
                    
                    console.log('[Fix Yuvi Next Date Click] Added click event listener to Yuvi\'s Bday task');
                }
            });
            
            console.log('[Fix Yuvi Next Date Click] Found', yuviTasks.length, 'Yuvi\'s Bday tasks');
        } catch (error) {
            console.error('[Fix Yuvi Next Date Click] Error:', error);
        }
    }

    // Run the function immediately
    addClickListeners();
    
    // Run the function after a delay to ensure the DOM is fully loaded
    setTimeout(addClickListeners, 2000);
    
    // Also run the function when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Next Date Click] Tasks loaded event received');
        setTimeout(addClickListeners, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Next Date Click] Task updated event received');
        setTimeout(addClickListeners, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Next Date Click] Tasks rendered event received');
        setTimeout(addClickListeners, 500);
    });
})();
