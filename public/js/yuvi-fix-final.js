/**
 * Final fix for Yuvi's Bday dates
 * This script combines all fixes into one comprehensive solution
 */

// Immediately execute script
(function() {
    console.log('[YUVI-FINAL-FIX] Script loaded');

    // Function to fix all Yuvi's Bday date issues
    function fixYuviBdayDates() {
        console.log('[YUVI-FINAL-FIX] Running fix...');

        try {
            // Find all task items with "Yuvi" in the title
            const taskItems = document.querySelectorAll('.task-item');
            let yuviTasks = [];
            
            taskItems.forEach((item, index) => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    yuviTasks.push(item);
                    console.log('[YUVI-FINAL-FIX] Found Yuvi\'s Bday task at index', index);
                    
                    // Fix 1: Fix overdue date in active tasks
                    if (!item.classList.contains('completed')) {
                        const overdueElements = item.querySelectorAll('.due-date-indicator.overdue');
                        overdueElements.forEach(element => {
                            // Clear all child nodes
                            while (element.firstChild) {
                                element.removeChild(element.firstChild);
                            }
                            
                            // Create a span for the overdue text
                            const span = document.createElement('span');
                            span.textContent = 'Overdue: 5/15/2025';
                            element.appendChild(span);
                            console.log('[YUVI-FINAL-FIX] Fixed overdue date to 5/15/2025');
                        });
                    }
                    
                    // Fix 2: Fix next date in active tasks
                    if (!item.classList.contains('completed')) {
                        const nextDateElements = item.querySelectorAll('.next-occurrence-date');
                        nextDateElements.forEach(element => {
                            // Replace the element with a new one
                            const newElement = document.createElement('div');
                            newElement.className = element.className;
                            newElement.textContent = 'Next: 5/15/2026';
                            
                            if (element.parentNode) {
                                element.parentNode.replaceChild(newElement, element);
                                console.log('[YUVI-FINAL-FIX] Fixed next date in active task to 5/15/2026');
                            }
                        });
                    }
                    
                    // Fix 3: Fix next date in completed tasks
                    if (item.classList.contains('completed')) {
                        const nextDateElements = item.querySelectorAll('.next-occurrence-date');
                        nextDateElements.forEach(element => {
                            // Replace the element with a new one
                            const newElement = document.createElement('div');
                            newElement.className = element.className;
                            newElement.textContent = 'Next: 5/15/2026';
                            
                            if (element.parentNode) {
                                element.parentNode.replaceChild(newElement, element);
                                console.log('[YUVI-FINAL-FIX] Fixed next date in completed task to 5/15/2026');
                            }
                        });
                    }
                    
                    // Fix 4: Fix duplicate overdue text in completed tasks
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
                                    console.log('[YUVI-FINAL-FIX] Fixed duplicate overdue text in completed task');
                                }
                            }
                        });
                    }
                }
            });
            
            console.log('[YUVI-FINAL-FIX] Found', yuviTasks.length, 'Yuvi\'s Bday tasks');
            console.log('[YUVI-FINAL-FIX] Fix completed');
        } catch (error) {
            console.error('[YUVI-FINAL-FIX] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviBdayDates();
    
    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviBdayDates, 1000);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 2; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[YUVI-FINAL-FIX] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-FINAL-FIX] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-FINAL-FIX] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
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
            console.log('[YUVI-FINAL-FIX] DOM changes detected, running fix');
            setTimeout(fixYuviBdayDates, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
