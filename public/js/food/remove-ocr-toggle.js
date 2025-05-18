/**
 * Remove OCR Toggle
 * Removes the OCR toggle button and hides the OCR container
 */

(function() {
    console.log('[Remove OCR Toggle] Initializing');

    function removeOcrToggle() {
        console.log('[Remove OCR Toggle] Removing OCR toggle buttons');

        // Find all OCR toggle buttons
        const ocrToggleButtons = document.querySelectorAll('.raw-ocr-toggle');
        ocrToggleButtons.forEach(button => {
            console.log('[Remove OCR Toggle] Removing OCR toggle button:', button);
            button.remove();
        });

        // Hide all OCR containers
        const ocrContainers = document.querySelectorAll('.raw-ocr-container');
        ocrContainers.forEach(container => {
            console.log('[Remove OCR Toggle] Hiding OCR container:', container);
            container.style.display = 'none';
        });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(removeOcrToggle, 500);
        });
    } else {
        setTimeout(removeOcrToggle, 500);
    }

    // Set up a mutation observer to watch for new OCR toggle buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(removeOcrToggle, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Remove OCR Toggle] Initialized');
})();
