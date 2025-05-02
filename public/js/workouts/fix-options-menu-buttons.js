/**
 * Fix Options Menu Buttons
 * This script fixes issues with the options menu buttons in workouts
 */

(function() {
    // Function to fix the Add Video button text and remove film icon
    function fixAddVideoButton() {
        // Find all Add Video buttons
        const addVideoButtons = document.querySelectorAll('.btn-view-exercise');

        addVideoButtons.forEach(button => {
            // Get the current text content
            const text = button.textContent.trim();

            // Check if it has duplicate "Add Video" text
            if (text.includes('Add VideoAdd Video')) {
                // Fix the text
                button.textContent = 'Add Video';
            } else if (text.includes('View ExerciseView Exercise')) {
                // Fix the text
                button.textContent = 'View Exercise';
            } else if (text.includes('🎬')) {
                // Remove the film emoji
                button.textContent = button.textContent.replace('🎬', '').trim();
            }

            // Remove any film icon elements
            const icons = button.querySelectorAll('span, i, img, svg');
            icons.forEach(icon => {
                icon.remove();
            });

            // Clean up any extra whitespace
            button.textContent = button.textContent.trim();

            // If the button is empty, add the appropriate text
            if (button.textContent === '') {
                if (button.classList.contains('has-video')) {
                    button.textContent = 'View Exercise';
                } else {
                    button.textContent = 'Add Video';
                }
            }
        });
    }

    // Function to handle options menu opening
    function handleOptionsMenuToggle() {
        // Listen for clicks on the options button
        document.addEventListener('click', event => {
            const target = event.target;

            // Check if the clicked element is an options button
            if (target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    fixAddVideoButton();
                }, 50);
            }

            // Also check if any menu is currently visible and fix it
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixAddVideoButton();
                }, 50);
            }
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Fix Options Menu Buttons] Initializing...');

        // Set up the options menu toggle handler
        handleOptionsMenuToggle();

        // Also fix any buttons that might already be visible
        fixAddVideoButton();

        console.log('[Fix Options Menu Buttons] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
