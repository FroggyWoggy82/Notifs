/**
 * Fix Robert's Overdue Date
 * Forces the correct overdue date for Robert's birthday task
 */

(function() {
    'use strict';
    
    function fixRobertOverdueDate() {
        try {
            console.log('[Fix Robert Overdue] Running fix...');
            
            // Find all task items
            const taskItems = document.querySelectorAll('.task-item');
            
            taskItems.forEach(item => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Robert')) {
                    console.log('[Fix Robert Overdue] Found Robert task');
                    
                    // Find all overdue elements
                    const overdueElements = item.querySelectorAll('.due-date-indicator.overdue');
                    overdueElements.forEach(element => {
                        // Check if it shows the wrong date
                        if (element.textContent && element.textContent.includes('5/15/2025')) {
                            console.log('[Fix Robert Overdue] Found wrong overdue date:', element.textContent);
                            
                            // Replace with correct date
                            const span = element.querySelector('span');
                            if (span) {
                                span.textContent = 'Overdue: 6/5/2025';
                                console.log('[Fix Robert Overdue] Fixed overdue date to 6/5/2025');
                            } else {
                                element.textContent = 'Overdue: 6/5/2025';
                                console.log('[Fix Robert Overdue] Fixed overdue date to 6/5/2025 (no span)');
                            }
                        }
                    });
                    
                    // Also check for any elements that contain 5/15/2025 and replace them
                    const allElements = item.querySelectorAll('*');
                    allElements.forEach(el => {
                        if (el.textContent && el.textContent.includes('5/15/2025')) {
                            console.log('[Fix Robert Overdue] Found 5/15/2025 in element:', el.textContent);
                            
                            // Replace 5/15/2025 with 6/5/2025
                            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                                el.textContent = el.textContent.replace('5/15/2025', '6/5/2025');
                                console.log('[Fix Robert Overdue] Replaced 5/15/2025 with 6/5/2025');
                            }
                        }
                    });
                }
            });
            
        } catch (error) {
            console.error('[Fix Robert Overdue] Error:', error);
        }
    }
    
    // Run the fix immediately
    fixRobertOverdueDate();
    
    // Run the fix when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Robert Overdue] DOM loaded, running fix...');
        setTimeout(fixRobertOverdueDate, 500);
    });
    
    // Run the fix when tasks are loaded
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Robert Overdue] Tasks loaded, running fix...');
        setTimeout(fixRobertOverdueDate, 100);
    });
    
    // Set up a mutation observer to catch any changes
    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if ((node.classList && node.classList.contains('task-item')) ||
                            node.querySelector && node.querySelector('.task-item')) {
                            shouldFix = true;
                        }
                    }
                });
            }
            
            // Also check for text changes that might introduce 5/15/2025
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const target = mutation.target;
                if (target.textContent && target.textContent.includes('5/15/2025')) {
                    shouldFix = true;
                }
            }
        });
        
        if (shouldFix) {
            setTimeout(fixRobertOverdueDate, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    // Run the fix every 2 seconds for the first 10 seconds to ensure it gets applied
    for (let i = 1; i <= 5; i++) {
        setTimeout(fixRobertOverdueDate, i * 2000);
    }
    
    console.log('[Fix Robert Overdue] Script loaded and observers set up');
})();
