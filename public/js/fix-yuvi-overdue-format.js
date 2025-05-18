/**
 * Fix for Yuvi's Bday overdue date formatting
 * This script fixes the formatting of the overdue date display
 */

// Immediately execute script
(function() {
    console.log('[YUVI-FORMAT-FIX] Script loaded');

    // Function to fix the overdue date formatting
    function fixOverdueDateFormat() {
        console.log('[YUVI-FORMAT-FIX] Running fix...');

        try {
            // Find all Yuvi's Bday tasks
            const taskItems = document.querySelectorAll('.task-item');
            
            taskItems.forEach((taskItem, index) => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-FORMAT-FIX] Found Yuvi\'s Bday task at index', index);
                    
                    // Find the overdue date element
                    const overdueElement = taskItem.querySelector('.overdue-date');
                    if (overdueElement) {
                        console.log('[YUVI-FORMAT-FIX] Found overdue date element:', overdueElement.textContent);
                        
                        // Add CSS to fix the formatting
                        overdueElement.style.display = 'inline-block';
                        overdueElement.style.whiteSpace = 'nowrap';
                        
                        console.log('[YUVI-FORMAT-FIX] Applied formatting fix to overdue date element');
                    }
                    
                    // Find all elements that might contain the overdue text
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.textContent && element.textContent.includes('Overdue:')) {
                            console.log('[YUVI-FORMAT-FIX] Found element with overdue text:', element.textContent);
                            console.log('[YUVI-FORMAT-FIX] Element class:', element.className);
                            
                            // Apply styling to ensure text stays on one line
                            element.style.display = 'inline-block';
                            element.style.whiteSpace = 'nowrap';
                            
                            // If this is a next-occurrence-date element, apply specific styling
                            if (element.classList.contains('next-occurrence-date')) {
                                element.style.display = 'inline-block';
                                element.style.whiteSpace = 'nowrap';
                                element.style.color = '#ff5555'; // Make sure the text is red
                                
                                // Check if the text is split across multiple elements
                                if (element.childNodes.length > 1) {
                                    // Combine all text into a single text node
                                    const combinedText = Array.from(element.childNodes)
                                        .map(node => node.textContent)
                                        .join(' ')
                                        .replace(/Overdue:\s+/, 'Overdue: ');
                                    
                                    element.textContent = combinedText;
                                    console.log('[YUVI-FORMAT-FIX] Combined split text nodes:', combinedText);
                                }
                            }
                            
                            console.log('[YUVI-FORMAT-FIX] Applied formatting fix');
                        }
                    });
                    
                    // Add CSS to the task item to ensure proper layout
                    const taskDetails = taskItem.querySelector('.task-details');
                    if (taskDetails) {
                        taskDetails.style.display = 'flex';
                        taskDetails.style.flexDirection = 'row';
                        taskDetails.style.alignItems = 'center';
                        taskDetails.style.flexWrap = 'nowrap';
                        
                        console.log('[YUVI-FORMAT-FIX] Applied layout fix to task details');
                    }
                }
            });
        } catch (error) {
            console.error('[YUVI-FORMAT-FIX] Error:', error);
        }
    }

    // Run the fix immediately
    fixOverdueDateFormat();
    
    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixOverdueDateFormat, 1000);
    
    // Run the fix every second for 5 seconds to ensure it gets applied
    for (let i = 2; i <= 5; i++) {
        setTimeout(fixOverdueDateFormat, i * 1000);
    }
    
    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[YUVI-FORMAT-FIX] Tasks loaded event received');
        setTimeout(fixOverdueDateFormat, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-FORMAT-FIX] Task updated event received');
        setTimeout(fixOverdueDateFormat, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-FORMAT-FIX] Tasks rendered event received');
        setTimeout(fixOverdueDateFormat, 500);
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
            console.log('[YUVI-FORMAT-FIX] DOM changes detected, running fix');
            setTimeout(fixOverdueDateFormat, 100);
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Add global CSS to fix the formatting of all overdue dates
    const style = document.createElement('style');
    style.textContent = `
        .next-occurrence-date {
            display: inline-block !important;
            white-space: nowrap !important;
        }
        .overdue-date {
            display: inline-block !important;
            white-space: nowrap !important;
        }
    `;
    document.head.appendChild(style);
    console.log('[YUVI-FORMAT-FIX] Added global CSS fixes');
})();
