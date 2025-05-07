/**
 * Black Pencil Fix
 * This script ensures the edit button pencil icon is black instead of colored
 */

(function() {

    function fixPencilColor() {

        const editButtons = document.querySelectorAll('.btn-edit-exercise-name');

        editButtons.forEach(button => {

            button.style.color = '#121212';

            const icons = button.querySelectorAll('svg, i, img');
            icons.forEach(icon => {
                icon.style.color = '#121212';
                icon.style.fill = '#121212';
                icon.remove(); // Remove the icon completely
            });

            button.innerHTML = '<i class="fas fa-pencil-alt"></i>';

            button.setAttribute('style', 'background-color: #ffffff !important; display: flex !important; align-items: center !important; justify-content: center !important;');

            const icon = button.querySelector('i');
            if (icon) {
                icon.setAttribute('style', 'color: #121212 !important; font-size: 14px !important; font-weight: 900 !important;');
            }
        });

        const labels = document.querySelectorAll('.weight-unit-label, .weight-increment-text');
        labels.forEach(label => {
            label.style.color = '#ffffff';
        });
    }

    function handleOptionsMenuToggle() {

        document.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    fixPencilColor();
                }, 50);
            }

            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixPencilColor();
                }, 50);
            }
        });
    }

    function init() {
        console.log('[Black Pencil Fix] Initializing...');

        handleOptionsMenuToggle();

        fixPencilColor();

        console.log('[Black Pencil Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
