/**
 * Move Delete Button
 * This script specifically moves the delete button in the exercise options menu to the bottom right next to the pencil icon
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMoveDeleteButton);
    } else {
        initMoveDeleteButton();
    }

    function initMoveDeleteButton() {
        // Set up a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(mutations => {
            // Check if any exercise options menus were added
            const optionsMenus = document.querySelectorAll('.exercise-options-menu');
            if (optionsMenus.length > 0) {
                moveDeleteButtons();
            }
        });
        
        // Start observing the document body for DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Move any existing delete buttons
        moveDeleteButtons();
        
        // Add a click event listener to move buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(moveDeleteButtons, 100);
                setTimeout(moveDeleteButtons, 300);
                setTimeout(moveDeleteButtons, 500);
            }
        });
    }
    
    function moveDeleteButtons() {
        // Find all exercise options menus
        const optionsMenus = document.querySelectorAll('.exercise-options-menu');
        
        optionsMenus.forEach(menu => {
            // Find the delete button
            const deleteButton = menu.querySelector('.btn-delete-exercise');
            
            if (deleteButton) {
                // Find the edit button (pencil icon)
                const editButton = menu.querySelector('.btn-edit-exercise');
                
                // Create a new delete button
                const newDeleteButton = document.createElement('button');
                newDeleteButton.type = 'button';
                newDeleteButton.className = 'btn-delete-exercise-moved';
                newDeleteButton.dataset.workoutIndex = deleteButton.dataset.workoutIndex;
                newDeleteButton.title = 'Remove Exercise';
                newDeleteButton.textContent = '×';
                
                // Style the new button
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
                
                // Add click handler
                newDeleteButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Call the global handleDeleteExercise function
                    if (typeof window.handleDeleteExercise === 'function') {
                        window.handleDeleteExercise(event);
                    }
                });
                
                // Hide the original delete button
                deleteButton.style.display = 'none';
                deleteButton.style.visibility = 'hidden';
                deleteButton.style.opacity = '0';
                deleteButton.style.position = 'absolute';
                deleteButton.style.pointerEvents = 'none';
                
                // Add the new delete button to the menu
                menu.appendChild(newDeleteButton);
                
                // If there's an edit button, position it correctly
                if (editButton) {
                    editButton.style.position = 'absolute';
                    editButton.style.bottom = '10px';
                    editButton.style.right = '10px';
                }
            }
        });
    }
})();
