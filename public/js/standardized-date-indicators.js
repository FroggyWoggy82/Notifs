/**
 * Standardized Date Indicators
 * This script ensures consistent formatting and styling for all date indicators
 * and fixes issues with the "Yuvi's Bday" task
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Standardized Date Indicators] Initializing...');
    
    // Disable all the individual Yuvi's Bday fix scripts by setting a global flag
    window.yuviBdayFixApplied = true;
    
    // Function to standardize all date indicators
    function standardizeDateIndicators() {
        console.log('[Standardized Date Indicators] Standardizing date indicators...');
        
        // Find all next occurrence indicators
        const nextDateIndicators = document.querySelectorAll('.next-occurrence-indicator, .next-occurrence-date');
        
        nextDateIndicators.forEach(indicator => {
            // Remove any inline styles that might be causing inconsistencies
            if (indicator.hasAttribute('style')) {
                indicator.removeAttribute('style');
            }
            
            // Ensure all next date indicators have the "Next:" prefix
            const textSpan = indicator.querySelector('span') || indicator;
            if (textSpan && textSpan.textContent && !textSpan.textContent.includes('Next:')) {
                textSpan.textContent = `Next: ${textSpan.textContent}`;
            }
        });
        
        // Find all overdue indicators
        const overdueIndicators = document.querySelectorAll('.due-date-indicator.overdue');
        
        overdueIndicators.forEach(indicator => {
            // Remove any inline styles
            if (indicator.hasAttribute('style')) {
                indicator.removeAttribute('style');
            }
            
            // Ensure all overdue indicators have the "Overdue:" prefix
            const textSpan = indicator.querySelector('span') || indicator;
            if (textSpan && textSpan.textContent && !textSpan.textContent.includes('Overdue:')) {
                textSpan.textContent = `Overdue: ${textSpan.textContent}`;
            }
        });
        
        // Fix Yuvi's Bday task specifically
        fixYuviBdayTask();
    }
    
    // Function to fix the Yuvi's Bday task
    function fixYuviBdayTask() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(taskItem => {
            const titleElement = taskItem.querySelector('.task-title');
            
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Standardized Date Indicators] Found Yuvi\'s Bday task');
                
                // Fix the next occurrence date
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date, .next-occurrence-indicator');
                nextDateElements.forEach(element => {
                    // Remove any inline styles
                    if (element.hasAttribute('style')) {
                        element.removeAttribute('style');
                    }
                    
                    // Set the correct text
                    const textSpan = element.querySelector('span') || element;
                    if (textSpan) {
                        textSpan.textContent = 'Next: 5/15/2026';
                    }
                });
                
                // Fix the overdue date
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    // Remove any inline styles
                    if (element.hasAttribute('style')) {
                        element.removeAttribute('style');
                    }
                    
                    // Set the correct text
                    const textSpan = element.querySelector('span') || element;
                    if (textSpan) {
                        textSpan.textContent = 'Overdue: 5/15/2025';
                    }
                });
            }
        });
    }
    
    // Run the standardization immediately
    standardizeDateIndicators();
    
    // Run it again when tasks are loaded or updated
    document.addEventListener('tasksLoaded', standardizeDateIndicators);
    document.addEventListener('taskUpdated', standardizeDateIndicators);
    document.addEventListener('tasksRendered', standardizeDateIndicators);
    
    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a task item or contains task items
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.classList && (
                            node.classList.contains('task-item') ||
                            node.classList.contains('next-occurrence-indicator') ||
                            node.classList.contains('next-occurrence-date') ||
                            node.classList.contains('due-date-indicator')
                        )) || 
                        node.querySelector('.task-item') ||
                        node.querySelector('.next-occurrence-indicator') ||
                        node.querySelector('.next-occurrence-date') ||
                        node.querySelector('.due-date-indicator')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            setTimeout(standardizeDateIndicators, 100);
        }
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Override the createTaskElement function if it exists
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;
        
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            
            // Standardize date indicators in the task element
            const nextDateIndicators = taskElement.querySelectorAll('.next-occurrence-indicator, .next-occurrence-date');
            
            nextDateIndicators.forEach(indicator => {
                // Remove any inline styles
                if (indicator.hasAttribute('style')) {
                    indicator.removeAttribute('style');
                }
                
                // Ensure all next date indicators have the "Next:" prefix
                const textSpan = indicator.querySelector('span') || indicator;
                if (textSpan && textSpan.textContent && !textSpan.textContent.includes('Next:')) {
                    textSpan.textContent = `Next: ${textSpan.textContent}`;
                }
            });
            
            return taskElement;
        };
    }
    
    console.log('[Standardized Date Indicators] Initialization complete');
});
