/**
 * Comprehensive Recipe Button Fix
 * Unified solution for View/Adjust/Delete buttons with conflict resolution
 * Version: 2.0 - Cache Busted
 */

(function() {
    'use strict';

    console.log('[Recipe Button Fix v2.0] Initializing comprehensive recipe button handler...');

    // Remove any existing event listeners to prevent conflicts
    function removeConflictingHandlers() {
        // Remove any existing click handlers on recipe buttons
        const existingButtons = document.querySelectorAll('.view-ingredients-btn, .delete-recipe-btn, .adjust-calories-toggle');
        existingButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        console.log('[Recipe Button Fix v2.0] Removed existing conflicting handlers');
    }

    // Main event handler using event delegation
    function handleRecipeButtonClick(event) {
        const target = event.target;

        // Only handle our specific buttons
        if (!target.classList.contains('view-ingredients-btn') &&
            !target.classList.contains('delete-recipe-btn') &&
            !target.classList.contains('adjust-calories-toggle')) {
            return;
        }

        console.log('[Recipe Button Fix v2.0] Button clicked:', target.className);

        // Prevent default and stop propagation
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // Handle based on button type
        if (target.classList.contains('view-ingredients-btn')) {
            handleViewButton(target);
        } else if (target.classList.contains('delete-recipe-btn')) {
            handleDeleteButton(target);
        } else if (target.classList.contains('adjust-calories-toggle')) {
            handleAdjustButton(target);
        }
    }

    function handleViewButton(button) {
        console.log('[Recipe Button Fix v2.0] Handling View button');

        const recipeCard = button.closest('.recipe-card');
        if (!recipeCard) {
            console.error('[Recipe Button Fix v2.0] No recipe card found');
            return;
        }

        const recipeId = recipeCard.dataset.id;
        const detailsDiv = recipeCard.querySelector('.ingredient-details');

        if (!detailsDiv || !recipeId) {
            console.error('[Recipe Button Fix v2.0] Missing details div or recipe ID');
            return;
        }

        console.log('[Recipe Button Fix v2.0] Recipe ID:', recipeId);

        // PREVENT ANY EDIT MODALS FROM APPEARING
        // Close any existing modals first
        const existingModals = document.querySelectorAll('.modal, .edit-ingredient-modal, [id*="modal"]');
        existingModals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                console.log('[Recipe Button Fix v2.0] Closed existing modal:', modal.className || modal.id);
            }
        });

        // Set flags to prevent edit modals
        window._preventEditModal = true;
        window._isViewingIngredients = true;

        // Check if ingredients are currently visible
        const isVisible = detailsDiv.style.display === 'block' ||
                         (detailsDiv.style.display === '' && detailsDiv.innerHTML.trim() !== '');

        if (isVisible) {
            // Hide ingredients
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = '';
            button.textContent = 'View';
            console.log('[Recipe Button Fix v2.0] Hiding ingredients');
        } else {
            // Show ingredients - use our own direct fetch to avoid conflicts
            button.textContent = 'Loading...';
            console.log('[Recipe Button Fix v2.0] Fetching ingredients directly to avoid modal conflicts');
            fetchIngredientsDirectly(recipeId, detailsDiv, button);
        }

        // Clear the prevention flags after a delay
        setTimeout(() => {
            window._preventEditModal = false;
            window._isViewingIngredients = false;
        }, 2000);
    }

    function handleDeleteButton(button) {
        console.log('[Recipe Button Fix v2.0] Handling Delete button');

        const recipeCard = button.closest('.recipe-card');
        if (!recipeCard) {
            console.error('[Recipe Button Fix v2.0] No recipe card found');
            return;
        }

        const recipeId = recipeCard.dataset.id;
        if (!recipeId) {
            console.error('[Recipe Button Fix v2.0] No recipe ID found');
            return;
        }

        console.log('[Recipe Button Fix v2.0] Recipe ID to delete:', recipeId);

        if (confirm('Are you sure you want to delete this recipe and all its ingredients?')) {
            // Try to use the existing deleteRecipe function
            if (typeof window.deleteRecipe === 'function') {
                console.log('[Recipe Button Fix v2.0] Using existing deleteRecipe function');
                window.deleteRecipe(recipeId);
            } else {
                console.log('[Recipe Button Fix v2.0] Fallback: deleting recipe directly');
                deleteRecipeDirectly(recipeId, recipeCard);
            }
        }
    }

    function handleAdjustButton(button) {
        console.log('[Recipe Button Fix] Handling Adjust button');

        const recipeCard = button.closest('.recipe-card');
        if (!recipeCard) {
            console.error('[Recipe Button Fix] No recipe card found');
            return;
        }

        // Look for both possible adjustment div classes
        let adjustmentDiv = recipeCard.querySelector('.calorie-adjustment-compact');
        if (!adjustmentDiv) {
            adjustmentDiv = recipeCard.querySelector('.calorie-adjustment');
        }

        if (!adjustmentDiv) {
            console.error('[Recipe Button Fix] No adjustment div found');
            return;
        }

        console.log('[Recipe Button Fix] Found adjustment div:', adjustmentDiv.className);

        // Toggle visibility
        const isVisible = adjustmentDiv.style.display === 'grid' ||
                         adjustmentDiv.style.display === 'block' ||
                         (adjustmentDiv.style.display === '' && adjustmentDiv.offsetHeight > 0);

        if (isVisible) {
            adjustmentDiv.style.display = 'none';
            button.textContent = 'Adjust';
            console.log('[Recipe Button Fix] Hiding adjustment section');
        } else {
            adjustmentDiv.style.display = 'grid';
            button.textContent = 'Hide';
            console.log('[Recipe Button Fix] Showing adjustment section');
        }
    }

    // Fallback function to fetch ingredients directly (READ-ONLY VIEW)
    async function fetchIngredientsDirectly(recipeId, detailsDiv, button) {
        try {
            console.log('[Recipe Button Fix] Fetching ingredients for recipe:', recipeId);

            // Use the correct API endpoint that returns recipe with ingredients
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const recipeData = await response.json();
            const ingredients = recipeData.ingredients || [];
            console.log('[Recipe Button Fix] Fetched ingredients:', ingredients.length);

            // Display ingredients in READ-ONLY format (no edit buttons or modals)
            console.log('[Recipe Button Fix] Processing ingredients array:', ingredients);

            if (!ingredients || ingredients.length === 0) {
                detailsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 10px;">No ingredients found for this recipe.</p>';
            } else {
                let html = '<div class="ingredients-list-readonly" style="background: #2a2a2a; border-radius: 6px; padding: 10px; margin-top: 10px;">';
                html += `<h4 style="color: #e0e0e0; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 8px;">Ingredients (${ingredients.length}):</h4>`;

                ingredients.forEach((ingredient, index) => {
                    const calories = ingredient.calories ? Math.round(ingredient.calories) : 0;
                    const protein = ingredient.protein ? Math.round(ingredient.protein * 10) / 10 : 0;
                    const fats = ingredient.fats ? Math.round(ingredient.fats * 10) / 10 : 0;
                    const carbs = ingredient.carbohydrates ? Math.round(ingredient.carbohydrates * 10) / 10 : 0;
                    const price = ingredient.price ? `$${ingredient.price.toFixed(2)}` : '';

                    // Key micronutrients to display
                    const micronutrients = [];
                    if (ingredient.fiber && parseFloat(ingredient.fiber) > 0) micronutrients.push(`Fiber: ${ingredient.fiber}g`);
                    if (ingredient.sodium && parseFloat(ingredient.sodium) > 0) micronutrients.push(`Sodium: ${ingredient.sodium}mg`);
                    if (ingredient.vitamin_c && parseFloat(ingredient.vitamin_c) > 0) micronutrients.push(`Vitamin C: ${ingredient.vitamin_c}mg`);
                    if (ingredient.calcium && parseFloat(ingredient.calcium) > 0) micronutrients.push(`Calcium: ${ingredient.calcium}mg`);
                    if (ingredient.iron && parseFloat(ingredient.iron) > 0) micronutrients.push(`Iron: ${ingredient.iron}mg`);
                    if (ingredient.potassium && parseFloat(ingredient.potassium) > 0) micronutrients.push(`Potassium: ${ingredient.potassium}mg`);
                    if (ingredient.omega3 && parseFloat(ingredient.omega3) > 0) micronutrients.push(`Omega-3: ${ingredient.omega3}g`);
                    if (ingredient.omega6 && parseFloat(ingredient.omega6) > 0) micronutrients.push(`Omega-6: ${ingredient.omega6}g`);

                    html += `
                        <div class="ingredient-item-readonly" style="
                            padding: 12px 15px;
                            margin-bottom: 10px;
                            background: #333;
                            border-radius: 6px;
                            border-left: 3px solid #4CAF50;
                            color: #e0e0e0;
                            font-size: 13px;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div style="flex: 1;">
                                    <strong style="color: #fff; font-size: 14px;">${escapeHtml(ingredient.name)}</strong>
                                </div>
                                <div style="text-align: right; color: #4CAF50; font-weight: bold;">
                                    ${ingredient.amount}g
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; margin-bottom: 8px;">
                                <div style="background: #2a2a2a; padding: 4px 8px; border-radius: 3px; text-align: center;">
                                    <div style="color: #ff9800; font-weight: bold; font-size: 12px;">${calories}</div>
                                    <div style="color: #aaa; font-size: 10px;">cal</div>
                                </div>
                                <div style="background: #2a2a2a; padding: 4px 8px; border-radius: 3px; text-align: center;">
                                    <div style="color: #2196F3; font-weight: bold; font-size: 12px;">${protein}</div>
                                    <div style="color: #aaa; font-size: 10px;">protein</div>
                                </div>
                                <div style="background: #2a2a2a; padding: 4px 8px; border-radius: 3px; text-align: center;">
                                    <div style="color: #9C27B0; font-weight: bold; font-size: 12px;">${fats}</div>
                                    <div style="color: #aaa; font-size: 10px;">fats</div>
                                </div>
                                <div style="background: #2a2a2a; padding: 4px 8px; border-radius: 3px; text-align: center;">
                                    <div style="color: #4CAF50; font-weight: bold; font-size: 12px;">${carbs}</div>
                                    <div style="color: #aaa; font-size: 10px;">carbs</div>
                                </div>
                                ${price ? `
                                <div style="background: #2a2a2a; padding: 4px 8px; border-radius: 3px; text-align: center;">
                                    <div style="color: #FFC107; font-weight: bold; font-size: 12px;">${price}</div>
                                    <div style="color: #aaa; font-size: 10px;">price</div>
                                </div>
                                ` : ''}
                            </div>

                            ${micronutrients.length > 0 ? `
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444;">
                                <div style="color: #aaa; font-size: 11px; line-height: 1.4;">
                                    ${micronutrients.slice(0, 6).join(' • ')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                });

                html += '</div>';
                detailsDiv.innerHTML = html;
            }

            detailsDiv.style.display = 'block';
            button.textContent = 'Hide';

            // Ensure no edit forms or modals can appear
            setTimeout(() => {
                const editForms = detailsDiv.querySelectorAll('.edit-ingredient-form, .ingredient-edit-form');
                editForms.forEach(form => {
                    form.style.display = 'none';
                    form.style.visibility = 'hidden';
                });
            }, 100);

        } catch (error) {
            console.error('[Recipe Button Fix] Error fetching ingredients:', error);
            detailsDiv.innerHTML = `
                <div style="background: #2a2a2a; border-radius: 6px; padding: 15px; margin-top: 10px; text-align: center;">
                    <p style="color: #ff6b6b; margin: 0 0 10px 0;">
                        Error loading ingredients: ${error.message}
                    </p>
                    <button onclick="this.closest('.ingredient-details').style.display='none'; this.closest('.recipe-card').querySelector('.view-ingredients-btn').textContent='View';"
                            style="padding: 8px 16px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Close
                    </button>
                </div>
            `;
            detailsDiv.style.display = 'block';
            button.textContent = 'View';
        }
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Fallback function to delete recipe directly
    async function deleteRecipeDirectly(recipeId, recipeCard) {
        try {
            console.log('[Recipe Button Fix] Deleting recipe:', recipeId);

            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Recipe Button Fix] Recipe deleted successfully:', result);

            // Remove the recipe card from the DOM
            recipeCard.remove();

            // Show success message if there's a status element
            const statusElement = document.getElementById('recipes-display-status');
            if (statusElement) {
                statusElement.textContent = result.message || 'Recipe deleted successfully';
                statusElement.className = 'status success';
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'status';
                }, 3000);
            }

        } catch (error) {
            console.error('[Recipe Button Fix] Error deleting recipe:', error);
            alert(`Error deleting recipe: ${error.message}`);
        }
    }

    // Initialize the fix
    function init() {
        console.log('[Recipe Button Fix v2.0] Initializing...');

        // Remove conflicting handlers first
        removeConflictingHandlers();

        // Add our unified event listener using event delegation
        document.addEventListener('click', handleRecipeButtonClick, true);

        console.log('[Recipe Button Fix v2.0] Event listener attached to document');

        // Add global modal prevention system
        setupModalPrevention();

        // Also observe for new recipe cards being added
        observeRecipeCards();
    }

    // Prevent edit modals from appearing when viewing ingredients
    function setupModalPrevention() {
        // Override common modal functions
        const originalShowModal = window.showModal;
        const originalOpenModal = window.openModal;

        window.showModal = function(...args) {
            if (window._preventEditModal || window._isViewingIngredients) {
                console.log('[Recipe Button Fix] Prevented modal from opening during ingredient view');
                return;
            }
            if (originalShowModal) {
                return originalShowModal.apply(this, args);
            }
        };

        window.openModal = function(...args) {
            if (window._preventEditModal || window._isViewingIngredients) {
                console.log('[Recipe Button Fix] Prevented modal from opening during ingredient view');
                return;
            }
            if (originalOpenModal) {
                return originalOpenModal.apply(this, args);
            }
        };

        // Prevent any modal with "edit" in the class or ID from showing
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (window._preventEditModal || window._isViewingIngredients) {
                        if (target.classList.contains('modal') ||
                            target.id.includes('modal') ||
                            target.classList.contains('edit-ingredient') ||
                            target.id.includes('edit')) {
                            if (target.style.display !== 'none') {
                                target.style.display = 'none';
                                console.log('[Recipe Button Fix] Force-closed modal during ingredient view:', target.className || target.id);
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style']
        });

        console.log('[Recipe Button Fix v2.0] Modal prevention system activated');
    }

    // Observer to handle dynamically added recipe cards
    function observeRecipeCards() {
        const recipeListContainer = document.getElementById('recipe-list');
        if (!recipeListContainer) {
            console.log('[Recipe Button Fix v2.0] Recipe list container not found, will retry...');
            setTimeout(observeRecipeCards, 1000);
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('recipe-card')) {
                            console.log('[Recipe Button Fix v2.0] New recipe card detected, removing conflicting handlers');
                            removeConflictingHandlers();
                        }
                    });
                }
            });
        });

        observer.observe(recipeListContainer, {
            childList: true,
            subtree: true
        });

        console.log('[Recipe Button Fix v2.0] Observer attached to recipe list container');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also initialize after a short delay to ensure all other scripts have loaded
    setTimeout(init, 1000);

})();
