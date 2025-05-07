/**
 * Edit Button Fix
 * This script ensures the edit button works correctly by attaching the proper event handler
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditButtonFix);
    } else {
        initEditButtonFix();
    }

    function initEditButtonFix() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const editButtons = node.querySelectorAll('.btn-edit-exercise-name');

                            if (editButtons.length > 0) {
                                editButtons.forEach(fixEditButton);
                            }

                            if (node.classList && node.classList.contains('btn-edit-exercise-name')) {
                                fixEditButton(node);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.querySelectorAll('.btn-edit-exercise-name').forEach(fixEditButton);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const editButton = menu.querySelector('.btn-edit-exercise-name');
                        if (editButton) {
                            fixEditButton(editButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function fixEditButton(button) {

        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.position = 'static';
        button.style.zIndex = '100';
        button.style.pointerEvents = 'auto';

        button.title = 'Edit Exercise Name';

        button.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (typeof window.openExerciseEditModal === 'function') {
                window.openExerciseEditModal(parseInt(workoutIndex, 10));
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }

            const menu = button.closest('.exercise-options-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        };
    }
})();
