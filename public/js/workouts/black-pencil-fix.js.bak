/**
 * Black Pencil Fix
 * This script ensures the edit button pencil icon is black instead of colored
 */

(function() {
    // Function to fix the pencil icon color
    function fixPencilColor() {
        // Find all edit buttons in the options menu
        const editButtons = document.querySelectorAll('.btn-edit-exercise-name');

        editButtons.forEach(button => {
            // Force black color on the button and all its children
            button.style.color = '#121212';

            // Remove any colored SVG or icon elements
            const icons = button.querySelectorAll('svg, i, img');
            icons.forEach(icon => {
                icon.style.color = '#121212';
                icon.style.fill = '#121212';
                icon.remove(); // Remove the icon completely
            });

            // Replace with Font Awesome icon - using fa-pencil-alt instead of fa-pen
            button.innerHTML = '<i class="fas fa-pencil-alt"></i>';

            // Apply inline styles to ensure black color and proper sizing
            button.setAttribute('style', 'background-color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important;');

            // Style the icon directly
            const icon = button.querySelector('i');
            if (icon) {
                icon.setAttribute('style', 'color: #121212 !important; font-size: 14px !important; font-weight: 900 !important;');
            }
        });

        // Also make the weight unit and increment text white
        const labels = document.querySelectorAll('.weight-unit-label, .weight-increment-text');
        labels.forEach(label => {
            label.style.color = '#ffffff';
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
                    fixPencilColor();
                }, 50);
            }

            // Also check if any menu is currently visible and fix it
            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixPencilColor();
                }, 50);
            }
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Black Pencil Fix] Initializing...');

        // Set up the options menu toggle handler
        handleOptionsMenuToggle();

        // Also fix any buttons that might already be visible
        fixPencilColor();

        console.log('[Black Pencil Fix] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
