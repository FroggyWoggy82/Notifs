/**
 * Force Remove Recipe Header Line
 * Uses a more aggressive approach to remove the line between Create New Recipe and Recipe Name
 */

(function() {
    console.log('[Force Remove Recipe Header Line] Initializing');

    // Flag to track if we've already applied the fix
    let fixApplied = false;
    let styleAdded = false;

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

    // Function to force remove the header line
    function forceRemoveHeaderLine() {
        // Only log if this is the first time we're applying the fix
        if (!fixApplied) {
            console.log('[Force Remove Recipe Header Line] Forcing removal of header line');
            fixApplied = true;
        }

        // Apply direct styles to the recipe creation section (only once)
        if (!styleAdded) {
            const style = document.createElement('style');
            style.textContent = `
                /* Force remove any lines or dividers */
                #recipe-creation-section,
                #recipe-creation-section .section-header-compact,
                #recipe-creation-section .section-header-compact h2,
                #recipe-creation-section #create-recipe-form,
                #recipe-creation-section #create-recipe-form .form-group {
                    border: none !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    background-color: #121212 !important;
                    box-shadow: none !important;
                }

                /* Force proper spacing */
                #recipe-creation-section .section-header-compact {
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }

                #create-recipe-form {
                    margin-top: 20px !important;
                }

                /* Force remove any dividers */
                #recipe-creation-section hr,
                #recipe-creation-section .divider,
                #recipe-creation-section .separator,
                #recipe-creation-section .line,
                #recipe-creation-section .border {
                    display: none !important;
                }

                /* Force proper styling for the recipe name form group */
                #create-recipe-form .form-group {
                    padding-top: 0 !important;
                    margin-top: 0 !important;
                    background-color: transparent !important;
                }

                /* Force proper styling for the recipe name label */
                #create-recipe-form .form-group label {
                    color: white !important;
                    margin-bottom: 5px !important;
                }

                /* Force proper styling for the recipe name input */
                #create-recipe-form .form-group input[type="text"] {
                    background-color: rgba(40, 40, 40, 0.7) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
            `;
            document.head.appendChild(style);
            styleAdded = true;
        }

        // Function to directly modify the DOM
        function modifyDOM() {
            // Get the recipe creation section
            const recipeCreationSection = document.getElementById('recipe-creation-section');
            if (!recipeCreationSection) return;

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

        // Run the DOM modification immediately
        modifyDOM();

        // Run it again after a short delay to catch any dynamic changes
        // Only set one timeout instead of multiple
        setTimeout(modifyDOM, 500);
    }

    // Create a debounced version of forceRemoveHeaderLine
    const debouncedForceRemoveHeaderLine = debounce(forceRemoveHeaderLine, 1000);

    // Run the force remove function when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceRemoveHeaderLine);
    } else {
        forceRemoveHeaderLine();
    }

    // Set up a mutation observer to watch for changes, but with debouncing
    const observer = new MutationObserver(function(mutations) {
        debouncedForceRemoveHeaderLine();
    });

    // Start observing the document body for changes, but only after a delay
    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }, 1000);

    console.log('[Force Remove Recipe Header Line] Initialized');
})();
