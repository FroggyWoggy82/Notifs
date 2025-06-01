/**
 * Save Recipe Button Fix
 * Ensures the Save Recipe button actually works by bypassing click event issues
 */

(function() {
    'use strict';

    console.log('[Save Recipe Button Fix] Loading...');

    function fixSaveRecipeButton() {
        console.log('[Save Recipe Button Fix] Attempting to fix Save Recipe button...');

        // Find the Save Recipe button
        const saveButton = document.querySelector('#create-recipe-form button[type="submit"]');
        const form = document.getElementById('create-recipe-form');

        if (!saveButton) {
            console.log('[Save Recipe Button Fix] Save Recipe button not found');
            return;
        }

        if (!form) {
            console.log('[Save Recipe Button Fix] Create recipe form not found');
            return;
        }

        console.log('[Save Recipe Button Fix] Found Save Recipe button and form');

        // Remove any existing click handlers and add our own
        const newButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newButton, saveButton);

        // Add our custom click handler that directly triggers form submission
        newButton.addEventListener('click', function(e) {
            console.log('[Save Recipe Button Fix] Save Recipe button clicked - triggering form submission');
            
            // Prevent default behavior
            e.preventDefault();
            e.stopPropagation();
            
            // Directly trigger the form's submit event
            const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true
            });
            
            form.dispatchEvent(submitEvent);
        });

        // Also ensure the button is properly styled and clickable
        newButton.style.setProperty('pointer-events', 'auto', 'important');
        newButton.style.setProperty('z-index', '9999', 'important');
        newButton.style.setProperty('position', 'relative', 'important');
        newButton.style.setProperty('cursor', 'pointer', 'important');

        console.log('[Save Recipe Button Fix] Save Recipe button fixed with direct form submission');
    }

    // Run the fix multiple times to catch dynamic content
    function runFix() {
        fixSaveRecipeButton();
    }

    // Run immediately
    runFix();

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runFix);
    } else {
        runFix();
    }

    // Run after delays to catch dynamic content
    setTimeout(runFix, 100);
    setTimeout(runFix, 500);
    setTimeout(runFix, 1000);
    setTimeout(runFix, 2000);

    // Monitor for changes and re-apply fix
    const observer = new MutationObserver(function(mutations) {
        let shouldRun = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.id === 'create-recipe-form' ||
                        node.querySelector?.('#create-recipe-form') ||
                        (node.tagName === 'BUTTON' && node.type === 'submit')
                    )) {
                        shouldRun = true;
                    }
                });
            }
        });

        if (shouldRun) {
            setTimeout(runFix, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('[Save Recipe Button Fix] Initialized with monitoring');
})();
