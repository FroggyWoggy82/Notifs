/**
 * Fix Button Text Display
 * Ensures the text in the Show Detailed Nutrition button is fully displayed and properly aligned
 */
(function() {
    // Function to fix button text display
    function fixButtonTextDisplay() {
        // Find all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');

        toggleButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.textFixed === 'true') return;

            // Mark as processed
            button.dataset.textFixed = 'true';

            // Create a wrapper for the text to ensure it's properly displayed
            const textWrapper = document.createElement('span');
            textWrapper.style.whiteSpace = 'nowrap';
            textWrapper.style.overflow = 'visible';
            textWrapper.style.display = 'inline-block';
            textWrapper.style.width = 'auto';
            textWrapper.style.textAlign = 'center';
            textWrapper.textContent = 'Show Detailed Nutrition';

            // Clear the button and add the wrapper
            button.textContent = '';
            button.appendChild(textWrapper);

            // Style the button to ensure proper alignment
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.height = '38px';
            button.style.lineHeight = '1';
            button.style.padding = '0 15px';
            button.style.margin = '0';
            button.style.whiteSpace = 'nowrap';
            button.style.overflow = 'visible';
            button.style.textOverflow = 'clip';
            button.style.verticalAlign = 'middle';

            // Find the other buttons in the same row using standard DOM methods
            let addButton = null;
            let removeButton = null;

            // Get all buttons in the parent container
            const siblingButtons = button.parentNode.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            siblingButtons.forEach(btn => {
                const text = btn.textContent.toLowerCase();
                if (text.includes('add')) {
                    addButton = btn;
                } else if (text.includes('remove')) {
                    removeButton = btn;
                }
            });

            // If we have the other buttons, match their height
            if (addButton) {
                const addStyle = window.getComputedStyle(addButton);
                button.style.height = addStyle.height;
                button.style.lineHeight = addStyle.lineHeight;
                button.style.padding = addStyle.padding;
                button.style.fontSize = addStyle.fontSize;
            }

            // Make sure the button is in a flex container
            if (button.parentNode) {
                button.parentNode.style.display = 'flex';
                button.parentNode.style.alignItems = 'center';
                button.parentNode.style.justifyContent = 'space-between';
                button.parentNode.style.width = '100%';
                button.parentNode.style.margin = '10px 0';
                button.parentNode.style.height = '38px';

                // Make all buttons in the row have the same flex
                const allButtons = button.parentNode.querySelectorAll('button');
                allButtons.forEach(btn => {
                    btn.style.flex = '1';
                    btn.style.margin = '0 5px';
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                });

                // First button should have no left margin
                const firstButton = button.parentNode.firstElementChild;
                if (firstButton) {
                    firstButton.style.marginLeft = '0';
                }

                // Last button should have no right margin
                const lastButton = button.parentNode.lastElementChild;
                if (lastButton) {
                    lastButton.style.marginRight = '0';
                }
            }

            // Add click handler to update the text
            button.addEventListener('click', function() {
                const panel = this.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
                if (!panel) return;

                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    textWrapper.textContent = 'Hide Detailed Nutrition';
                } else {
                    textWrapper.textContent = 'Show Detailed Nutrition';
                }
            });
        });
    }

    // Helper function to find elements by text content (not used anymore)
    // We're using standard DOM methods instead

    // Run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixButtonTextDisplay, 500);
        });
    } else {
        setTimeout(fixButtonTextDisplay, 500);
    }

    // Also run after delays to ensure all dynamic content is loaded
    setTimeout(fixButtonTextDisplay, 1000);
    setTimeout(fixButtonTextDisplay, 2000);

    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        setTimeout(fixButtonTextDisplay, 100);
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
