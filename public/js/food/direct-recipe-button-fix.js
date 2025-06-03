/**
 * Comprehensive Recipe Button Fix
 * Unified solution for View/Adjust/Delete buttons with conflict resolution
 * Version: 2.0 - Cache Busted
 */

(function() {
    'use strict';

    console.log('[Recipe Button Fix v2.0] Initializing comprehensive recipe button handler...');

    // Flag to prevent multiple initializations
    let isInitialized = false;

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
            // Use the correct API endpoint that returns recipe with ingredients
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const recipeData = await response.json();

            // Handle both possible response structures
            let ingredients = [];
            if (recipeData.recipe && recipeData.recipe.ingredients) {
                ingredients = recipeData.recipe.ingredients;
            } else if (recipeData.ingredients) {
                ingredients = recipeData.ingredients;
            } else if (Array.isArray(recipeData)) {
                ingredients = recipeData;
            }

            // Display ingredients in READ-ONLY format (no edit buttons or modals)

            if (!ingredients || ingredients.length === 0) {
                detailsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 5px; font-size: 12px;">No ingredients found.</p>';
            } else {
                let html = '<div class="ingredients-list-readonly" style="margin-top: 5px;">';

                ingredients.forEach((ingredient, index) => {
                    const calories = ingredient.calories ? Math.round(ingredient.calories) : 0;
                    const protein = ingredient.protein ? Math.round(ingredient.protein * 10) / 10 : 0;
                    const fats = ingredient.fats ? Math.round(ingredient.fats * 10) / 10 : 0;
                    const carbs = ingredient.carbohydrates ? Math.round(ingredient.carbohydrates * 10) / 10 : 0;
                    const price = ingredient.price ? `$${ingredient.price.toFixed(2)}` : '';

                    html += `
                        <div style="
                            padding: 3px 0;
                            margin-bottom: 2px;
                            font-size: 11px;
                            line-height: 1.2;
                            border-bottom: 1px solid #333;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1px;">
                                <span style="color: #fff; font-weight: bold; font-size: 12px;">${escapeHtml(ingredient.name)}</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #ccc; font-size: 11px;">${ingredient.amount}g</span>
                                    <button class="delete-ingredient-btn" data-recipe-id="${recipeId}" data-ingredient-id="${ingredient.id}" style="
                                        background: #666;
                                        color: #fff;
                                        border: none;
                                        border-radius: 1px;
                                        padding: 1px 3px;
                                        font-size: 8px;
                                        cursor: pointer;
                                        line-height: 1;
                                        width: 12px;
                                        height: 12px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    " title="Delete ingredient">×</button>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; color: #aaa; font-size: 10px;">
                                <span>${calories}cal</span>
                                <span>${protein}p</span>
                                <span>${fats}f</span>
                                <span>${carbs}c</span>
                                ${price ? `<span>${price}</span>` : ''}
                            </div>
                        </div>
                    `;
                });

                // Add "Add Ingredient" button
                html += `
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444;">
                        <button class="add-ingredient-btn" data-recipe-id="${recipeId}" style="
                            background: #333;
                            color: #fff;
                            border: 1px solid #555;
                            border-radius: 3px;
                            padding: 4px 8px;
                            font-size: 11px;
                            cursor: pointer;
                            width: 100%;
                        ">+ Add Ingredient</button>
                    </div>
                `;

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

    // Cronometer parser function for popup
    function parseCronometerData(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }

        // Use existing parser if available
        if (typeof window.parseCronometerText === 'function') {
            try {
                const result = window.parseCronometerText(text);
                if (result && result.success) {
                    return {
                        calories: result.calories || 0,
                        protein: result.protein || 0,
                        fats: result.fat || result.fats || 0,
                        carbohydrates: result.carbs || result.carbohydrates || 0,
                        fiber: result.fiber || 0,
                        sodium: result.sodium || 0,
                        vitamin_c: result.vitaminC || result.vitamin_c || 0,
                        calcium: result.calcium || 0,
                        iron: result.iron || 0,
                        potassium: result.potassium || 0,
                        omega3: result.omega3 || 0,
                        omega6: result.omega6 || 0
                    };
                }
            } catch (error) {
                console.warn('[Recipe Button Fix] Error using existing parser:', error);
            }
        }

        // Fallback parser using patterns
        function extractValue(text, pattern) {
            const match = text.match(pattern);
            return match ? parseFloat(match[1]) : 0;
        }

        const patterns = {
            ENERGY: /Energy\s*(\d+\.?\d*)\s*kcal/i,
            PROTEIN: /Protein\s*(\d+\.?\d*)\s*g/i,
            FAT: /Fat\s*(\d+\.?\d*)\s*g/i,
            CARBS: /Carbs\s*(\d+\.?\d*)\s*g/i,
            FIBER: /Fiber\s*(\d+\.?\d*)\s*g/i,
            SODIUM: /Sodium\s*(\d+\.?\d*)\s*mg/i,
            VITAMIN_C: /Vitamin C\s*(\d+\.?\d*)\s*mg/i,
            CALCIUM: /Calcium\s*(\d+\.?\d*)\s*mg/i,
            IRON: /Iron\s*(\d+\.?\d*)\s*mg/i,
            POTASSIUM: /Potassium\s*(\d+\.?\d*)\s*mg/i,
            OMEGA3: /Omega-3\s*(\d+\.?\d*)\s*g/i,
            OMEGA6: /Omega-6\s*(\d+\.?\d*)\s*g/i
        };

        return {
            calories: extractValue(text, patterns.ENERGY),
            protein: extractValue(text, patterns.PROTEIN),
            fats: extractValue(text, patterns.FAT),
            carbohydrates: extractValue(text, patterns.CARBS),
            fiber: extractValue(text, patterns.FIBER),
            sodium: extractValue(text, patterns.SODIUM),
            vitamin_c: extractValue(text, patterns.VITAMIN_C),
            calcium: extractValue(text, patterns.CALCIUM),
            iron: extractValue(text, patterns.IRON),
            potassium: extractValue(text, patterns.POTASSIUM),
            omega3: extractValue(text, patterns.OMEGA3),
            omega6: extractValue(text, patterns.OMEGA6)
        };
    }

    // Function to show add ingredient popup for existing recipes
    window.showAddIngredientPopup = function(recipeId) {
        // Remove any existing popup
        const existingPopup = document.getElementById('add-ingredient-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup modal
        const popupHtml = `
            <div id="add-ingredient-popup" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1a1a1a;
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 20px;
                    width: 90%;
                    max-width: 400px;
                    color: #fff;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #333;
                        padding-bottom: 10px;
                    ">
                        <h3 style="margin: 0; font-size: 16px;">Add Ingredient</h3>
                        <button class="close-popup-btn" style="
                            background: none;
                            border: none;
                            color: #ccc;
                            font-size: 20px;
                            cursor: pointer;
                            padding: 0;
                            width: 24px;
                            height: 24px;
                        ">×</button>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Ingredient Name</label>
                        <input type="text" id="popup-ingredient-name" placeholder="Enter ingredient name" style="
                            width: 100%;
                            background: #222;
                            border: 1px solid #555;
                            color: #fff;
                            padding: 8px 10px;
                            font-size: 13px;
                            border-radius: 4px;
                            box-sizing: border-box;
                        " />
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Cronometer Data (Optional)</label>
                        <textarea id="popup-cronometer-data" placeholder="Paste Cronometer nutrition data here..." style="
                            width: 100%;
                            background: #222;
                            border: 1px solid #555;
                            color: #fff;
                            padding: 8px 10px;
                            font-size: 13px;
                            border-radius: 4px;
                            box-sizing: border-box;
                            min-height: 60px;
                            resize: vertical;
                        "></textarea>
                        <div style="font-size: 11px; color: #888; margin-top: 4px;">
                            Paste nutrition data from Cronometer to auto-fill nutrition values
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Amount (g)</label>
                            <input type="number" id="popup-ingredient-amount" placeholder="0" style="
                                width: 100%;
                                background: #222;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 8px 10px;
                                font-size: 13px;
                                border-radius: 4px;
                                box-sizing: border-box;
                            " />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Package Amount (g)</label>
                            <input type="number" id="popup-package-amount" placeholder="0" style="
                                width: 100%;
                                background: #222;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 8px 10px;
                                font-size: 13px;
                                border-radius: 4px;
                                box-sizing: border-box;
                            " />
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Price ($)</label>
                            <input type="number" id="popup-ingredient-price" placeholder="0.00" step="0.01" style="
                                width: 100%;
                                background: #222;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 8px 10px;
                                font-size: 13px;
                                border-radius: 4px;
                                box-sizing: border-box;
                            " />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #ccc;">Grocery Store</label>
                            <input type="text" id="popup-grocery-store" placeholder="Store name" style="
                                width: 100%;
                                background: #222;
                                border: 1px solid #555;
                                color: #fff;
                                padding: 8px 10px;
                                font-size: 13px;
                                border-radius: 4px;
                                box-sizing: border-box;
                            " />
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="popup-add-ingredient-btn" data-recipe-id="${recipeId}" style="
                            background: #4CAF50;
                            color: #fff;
                            border: none;
                            border-radius: 4px;
                            padding: 10px 20px;
                            font-size: 13px;
                            cursor: pointer;
                            flex: 1;
                        ">Add Ingredient</button>
                        <button class="close-popup-btn" style="
                            background: #666;
                            color: #fff;
                            border: none;
                            border-radius: 4px;
                            padding: 10px 20px;
                            font-size: 13px;
                            cursor: pointer;
                            flex: 1;
                        ">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // Add popup to body
        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Focus on the ingredient name input
        const nameInput = document.getElementById('popup-ingredient-name');
        if (nameInput) {
            nameInput.focus();
        }
    };

    // Debounce flag to prevent duplicate submissions
    let isSubmittingIngredient = false;

    // Function to add ingredient to recipe from popup
    window.addIngredientFromPopup = async function(recipeId) {
        // Prevent duplicate submissions
        if (isSubmittingIngredient) {
            return;
        }

        isSubmittingIngredient = true;

        try {
            const nameInput = document.getElementById('popup-ingredient-name');
            const amountInput = document.getElementById('popup-ingredient-amount');
            const priceInput = document.getElementById('popup-ingredient-price');
            const packageAmountInput = document.getElementById('popup-package-amount');
            const groceryStoreInput = document.getElementById('popup-grocery-store');
            const cronometerDataInput = document.getElementById('popup-cronometer-data');

            const name = nameInput?.value.trim();
            const amount = parseFloat(amountInput?.value) || 0;
            const price = parseFloat(priceInput?.value) || 0;
            const packageAmount = parseFloat(packageAmountInput?.value) || amount;
            const groceryStore = groceryStoreInput?.value.trim() || '';
            const cronometerData = cronometerDataInput?.value.trim() || '';

            if (!name || amount <= 0) {
                alert('Please enter a valid ingredient name and amount.');
                return;
            }

            // Start with default nutrition values
            let nutritionData = {
                calories: 0,
                protein: 0,
                fats: 0,
                carbohydrates: 0,
                fiber: 0,
                sodium: 0,
                vitamin_c: 0,
                calcium: 0,
                iron: 0,
                potassium: 0,
                omega3: 0,
                omega6: 0
            };

            // Parse Cronometer data if provided
            if (cronometerData) {
                try {
                    const parsedData = parseCronometerData(cronometerData);
                    if (parsedData) {
                        nutritionData = { ...nutritionData, ...parsedData };
                    }
                } catch (parseError) {
                    // Continue with default values if parsing fails
                }
            }

            // Create ingredient data with all fields
            const ingredientData = {
                name: name,
                amount: amount,
                price: price > 0 ? price : 0,
                package_amount: packageAmount,
                grocery_store: groceryStore,
                ...nutritionData
            };

            const response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                body: JSON.stringify(ingredientData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // Close the popup
            closeAddIngredientPopup();

            // Refresh the ingredients display
            const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
            const detailsDiv = recipeCard?.querySelector('.ingredient-details');
            const viewButton = recipeCard?.querySelector('.view-ingredients-btn');

            if (detailsDiv && viewButton) {
                // Re-fetch and display ingredients
                await fetchIngredientsDirectly(recipeId, detailsDiv, viewButton);
            }

            // Show visual success notification
            showNotification(`Ingredient "${name}" added successfully!`, 'success');

        } catch (error) {
            showNotification(`Error adding ingredient: ${error.message}`, 'error');
        } finally {
            // Reset the debounce flag
            isSubmittingIngredient = false;
        }
    };

    // Function to close add ingredient popup
    window.closeAddIngredientPopup = function() {
        const popup = document.getElementById('add-ingredient-popup');
        if (popup) {
            popup.remove();
        }
    };

    // Visual notification system (make it globally accessible)
    window.showNotification = function(message, type = 'success') {
        // Remove any existing notifications
        const existingNotification = document.getElementById('ingredient-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'ingredient-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add CSS animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    };

    // Debounce flag to prevent duplicate refresh calls
    let isRefreshing = false;

    // Function to delete ingredient from recipe
    window.deleteIngredientFromRecipe = async function(recipeId, ingredientId) {
        // Direct delete without confirmation dialog

        // Prevent duplicate refresh calls
        if (isRefreshing) {
            return;
        }

        try {
            const response = await fetch(`/api/direct-update/recipe/${recipeId}/ingredient/${ingredientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // Set refresh flag to prevent duplicates
            isRefreshing = true;

            // Refresh the ingredients display
            const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
            const detailsDiv = recipeCard?.querySelector('.ingredient-details');
            const viewButton = recipeCard?.querySelector('.view-ingredients-btn');

            if (detailsDiv && viewButton) {
                // Re-fetch and display ingredients
                await fetchIngredientsDirectly(recipeId, detailsDiv, viewButton);
            }

            // Show visual success notification
            showNotification('Ingredient deleted successfully!', 'success');

        } catch (error) {
            showNotification(`Error deleting ingredient: ${error.message}`, 'error');
        } finally {
            // Reset refresh flag after a short delay
            setTimeout(() => {
                isRefreshing = false;
            }, 1000);
        }
    };

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
        if (isInitialized) {
            console.log('[Recipe Button Fix v2.0] Already initialized, skipping...');
            return;
        }

        console.log('[Recipe Button Fix v2.0] Initializing...');
        isInitialized = true;

        // Remove conflicting handlers first
        removeConflictingHandlers();

        // Add our unified event listener using event delegation
        document.addEventListener('click', handleRecipeButtonClick, true);

        // Add event delegation for add ingredient buttons and popup
        document.addEventListener('click', function(event) {
            // Check for add ingredient button (including text-based detection)
            const button = event.target.closest('button');
            if (button && button.textContent.includes('+ Add Ingredient')) {
                event.preventDefault();
                event.stopPropagation();

                const recipeCard = button.closest('.recipe-card');
                const recipeId = recipeCard ? recipeCard.dataset.id : button.dataset.recipeId;

                if (recipeId) {
                    showAddIngredientPopup(recipeId);
                }
                return;
            }

            // Handle popup buttons
            if (event.target.classList.contains('popup-add-ingredient-btn')) {
                event.preventDefault();
                event.stopPropagation();
                const recipeId = event.target.dataset.recipeId;
                if (recipeId) {
                    addIngredientFromPopup(recipeId);
                }
            } else if (event.target.classList.contains('close-popup-btn')) {
                event.preventDefault();
                event.stopPropagation();
                closeAddIngredientPopup();
            } else if (event.target.classList.contains('delete-ingredient-btn')) {
                event.preventDefault();
                event.stopPropagation();
                const recipeId = event.target.dataset.recipeId;
                const ingredientId = event.target.dataset.ingredientId;
                if (recipeId && ingredientId) {
                    deleteIngredientFromRecipe(recipeId, ingredientId);
                }
            }
        }, true);

        // Close popup when clicking outside of it
        document.addEventListener('click', function(event) {
            if (event.target.id === 'add-ingredient-popup') {
                closeAddIngredientPopup();
            }
        });

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
