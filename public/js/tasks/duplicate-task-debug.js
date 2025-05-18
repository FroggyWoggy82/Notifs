/**
 * Duplicate Task Debug
 * Adds debugging information to help diagnose duplicate task creation
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Duplicate task debug script loaded');
    
    // Add a counter to track form submissions
    window.taskSubmissionCount = 0;
    
    // Add a counter to track API calls
    window.taskApiCallCount = 0;
    
    // Store original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to track API calls
    window.fetch = function(url, options) {
        // Check if this is a task creation API call
        if (typeof url === 'string' && url.includes('/api/tasks') && options && options.method === 'POST') {
            window.taskApiCallCount++;
            console.log(`Task API call #${window.taskApiCallCount}:`, {
                url,
                method: options.method,
                body: options.body ? JSON.parse(options.body) : null
            });
        }
        
        // Call the original fetch function
        return originalFetch.apply(this, arguments);
    };
    
    // Log when the add task form is submitted
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        const originalAddEventListener = addTaskForm.addEventListener;
        
        // Override addEventListener to track submit events
        addTaskForm.addEventListener = function(type, listener, options) {
            if (type === 'submit') {
                console.log('Adding submit event listener to addTaskForm');
                
                // Wrap the listener to count submissions
                const wrappedListener = function(event) {
                    window.taskSubmissionCount++;
                    console.log(`Form submission #${window.taskSubmissionCount}`);
                    
                    // Call the original listener
                    return listener.apply(this, arguments);
                };
                
                // Call the original addEventListener with our wrapped listener
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            
            // Call the original addEventListener for other event types
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    // Add a visual indicator to show the fix is active
    const container = document.querySelector('.container');
    if (container) {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = 'rgba(0, 200, 0, 0.7)';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '5px';
        indicator.style.fontSize = '12px';
        indicator.style.zIndex = '9999';
        indicator.textContent = 'Duplicate Task Fix Active';
        container.appendChild(indicator);
    }
});
