/**
 * Fix Edit Form Display
 * Ensures the edit form is only displayed when the edit button is clicked
 */

(function() {
    console.log('[Fix Edit Form Display] Initializing...');

    // Function to ensure edit forms are hidden
    function hideEditForms() {
        console.log('[Fix Edit Form Display] Hiding edit forms...');

        // Find all edit forms that don't have the show-edit-form class
        const editForms = document.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
        editForms.forEach(form => {
            // Hide the form
            form.style.display = 'none';
            // Add a data attribute to mark it as processed
            form.setAttribute('data-edit-form-fixed', 'true');

            // Also hide any h4 headers inside the form (like "Edit Ingredient")
            const headers = form.querySelectorAll('h4');
            headers.forEach(header => {
                if (header.textContent.includes('Edit Ingredient')) {
                    header.style.display = 'none';
                }
            });
        });

        // Find all h4 elements and check if they contain "Edit Ingredient"
        const allHeaders = document.querySelectorAll('h4');
        allHeaders.forEach(header => {
            if (header.textContent.includes('Edit Ingredient')) {
                const parentForm = header.closest('.edit-ingredient-form');
                if (parentForm && !parentForm.classList.contains('show-edit-form')) {
                    parentForm.style.display = 'none';
                }
            }
        });

        // Log any forms that have the show-edit-form class
        const visibleForms = document.querySelectorAll('.edit-ingredient-form.show-edit-form');
        if (visibleForms.length > 0) {
            console.log(`[Fix Edit Form Display] Found ${visibleForms.length} forms with show-edit-form class`);
        }

        console.log('[Fix Edit Form Display] Edit forms hidden');
    }

    // Function to observe DOM changes and ensure edit forms are hidden
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsHiding = false;

            mutations.forEach(mutation => {
                // Check if attributes were modified (display style could change)
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'style' &&
                    mutation.target.classList &&
                    mutation.target.classList.contains('edit-ingredient-form')) {

                    // If this is not an explicit edit button click, hide the form
                    // But only if it doesn't have the show-edit-form class
                    if (!window._editButtonClicked && !mutation.target.classList.contains('show-edit-form')) {
                        mutation.target.style.display = 'none';
                        needsHiding = true;
                    }
                }

                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                // Only hide if not from an edit button click and doesn't have show-edit-form class
                                if (!window._editButtonClicked && !node.classList.contains('show-edit-form')) {
                                    node.style.display = 'none';
                                    needsHiding = true;
                                }
                                // Mark as processed
                                node.setAttribute('data-edit-form-fixed', 'true');
                            }

                            // Also check child nodes
                            const editForms = node.querySelectorAll('.edit-ingredient-form');
                            if (editForms.length > 0) {
                                editForms.forEach(form => {
                                    // Only hide if not from an edit button click and doesn't have show-edit-form class
                                    if (!window._editButtonClicked && !form.classList.contains('show-edit-form')) {
                                        form.style.display = 'none';
                                        needsHiding = true;
                                    }
                                    // Mark as processed
                                    form.setAttribute('data-edit-form-fixed', 'true');
                                });
                            }

                            // Check for ingredient details being added (view button clicked)
                            if (node.classList && node.classList.contains('ingredient-details')) {
                                // This is likely from a view button click, ensure edit forms are hidden
                                // But only if they don't have the show-edit-form class
                                setTimeout(() => {
                                    const editForms = node.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
                                    editForms.forEach(form => {
                                        form.style.display = 'none';
                                    });
                                }, 50);
                                needsHiding = true;
                            }
                        }
                    });
                }
            });

            // If we had to hide something, log it
            if (needsHiding) {
                console.log('[Fix Edit Form Display] Hid edit forms after DOM changes');
            }
        });

        // Start observing the document body with all possible options
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    // Function to ensure edit forms are only displayed when edit button is clicked
    function fixEditButtonBehavior() {
        // Track edit button clicks
        window._editButtonClicked = false;

        // Use event delegation to handle button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on a view button
            if (event.target.classList.contains('view-ingredients-btn')) {
                console.log('[Fix Edit Form Display] View button clicked');
                window._editButtonClicked = false;

                // Get the recipe item
                const recipeItem = event.target.closest('.recipe-card');
                if (recipeItem) {
                    // Find the edit form in this recipe item
                    setTimeout(() => {
                        const editForm = recipeItem.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            // Ensure the edit form is hidden
                            editForm.style.display = 'none';
                            console.log('[Fix Edit Form Display] Hid edit form after view button click');
                        }
                    }, 100); // Delay to ensure the DOM has updated
                }
            }

            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Form Display] Edit button clicked');
                window._editButtonClicked = true;

                // Get the row and container
                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {
                        // Find the edit form
                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            // Make sure the edit form is visible
                            // First remove any inline style that might be hiding it
                            editForm.removeAttribute('style');
                            // Then set the display to block
                            editForm.style.display = 'block';
                            // Add the show-edit-form class to override any CSS rules
                            editForm.classList.add('show-edit-form');

                            console.log('[Fix Edit Form Display] Made edit form visible from click handler:', editForm);
                        }
                    }
                }

                // Reset the flag after a longer delay to ensure the form stays visible
                setTimeout(() => {
                    window._editButtonClicked = false;
                }, 2000);
            }

            // Check if the click was on a cancel button
            if (event.target.classList.contains('cancel-edit-btn')) {
                console.log('[Fix Edit Form Display] Cancel button clicked');

                // Get the edit form
                const editForm = event.target.closest('.edit-ingredient-form');
                if (editForm) {
                    // Hide the form
                    editForm.style.display = 'none';
                }
            }
        }, true); // Use capture phase to ensure this runs before other handlers
    }

    // Function to add CSS to ensure edit forms are hidden by default
    function addCssRules() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ensure edit forms are hidden by default */
            .edit-ingredient-form:not(.show-edit-form) {
                display: none;
            }

            /* Only show when explicitly made visible by JS */
            .edit-ingredient-form.show-edit-form {
                display: block !important;
            }

            /* Make sure all elements inside a visible form are displayed */
            .edit-ingredient-form.show-edit-form * {
                display: inherit;
            }

            /* Specific overrides for form elements */
            .edit-ingredient-form.show-edit-form input,
            .edit-ingredient-form.show-edit-form button,
            .edit-ingredient-form.show-edit-form select,
            .edit-ingredient-form.show-edit-form textarea,
            .edit-ingredient-form.show-edit-form label {
                display: inline-block;
            }

            .edit-ingredient-form.show-edit-form h4 {
                display: block;
            }
        `;
        document.head.appendChild(style);
        console.log('[Fix Edit Form Display] Added CSS rules');
    }

    // Function to patch the handleEditIngredientClick function
    function patchEditIngredientClick() {
        // Check if the original function exists
        if (window.handleEditIngredientClick) {
            console.log('[Fix Edit Form Display] Patching handleEditIngredientClick function');

            // Store the original function
            const originalFunction = window.handleEditIngredientClick;

            // Replace with our patched version
            window.handleEditIngredientClick = function(event) {
                console.log('[Fix Edit Form Display] Patched handleEditIngredientClick called');

                // Set the edit button clicked flag
                window._editButtonClicked = true;

                // Call the original function
                const result = originalFunction.apply(this, arguments);

                // Get the edit form
                const row = event.target.closest('tr');
                const container = row.closest('.ingredient-details');
                const editForm = container.querySelector('.edit-ingredient-form');

                // Make sure the edit form is visible
                if (editForm) {
                    // First remove any inline style that might be hiding it
                    editForm.removeAttribute('style');
                    // Then set the display to block
                    editForm.style.display = 'block';
                    // Add the show-edit-form class to override any CSS rules
                    editForm.classList.add('show-edit-form');

                    console.log('[Fix Edit Form Display] Made edit form visible:', editForm);

                    // Also make sure any headers inside the form are visible
                    const headers = editForm.querySelectorAll('h4');
                    headers.forEach(header => {
                        header.style.display = 'block';
                    });
                }

                // Reset the flag after a longer delay to ensure the form stays visible
                setTimeout(() => {
                    window._editButtonClicked = false;
                }, 2000);

                return result;
            };

            console.log('[Fix Edit Form Display] handleEditIngredientClick function patched');
        }
    }

    // Function to patch the fetchAndDisplayIngredients function
    function patchFetchAndDisplayIngredients() {
        // Check if the original function exists
        if (window.fetchAndDisplayIngredients) {
            console.log('[Fix Edit Form Display] Patching fetchAndDisplayIngredients function');

            // Store the original function
            const originalFunction = window.fetchAndDisplayIngredients;

            // Replace with our patched version
            window.fetchAndDisplayIngredients = async function(recipeId, detailsDiv, viewButton) {
                console.log('[Fix Edit Form Display] Patched fetchAndDisplayIngredients called');

                // Set the edit button clicked flag to false since this is a view operation
                window._editButtonClicked = false;

                // Call the original function
                const result = await originalFunction.apply(this, arguments);

                // Ensure any edit forms are hidden, but only if they don't have the show-edit-form class
                setTimeout(() => {
                    const editForms = detailsDiv.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
                    editForms.forEach(form => {
                        form.style.display = 'none';
                    });
                    console.log('[Fix Edit Form Display] Hid edit forms after fetchAndDisplayIngredients');
                }, 100);

                return result;
            };

            console.log('[Fix Edit Form Display] fetchAndDisplayIngredients function patched');
        }
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Fix Edit Form Display] Initializing...');

        // Add CSS rules first
        addCssRules();

        // Hide all edit forms
        setTimeout(hideEditForms, 100); // Delay to ensure the DOM is fully loaded

        // Fix edit button behavior
        fixEditButtonBehavior();

        // Patch the handleEditIngredientClick function
        setTimeout(patchEditIngredientClick, 200);

        // Patch the fetchAndDisplayIngredients function
        setTimeout(patchFetchAndDisplayIngredients, 200);

        // Observe DOM changes to hide edit forms for new elements
        observeDOMChanges();

        // We're no longer using periodic checks as they might interfere with the edit button
        // setInterval(hideEditForms, 1000);

        console.log('[Fix Edit Form Display] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
