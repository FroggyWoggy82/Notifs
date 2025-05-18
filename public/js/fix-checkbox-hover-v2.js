/**
 * Fix Checkbox Hover Effects v3
 * This script fixes the white flashing issue and size changes when hovering over checkboxes
 * while preserving the checkbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Checkbox Hover Effects v3] Initializing...');

    // Function to ensure checkboxes are clickable and maintain consistent size
    function fixCheckboxes() {
        // Get all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"], .habit-checkbox');

        // Make sure all checkboxes are clickable and have consistent size
        checkboxes.forEach(checkbox => {
            // Store the original checked state
            const wasChecked = checkbox.checked;

            // Ensure the checkbox is clickable
            checkbox.style.pointerEvents = 'auto';
            checkbox.style.cursor = 'pointer';

            // Force consistent size
            checkbox.style.width = '24px';
            checkbox.style.height = '24px';
            checkbox.style.minWidth = '24px';
            checkbox.style.minHeight = '24px';
            checkbox.style.maxWidth = '24px';
            checkbox.style.maxHeight = '24px';

            // Prevent any transforms that might cause size changes
            checkbox.style.transform = 'none';

            // Disable any animations
            checkbox.style.animation = 'none';

            // Restore the checked state
            checkbox.checked = wasChecked;
        });
    }

    // Run the function immediately
    fixCheckboxes();

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
            setTimeout(fixCheckboxes, 100);
        }
    });

    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('[Fix Checkbox Hover Effects v3] Initialization complete');
});
