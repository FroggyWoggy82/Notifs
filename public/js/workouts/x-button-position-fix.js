/**
 * X Button Position Fix
 * This script ensures the X button is positioned at the bottom right next to the pencil icon
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPositionFix);
    } else {
        initPositionFix();
    }

    function initPositionFix() {

        const observer = new MutationObserver(() => {

            const visibleMenus = document.querySelectorAll('.exercise-options-menu');
            visibleMenus.forEach(menu => {
                const deleteButton = menu.querySelector('.btn-delete-exercise');
                if (deleteButton) {
                    positionDeleteButton(deleteButton, menu);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const visibleMenus = document.querySelectorAll('.exercise-options-menu');
        visibleMenus.forEach(menu => {
            const deleteButton = menu.querySelector('.btn-delete-exercise');
            if (deleteButton) {
                positionDeleteButton(deleteButton, menu);
            }
        });

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const deleteButton = menu.querySelector('.btn-delete-exercise');
                        if (deleteButton) {
                            positionDeleteButton(deleteButton, menu);
                        }
                    });
                }, 100);
            }
        });
    }
    
    function positionDeleteButton(button, menu) {

        button.style.position = 'absolute';
        button.style.bottom = '10px';
        button.style.right = '45px'; // Position to the left of the pencil icon

        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.zIndex = '1000';
        button.style.pointerEvents = 'auto';

        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.backgroundColor = '#f44336';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.width = '28px';
        button.style.height = '28px';
        button.style.fontSize = '1.5rem';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';

        button.innerHTML = '×';

        const editButton = menu.querySelector('.btn-edit-exercise');
        if (editButton) {
            editButton.style.position = 'absolute';
            editButton.style.bottom = '10px';
            editButton.style.right = '10px';
        }
    }
})();
