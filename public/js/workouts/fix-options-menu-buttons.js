/**
 * Fix Options Menu Buttons
 * This script fixes issues with the options menu buttons in workouts
 */

(function() {

    function fixAddVideoButton() {

        const addVideoButtons = document.querySelectorAll('.btn-view-exercise');

        addVideoButtons.forEach(button => {

            const text = button.textContent.trim();

            if (text.includes('Add VideoAdd Video')) {

                button.textContent = 'Add Video';
            } else if (text.includes('View ExerciseView Exercise')) {

                button.textContent = 'View Exercise';
            } else if (text.includes('🎬')) {

                button.textContent = button.textContent.replace('🎬', '').trim();
            }

            const icons = button.querySelectorAll('span, i, img, svg');
            icons.forEach(icon => {
                icon.remove();
            });

            button.textContent = button.textContent.trim();

            if (button.textContent === '') {
                if (button.classList.contains('has-video')) {
                    button.textContent = 'View Exercise';
                } else {
                    button.textContent = 'Add Video';
                }
            }
        });
    }

    function handleOptionsMenuToggle() {

        document.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    fixAddVideoButton();
                }, 50);
            }

            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixAddVideoButton();
                }, 50);
            }
        });
    }

    function init() {
        console.log('[Fix Options Menu Buttons] Initializing...');

        handleOptionsMenuToggle();

        fixAddVideoButton();

        console.log('[Fix Options Menu Buttons] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
