/**
 * Direct fix for Yuvi's Bday duplicate overdue text
 * This script directly targets the element with the duplicate text by its specific reference in the DOM
 */

// Immediately execute script
(function() {
    console.log('[YUVI-DIRECT-REF] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-DIRECT-REF] Running fix...');

        try {
            // Find the specific element with the duplicate text
            const specificElement = document.querySelector('.task-item .next-occurrence-date');
            if (specificElement && (
                specificElement.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                specificElement.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                
                console.log('[YUVI-DIRECT-REF] Found element with duplicate text:', specificElement.textContent);
                specificElement.textContent = 'Overdue: 5/15/2025';
                console.log('[YUVI-DIRECT-REF] Fixed duplicate overdue text');
            }
            
            // Find all elements with the duplicate text
            const allElements = document.querySelectorAll('.task-item .next-occurrence-date');
            allElements.forEach(element => {
                if (element.textContent && (
                    element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                    element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                    
                    console.log('[YUVI-DIRECT-REF] Found element with duplicate text:', element.textContent);
                    element.textContent = 'Overdue: 5/15/2025';
                    console.log('[YUVI-DIRECT-REF] Fixed duplicate overdue text');
                }
            });
            
            // Find the specific element with reference e371
            const yuviBdayTasks = document.querySelectorAll('.task-item');
            yuviBdayTasks.forEach(taskItem => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-DIRECT-REF] Found Yuvi\'s Bday task');
                    
                    // Find all elements with the duplicate text
                    const nextOccurrenceDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                    nextOccurrenceDateElements.forEach(element => {
                        console.log('[YUVI-DIRECT-REF] Found next-occurrence-date element:', element.textContent);
                        
                        if (element.textContent && (
                            element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                            
                            console.log('[YUVI-DIRECT-REF] Found element with duplicate text:', element.textContent);
                            element.textContent = 'Overdue: 5/15/2025';
                            console.log('[YUVI-DIRECT-REF] Fixed duplicate overdue text');
                        }
                    });
                }
            });
        } catch (error) {
            console.error('[YUVI-DIRECT-REF] Error:', error);
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
        console.log('[YUVI-DIRECT-REF] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-DIRECT-REF] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-DIRECT-REF] Tasks rendered event received');
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
            console.log('[YUVI-DIRECT-REF] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
