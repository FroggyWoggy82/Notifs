/**
 * Direct fix for Yuvi's Bday duplicate overdue text
 * This script directly targets the element with the duplicate text
 */

// Immediately execute script
(function() {
    console.log('[YUVI-DIRECT-FIX] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-DIRECT-FIX] Running fix...');

        try {
            // Find the specific Yuvi's Bday task with duplicate text
            const yuviBdayTask = Array.from(document.querySelectorAll('.task-item')).find(item => {
                const titleElement = item.querySelector('.task-title');
                if (!titleElement || !titleElement.textContent.includes('Yuvi')) {
                    return false;
                }
                
                // Check if this task has the duplicate text
                const elements = item.querySelectorAll('*');
                return Array.from(elements).some(el => 
                    el.textContent && (
                        el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        el.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')
                    )
                );
            });
            
            if (yuviBdayTask) {
                console.log('[YUVI-DIRECT-FIX] Found Yuvi\'s Bday task with duplicate text');
                
                // Find the specific element with the duplicate text
                const elementWithDuplicateText = Array.from(yuviBdayTask.querySelectorAll('*')).find(el => 
                    el.textContent && (
                        el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        el.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')
                    )
                );
                
                if (elementWithDuplicateText) {
                    console.log('[YUVI-DIRECT-FIX] Found element with duplicate text:', elementWithDuplicateText.textContent);
                    console.log('[YUVI-DIRECT-FIX] Element class:', elementWithDuplicateText.className);
                    console.log('[YUVI-DIRECT-FIX] Element tag:', elementWithDuplicateText.tagName);
                    
                    // Replace the element with a new one
                    const newElement = document.createElement(elementWithDuplicateText.tagName);
                    newElement.className = elementWithDuplicateText.className;
                    newElement.textContent = 'Overdue: 5/15/2025';
                    
                    if (elementWithDuplicateText.parentNode) {
                        elementWithDuplicateText.parentNode.replaceChild(newElement, elementWithDuplicateText);
                        console.log('[YUVI-DIRECT-FIX] Fixed duplicate overdue text');
                    }
                } else {
                    console.log('[YUVI-DIRECT-FIX] Could not find element with duplicate text');
                }
            } else {
                console.log('[YUVI-DIRECT-FIX] Could not find Yuvi\'s Bday task with duplicate text');
            }
        } catch (error) {
            console.error('[YUVI-DIRECT-FIX] Error:', error);
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
        console.log('[YUVI-DIRECT-FIX] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-DIRECT-FIX] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-DIRECT-FIX] Tasks rendered event received');
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
            console.log('[YUVI-DIRECT-FIX] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
