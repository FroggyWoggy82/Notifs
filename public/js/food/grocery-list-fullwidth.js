/**
 * Grocery List Full Width Functionality
 * Makes the grocery list results section expand to full width and display below both recipe section and grocery list controls
 * Creates a clear visual separation between input controls and output results
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Grocery List Full Width] Initializing...');
    // Get references to the main elements
    const twoColumnLayout = document.querySelector('.two-column-layout');
    const recipesSection = document.getElementById('recipes-display-section');
    const groceryListSection = document.getElementById('grocery-list-section');
    const groceryListResults = document.getElementById('grocery-list-results');
    const groceryListContainer = document.querySelector('.grocery-list-container');
    const generateListBtn = document.getElementById('generate-list-btn');

    console.log('[Grocery List Full Width] Elements found:', {
        twoColumnLayout: !!twoColumnLayout,
        recipesSection: !!recipesSection,
        groceryListSection: !!groceryListSection,
        groceryListResults: !!groceryListResults,
        groceryListContainer: !!groceryListContainer,
        generateListBtn: !!generateListBtn
    });

    // Store original positions and styles
    let originalStyles = {
        groceryListResults: {
            width: groceryListResults ? getComputedStyle(groceryListResults).width : 'auto',
            maxHeight: groceryListResults ? getComputedStyle(groceryListResults).maxHeight : 'none',
            overflow: groceryListResults ? getComputedStyle(groceryListResults).overflow : 'visible',
            position: groceryListResults ? getComputedStyle(groceryListResults).position : 'static',
            left: groceryListResults ? getComputedStyle(groceryListResults).left : 'auto',
            right: groceryListResults ? getComputedStyle(groceryListResults).right : 'auto'
        },
        twoColumnLayout: {
            marginBottom: twoColumnLayout ? getComputedStyle(twoColumnLayout).marginBottom : '20px'
        }
    };

    // Create a container for the full-width grocery list results if it doesn't exist
    let fullWidthContainer = document.getElementById('full-width-grocery-results');
    if (!fullWidthContainer) {
        fullWidthContainer = document.createElement('div');
        fullWidthContainer.id = 'full-width-grocery-results';
        fullWidthContainer.className = 'full-width-grocery-results';

        // Insert after the two-column layout
        if (twoColumnLayout && twoColumnLayout.parentNode) {
            twoColumnLayout.parentNode.insertBefore(fullWidthContainer, twoColumnLayout.nextSibling);
        }
    }

    // Function to check if grocery list is displayed
    function isGroceryListDisplayed() {
        if (!groceryListResults) {
            console.log('[Grocery List Full Width] groceryListResults not found');
            return false;
        }

        // Check if the grocery list has content other than the empty message
        const emptyMessage = groceryListResults.querySelector('.empty-message');
        if (emptyMessage && emptyMessage.textContent.includes('Generate a list to see ingredients')) {
            console.log('[Grocery List Full Width] Empty message found, no grocery list displayed');
            return false;
        }

        // Check if there's a grocery list table
        const groceryTable = groceryListResults.querySelector('.grocery-list-table');
        const isDisplayed = !!groceryTable;
        console.log('[Grocery List Full Width] Grocery list displayed:', isDisplayed, 'Table found:', !!groceryTable);
        return isDisplayed;
    }

    // Function to expand grocery list results to full width and move below both sections
    function expandGroceryListToFullWidth() {
        if (!groceryListResults || !fullWidthContainer) {
            console.log('[Grocery List Full Width] Cannot expand, missing elements');
            return;
        }

        console.log('[Grocery List Full Width] Expanding grocery list results to full width below sections');

        // Move the grocery list results to the full-width container
        if (groceryListResults.parentNode !== fullWidthContainer) {
            // Clone any status messages that should stay with the results
            const statusMessage = document.getElementById('grocery-status-message');

            // Move the grocery list results to the full-width container
            fullWidthContainer.appendChild(groceryListResults);

            // If there's a status message, move it too
            if (statusMessage) {
                fullWidthContainer.appendChild(statusMessage);
            }
        }

        // Apply styles to make the grocery list results more visible
        groceryListResults.style.width = '100%';
        groceryListResults.style.maxHeight = 'none';
        groceryListResults.style.overflow = 'visible';

        // Add a custom class for additional styling
        groceryListResults.classList.add('expanded-results');
        fullWidthContainer.style.display = 'block';

        // Add margin to the two-column layout to create space
        if (twoColumnLayout) {
            twoColumnLayout.style.marginBottom = '20px';
        }

        console.log('[Grocery List Full Width] Expanded grocery list results to full width below sections');
    }

    // Function to restore original grocery list results layout
    function restoreGroceryListLayout() {
        if (!groceryListResults || !groceryListContainer) {
            console.log('[Grocery List Full Width] Cannot restore, missing elements');
            return;
        }

        console.log('[Grocery List Full Width] Restoring grocery list results layout');

        // Move the grocery list results back to its original container
        if (groceryListResults.parentNode !== groceryListContainer) {
            // Find the position where it should be inserted (before the status message)
            const statusMessage = document.getElementById('grocery-status-message');

            if (statusMessage && statusMessage.parentNode === groceryListContainer) {
                groceryListContainer.insertBefore(groceryListResults, statusMessage);
            } else {
                groceryListContainer.appendChild(groceryListResults);
            }

            // If the status message was moved, move it back too
            if (statusMessage && statusMessage.parentNode !== groceryListContainer) {
                groceryListContainer.appendChild(statusMessage);
            }
        }

        // Restore original styles
        groceryListResults.style.width = originalStyles.groceryListResults.width;
        groceryListResults.style.maxHeight = originalStyles.groceryListResults.maxHeight;
        groceryListResults.style.overflow = originalStyles.groceryListResults.overflow;
        groceryListResults.style.position = originalStyles.groceryListResults.position;
        groceryListResults.style.left = originalStyles.groceryListResults.left;
        groceryListResults.style.right = originalStyles.groceryListResults.right;

        // Remove the custom class
        groceryListResults.classList.remove('expanded-results');

        // Hide the full-width container
        if (fullWidthContainer) {
            fullWidthContainer.style.display = 'none';
        }

        // Restore original margin to the two-column layout
        if (twoColumnLayout) {
            twoColumnLayout.style.marginBottom = originalStyles.twoColumnLayout.marginBottom;
        }

        console.log('[Grocery List Full Width] Restored grocery list results layout');
    }

    // Function to update layout based on grocery list state
    function updateLayout() {
        console.log('[Grocery List Full Width] Updating layout');
        if (isGroceryListDisplayed()) {
            expandGroceryListToFullWidth();
        } else {
            restoreGroceryListLayout();
        }
    }

    // Initial layout check
    console.log('[Grocery List Full Width] Performing initial layout check');
    updateLayout();

    // Listen for grocery list generation
    if (generateListBtn) {
        console.log('[Grocery List Full Width] Adding click listener to generate button');
        generateListBtn.addEventListener('click', function() {
            console.log('[Grocery List Full Width] Generate button clicked');
            // Wait a short time for the grocery list to be generated
            setTimeout(function() {
                console.log('[Grocery List Full Width] Delayed update after button click');
                updateLayout();
            }, 500);
        });
    }

    // Listen for the custom event dispatched when grocery list is generated
    console.log('[Grocery List Full Width] Adding groceryListGenerated event listener');
    document.addEventListener('groceryListGenerated', function() {
        console.log('[Grocery List Full Width] groceryListGenerated event received');
        updateLayout();
    });

    // Create a MutationObserver to watch for changes in the grocery list results
    const observer = new MutationObserver(function(mutations) {
        console.log('[Grocery List Full Width] Mutation detected in grocery list results');
        updateLayout();
    });

    // Start observing the grocery list results for changes
    if (groceryListResults) {
        console.log('[Grocery List Full Width] Starting MutationObserver');
        observer.observe(groceryListResults, {
            childList: true,
            subtree: true,
            characterData: true
        });
    } else {
        console.log('[Grocery List Full Width] Cannot start MutationObserver - groceryListResults not found');
    }

    // Listen for recipe checkbox changes
    const recipeCheckboxes = document.querySelectorAll('#grocery-recipe-selection input[type="checkbox"]');
    recipeCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            console.log('[Grocery List Full Width] Recipe checkbox changed');
            // If all checkboxes are unchecked, restore the layout
            const anyChecked = Array.from(recipeCheckboxes).some(cb => cb.checked);
            if (!anyChecked) {
                console.log('[Grocery List Full Width] All recipes unchecked, restoring layout');
                restoreGroceryListLayout();
            }
        });
    });

    // Create a MutationObserver to watch for new recipe checkboxes
    const recipeSelectionObserver = new MutationObserver(function(mutations) {
        console.log('[Grocery List Full Width] Mutation detected in recipe selection');
        // Find new checkboxes and add event listeners
        const newCheckboxes = document.querySelectorAll('#grocery-recipe-selection input[type="checkbox"]:not([data-event-attached])');
        newCheckboxes.forEach(function(checkbox) {
            console.log('[Grocery List Full Width] Adding event listener to new checkbox');
            checkbox.setAttribute('data-event-attached', 'true');
            checkbox.addEventListener('change', function() {
                console.log('[Grocery List Full Width] New recipe checkbox changed');
                // If all checkboxes are unchecked, restore the layout
                const allCheckboxes = document.querySelectorAll('#grocery-recipe-selection input[type="checkbox"]');
                const anyChecked = Array.from(allCheckboxes).some(cb => cb.checked);
                if (!anyChecked) {
                    console.log('[Grocery List Full Width] All recipes unchecked, restoring layout');
                    restoreGroceryListLayout();
                }
            });
        });
    });

    // Start observing the recipe selection container for changes
    const recipeSelectionContainer = document.getElementById('grocery-recipe-selection');
    if (recipeSelectionContainer) {
        console.log('[Grocery List Full Width] Starting recipe selection observer');
        recipeSelectionObserver.observe(recipeSelectionContainer, {
            childList: true,
            subtree: true
        });
    }

    // Handle window resize events to ensure proper layout
    window.addEventListener('resize', function() {
        console.log('[Grocery List Full Width] Window resized');
        if (isGroceryListDisplayed()) {
            // Ensure the full-width container is properly sized
            if (fullWidthContainer) {
                fullWidthContainer.style.width = '100%';
            }
        }
    });

    console.log('[Grocery List Full Width] Initialization complete');
});
