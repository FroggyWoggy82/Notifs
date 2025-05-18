/**
 * Direct fix for Yuvi's Bday duplicate overdue text
 * This script directly targets the element with the duplicate text by its exact text content
 */

// Immediately execute script
(function() {
    console.log('[YUVI-EXACT-TEXT] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-EXACT-TEXT] Running fix...');

        try {
            // Find all elements with the exact text content "Overdue: 5/15/2025Overdue: 5/15/2025"
            const allElements = document.querySelectorAll('*');
            let fixedCount = 0;
            
            allElements.forEach(element => {
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                    const text = element.textContent.trim();
                    if (text === 'Overdue: 5/15/2025Overdue: 5/15/2025' || text === 'Overdue: 5/15/2025 Overdue: 5/15/2025') {
                        console.log('[YUVI-EXACT-TEXT] Found element with exact duplicate text:', text);
                        console.log('[YUVI-EXACT-TEXT] Element class:', element.className);
                        console.log('[YUVI-EXACT-TEXT] Element tag:', element.tagName);
                        
                        // Replace the element's text content
                        element.textContent = 'Overdue: 5/15/2025';
                        console.log('[YUVI-EXACT-TEXT] Fixed exact duplicate overdue text');
                        fixedCount++;
                    }
                }
            });
            
            console.log('[YUVI-EXACT-TEXT] Fixed', fixedCount, 'elements with exact duplicate overdue text');
            
            // Find all elements with text content containing "Overdue: 5/15/2025Overdue: 5/15/2025"
            allElements.forEach(element => {
                if (element.textContent && (
                    element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                    element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                    
                    console.log('[YUVI-EXACT-TEXT] Found element containing duplicate text:', element.textContent);
                    console.log('[YUVI-EXACT-TEXT] Element class:', element.className);
                    console.log('[YUVI-EXACT-TEXT] Element tag:', element.tagName);
                    
                    // Replace the element's text content
                    element.textContent = element.textContent.replace('Overdue: 5/15/2025Overdue: 5/15/2025', 'Overdue: 5/15/2025');
                    element.textContent = element.textContent.replace('Overdue: 5/15/2025 Overdue: 5/15/2025', 'Overdue: 5/15/2025');
                    console.log('[YUVI-EXACT-TEXT] Fixed element containing duplicate overdue text');
                    fixedCount++;
                }
            });
            
            console.log('[YUVI-EXACT-TEXT] Fixed', fixedCount, 'elements with duplicate overdue text');
        } catch (error) {
            console.error('[YUVI-EXACT-TEXT] Error:', error);
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
        console.log('[YUVI-EXACT-TEXT] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-EXACT-TEXT] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-EXACT-TEXT] Tasks rendered event received');
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
            console.log('[YUVI-EXACT-TEXT] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
