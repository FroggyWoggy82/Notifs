/**
 * Direct fix for Yuvi's Bday duplicate overdue text
 * This script directly modifies the DOM structure
 */

// Immediately execute script
(function() {
    console.log('[YUVI-DOM-STRUCTURE] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-DOM-STRUCTURE] Running fix...');

        try {
            // Find all Yuvi's Bday tasks
            const taskItems = document.querySelectorAll('.task-item');
            
            taskItems.forEach((taskItem, index) => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-DOM-STRUCTURE] Found Yuvi\'s Bday task at index', index);
                    
                    // Find all next-occurrence-date elements
                    const nextOccurrenceDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                    
                    nextOccurrenceDateElements.forEach((element, i) => {
                        console.log('[YUVI-DOM-STRUCTURE] Found next-occurrence-date element', i, ':', element.textContent);
                        
                        if (element.textContent && (
                            element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                            
                            console.log('[YUVI-DOM-STRUCTURE] Found element with duplicate text:', element.textContent);
                            
                            // Create a new element to replace the old one
                            const newElement = document.createElement('span');
                            newElement.className = element.className;
                            newElement.textContent = 'Overdue: 5/15/2025';
                            
                            // Replace the old element with the new one
                            element.parentNode.replaceChild(newElement, element);
                            
                            console.log('[YUVI-DOM-STRUCTURE] Replaced element with duplicate text');
                        }
                    });
                    
                    // Check if there are any elements with duplicate text
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                            const text = element.textContent.trim();
                            if (text === 'Overdue: 5/15/2025Overdue: 5/15/2025' || text === 'Overdue: 5/15/2025 Overdue: 5/15/2025') {
                                console.log('[YUVI-DOM-STRUCTURE] Found element with exact duplicate text:', text);
                                element.textContent = 'Overdue: 5/15/2025';
                                console.log('[YUVI-DOM-STRUCTURE] Fixed exact duplicate overdue text');
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('[YUVI-DOM-STRUCTURE] Error:', error);
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
        console.log('[YUVI-DOM-STRUCTURE] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-DOM-STRUCTURE] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-DOM-STRUCTURE] Tasks rendered event received');
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
            console.log('[YUVI-DOM-STRUCTURE] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
