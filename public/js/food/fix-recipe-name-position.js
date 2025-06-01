/**
 * Fix Recipe Name Position
 * Ensures the recipe name field is properly positioned at the top of the form
 */

(function() {
    // console.log('[Fix Recipe Name Position] Initializing');

    function fixRecipeNamePosition() {
        // Get the create recipe form
        const createRecipeForm = document.getElementById('create-recipe-form');
        if (!createRecipeForm) {
            return;
        }

        // Get the recipe name input
        const recipeNameInput = document.getElementById('recipeName');
        if (!recipeNameInput) {
            return;
        }

        // Get the form group containing the recipe name input
        const formGroup = recipeNameInput.closest('.form-group');
        if (!formGroup) {
            return;
        }

        // Make sure the form group is the first child of the form
        if (createRecipeForm.firstChild !== formGroup) {
            // Remove the form group from its current position
            formGroup.parentNode.removeChild(formGroup);

            // Insert it at the beginning of the form
            createRecipeForm.insertBefore(formGroup, createRecipeForm.firstChild);
        }

        // Make sure the recipe name input is visible
        recipeNameInput.style.display = 'block';
        recipeNameInput.style.opacity = '1';
        recipeNameInput.style.visibility = 'visible';

        // Add a class to the form group for styling
        formGroup.classList.add('recipe-name-form-group');
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixRecipeNamePosition, 500);
        });
    } else {
        setTimeout(fixRecipeNamePosition, 500);
    }

    // Set up a mutation observer to watch for changes to the form
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                setTimeout(fixRecipeNamePosition, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // console.log('[Fix Recipe Name Position] Initialized');
})();
