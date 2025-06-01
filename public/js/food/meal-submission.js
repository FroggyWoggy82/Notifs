/**
 * Meal Submission Functionality
 * Handles the submit meal section functionality
 */

(function() {
    'use strict';

    console.log('[Meal Submission] Initializing...');

    // State variables
    let currentRecipe = null;
    let currentIngredients = [];
    let selectedPhoto = null;

    // DOM elements
    let elements = {};

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('[Meal Submission] DOM ready, initializing...');

        // Get DOM elements
        elements = {
            form: document.getElementById('submit-meal-form'),
            mealDate: document.getElementById('meal-date'),
            recipeSelector: document.getElementById('recipe-selector'),
            recipeLoadingStatus: document.getElementById('recipe-loading-status'),
            ingredientsContainer: document.getElementById('meal-ingredients-container'),
            ingredientsList: document.getElementById('meal-ingredients-list'),
            nutritionSummary: document.getElementById('meal-nutrition-summary'),
            totalCalories: document.getElementById('total-calories'),
            totalProtein: document.getElementById('total-protein'),
            totalCarbs: document.getElementById('total-carbs'),
            totalFat: document.getElementById('total-fat'),
            toggleMicronutrients: document.getElementById('toggle-micronutrients'),
            micronutrientsDetails: document.getElementById('micronutrients-details'),
            mealPhoto: document.getElementById('meal-photo'),
            photoPreview: document.getElementById('photo-preview'),
            previewImage: document.getElementById('preview-image'),
            removePhotoBtn: document.getElementById('remove-photo'),
            submitBtn: document.getElementById('submit-meal-btn'),
            resetBtn: document.getElementById('reset-meal-form'),
            status: document.getElementById('meal-submission-status')
        };

        // Check if elements exist
        if (!elements.form) {
            console.log('[Meal Submission] Form not found, skipping initialization');
            return;
        }

        // Set default date to today
        setDefaultDate();

        // Load recipes
        loadRecipes();

        // Bind event listeners
        bindEventListeners();

        console.log('[Meal Submission] Initialization complete');
    }

    function setDefaultDate() {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        elements.mealDate.value = today;
    }

    function bindEventListeners() {
        // Recipe selection
        elements.recipeSelector.addEventListener('change', handleRecipeSelection);

        // Photo upload
        elements.mealPhoto.addEventListener('change', handlePhotoSelection);
        elements.removePhotoBtn.addEventListener('click', removePhoto);

        // Micronutrients toggle
        elements.toggleMicronutrients.addEventListener('click', toggleMicronutrients);

        // Form submission
        elements.form.addEventListener('submit', handleFormSubmission);

        // Reset form
        elements.resetBtn.addEventListener('click', resetForm);

        // Form validation
        elements.mealDate.addEventListener('change', validateForm);
        elements.recipeSelector.addEventListener('change', validateForm);
    }

    async function loadRecipes() {
        console.log('[Meal Submission] Loading recipes...');

        elements.recipeLoadingStatus.style.display = 'block';
        elements.recipeSelector.disabled = true;

        try {
            const response = await fetch('/api/recipes');
            const data = await response.json();

            if (data.success && data.recipes) {
                populateRecipeSelector(data.recipes);
                console.log(`[Meal Submission] Loaded ${data.recipes.length} recipes`);
            } else {
                throw new Error(data.message || 'Failed to load recipes');
            }
        } catch (error) {
            console.error('[Meal Submission] Error loading recipes:', error);
            showStatus('Error loading recipes. Please refresh the page.', 'error');
        } finally {
            elements.recipeLoadingStatus.style.display = 'none';
            elements.recipeSelector.disabled = false;
        }
    }

    function populateRecipeSelector(recipes) {
        // Clear existing options (except the first one)
        while (elements.recipeSelector.children.length > 1) {
            elements.recipeSelector.removeChild(elements.recipeSelector.lastChild);
        }

        // Add recipe options
        recipes.forEach(recipe => {
            const option = document.createElement('option');
            option.value = recipe.id;
            option.textContent = `${recipe.name} (${recipe.total_calories || 0} cal)`;
            elements.recipeSelector.appendChild(option);
        });
    }

    async function handleRecipeSelection() {
        const recipeId = elements.recipeSelector.value;

        if (!recipeId) {
            hideIngredientsAndNutrition();
            return;
        }

        console.log(`[Meal Submission] Loading recipe ${recipeId}...`);

        try {
            const response = await fetch(`/api/recipes/${recipeId}`);
            const data = await response.json();

            if (data.success && data.recipe) {
                currentRecipe = data.recipe;
                currentIngredients = data.recipe.ingredients || [];
                displayIngredients();
                calculateNutrition();
                showIngredientsAndNutrition();
                validateForm();
                console.log(`[Meal Submission] Loaded recipe: ${data.recipe.name}`);
            } else {
                throw new Error(data.message || 'Failed to load recipe details');
            }
        } catch (error) {
            console.error('[Meal Submission] Error loading recipe:', error);
            showStatus('Error loading recipe details. Please try again.', 'error');
            hideIngredientsAndNutrition();
        }
    }

    function displayIngredients() {
        elements.ingredientsList.innerHTML = '';

        currentIngredients.forEach((ingredient, index) => {
            const ingredientElement = createIngredientElement(ingredient, index);
            elements.ingredientsList.appendChild(ingredientElement);
        });

        // Add "Add Ingredient" button after all ingredients
        const addIngredientBtn = document.createElement('button');
        addIngredientBtn.type = 'button';
        addIngredientBtn.className = 'add-ingredient-btn';
        addIngredientBtn.innerHTML = '+ Add Ingredient';
        addIngredientBtn.addEventListener('click', showAddIngredientForm);
        elements.ingredientsList.appendChild(addIngredientBtn);
    }

    function createIngredientElement(ingredient, index) {
        const div = document.createElement('div');
        div.className = 'meal-ingredient-item';
        div.dataset.index = index;

        div.innerHTML = `
            <div class="ingredient-info">
                <div class="ingredient-name">${ingredient.name}</div>
                <div class="ingredient-original-amount">Recipe amount: ${ingredient.amount}g</div>
            </div>
            <div class="amount-input-group">
                <label for="ingredient-amount-${index}">Amount eaten (g):</label>
                <input
                    type="number"
                    id="ingredient-amount-${index}"
                    value="${ingredient.amount}"
                    min="0"
                    step="0.1"
                    data-index="${index}"
                >
            </div>
            <div class="nutrition-preview">
                <div class="calories">Cal: <span class="cal-value">${ingredient.calories || 0}</span></div>
                <div class="protein">Protein: <span class="protein-value">${ingredient.protein || 0}</span>g</div>
                <div class="fat">Fat: <span class="fat-value">${ingredient.fats || 0}</span>g</div>
                <div class="carbs">Carbs: <span class="carbs-value">${ingredient.carbohydrates || 0}</span>g</div>
            </div>
            <div class="ingredient-actions">
                <button type="button" class="remove-ingredient-btn" data-index="${index}">Remove</button>
            </div>
        `;

        // Add event listener for amount changes
        const amountInput = div.querySelector('input');
        amountInput.addEventListener('input', () => {
            updateIngredientNutrition(index, parseFloat(amountInput.value) || 0);
            calculateNutrition();
        });

        // Add event listener for remove button
        const removeBtn = div.querySelector('.remove-ingredient-btn');
        removeBtn.addEventListener('click', () => {
            removeIngredient(index);
        });

        return div;
    }

    function updateIngredientNutrition(index, newAmount) {
        const ingredient = currentIngredients[index];
        const originalAmount = ingredient.amount;
        const ratio = newAmount / originalAmount;

        // Update the nutrition preview
        const ingredientElement = document.querySelector(`[data-index="${index}"]`);
        if (ingredientElement) {
            const calories = Math.round((ingredient.calories || 0) * ratio);
            const protein = Math.round((ingredient.protein || 0) * ratio * 10) / 10;
            const fat = Math.round((ingredient.fats || 0) * ratio * 10) / 10;
            const carbs = Math.round((ingredient.carbohydrates || 0) * ratio * 10) / 10;

            ingredientElement.querySelector('.cal-value').textContent = calories;
            ingredientElement.querySelector('.protein-value').textContent = protein;
            ingredientElement.querySelector('.fat-value').textContent = fat;
            ingredientElement.querySelector('.carbs-value').textContent = carbs;
        }
    }

    function calculateNutrition() {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let micronutrients = {};

        currentIngredients.forEach((ingredient, index) => {
            const amountInput = document.getElementById(`ingredient-amount-${index}`);
            const amount = parseFloat(amountInput?.value) || 0;
            const originalAmount = ingredient.amount;
            const ratio = amount / originalAmount;

            totalCalories += (ingredient.calories || 0) * ratio;
            totalProtein += (ingredient.protein || 0) * ratio;
            totalFat += (ingredient.fats || 0) * ratio;
            totalCarbs += (ingredient.carbohydrates || 0) * ratio;

            // Calculate micronutrients
            const micronutrientFields = [
                'fiber', 'sugars', 'saturated', 'monounsaturated', 'polyunsaturated',
                'omega3', 'omega6', 'cholesterol', 'vitamin_a', 'vitamin_c', 'vitamin_d',
                'vitamin_e', 'vitamin_k', 'thiamine', 'riboflavin', 'niacin', 'vitamin_b6',
                'folate', 'vitamin_b12', 'pantothenic_acid', 'calcium', 'iron', 'magnesium',
                'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium'
            ];

            micronutrientFields.forEach(field => {
                if (ingredient[field] !== undefined && ingredient[field] !== null) {
                    if (!micronutrients[field]) micronutrients[field] = 0;
                    micronutrients[field] += (ingredient[field] || 0) * ratio;
                }
            });
        });

        // Update main nutrition display
        elements.totalCalories.textContent = Math.round(totalCalories);
        elements.totalProtein.textContent = Math.round(totalProtein * 10) / 10;
        elements.totalFat.textContent = Math.round(totalFat * 10) / 10;
        elements.totalCarbs.textContent = Math.round(totalCarbs * 10) / 10;

        // Update micronutrients display
        updateMicronutrientsDisplay(micronutrients);
    }

    function updateMicronutrientsDisplay(micronutrients) {
        const micronutrientsContainer = elements.micronutrientsDetails;

        // Define micronutrient categories
        const categories = {
            'Carbohydrates': {
                'fiber': 'Fiber (g)',
                'sugars': 'Sugars (g)'
            },
            'Lipids': {
                'saturated': 'Saturated Fat (g)',
                'monounsaturated': 'Monounsaturated Fat (g)',
                'polyunsaturated': 'Polyunsaturated Fat (g)',
                'omega3': 'Omega-3 (g)',
                'omega6': 'Omega-6 (g)',
                'cholesterol': 'Cholesterol (mg)'
            },
            'Vitamins': {
                'vitamin_a': 'Vitamin A (μg)',
                'vitamin_c': 'Vitamin C (mg)',
                'vitamin_d': 'Vitamin D (IU)',
                'vitamin_e': 'Vitamin E (mg)',
                'vitamin_k': 'Vitamin K (μg)',
                'thiamine': 'B1 (Thiamine) (mg)',
                'riboflavin': 'B2 (Riboflavin) (mg)',
                'niacin': 'B3 (Niacin) (mg)',
                'vitamin_b6': 'B6 (Pyridoxine) (mg)',
                'folate': 'Folate (μg)',
                'vitamin_b12': 'B12 (Cobalamin) (μg)',
                'pantothenic_acid': 'B5 (Pantothenic Acid) (mg)'
            },
            'Minerals': {
                'calcium': 'Calcium (mg)',
                'iron': 'Iron (mg)',
                'magnesium': 'Magnesium (mg)',
                'phosphorus': 'Phosphorus (mg)',
                'potassium': 'Potassium (mg)',
                'sodium': 'Sodium (mg)',
                'zinc': 'Zinc (mg)',
                'copper': 'Copper (mg)',
                'manganese': 'Manganese (mg)',
                'selenium': 'Selenium (μg)'
            }
        };

        let html = '<div class="micronutrients-grid">';

        Object.entries(categories).forEach(([categoryName, categoryFields]) => {
            html += `<div class="micronutrient-category">`;
            html += `<h4>${categoryName}</h4>`;

            Object.entries(categoryFields).forEach(([field, label]) => {
                const value = micronutrients[field] || 0;
                const displayValue = value > 0 ? (Math.round(value * 100) / 100) : 0;

                html += `<div class="micronutrient-item">`;
                html += `<span class="name">${label}</span>`;
                html += `<span class="value">${displayValue}</span>`;
                html += `</div>`;
            });

            html += `</div>`;
        });

        html += '</div>';
        micronutrientsContainer.innerHTML = html;
    }

    function toggleMicronutrients() {
        const isExpanded = elements.micronutrientsDetails.style.display !== 'none';

        if (isExpanded) {
            elements.micronutrientsDetails.style.display = 'none';
            elements.toggleMicronutrients.classList.remove('expanded');
            elements.toggleMicronutrients.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Micronutrients';
        } else {
            elements.micronutrientsDetails.style.display = 'block';
            elements.toggleMicronutrients.classList.add('expanded');
            elements.toggleMicronutrients.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Detailed Micronutrients';
        }
    }

    function handlePhotoSelection(event) {
        const file = event.target.files[0];

        if (!file) {
            removePhoto();
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showStatus('Please select a valid image file.', 'error');
            event.target.value = '';
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showStatus('Image file is too large. Please select a file smaller than 10MB.', 'error');
            event.target.value = '';
            return;
        }

        selectedPhoto = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            elements.previewImage.src = e.target.result;
            elements.photoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function removePhoto() {
        selectedPhoto = null;
        elements.mealPhoto.value = '';
        elements.photoPreview.style.display = 'none';
        elements.previewImage.src = '';
    }

    function showIngredientsAndNutrition() {
        elements.ingredientsContainer.style.display = 'block';
        elements.nutritionSummary.style.display = 'block';
    }

    function hideIngredientsAndNutrition() {
        elements.ingredientsContainer.style.display = 'none';
        elements.nutritionSummary.style.display = 'none';
        currentRecipe = null;
        currentIngredients = [];
    }

    function removeIngredient(index) {
        if (currentIngredients.length <= 1) {
            showStatus('Cannot remove the last ingredient.', 'error');
            return;
        }

        // Remove ingredient from array
        currentIngredients.splice(index, 1);

        // Re-display ingredients with updated indices
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        console.log(`[Meal Submission] Removed ingredient at index ${index}`);
    }

    function showAddIngredientForm() {
        // DISABLED - This function is now handled by unified-add-ingredient-handler.js
        console.log('[Meal Submission] showAddIngredientForm disabled to prevent duplicate modals');
        return;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'add-ingredient-modal-overlay';
        overlay.innerHTML = `
            <div class="add-ingredient-modal">
                <div class="modal-header">
                    <h3>Add Ingredient</h3>
                    <button type="button" class="close-modal-btn">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="ingredient-selection-type">
                        <label>
                            <input type="radio" name="ingredient-type" value="existing" checked>
                            Select from existing ingredients
                        </label>
                        <label>
                            <input type="radio" name="ingredient-type" value="manual">
                            Enter manually
                        </label>
                    </div>

                    <div id="existing-ingredient-section">
                        <label for="existing-ingredient-select">Choose ingredient:</label>
                        <select id="existing-ingredient-select">
                            <option value="">-- Select an ingredient --</option>
                        </select>
                    </div>

                    <div id="manual-ingredient-section" style="display: none;">
                        <div class="form-group">
                            <label for="manual-ingredient-name">Ingredient Name:</label>
                            <input type="text" id="manual-ingredient-name" placeholder="Enter ingredient name">
                        </div>
                        <div class="form-group">
                            <label for="manual-ingredient-calories">Calories per 100g:</label>
                            <input type="number" id="manual-ingredient-calories" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="manual-ingredient-protein">Protein per 100g:</label>
                            <input type="number" id="manual-ingredient-protein" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="manual-ingredient-fat">Fat per 100g:</label>
                            <input type="number" id="manual-ingredient-fat" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="manual-ingredient-carbs">Carbs per 100g:</label>
                            <input type="number" id="manual-ingredient-carbs" min="0" step="0.1">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="ingredient-amount">Amount (g):</label>
                        <input type="number" id="ingredient-amount" min="0" step="0.1" value="100">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="add-ingredient-confirm-btn">Add Ingredient</button>
                    <button type="button" class="cancel-add-ingredient-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Load existing ingredients
        loadExistingIngredients();

        // Add event listeners
        setupAddIngredientModalEvents(overlay);
    }

    async function loadExistingIngredients() {
        try {
            const response = await fetch('/api/ingredients');
            const data = await response.json();

            if (data.success && data.ingredients) {
                const select = document.getElementById('existing-ingredient-select');
                data.ingredients.forEach(ingredient => {
                    const option = document.createElement('option');
                    option.value = ingredient.id;
                    option.textContent = ingredient.name;
                    option.dataset.ingredient = JSON.stringify(ingredient);
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('[Meal Submission] Error loading ingredients:', error);
        }
    }

    function setupAddIngredientModalEvents(overlay) {
        const modal = overlay.querySelector('.add-ingredient-modal');
        const closeBtn = overlay.querySelector('.close-modal-btn');
        const cancelBtn = overlay.querySelector('.cancel-add-ingredient-btn');
        const confirmBtn = overlay.querySelector('.add-ingredient-confirm-btn');
        const typeRadios = overlay.querySelectorAll('input[name="ingredient-type"]');
        const existingSection = overlay.querySelector('#existing-ingredient-section');
        const manualSection = overlay.querySelector('#manual-ingredient-section');

        // Close modal events
        closeBtn.addEventListener('click', () => closeAddIngredientModal(overlay));
        cancelBtn.addEventListener('click', () => closeAddIngredientModal(overlay));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAddIngredientModal(overlay);
        });

        // Toggle between existing and manual ingredient entry
        typeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'existing') {
                    existingSection.style.display = 'block';
                    manualSection.style.display = 'none';
                } else {
                    existingSection.style.display = 'none';
                    manualSection.style.display = 'block';
                }
            });
        });

        // Confirm add ingredient
        confirmBtn.addEventListener('click', () => addNewIngredient(overlay));

        // Prevent modal from closing when clicking inside
        modal.addEventListener('click', (e) => e.stopPropagation());
    }

    function closeAddIngredientModal(overlay) {
        document.body.removeChild(overlay);
    }

    function addNewIngredient(overlay) {
        const typeRadio = overlay.querySelector('input[name="ingredient-type"]:checked');
        const amount = parseFloat(overlay.querySelector('#ingredient-amount').value) || 0;

        if (amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        let newIngredient;

        if (typeRadio.value === 'existing') {
            const select = overlay.querySelector('#existing-ingredient-select');
            const selectedOption = select.options[select.selectedIndex];

            if (!selectedOption.value) {
                alert('Please select an ingredient.');
                return;
            }

            const ingredientData = JSON.parse(selectedOption.dataset.ingredient);
            newIngredient = {
                id: ingredientData.id,
                name: ingredientData.name,
                amount: amount,
                calories: (ingredientData.calories || 0) * (amount / 100),
                protein: (ingredientData.protein || 0) * (amount / 100),
                fats: (ingredientData.fats || 0) * (amount / 100),
                carbohydrates: (ingredientData.carbohydrates || 0) * (amount / 100)
            };
        } else {
            // Manual entry
            const name = overlay.querySelector('#manual-ingredient-name').value.trim();
            const caloriesPer100g = parseFloat(overlay.querySelector('#manual-ingredient-calories').value) || 0;
            const proteinPer100g = parseFloat(overlay.querySelector('#manual-ingredient-protein').value) || 0;
            const fatPer100g = parseFloat(overlay.querySelector('#manual-ingredient-fat').value) || 0;
            const carbsPer100g = parseFloat(overlay.querySelector('#manual-ingredient-carbs').value) || 0;

            if (!name) {
                alert('Please enter an ingredient name.');
                return;
            }

            newIngredient = {
                id: `manual_${Date.now()}`, // Temporary ID for manual ingredients
                name: name,
                amount: amount,
                calories: caloriesPer100g * (amount / 100),
                protein: proteinPer100g * (amount / 100),
                fats: fatPer100g * (amount / 100),
                carbohydrates: carbsPer100g * (amount / 100)
            };
        }

        // Add to current ingredients
        currentIngredients.push(newIngredient);

        // Re-display ingredients
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        // Close modal
        closeAddIngredientModal(overlay);

        console.log(`[Meal Submission] Added ingredient: ${newIngredient.name}`);
    }

    function validateForm() {
        const isValid = elements.mealDate.value && elements.recipeSelector.value;
        elements.submitBtn.disabled = !isValid;
    }

    async function handleFormSubmission(event) {
        event.preventDefault();

        if (elements.submitBtn.disabled) {
            return;
        }

        console.log('[Meal Submission] Submitting meal...');

        elements.submitBtn.disabled = true;
        elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            // Generate default time
            const now = new Date();
            const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

            // Prepare meal data
            const mealData = {
                name: currentRecipe ? currentRecipe.name : 'Meal',
                date: elements.mealDate.value,
                time: currentTime,
                ingredients: []
            };

            // Collect ingredient data with actual amounts
            currentIngredients.forEach((ingredient, index) => {
                const amountInput = document.getElementById(`ingredient-amount-${index}`);
                const amount = parseFloat(amountInput?.value) || 0;

                if (amount > 0) {
                    const originalAmount = ingredient.amount;
                    const ratio = amount / originalAmount;

                    mealData.ingredients.push({
                        id: ingredient.id,
                        name: ingredient.name,
                        amount: amount,
                        calories: Math.round((ingredient.calories || 0) * ratio * 100) / 100,
                        protein: Math.round((ingredient.protein || 0) * ratio * 100) / 100,
                        fat: Math.round((ingredient.fats || 0) * ratio * 100) / 100,
                        carbs: Math.round((ingredient.carbohydrates || 0) * ratio * 100) / 100
                    });
                }
            });

            if (mealData.ingredients.length === 0) {
                throw new Error('Please specify amounts for at least one ingredient.');
            }

            // Submit meal data
            let response;
            if (selectedPhoto) {
                // Submit with photo
                const formData = new FormData();
                formData.append('meal-photo', selectedPhoto);
                formData.append('name', mealData.name);
                formData.append('date', mealData.date);
                formData.append('time', mealData.time);
                formData.append('ingredients', JSON.stringify(mealData.ingredients));

                response = await fetch('/api/meals', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Submit without photo
                response = await fetch('/api/meals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(mealData)
                });
            }

            const result = await response.json();

            if (result.success) {
                showStatus('Meal submitted successfully!', 'success');
                resetForm();
                console.log('[Meal Submission] Meal submitted successfully:', result.meal);

                // Refresh the meal calendar if it exists
                if (window.MealCalendar && typeof window.MealCalendar.refresh === 'function') {
                    window.MealCalendar.refresh();
                }
            } else {
                throw new Error(result.message || 'Failed to submit meal');
            }

        } catch (error) {
            console.error('[Meal Submission] Error submitting meal:', error);
            showStatus(error.message || 'Error submitting meal. Please try again.', 'error');
        } finally {
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerHTML = '<i class="fas fa-utensils"></i> Submit Meal';
            validateForm();
        }
    }

    function resetForm() {
        elements.form.reset();
        setDefaultDate();
        hideIngredientsAndNutrition();
        removePhoto();
        hideStatus();
        validateForm();

        // Reset micronutrients toggle
        elements.micronutrientsDetails.style.display = 'none';
        elements.toggleMicronutrients.classList.remove('expanded');
        elements.toggleMicronutrients.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Micronutrients';
    }

    function showStatus(message, type) {
        elements.status.textContent = message;
        elements.status.className = `status ${type}`;
        elements.status.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(hideStatus, 5000);
        }
    }

    function hideStatus() {
        elements.status.style.display = 'none';
        elements.status.className = 'status';
    }

    console.log('[Meal Submission] Module loaded');

})();
