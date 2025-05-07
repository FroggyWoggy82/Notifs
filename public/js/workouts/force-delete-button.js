/**
 * Force Delete Button
 * This script forcefully replaces the delete button with a new one that is guaranteed to be visible
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForceDeleteButton);
    } else {
        initForceDeleteButton();
    }

    function initForceDeleteButton() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');
                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(replaceDeleteButton);
                            }

                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                replaceDeleteButton(node);
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

        document.querySelectorAll('.btn-delete-exercise').forEach(replaceDeleteButton);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const deleteButton = menu.querySelector('.btn-delete-exercise');
                        if (deleteButton) {
                            replaceDeleteButton(deleteButton);
                        }
                    });
                }, 100);
            }
        });
    }

    function replaceDeleteButton(button) {

        const workoutIndex = button.dataset.workoutIndex;
        if (!workoutIndex) return;

        const newButton = document.createElement('button');
        newButton.type = 'button';
        newButton.className = 'btn-delete-exercise-force';
        newButton.dataset.workoutIndex = workoutIndex;
        newButton.title = 'Remove Exercise';

        newButton.innerHTML = '';
        newButton.textContent = '×';

        newButton.style.display = 'flex';
        newButton.style.alignItems = 'center';
        newButton.style.justifyContent = 'center';
        newButton.style.backgroundColor = '#f44336';
        newButton.style.color = 'white';
        newButton.style.border = 'none';
        newButton.style.borderRadius = '4px';
        newButton.style.width = '28px';
        newButton.style.height = '28px';
        newButton.style.fontSize = '1.5rem';
        newButton.style.fontWeight = 'bold';
        newButton.style.cursor = 'pointer';
        newButton.style.marginLeft = '5px';
        newButton.style.zIndex = '1000';

        newButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            }
        });

        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
    }
})();
