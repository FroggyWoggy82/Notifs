/**
 * Recipe Search Functionality
 * Adds search and filtering capabilities to the Your Recipes section
 */

(function() {
    'use strict';

    let allRecipes = []; // Store all recipes for filtering
    let filteredRecipes = []; // Store currently filtered recipes

    function initializeRecipeSearch() {
        console.log('Initializing recipe search functionality...');

        const searchInput = document.getElementById('recipe-search-input');
        const clearButton = document.getElementById('clear-recipe-search');
        const recipeList = document.getElementById('recipe-list');

        if (!searchInput || !clearButton || !recipeList) {
            console.warn('Recipe search elements not found');
            return;
        }

        // Store original recipes when they're loaded
        function storeRecipes() {
            const recipeCards = recipeList.querySelectorAll('.recipe-card');
            allRecipes = Array.from(recipeCards).map(card => {
                return {
                    element: card,
                    name: card.querySelector('.recipe-card-title')?.textContent?.toLowerCase() || '',
                    calories: card.querySelector('.recipe-card-calories')?.textContent?.toLowerCase() || '',
                    id: card.dataset.id
                };
            });
            filteredRecipes = [...allRecipes];
            console.log(`Stored ${allRecipes.length} recipes for searching`);
        }

        // Filter recipes based on search term
        function filterRecipes(searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            
            if (!term) {
                // Show all recipes
                filteredRecipes = [...allRecipes];
                showAllRecipes();
                return;
            }

            // Filter recipes that match the search term
            filteredRecipes = allRecipes.filter(recipe => {
                return recipe.name.includes(term) || 
                       recipe.calories.includes(term);
            });

            displayFilteredRecipes();
            console.log(`Filtered to ${filteredRecipes.length} recipes matching "${term}"`);
        }

        // Show all recipes
        function showAllRecipes() {
            allRecipes.forEach(recipe => {
                recipe.element.style.display = 'block';
            });
            
            if (allRecipes.length === 0) {
                recipeList.innerHTML = '<p style="text-align:center;">No recipes found. Create one above!</p>';
            }
        }

        // Display only filtered recipes
        function displayFilteredRecipes() {
            // Hide all recipes first
            allRecipes.forEach(recipe => {
                recipe.element.style.display = 'none';
            });

            // Show only filtered recipes
            filteredRecipes.forEach(recipe => {
                recipe.element.style.display = 'block';
            });

            // Show "no results" message if no matches
            if (filteredRecipes.length === 0) {
                const noResultsMsg = document.createElement('p');
                noResultsMsg.style.textAlign = 'center';
                noResultsMsg.style.color = 'rgba(255, 255, 255, 0.6)';
                noResultsMsg.style.padding = '20px';
                noResultsMsg.textContent = 'No recipes match your search.';
                noResultsMsg.className = 'no-search-results';
                
                // Remove any existing no-results message
                const existingMsg = recipeList.querySelector('.no-search-results');
                if (existingMsg) {
                    existingMsg.remove();
                }
                
                recipeList.appendChild(noResultsMsg);
            } else {
                // Remove no-results message if it exists
                const existingMsg = recipeList.querySelector('.no-search-results');
                if (existingMsg) {
                    existingMsg.remove();
                }
            }
        }

        // Search input event handler
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            
            // Show/hide clear button
            if (searchTerm.trim()) {
                clearButton.style.display = 'flex';
            } else {
                clearButton.style.display = 'none';
            }

            // Filter recipes
            filterRecipes(searchTerm);
        });

        // Clear button event handler
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            clearButton.style.display = 'none';
            filterRecipes('');
            searchInput.focus();
        });

        // Keyboard shortcuts
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                clearButton.style.display = 'none';
                filterRecipes('');
            }
        });

        // Observer to detect when recipes are loaded/updated
        const observer = new MutationObserver(function(mutations) {
            let recipesChanged = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Check if recipe cards were added or removed
                    const addedRecipes = Array.from(mutation.addedNodes).some(node => 
                        node.classList && node.classList.contains('recipe-card')
                    );
                    const removedRecipes = Array.from(mutation.removedNodes).some(node => 
                        node.classList && node.classList.contains('recipe-card')
                    );
                    
                    if (addedRecipes || removedRecipes) {
                        recipesChanged = true;
                    }
                }
            });

            if (recipesChanged) {
                console.log('Recipes updated, refreshing search data...');
                setTimeout(() => {
                    storeRecipes();
                    // Re-apply current search if there is one
                    const currentSearch = searchInput.value;
                    if (currentSearch.trim()) {
                        filterRecipes(currentSearch);
                    }
                }, 100);
            }
        });

        // Start observing the recipe list
        observer.observe(recipeList, {
            childList: true,
            subtree: true
        });

        // Initial setup - store recipes if they're already loaded
        setTimeout(() => {
            storeRecipes();
        }, 500);

        console.log('Recipe search functionality initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRecipeSearch);
    } else {
        initializeRecipeSearch();
    }

    // Also run after a delay to catch dynamically loaded content
    setTimeout(initializeRecipeSearch, 1000);

})();
