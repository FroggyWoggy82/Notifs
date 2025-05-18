/**
 * Fix Yuvi's Bday duplicate overdue text
 * This script specifically targets the duplicate "Overdue: 5/15/2025Overdue: 5/15/2025" text
 */

// Immediately execute script
(function() {
    console.log('[YUVI-DUPLICATE-FIX] Script loaded');

    // Function to fix the duplicate overdue text
    function fixDuplicateOverdueText() {
        console.log('[YUVI-DUPLICATE-FIX] Running fix...');

        try {
            // First approach: Find all elements with text content containing "Overdue: 5/15/2025Overdue: 5/15/2025"
            const allElements = document.querySelectorAll('*');
            let fixedCount = 0;

            allElements.forEach(element => {
                if (element.textContent && (
                    element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                    element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {

                    // Store the original text for logging
                    const originalText = element.textContent;

                    // Replace the element with a new one
                    const newElement = document.createElement('div');
                    newElement.className = element.className;
                    newElement.textContent = 'Overdue: 5/15/2025';

                    if (element.parentNode) {
                        element.parentNode.replaceChild(newElement, element);
                        console.log('[YUVI-DUPLICATE-FIX] Fixed duplicate overdue text:', originalText, '→', newElement.textContent);
                        fixedCount++;
                    }
                }
            });

            // Second approach: Directly target the specific element with the duplicate text
            const yuviBdayTasks = Array.from(document.querySelectorAll('.task-item')).filter(item => {
                const titleElement = item.querySelector('.task-title');
                return titleElement && titleElement.textContent.includes('Yuvi');
            });

            yuviBdayTasks.forEach(taskItem => {
                // Find all elements with class due-date-indicator
                const dueDateIndicators = taskItem.querySelectorAll('.due-date-indicator');
                dueDateIndicators.forEach(indicator => {
                    if (indicator.textContent && (
                        indicator.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        indicator.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {

                        // Store the original text for logging
                        const originalText = indicator.textContent;

                        // Replace the element's content
                        indicator.textContent = 'Overdue: 5/15/2025';
                        console.log('[YUVI-DUPLICATE-FIX] Fixed duplicate overdue text in due-date-indicator:', originalText, '→', indicator.textContent);
                        fixedCount++;
                    }
                });
            });

            console.log('[YUVI-DUPLICATE-FIX] Fixed', fixedCount, 'elements with duplicate overdue text');
        } catch (error) {
            console.error('[YUVI-DUPLICATE-FIX] Error:', error);
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
        console.log('[YUVI-DUPLICATE-FIX] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-DUPLICATE-FIX] Task updated event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-DUPLICATE-FIX] Tasks rendered event received');
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
            console.log('[YUVI-DUPLICATE-FIX] DOM changes detected, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
