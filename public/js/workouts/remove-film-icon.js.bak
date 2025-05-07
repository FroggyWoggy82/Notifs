/**
 * Remove Film Icon
 * This script removes the film icon from the Add Video button in the workout options menu
 */

(function() {
    // Function to patch the createExerciseItem function to remove the film icon
    function patchCreateExerciseItem() {
        // Store the original function if it exists
        if (typeof window.createExerciseItem === 'function') {
            const originalCreateExerciseItem = window.createExerciseItem;
            
            // Override the function
            window.createExerciseItem = function(exerciseData, index, isTemplate = false) {
                // Call the original function to get the HTML
                const element = originalCreateExerciseItem(exerciseData, index, isTemplate);
                
                // Find and modify the Add Video button
                if (element) {
                    const viewButton = element.querySelector('.btn-view-exercise');
                    if (viewButton) {
                        // Get the current text
                        const text = viewButton.textContent.trim();
                        
                        // Remove the film emoji and clean up the text
                        if (text.includes('🎬')) {
                            viewButton.textContent = text.replace('🎬', '').trim();
                        }
                    }
                }
                
                return element;
            };
            
            console.log('[Remove Film Icon] Successfully patched createExerciseItem function');
        }
    }
    
    // Function to directly modify the HTML template
    function modifyTemplateStrings() {
        // Find all script tags that might contain the template
        const scripts = document.querySelectorAll('script');
        
        scripts.forEach(script => {
            if (script.textContent.includes('btn-view-exercise') && script.textContent.includes('🎬')) {
                // Replace the film emoji in the script content
                const originalContent = script.textContent;
                const modifiedContent = originalContent.replace(/🎬\s+/g, '');
                
                // Create a new script element with the modified content
                const newScript = document.createElement('script');
                newScript.textContent = modifiedContent;
                
                // Replace the old script with the new one
                if (script.parentNode) {
                    script.parentNode.replaceChild(newScript, script);
                    console.log('[Remove Film Icon] Modified template string in script tag');
                }
            }
        });
    }
    
    // Function to modify existing buttons in the DOM
    function removeFilmIconFromButtons() {
        // Find all Add Video buttons
        const addVideoButtons = document.querySelectorAll('.btn-view-exercise');
        
        addVideoButtons.forEach(button => {
            // Get the current text content
            const text = button.textContent.trim();
            
            // Remove the film emoji if present
            if (text.includes('🎬')) {
                button.textContent = text.replace('🎬', '').trim();
                console.log('[Remove Film Icon] Removed film icon from button');
            }
        });
    }
    
    // Function to observe DOM changes and remove film icons from new buttons
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for Add Video buttons in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is a button
                            if (node.classList && node.classList.contains('btn-view-exercise')) {
                                // Remove film icon from this button
                                const text = node.textContent.trim();
                                if (text.includes('🎬')) {
                                    node.textContent = text.replace('🎬', '').trim();
                                    console.log('[Remove Film Icon] Removed film icon from new button');
                                }
                            }
                            
                            // Also check child nodes
                            const buttons = node.querySelectorAll('.btn-view-exercise');
                            buttons.forEach(button => {
                                const text = button.textContent.trim();
                                if (text.includes('🎬')) {
                                    button.textContent = text.replace('🎬', '').trim();
                                    console.log('[Remove Film Icon] Removed film icon from new button (child)');
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('[Remove Film Icon] Started observing DOM changes');
    }
    
    // Initialize when the DOM is ready
    function init() {
        console.log('[Remove Film Icon] Initializing...');
        
        // Try to patch the createExerciseItem function
        patchCreateExerciseItem();
        
        // Modify template strings
        modifyTemplateStrings();
        
        // Remove film icons from existing buttons
        removeFilmIconFromButtons();
        
        // Observe DOM changes to remove film icons from new buttons
        observeDOMChanges();
        
        console.log('[Remove Film Icon] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
