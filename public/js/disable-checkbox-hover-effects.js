/**
 * Fix Checkbox Hover Effects
 * This script fixes the white flashing issue when hovering over checkboxes
 * while preserving the checkbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Checkbox Hover Effects] Initializing...');

    // Set a global flag to indicate that hover effects are fixed
    window.checkboxHoverEffectsFixed = true;

    // Function to fix checkbox hover effects
    function fixCheckboxHoverEffects() {
        // Get all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"], .habit-checkbox');

        // Remove all inline styles that might be causing the flashing
        checkboxes.forEach(checkbox => {
            if (checkbox.hasAttribute('style')) {
                // Store the original checked state
                const wasChecked = checkbox.checked;

                // Only remove background-color and transition styles
                const currentStyle = checkbox.getAttribute('style');
                const newStyle = currentStyle
                    .replace(/background-color:[^;]+;?/g, '')
                    .replace(/transition:[^;]+;?/g, '')
                    .replace(/animation:[^;]+;?/g, '');

                if (newStyle.trim()) {
                    checkbox.setAttribute('style', newStyle);
                } else {
                    checkbox.removeAttribute('style');
                }

                // Restore the checked state
                checkbox.checked = wasChecked;
            }
        });
    }

    // Run the function immediately
    fixCheckboxHoverEffects();

    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;

        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a checkbox or contains checkboxes
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.tagName === 'INPUT' && node.type === 'checkbox') ||
                            node.classList && node.classList.contains('habit-checkbox') ||
                            node.querySelector('input[type="checkbox"]') ||
                            node.querySelector('.habit-checkbox')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            setTimeout(fixCheckboxHoverEffects, 100);
        }
    });

    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });

    console.log('[Fix Checkbox Hover Effects] Initialization complete');
});
