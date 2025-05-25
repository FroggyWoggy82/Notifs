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
        `;

        // Add event listener for amount changes
        const amountInput = div.querySelector('input');
        amountInput.addEventListener('input', () => {
            updateIngredientNutrition(index, parseFloat(amountInput.value) || 0);
            calculateNutrition();
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
