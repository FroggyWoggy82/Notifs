/**
 * Delete Button Fix
 * This script ensures the delete button remains visible and functional after being clicked
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeleteButtonFix);
    } else {
        initDeleteButtonFix();
    }

    function initDeleteButtonFix() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');

                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(fixDeleteButton);
                            }

                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                fixDeleteButton(node);
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

        document.querySelectorAll('.btn-delete-exercise').forEach(fixDeleteButton);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const deleteButton = menu.querySelector('.btn-delete-exercise');
                        if (deleteButton) {
                            fixDeleteButton(deleteButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function fixDeleteButton(button) {

        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.position = 'static';
        button.style.zIndex = '100';
        button.style.pointerEvents = 'auto';

        button.textContent = '×';

        button.style.fontSize = '1.2rem';
        button.style.fontWeight = 'bold';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.backgroundColor = '#f44336';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.padding = '0 6px';
        button.style.minWidth = '24px';
        button.style.height = '24px';
        button.style.lineHeight = '24px';
        button.style.color = 'white';
        button.style.textAlign = 'center';
        button.style.cursor = 'pointer';

        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        button.title = 'Remove Exercise';

        button.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }

            setTimeout(() => {
                button.style.display = 'flex';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
            }, 100);
        };
    }
})();
