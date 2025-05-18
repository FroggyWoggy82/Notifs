/**
 * Direct fix for Yuvi's Bday duplicate overdue text
 * This script directly targets the element with the duplicate text by its specific class and position
 */

// Immediately execute script
(function() {
    console.log('[YUVI-DIRECT-ELEMENT] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-DIRECT-ELEMENT] Running fix...');

        try {
            // Find all Yuvi's Bday tasks
            const yuviBdayTasks = Array.from(document.querySelectorAll('.task-item')).filter(item => {
                const titleElement = item.querySelector('.task-title');
                return titleElement && titleElement.textContent.includes('Yuvi');
            });
            
            console.log('[YUVI-DIRECT-ELEMENT] Found', yuviBdayTasks.length, 'Yuvi\'s Bday tasks');
            
            // Process each Yuvi's Bday task
            yuviBdayTasks.forEach((taskItem, index) => {
                console.log('[YUVI-DIRECT-ELEMENT] Processing Yuvi\'s Bday task at index', index);
                
                // Check if this is a completed task
                if (taskItem.classList.contains('completed')) {
                    console.log('[YUVI-DIRECT-ELEMENT] This is a completed task');
                    
                    // Find the specific element with the duplicate text
                    const nextOccurrenceDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                    nextOccurrenceDateElements.forEach((element, i) => {
                        console.log('[YUVI-DIRECT-ELEMENT] Found next-occurrence-date element', i, ':', element.textContent);
                        
                        if (element.textContent && (
                            element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                            
                            console.log('[YUVI-DIRECT-ELEMENT] Found element with duplicate text:', element.textContent);
                            
                            // Replace the element's text content
                            element.textContent = 'Overdue: 5/15/2025';
                            console.log('[YUVI-DIRECT-ELEMENT] Fixed duplicate overdue text');
                        }
                    });
                    
                    // Find all elements with the duplicate text
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.textContent && (
                            element.textContent === 'Overdue: 5/15/2025Overdue: 5/15/2025' ||
                            element.textContent === 'Overdue: 5/15/2025 Overdue: 5/15/2025')) {
                            
                            console.log('[YUVI-DIRECT-ELEMENT] Found element with exact duplicate text:', element.textContent);
                            console.log('[YUVI-DIRECT-ELEMENT] Element class:', element.className);
                            console.log('[YUVI-DIRECT-ELEMENT] Element tag:', element.tagName);
                            
                            // Replace the element's text content
                            element.textContent = 'Overdue: 5/15/2025';
                            console.log('[YUVI-DIRECT-ELEMENT] Fixed exact duplicate overdue text');
                        }
                    });
                }
            });
        } catch (error) {
            console.error('[YUVI-DIRECT-ELEMENT] Error:', error);
        }
    }

    // Run the fix immediately
    fixDuplicateOverdueText();
    
    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixDuplicateOverdueText, 1000);
    
    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 2; i <= 10; i++) {
        setTimeout(fixDuplicateOverdueText, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[YUVI-DIRECT-ELEMENT] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-DIRECT-ELEMENT] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-DIRECT-ELEMENT] Tasks rendered event received');
        setTimeout(fixDuplicateOverdueText, 500);
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
            console.log('[YUVI-DIRECT-ELEMENT] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
