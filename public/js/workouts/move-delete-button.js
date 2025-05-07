/**
 * Move Delete Button
 * This script specifically moves the delete button in the exercise options menu to the bottom right next to the pencil icon
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMoveDeleteButton);
    } else {
        initMoveDeleteButton();
    }

    function initMoveDeleteButton() {

        const observer = new MutationObserver(mutations => {

            const optionsMenus = document.querySelectorAll('.exercise-options-menu');
            if (optionsMenus.length > 0) {
                moveDeleteButtons();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        moveDeleteButtons();

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(moveDeleteButtons, 100);
                setTimeout(moveDeleteButtons, 300);
                setTimeout(moveDeleteButtons, 500);
            }
        });
    }
    
    function moveDeleteButtons() {

        const optionsMenus = document.querySelectorAll('.exercise-options-menu');
        
        optionsMenus.forEach(menu => {

            const deleteButton = menu.querySelector('.btn-delete-exercise');
            
            if (deleteButton) {

                const editButton = menu.querySelector('.btn-edit-exercise');

                const newDeleteButton = document.createElement('button');
                newDeleteButton.type = 'button';
                newDeleteButton.className = 'btn-delete-exercise-moved';
                newDeleteButton.dataset.workoutIndex = deleteButton.dataset.workoutIndex;
                newDeleteButton.title = 'Remove Exercise';
                newDeleteButton.textContent = '×';

                newDeleteButton.style.position = 'absolute';
                newDeleteButton.style.bottom = '10px';
                newDeleteButton.style.right = editButton ? '45px' : '10px'; // Position to the left of the pencil icon if it exists
                newDeleteButton.style.display = 'flex';
                newDeleteButton.style.alignItems = 'center';
                newDeleteButton.style.justifyContent = 'center';
                newDeleteButton.style.backgroundColor = '#f44336';
                newDeleteButton.style.color = 'white';
                newDeleteButton.style.border = 'none';
                newDeleteButton.style.borderRadius = '4px';
                newDeleteButton.style.width = '28px';
                newDeleteButton.style.height = '28px';
                newDeleteButton.style.fontSize = '1.5rem';
                newDeleteButton.style.fontWeight = 'bold';
                newDeleteButton.style.cursor = 'pointer';
                newDeleteButton.style.zIndex = '1000';

                newDeleteButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    if (typeof window.handleDeleteExercise === 'function') {
                        window.handleDeleteExercise(event);
                    }
                });

                deleteButton.style.display = 'none';
                deleteButton.style.visibility = 'hidden';
                deleteButton.style.opacity = '0';
                deleteButton.style.position = 'absolute';
                deleteButton.style.pointerEvents = 'none';

                menu.appendChild(newDeleteButton);

                if (editButton) {
                    editButton.style.position = 'absolute';
                    editButton.style.bottom = '10px';
                    editButton.style.right = '10px';
                }
            }
        });
    }
})();
