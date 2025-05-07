/**
 * Direct Delete Button Fix
 * This script directly creates and inserts visible delete buttons
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDirectDeleteButtonFix);
    } else {
        initDirectDeleteButtonFix();
    }

    function initDirectDeleteButtonFix() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for exercise option menus
                            const menus = node.querySelectorAll('.exercise-options-menu');
                            if (menus.length > 0) {
                                menus.forEach(fixDeleteButtonInMenu);
                            }
                            
                            // If the node itself is a menu
                            if (node.classList && node.classList.contains('exercise-options-menu')) {
                                fixDeleteButtonInMenu(node);
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document body for DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Fix any existing menus
        document.querySelectorAll('.exercise-options-menu').forEach(fixDeleteButtonInMenu);
        
        // Add a click event listener to the document to fix buttons when options menus are opened
        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {
                // Wait for the menu to open
                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(fixDeleteButtonInMenu);
                }, 100);
            }
        });
    }
    
    function fixDeleteButtonInMenu(menu) {
        // Find the button group in the menu
        const buttonGroup = menu.querySelector('.button-group-right');
        if (!buttonGroup) return;
        
        // Find the delete button
        let deleteButton = buttonGroup.querySelector('.btn-delete-exercise');
        
        // If delete button doesn't exist or is not visible, create a new one
        if (!deleteButton || getComputedStyle(deleteButton).display === 'none') {
            // Get the workout index from the menu ID
            const menuId = menu.id;
            const workoutIndex = menuId ? menuId.split('-').pop() : '';
            
            // Remove the existing delete button if it exists
            if (deleteButton) {
                deleteButton.remove();
            }
            
            // Create a new delete button
            deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-delete-exercise-direct';
            deleteButton.title = 'Remove Exercise';
            deleteButton.dataset.workoutIndex = workoutIndex;
            deleteButton.innerHTML = '×';
            
            // Style the button
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
            
            // Add click handler
            deleteButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Call the global handleDeleteExercise function
                if (typeof window.handleDeleteExercise === 'function') {
                    window.handleDeleteExercise(event);
                }
            });
            
            // Append the new button to the button group
            buttonGroup.appendChild(deleteButton);
        }
    }
})();
