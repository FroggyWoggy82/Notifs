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
            bloatingRatingInputs: document.querySelectorAll('input[name="bloating-rating"]'),
            customBloatingRating: document.getElementById('custom-bloating-rating'),
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

        // Bloating rating handlers
        setupBloatingRatingHandlers();
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

        // Add ingredient ID if available (for database updates)
        if (ingredient.id) {
            div.dataset.ingredientId = ingredient.id;
        }

        div.innerHTML = `
            <div class="ingredient-info">
                <div class="ingredient-name-container">
                    <div class="ingredient-name-display">${ingredient.name}</div>
                    <div class="ingredient-search-container" style="display: none;">
                        <input type="text" class="ingredient-search-input" placeholder="Search for ingredient..." value="${ingredient.name}">
                        <div class="ingredient-search-dropdown" style="display: none;"></div>
                    </div>
                    <button type="button" class="ingredient-dropdown-btn" data-index="${index}" title="Replace ingredient" tabindex="-1">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
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
                    tabindex="${100 + index}"
                >
            </div>
            <div class="nutrition-preview">
                <div class="calories">Cal: <span class="cal-value">${ingredient.calories || 0}</span></div>
                <div class="protein">Protein: <span class="protein-value">${ingredient.protein || 0}</span>g</div>
                <div class="fat">Fat: <span class="fat-value">${ingredient.fats || 0}</span>g</div>
                <div class="carbs">Carbs: <span class="carbs-value">${ingredient.carbohydrates || 0}</span>g</div>
            </div>
            <div class="ingredient-actions">
                <button type="button" class="edit-ingredient-btn" data-index="${index}" tabindex="-1">Edit</button>
                <button type="button" class="remove-ingredient-btn" data-index="${index}" tabindex="-1">Remove</button>
            </div>
        `;

        // Add event listener for amount changes
        const amountInput = div.querySelector('input');
        amountInput.addEventListener('input', () => {
            updateIngredientNutrition(index, parseFloat(amountInput.value) || 0);
            calculateNutrition();
        });

        // Add event listener for edit button
        const editBtn = div.querySelector('.edit-ingredient-btn');
        editBtn.addEventListener('click', () => {
            editIngredient(index);
        });

        // Add event listener for remove button
        const removeBtn = div.querySelector('.remove-ingredient-btn');
        removeBtn.addEventListener('click', () => {
            removeIngredient(index);
        });

        // Add event listener for dropdown button
        const dropdownBtn = div.querySelector('.ingredient-dropdown-btn');
        dropdownBtn.addEventListener('click', () => {
            toggleIngredientSearch(index);
        });

        // Add event listener for search input
        const searchInput = div.querySelector('.ingredient-search-input');
        searchInput.addEventListener('input', (e) => {
            handleIngredientSearch(e, index);
        });

        // Add event listener to close search when clicking outside
        searchInput.addEventListener('blur', (e) => {
            // Delay hiding to allow for dropdown clicks
            setTimeout(() => {
                hideIngredientSearch(index);
            }, 200);
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

    function editIngredient(index) {
        const ingredient = currentIngredients[index];
        if (!ingredient) {
            console.error(`[Meal Submission] Ingredient at index ${index} not found`);
            return;
        }

        console.log(`[Meal Submission] Editing ingredient at index ${index}:`, ingredient);

        // Store the ingredient ID for later use
        if (ingredient.id) {
            console.log(`[Meal Submission] Ingredient has database ID: ${ingredient.id}`);
        }

        showEditIngredientPopup(ingredient, index);
    }

    function showAddIngredientForm() {
        console.log('[Meal Submission] Showing add ingredient popup modal...');
        showMealAddIngredientPopup();
    }

    // Ingredient search and replacement functions
    function toggleIngredientSearch(index) {
        const ingredientElement = document.querySelector(`[data-index="${index}"]`);
        if (!ingredientElement) return;

        const nameDisplay = ingredientElement.querySelector('.ingredient-name-display');
        const searchContainer = ingredientElement.querySelector('.ingredient-search-container');
        const dropdownBtn = ingredientElement.querySelector('.ingredient-dropdown-btn');
        const searchInput = ingredientElement.querySelector('.ingredient-search-input');

        if (searchContainer.style.display === 'none') {
            // Show search
            nameDisplay.style.display = 'none';
            searchContainer.style.display = 'block';
            dropdownBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            searchInput.focus();
            searchInput.select();
        } else {
            // Hide search
            hideIngredientSearch(index);
        }
    }

    function hideIngredientSearch(index) {
        const ingredientElement = document.querySelector(`[data-index="${index}"]`);
        if (!ingredientElement) return;

        const nameDisplay = ingredientElement.querySelector('.ingredient-name-display');
        const searchContainer = ingredientElement.querySelector('.ingredient-search-container');
        const dropdownBtn = ingredientElement.querySelector('.ingredient-dropdown-btn');
        const dropdown = ingredientElement.querySelector('.ingredient-search-dropdown');

        nameDisplay.style.display = 'block';
        searchContainer.style.display = 'none';
        dropdown.style.display = 'none';
        dropdownBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }

    async function handleIngredientSearch(event, index) {
        const searchTerm = event.target.value.trim();
        const ingredientElement = document.querySelector(`[data-index="${index}"]`);
        const dropdown = ingredientElement.querySelector('.ingredient-search-dropdown');

        if (searchTerm.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        try {
            // Use the same approach as the existing ingredient search functionality
            // Search through all recipes to find matching ingredients
            const recipesResponse = await fetch('/api/recipes');
            if (!recipesResponse.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const responseData = await recipesResponse.json();
            let recipes;
            if (Array.isArray(responseData)) {
                recipes = responseData;
            } else if (responseData && responseData.success && Array.isArray(responseData.recipes)) {
                recipes = responseData.recipes;
            } else {
                throw new Error('Invalid recipe data format');
            }

            // Extract all ingredients from all recipes
            const allIngredients = [];
            for (const recipe of recipes) {
                try {
                    const recipeDetailResponse = await fetch(`/api/recipes/${recipe.id}`);
                    if (recipeDetailResponse.ok) {
                        const recipeDetailData = await recipeDetailResponse.json();

                        // Handle different response formats
                        let recipeDetail;
                        if (recipeDetailData.success && recipeDetailData.recipe) {
                            // New format: {success: true, recipe: {...}}
                            recipeDetail = recipeDetailData.recipe;
                        } else if (recipeDetailData.ingredients) {
                            // Old format: direct recipe object
                            recipeDetail = recipeDetailData;
                        } else {
                            console.warn(`No ingredients found in recipe ${recipe.id}`);
                            continue;
                        }

                        if (recipeDetail.ingredients && Array.isArray(recipeDetail.ingredients)) {
                            recipeDetail.ingredients.forEach(ingredient => {
                                allIngredients.push({
                                    ...ingredient,
                                    recipe_name: recipe.name,
                                    recipe_id: recipe.id
                                });
                            });
                        }
                    }
                } catch (recipeError) {
                    console.warn(`Failed to fetch recipe ${recipe.id}:`, recipeError);
                }
            }

            // Filter ingredients by search term
            const filteredIngredients = allIngredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Remove duplicates by name (keep the most recent)
            const uniqueIngredients = [];
            const seenNames = new Set();
            for (const ingredient of filteredIngredients) {
                if (!seenNames.has(ingredient.name.toLowerCase())) {
                    seenNames.add(ingredient.name.toLowerCase());
                    uniqueIngredients.push(ingredient);
                }
            }

            // Update dropdown with results
            updateIngredientSearchDropdown(dropdown, uniqueIngredients.slice(0, 10), index);
            dropdown.style.display = 'block';
        } catch (error) {
            console.error('Error searching ingredients:', error);
            dropdown.innerHTML = '<div class="search-result-item no-results">Search error occurred</div>';
            dropdown.style.display = 'block';
        }
    }

    function updateIngredientSearchDropdown(dropdown, ingredients, index) {
        dropdown.innerHTML = '';

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            dropdown.innerHTML = '<div class="search-result-item no-results">No ingredients found</div>';
            return;
        }

        ingredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-name">${ingredient.name}</div>
                <div class="result-nutrition">
                    ${ingredient.calories || 0} cal,
                    ${ingredient.protein || 0}g protein,
                    ${ingredient.fats || 0}g fat,
                    ${ingredient.carbohydrates || 0}g carbs
                </div>
            `;

            item.addEventListener('click', () => {
                replaceIngredient(index, ingredient);
            });

            dropdown.appendChild(item);
        });
    }

    function replaceIngredient(index, newIngredient) {
        console.log(`[Meal Submission] Replacing ingredient at index ${index} with:`, newIngredient);

        // Get the current amount from the input
        const amountInput = document.getElementById(`ingredient-amount-${index}`);
        const currentAmount = parseFloat(amountInput?.value) || 100;

        // Create new ingredient object with the current amount
        const replacementIngredient = {
            ...newIngredient,
            amount: currentAmount,
            // Calculate nutrition based on the current amount
            calories: (newIngredient.calories || 0) * (currentAmount / 100),
            protein: (newIngredient.protein || 0) * (currentAmount / 100),
            fats: (newIngredient.fats || 0) * (currentAmount / 100),
            carbohydrates: (newIngredient.carbohydrates || 0) * (currentAmount / 100),
            // Store per-100g values for future calculations
            calories_per_100g: newIngredient.calories || 0,
            protein_per_100g: newIngredient.protein || 0,
            fat_per_100g: newIngredient.fats || 0,
            carbohydrates_per_100g: newIngredient.carbohydrates || 0
        };

        // Update the ingredient in the array
        currentIngredients[index] = replacementIngredient;

        // Re-display ingredients to update the UI
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        console.log(`[Meal Submission] Ingredient replaced successfully`);
    }

    function showMealAddIngredientPopup() {
        // Remove any existing popup
        const existingPopup = document.getElementById('meal-add-ingredient-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup HTML
        const popupHtml = `
            <div id="meal-add-ingredient-popup" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background-color: rgba(20, 20, 20, 0.95);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 20px;
                    width: 90%;
                    max-width: 500px;
                    color: #ffffff;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #ffffff;">Add Ingredient to Meal</h3>
                        <button onclick="closeMealAddIngredientPopup()" style="
                            background: none;
                            border: none;
                            color: #ffffff;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">&times;</button>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Ingredient Name:</label>
                        <input type="text" id="meal-popup-ingredient-name" placeholder="Enter ingredient name" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Amount (g):</label>
                        <input type="number" id="meal-popup-ingredient-amount" placeholder="100" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Calories per 100g:</label>
                        <input type="number" id="meal-popup-ingredient-calories" placeholder="0" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Protein per 100g (g):</label>
                        <input type="number" id="meal-popup-ingredient-protein" placeholder="0" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Fat per 100g (g):</label>
                        <input type="number" id="meal-popup-ingredient-fat" placeholder="0" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Carbs per 100g (g):</label>
                        <input type="number" id="meal-popup-ingredient-carbs" placeholder="0" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="closeMealAddIngredientPopup()" style="
                            padding: 10px 20px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(60, 60, 60, 0.8);
                            color: #ffffff;
                            cursor: pointer;
                        ">Cancel</button>
                        <button onclick="addIngredientFromMealPopup()" style="
                            padding: 10px 20px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 120, 40, 0.8);
                            color: #ffffff;
                            cursor: pointer;
                        ">Add Ingredient</button>
                    </div>
                </div>
            </div>
        `;

        // Add popup to body
        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Focus on the ingredient name input
        const nameInput = document.getElementById('meal-popup-ingredient-name');
        if (nameInput) {
            nameInput.focus();
        }
    }

    // Global functions for the popup modal
    window.closeMealAddIngredientPopup = function() {
        const popup = document.getElementById('meal-add-ingredient-popup');
        if (popup) {
            popup.remove();
        }
    };

    window.addIngredientFromMealPopup = function() {
        console.log('[Meal Submission] Adding ingredient from popup...');

        // Get values from the popup
        const name = document.getElementById('meal-popup-ingredient-name').value.trim();
        const amount = parseFloat(document.getElementById('meal-popup-ingredient-amount').value) || 0;
        const caloriesPer100g = parseFloat(document.getElementById('meal-popup-ingredient-calories').value) || 0;
        const proteinPer100g = parseFloat(document.getElementById('meal-popup-ingredient-protein').value) || 0;
        const fatPer100g = parseFloat(document.getElementById('meal-popup-ingredient-fat').value) || 0;
        const carbsPer100g = parseFloat(document.getElementById('meal-popup-ingredient-carbs').value) || 0;

        // Validate inputs
        if (!name) {
            alert('Please enter an ingredient name.');
            return;
        }

        if (amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        // Calculate nutrition values based on the amount
        const calories = caloriesPer100g * (amount / 100);
        const protein = proteinPer100g * (amount / 100);
        const fat = fatPer100g * (amount / 100);
        const carbs = carbsPer100g * (amount / 100);

        // Create new ingredient object
        const newIngredient = {
            id: `manual_${Date.now()}`, // Temporary ID for manual ingredients
            name: name,
            amount: amount,
            calories: calories,
            protein: protein,
            fats: fat,
            carbohydrates: carbs
        };

        // Add to current ingredients
        currentIngredients.push(newIngredient);

        // Re-display ingredients
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        // Close popup
        window.closeMealAddIngredientPopup();

        console.log(`[Meal Submission] Added ingredient: ${newIngredient.name}`);
        showStatus(`Ingredient "${name}" added successfully!`, 'success');
    };

    function showEditIngredientPopup(ingredient, index) {
        // Remove any existing popup
        const existingPopup = document.getElementById('meal-edit-ingredient-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        console.log(`[Meal Submission] Creating edit popup for ingredient:`, ingredient);

        // Ensure we have all the necessary data
        if (!ingredient) {
            console.error('[Meal Submission] No ingredient data provided');
            alert('Could not extract ingredient data. Please try again.');
            return;
        }

        // Calculate per-100g values from the current ingredient with safe fallbacks
        const currentAmount = ingredient.amount || 100;
        const safeAmount = currentAmount > 0 ? currentAmount : 100;

        const caloriesPer100g = ingredient.calories_per_100g ||
            (ingredient.calories && safeAmount ? (ingredient.calories / safeAmount * 100) : 0);
        const proteinPer100g = ingredient.protein_per_100g ||
            (ingredient.protein && safeAmount ? (ingredient.protein / safeAmount * 100) : 0);
        const fatPer100g = ingredient.fat_per_100g ||
            ((ingredient.fats || ingredient.fat) && safeAmount ? ((ingredient.fats || ingredient.fat) / safeAmount * 100) : 0);
        const carbsPer100g = ingredient.carbohydrates_per_100g ||
            ((ingredient.carbohydrates || ingredient.carbs) && safeAmount ? ((ingredient.carbohydrates || ingredient.carbs) / safeAmount * 100) : 0);

        // Create popup HTML
        const popupHtml = `
            <div id="meal-edit-ingredient-popup" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background-color: rgba(20, 20, 20, 0.95);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 20px;
                    width: 90%;
                    max-width: 500px;
                    color: #ffffff;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #ffffff;">Edit Ingredient</h3>
                        <button onclick="closeEditIngredientPopup()" style="
                            background: none;
                            border: none;
                            color: #ffffff;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">&times;</button>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Ingredient Name:</label>
                        <input type="text" id="edit-popup-ingredient-name" value="${ingredient.name}" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Amount (g):</label>
                        <input type="number" id="edit-popup-ingredient-amount" value="${ingredient.amount}" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Calories per 100g:</label>
                        <input type="number" id="edit-popup-ingredient-calories" value="${caloriesPer100g}" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Protein per 100g (g):</label>
                        <input type="number" id="edit-popup-ingredient-protein" value="${proteinPer100g}" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Fat per 100g (g):</label>
                        <input type="number" id="edit-popup-ingredient-fat" value="${fatPer100g}" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #ffffff;">Carbs per 100g (g):</label>
                        <input type="number" id="edit-popup-ingredient-carbs" value="${carbsPer100g}" min="0" step="0.1" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 40, 40, 0.8);
                            color: #ffffff;
                            box-sizing: border-box;
                        ">
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="closeEditIngredientPopup()" style="
                            padding: 10px 20px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(60, 60, 60, 0.8);
                            color: #ffffff;
                            cursor: pointer;
                        ">Cancel</button>
                        <button onclick="saveEditedIngredient(${index})" style="
                            padding: 10px 20px;
                            border: 1px solid #555;
                            border-radius: 4px;
                            background-color: rgba(40, 120, 40, 0.8);
                            color: #ffffff;
                            cursor: pointer;
                        ">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        // Add popup to body
        document.body.insertAdjacentHTML('beforeend', popupHtml);

        // Focus on the ingredient name input
        const nameInput = document.getElementById('edit-popup-ingredient-name');
        if (nameInput) {
            nameInput.focus();
        }
    }

    // Global functions for the edit popup modal
    window.closeEditIngredientPopup = function() {
        const popup = document.getElementById('meal-edit-ingredient-popup');
        if (popup) {
            popup.remove();
        }
    };

    window.saveEditedIngredient = function(index) {
        console.log(`[Meal Submission] Saving edited ingredient at index ${index}...`);

        // Get values from the popup
        const name = document.getElementById('edit-popup-ingredient-name').value.trim();
        const amount = parseFloat(document.getElementById('edit-popup-ingredient-amount').value) || 0;
        const caloriesPer100g = parseFloat(document.getElementById('edit-popup-ingredient-calories').value) || 0;
        const proteinPer100g = parseFloat(document.getElementById('edit-popup-ingredient-protein').value) || 0;
        const fatPer100g = parseFloat(document.getElementById('edit-popup-ingredient-fat').value) || 0;
        const carbsPer100g = parseFloat(document.getElementById('edit-popup-ingredient-carbs').value) || 0;

        // Check if comprehensive nutrition fields are available (from the comprehensive edit popup)
        const comprehensiveNutrition = {};
        const nutritionFields = [
            'fiber', 'sugar', 'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc',
            'vitamin-a', 'vitamin-c', 'vitamin-d', 'vitamin-e', 'vitamin-k', 'thiamin', 'riboflavin', 'niacin',
            'vitamin-b6', 'folate', 'vitamin-b12', 'biotin', 'pantothenic-acid', 'choline', 'omega-3', 'omega-6',
            'saturated-fat', 'monounsaturated-fat', 'polyunsaturated-fat', 'trans-fat', 'cholesterol',
            'histidine', 'isoleucine', 'leucine', 'lysine', 'methionine', 'phenylalanine', 'threonine',
            'tryptophan', 'tyrosine', 'valine', 'alcohol', 'caffeine', 'water'
        ];

        let hasComprehensiveData = false;
        nutritionFields.forEach(field => {
            const element = document.getElementById(`edit-nutrition-${field}`);
            if (element) {
                const value = parseFloat(element.value) || 0;
                if (value > 0) {
                    hasComprehensiveData = true;
                }
                comprehensiveNutrition[field.replace('-', '_')] = value;
            }
        });

        if (hasComprehensiveData) {
            console.log(`[Meal Submission] Found comprehensive nutrition data, saving ${Object.keys(comprehensiveNutrition).length} fields`);
        }

        // Validate inputs
        if (!name) {
            alert('Please enter an ingredient name.');
            return;
        }

        if (amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        // Calculate nutrition values based on the amount
        const calories = caloriesPer100g * (amount / 100);
        const protein = proteinPer100g * (amount / 100);
        const fat = fatPer100g * (amount / 100);
        const carbs = carbsPer100g * (amount / 100);

        // Update the ingredient in the array
        const updatedIngredient = {
            ...currentIngredients[index],
            name: name,
            amount: amount,
            calories: calories,
            protein: protein,
            fats: fat,
            fat: fat,  // Include both formats for compatibility
            carbohydrates: carbs,
            carbs: carbs,  // Include both formats for compatibility
            // Store per-100g values for future edits
            calories_per_100g: caloriesPer100g,
            protein_per_100g: proteinPer100g,
            fat_per_100g: fatPer100g,
            carbohydrates_per_100g: carbsPer100g,
            // Include comprehensive nutrition data if available
            ...comprehensiveNutrition
        };

        currentIngredients[index] = updatedIngredient;

        // Re-display ingredients
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        // Close popup
        window.closeEditIngredientPopup();

        console.log(`[Meal Submission] Updated ingredient: ${updatedIngredient.name}`);
        showStatus(`Ingredient "${name}" updated successfully!`, 'success');
    };

    function setupBloatingRatingHandlers() {
        // Handle radio button changes
        elements.bloatingRatingInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.value !== '') {
                    // Clear custom rating when radio button is selected
                    elements.customBloatingRating.value = '';
                }
            });
        });

        // Handle custom rating input
        elements.customBloatingRating.addEventListener('input', function() {
            if (this.value !== '') {
                // Clear radio button selection when custom rating is entered
                elements.bloatingRatingInputs.forEach(input => {
                    if (input.value !== '') {
                        input.checked = false;
                    }
                });
                // Check the "Skip" option to maintain form state
                const skipOption = document.querySelector('input[name="bloating-rating"][value=""]');
                if (skipOption) {
                    skipOption.checked = true;
                }
            }
        });
    }

    function getBloatingRating() {
        // Check if custom rating is provided
        const customRating = elements.customBloatingRating.value;
        if (customRating && customRating >= 1 && customRating <= 10) {
            return parseInt(customRating);
        }

        // Check radio button selection
        const selectedRadio = document.querySelector('input[name="bloating-rating"]:checked');
        if (selectedRadio && selectedRadio.value !== '') {
            return parseInt(selectedRadio.value);
        }

        // No rating provided
        return null;
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

            // Add bloating rating if provided
            const bloatingRating = getBloatingRating();
            if (bloatingRating !== null) {
                mealData.bloating_rating = bloatingRating;
            }

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

                // Schedule bloating notification for 30 minutes from now
                if (window.BloatingNotifications && result.meal) {
                    const notificationTime = Date.now() + (30 * 60 * 1000); // 30 minutes
                    const ingredientNames = mealData.ingredients ?
                        mealData.ingredients.map(ing => ing.name).join(', ') :
                        mealData.name;

                    window.BloatingNotifications.scheduleNotification(
                        result.meal.id,
                        mealData.name,
                        ingredientNames,
                        notificationTime
                    );

                    console.log('[Meal Submission] Scheduled bloating notification for 30 minutes');
                }

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

    // Expose functions globally for external access
    window.showAddIngredientForm = function(container) {
        console.log('[Meal Submission] showAddIngredientForm called globally');
        showAddIngredientForm();
    };

    // Function to add ingredient to meal from external popup
    window.addIngredientToMeal = function(newIngredient) {
        console.log('[Meal Submission] Adding ingredient to meal:', newIngredient);

        // Add to current ingredients
        currentIngredients.push(newIngredient);

        // Re-display ingredients
        displayIngredients();

        // Recalculate nutrition
        calculateNutrition();

        console.log(`[Meal Submission] Added ingredient: ${newIngredient.name}`);
        showStatus(`Ingredient "${newIngredient.name}" added successfully!`, 'success');
    };

    // Make edit ingredient function globally accessible
    window.editIngredientFromMealSubmission = function(index) {
        editIngredient(index);
    };

    // Expose currentIngredients globally for other modules to access
    Object.defineProperty(window, 'currentIngredients', {
        get: function() {
            return currentIngredients;
        },
        set: function(value) {
            currentIngredients = value;
        }
    });

    console.log('[Meal Submission] Module loaded');

})();
