/**
 * Remove Recipe Header Line
 * Removes any dynamically added lines or dividers between the Create New Recipe header and the Recipe Name field
 */

(function() {
    // console.log('[Remove Recipe Header Line] Initializing');

    // Flag to track if we've already applied the fix
    let fixApplied = false;

    // Debounce function to limit how often a function can be called
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Function to remove any dividers or lines
    function removeHeaderLine() {
        // Only apply fix once
        if (!fixApplied) {
            fixApplied = true;
        }

        // Get the recipe creation section
        const recipeCreationSection = document.getElementById('recipe-creation-section');
        if (!recipeCreationSection) {
            return;
        }

        // Get the section header
        const sectionHeader = recipeCreationSection.querySelector('.section-header-compact');
        if (sectionHeader) {
            // Remove any borders or backgrounds
            sectionHeader.style.border = 'none';
            sectionHeader.style.borderBottom = 'none';
            sectionHeader.style.background = 'none';
            sectionHeader.style.boxShadow = 'none';
            sectionHeader.style.marginBottom = '0';
            sectionHeader.style.paddingBottom = '0';
        }

        // Get the recipe form
        const recipeForm = document.getElementById('create-recipe-form');
        if (recipeForm) {
            // Add margin to the form to create space between the header and form
            recipeForm.style.marginTop = '20px';

            // Get the recipe name form group
            const recipeNameFormGroup = recipeForm.querySelector('.form-group');
            if (recipeNameFormGroup) {
                // Remove any backgrounds or borders
                recipeNameFormGroup.style.background = 'none';
                recipeNameFormGroup.style.border = 'none';
                recipeNameFormGroup.style.boxShadow = 'none';
                recipeNameFormGroup.style.paddingTop = '0';
            }
        }

        // Remove any HR elements that might be between the header and form
        const hrElements = recipeCreationSection.querySelectorAll('hr, .divider, .separator');
        hrElements.forEach(hr => {
            hr.remove();
        });

        // Remove any elements with class names that might indicate a divider
        const dividerElements = recipeCreationSection.querySelectorAll('.divider, .separator, .line, .border');
        dividerElements.forEach(divider => {
            divider.remove();
        });

        // Set the background color of the section to match the page background
        recipeCreationSection.style.backgroundColor = '#121212';

        // Remove any borders from the section
        recipeCreationSection.style.border = 'none';
        recipeCreationSection.style.borderTop = 'none';
        recipeCreationSection.style.borderBottom = 'none';
    }

    // Create a debounced version of removeHeaderLine
    const debouncedRemoveHeaderLine = debounce(removeHeaderLine, 500);

    // Function to run on DOM content loaded
    function init() {
        // Remove the header line
        removeHeaderLine();

        // Set up a mutation observer to watch for changes to the recipe creation section
        const recipeCreationSection = document.getElementById('recipe-creation-section');
        if (recipeCreationSection) {
            const observer = new MutationObserver(function(mutations) {
                // Use the debounced version to avoid excessive calls
                debouncedRemoveHeaderLine();
            });

            // Start observing the recipe creation section
            observer.observe(recipeCreationSection, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // console.log('[Remove Recipe Header Line] Initialized');
})();
