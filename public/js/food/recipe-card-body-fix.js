/**
 * Recipe Card Body Fix
 * Ensures recipe card bodies are completely hidden when not in use
 * and properly shown when expanded
 */

(function() {
    'use strict';

    function initializeRecipeCardBodyFix() {
        console.log('Initializing recipe card body fix...');

        // Function to check if any content in recipe card body is visible
        function isRecipeCardBodyExpanded(recipeCardBody) {
            if (!recipeCardBody) return false;

            const adjustmentSection = recipeCardBody.querySelector('.calorie-adjustment-compact');
            const ingredientDetails = recipeCardBody.querySelector('.ingredient-details');

            const adjustmentVisible = adjustmentSection && 
                (adjustmentSection.style.display === 'grid' || 
                 adjustmentSection.style.display === 'block');
            
            const ingredientsVisible = ingredientDetails && 
                ingredientDetails.style.display === 'block';

            return adjustmentVisible || ingredientsVisible;
        }

        // Function to update recipe card body visibility
        function updateRecipeCardBodyVisibility(recipeCard) {
            const recipeCardBody = recipeCard.querySelector('.recipe-card-body');
            if (!recipeCardBody) return;

            const isExpanded = isRecipeCardBodyExpanded(recipeCardBody);
            
            if (isExpanded) {
                recipeCardBody.classList.add('expanded');
                console.log('Recipe card body expanded');
            } else {
                recipeCardBody.classList.remove('expanded');
                console.log('Recipe card body collapsed');
            }
        }

        // Function to observe all recipe cards
        function observeRecipeCards() {
            const recipeList = document.getElementById('recipe-list');
            if (!recipeList) return;

            // Create mutation observer to watch for changes
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        const recipeCard = target.closest('.recipe-card');
                        if (recipeCard) {
                            updateRecipeCardBodyVisibility(recipeCard);
                        }
                    }
                });
            });

            // Observe all existing recipe cards
            const recipeCards = recipeList.querySelectorAll('.recipe-card');
            recipeCards.forEach(function(recipeCard) {
                const recipeCardBody = recipeCard.querySelector('.recipe-card-body');
                if (recipeCardBody) {
                    // Initial check
                    updateRecipeCardBodyVisibility(recipeCard);

                    // Observe style changes on child elements
                    const childElements = recipeCardBody.querySelectorAll('.calorie-adjustment-compact, .ingredient-details');
                    childElements.forEach(function(element) {
                        observer.observe(element, {
                            attributes: true,
                            attributeFilter: ['style']
                        });
                    });
                }
            });

            // Also observe for new recipe cards being added
            const listObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.classList && node.classList.contains('recipe-card')) {
                                const recipeCardBody = node.querySelector('.recipe-card-body');
                                if (recipeCardBody) {
                                    updateRecipeCardBodyVisibility(node);

                                    // Observe new child elements
                                    const childElements = recipeCardBody.querySelectorAll('.calorie-adjustment-compact, .ingredient-details');
                                    childElements.forEach(function(element) {
                                        observer.observe(element, {
                                            attributes: true,
                                            attributeFilter: ['style']
                                        });
                                    });
                                }
                            }
                        });
                    }
                });
            });

            listObserver.observe(recipeList, {
                childList: true,
                subtree: true
            });
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeRecipeCards);
        } else {
            observeRecipeCards();
        }

        // Also run after a short delay to catch dynamically loaded content
        setTimeout(observeRecipeCards, 1000);
    }

    // Initialize the fix
    initializeRecipeCardBodyFix();

})();
