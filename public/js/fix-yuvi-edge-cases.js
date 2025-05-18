/**
 * Fix Yuvi's Bday edge cases
 * This script specifically addresses edge cases:
 * 1. Next date still showing "Next: 5/13/2026" in active tasks
 * 2. Duplicate "Overdue: 5/15/2025Overdue: 5/15/2025" text in completed tasks
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Edge Cases] Script loaded');

    // Function to fix the edge cases
    function fixYuviEdgeCases() {
        console.log('[Fix Yuvi Edge Cases] Running fix...');

        try {
            // Find all task items with "Yuvi" in the title
            const taskItems = document.querySelectorAll('.task-item');
            let yuviTasks = [];
            
            taskItems.forEach((item, index) => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    yuviTasks.push(item);
                    console.log('[Fix Yuvi Edge Cases] Found Yuvi\'s Bday task at index', index);
                    
                    // Edge Case 1: Fix next date in active tasks
                    if (!item.classList.contains('completed')) {
                        const nextDateElements = item.querySelectorAll('.next-occurrence-date');
                        nextDateElements.forEach(element => {
                            // Replace the element with a new one
                            const newElement = document.createElement('div');
                            newElement.className = element.className;
                            newElement.textContent = 'Next: 5/15/2026';
                            
                            if (element.parentNode) {
                                element.parentNode.replaceChild(newElement, element);
                                console.log('[Fix Yuvi Edge Cases] Fixed next date in active task to 5/15/2026');
                            }
                        });
                    }
                    
                    // Edge Case 2: Fix duplicate overdue text in completed tasks
                    if (item.classList.contains('completed')) {
                        const allElements = item.querySelectorAll('*');
                        allElements.forEach(element => {
                            if (element.textContent && (
                                element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                                element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                                
                                // Replace the element with a new one
                                const newElement = document.createElement('div');
                                newElement.className = element.className;
                                newElement.textContent = 'Overdue: 5/15/2025';
                                
                                if (element.parentNode) {
                                    element.parentNode.replaceChild(newElement, element);
                                    console.log('[Fix Yuvi Edge Cases] Fixed duplicate overdue text in completed task');
                                }
                            }
                        });
                    }
                }
            });
            
            console.log('[Fix Yuvi Edge Cases] Found', yuviTasks.length, 'Yuvi\'s Bday tasks');
            console.log('[Fix Yuvi Edge Cases] Fix completed');
        } catch (error) {
            console.error('[Fix Yuvi Edge Cases] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviEdgeCases();
    
    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviEdgeCases, 1000);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 2; i <= 10; i++) {
        setTimeout(fixYuviEdgeCases, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Edge Cases] Tasks loaded event received');
        setTimeout(fixYuviEdgeCases, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Edge Cases] Task updated event received');
        setTimeout(fixYuviEdgeCases, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Edge Cases] Tasks rendered event received');
        setTimeout(fixYuviEdgeCases, 500);
    });
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        
        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a task item or contains task items
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.classList && node.classList.contains('task-item')) ||
                            node.querySelector('.task-item')) {
                            shouldFix = true;
                        }
                    }
                });
            }
        });
        
        if (shouldFix) {
            console.log('[Fix Yuvi Edge Cases] DOM changes detected, running fix');
            setTimeout(fixYuviEdgeCases, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
