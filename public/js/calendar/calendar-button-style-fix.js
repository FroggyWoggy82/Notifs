// Calendar Button Style Fix
// Overrides the inline styles for edit and delete buttons in the calendar

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar button style fix loaded');
    
    // Function to override button styles
    function overrideButtonStyles() {
        // Find all edit and delete buttons in the selected task list
        const editButtons = document.querySelectorAll('#selectedTaskList .edit-task-btn');
        const deleteButtons = document.querySelectorAll('#selectedTaskList .delete-btn');
        
        // Override edit button styles
        editButtons.forEach(button => {
            // Remove inline styles that set background and border colors
            button.style.removeProperty('background');
            button.style.removeProperty('border');
            button.style.removeProperty('box-shadow');
        });
        
        // Override delete button styles
        deleteButtons.forEach(button => {
            // Remove inline styles that set background and border colors
            button.style.removeProperty('background');
            button.style.removeProperty('border');
            button.style.removeProperty('box-shadow');
        });
    }
    
    // Create a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if any nodes were added
            if (mutation.addedNodes.length) {
                // Check if any of the added nodes are buttons or contain buttons
                mutation.addedNodes.forEach(node => {
                    // If the node is an element
                    if (node.nodeType === 1) {
                        // If the node is a button with the relevant classes
                        if ((node.classList && (node.classList.contains('edit-task-btn') || node.classList.contains('delete-btn')))) {
                            overrideButtonStyles();
                        }
                        // If the node contains buttons
                        else if (node.querySelectorAll) {
                            const buttons = node.querySelectorAll('.edit-task-btn, .delete-btn');
                            if (buttons.length) {
                                overrideButtonStyles();
                            }
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run once on page load
    overrideButtonStyles();
});
