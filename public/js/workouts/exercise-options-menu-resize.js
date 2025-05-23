/**
 * Exercise Options Menu Resize
 * Adjusts the size of elements in the exercise options menu
 */

(function() {
    // Function to adjust the exercise options menu elements
    function adjustExerciseOptionsMenuElements() {
        // Find all exercise unit select elements and make them smaller
        const unitSelects = document.querySelectorAll('.exercise-unit-select');
        unitSelects.forEach(select => {
            select.style.width = '38px';
            select.style.minWidth = '38px';
            select.style.maxWidth = '38px';
            select.style.paddingLeft = '1px';
            select.style.paddingRight = '1px';
            select.style.textOverflow = 'ellipsis';
            select.style.overflow = 'hidden';
        });

        // Find all Add Video buttons and make them smaller
        const addVideoButtons = document.querySelectorAll('.btn-view-exercise');
        addVideoButtons.forEach(button => {
            button.style.minWidth = '65px';
            button.style.maxWidth = '65px';
            button.style.padding = '0 2px';
            button.style.fontSize = '0.7rem';
        });

        // Find all History buttons and make them smaller
        const historyButtons = document.querySelectorAll('.view-history-btn');
        historyButtons.forEach(button => {
            button.style.minWidth = '55px';
            button.style.maxWidth = '55px';
            button.style.padding = '0 2px';
            button.style.fontSize = '0.7rem';
        });
    }

    // Function to observe DOM changes and adjust elements when the menu appears
    function observeDOMChanges() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check if any nodes were added
                if (mutation.addedNodes.length) {
                    // Check if any of the added nodes are exercise options menus
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (
                            node.classList && node.classList.contains('exercise-options-menu') ||
                            node.querySelector && node.querySelector('.exercise-options-menu')
                        )) {
                            // Adjust the menu elements
                            setTimeout(adjustExerciseOptionsMenuElements, 0);
                        }
                    });
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observeDOMChanges();
        });
    } else {
        observeDOMChanges();
    }
})();
