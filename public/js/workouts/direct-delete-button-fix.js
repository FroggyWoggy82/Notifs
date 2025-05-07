/**
 * Direct Delete Button Fix
 * This script directly creates and inserts visible delete buttons
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDirectDeleteButtonFix);
    } else {
        initDirectDeleteButtonFix();
    }

    function initDirectDeleteButtonFix() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const menus = node.querySelectorAll('.exercise-options-menu');
                            if (menus.length > 0) {
                                menus.forEach(fixDeleteButtonInMenu);
                            }

                            if (node.classList && node.classList.contains('exercise-options-menu')) {
                                fixDeleteButtonInMenu(node);
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

        document.querySelectorAll('.exercise-options-menu').forEach(fixDeleteButtonInMenu);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(fixDeleteButtonInMenu);
                }, 100);
            }
        });
    }
    
    function fixDeleteButtonInMenu(menu) {

        const buttonGroup = menu.querySelector('.button-group-right');
        if (!buttonGroup) return;

        let deleteButton = buttonGroup.querySelector('.btn-delete-exercise');

        if (!deleteButton || getComputedStyle(deleteButton).display === 'none') {

            const menuId = menu.id;
            const workoutIndex = menuId ? menuId.split('-').pop() : '';

            if (deleteButton) {
                deleteButton.remove();
            }

            deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-delete-exercise-direct';
            deleteButton.title = 'Remove Exercise';
            deleteButton.dataset.workoutIndex = workoutIndex;
            deleteButton.innerHTML = '×';

            deleteButton.style.display = 'flex';
            deleteButton.style.alignItems = 'center';
            deleteButton.style.justifyContent = 'center';
            deleteButton.style.backgroundColor = '#f44336';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.borderRadius = '4px';
            deleteButton.style.width = '28px';
            deleteButton.style.height = '28px';
            deleteButton.style.fontSize = '1.5rem';
            deleteButton.style.fontWeight = 'bold';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.marginLeft = '5px';
            deleteButton.style.zIndex = '1000';

            deleteButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (typeof window.handleDeleteExercise === 'function') {
                    window.handleDeleteExercise(event);
                }
            });

            buttonGroup.appendChild(deleteButton);
        }
    }
})();
