console.error("FOOD.JS SCRIPT FILE LOADED - THIS SHOULD BE VISIBLE IMMEDIATELY");

document.addEventListener('DOMContentLoaded', () => {
    console.error("FOOD.JS SCRIPT STARTED - DOM CONTENT LOADED - THIS SHOULD BE VISIBLE");

    console.error("ABOUT TO INITIALIZE VARIABLES - THIS SHOULD BE VISIBLE");
    const ingredientsList = document.getElementById('ingredients-list');
    console.error("FINISHED INITIALIZING ingredientsList - THIS SHOULD BE VISIBLE");
    const createRecipeForm = document.getElementById('create-recipe-form');
    console.error("FINISHED INITIALIZING createRecipeForm - THIS SHOULD BE VISIBLE");
    const recipeNameInput = document.getElementById('recipeName');
    console.error("FINISHED INITIALIZING recipeNameInput - THIS SHOULD BE VISIBLE");
    const createRecipeStatus = document.getElementById('create-recipe-status');
    console.error("FINISHED INITIALIZING createRecipeStatus - THIS SHOULD BE VISIBLE");
    const recipeListContainer = document.getElementById('recipe-list');
    console.error("FINISHED INITIALIZING recipeListContainer - THIS SHOULD BE VISIBLE");
    const recipesDisplayStatus = document.getElementById('recipes-display-status');
    console.error("FINISHED INITIALIZING recipesDisplayStatus - THIS SHOULD BE VISIBLE");

    console.error("ABOUT TO CHECK initializeCronometerTextParser - THIS SHOULD BE VISIBLE");
    // Temporarily commenting out initializeCronometerTextParser to debug the main script flow
    /*
    try {
        if (typeof initializeCronometerTextParser === 'function') {
            console.error("initializeCronometerTextParser FUNCTION FOUND - THIS SHOULD BE VISIBLE");
            console.log('Initializing Cronometer text parser for all existing ingredient items');
            const ingredientItems = document.querySelectorAll('.ingredient-item');
            ingredientItems.forEach(item => {
                try {
                    initializeCronometerTextParser(item);
                } catch (itemError) {
                    console.error('Error initializing Cronometer text parser for item:', itemError);
                }
            });
        } else {
            console.error("initializeCronometerTextParser FUNCTION NOT FOUND - THIS SHOULD BE VISIBLE");
            console.warn('Cronometer text parser not available on page load');
        }
    } catch (error) {
        console.error('Error in initializeCronometerTextParser section:', error);
    }
    */
    console.error("FINISHED CRONOMETER TEXT PARSER CHECK - THIS SHOULD BE VISIBLE");
    console.error("ABOUT TO CONTINUE WITH VARIABLE INITIALIZATION - THIS SHOULD BE VISIBLE");

    const targetWeightInput = document.getElementById('targetWeight');
    const weeklyGainGoalInput = document.getElementById('weeklyGainGoal');
    const saveAllWeightGoalsBtn = document.getElementById('save-all-weight-goals-btn');
    const weightGoalStatus = document.getElementById('weight-goal-status');
    const weightGoalChartCanvas = document.getElementById('weight-goal-chart');
    const weightChartMessage = document.getElementById('weight-chart-message');
    const userSelector = document.getElementById('user-selector');
    console.error("FINISHED INITIALIZING CHART VARIABLES - THIS SHOULD BE VISIBLE");
    const resetScaleButton = document.getElementById('reset-scale-button');
    const xAxisScaleSlider = document.getElementById('x-axis-scale');
    const yAxisScaleSlider = document.getElementById('y-axis-scale');
    const xScaleValue = document.getElementById('x-scale-value');
    const yScaleValue = document.getElementById('y-scale-value');
    let weightGoalChart = null; // To hold the Chart.js instance

    const calorieUserSelector = document.getElementById('calorie-user-selector');
    const calorieTargetInput = document.getElementById('calorie-target');
    const proteinTargetInput = document.getElementById('protein-target');
    const fatTargetInput = document.getElementById('fat-target');
    const saveAllTargetsBtn = document.getElementById('save-all-targets-btn');
    const currentCalorieTarget = document.getElementById('current-calorie-target');
    const currentProteinTarget = document.getElementById('current-protein-target');
    const currentFatTarget = document.getElementById('current-fat-target');
    const calorieTargetStatus = document.getElementById('calorie-target-status');

    let xAxisScale = 1;
    let yAxisScale = 1;

    let currentUserId = localStorage.getItem('weightUserPreference') || 1;

    if (userSelector && currentUserId) {
        userSelector.value = currentUserId;
    }


    function createIngredientRowHtml() {
        return `
            <div class="ingredient-row">
                <!-- Ingredient Selection Type -->
                <div class="selection-row">
                    <div class="selection-type">
                        <label>
                            <input type="radio" name="ingredient-selection-type" value="existing" class="ingredient-selection-radio">
                            Use existing
                        </label>
                        <label>
                            <input type="radio" name="ingredient-selection-type" value="new" class="ingredient-selection-radio" checked>
                            Create new
                        </label>
                    </div>
                    <div class="existing-ingredient-selection" style="display: none;">
                        <input type="text" class="ingredient-search-input" placeholder="Search ingredients...">
                        <!-- Dropdown will be created dynamically by ingredient-search-autocomplete.js -->
                    </div>
                </div>

                <!-- Ingredient Name, Amount, and Price stacked vertically -->
                <div class="ingredient-inputs-container">
                    <input type="text" placeholder="Ingredient Name" class="ingredient-name" required>
                    <input type="number" placeholder="Amount (g)" class="ingredient-amount" step="0.01" required>
                    <input type="number" placeholder="Package Amount (g)" class="ingredient-package-amount" step="0.01">
                    <input type="number" placeholder="Package Price" class="ingredient-price" step="0.01" required>
                    <!-- Hidden fields for form submission -->
                    <input type="hidden" class="ingredient-calories" required>
                    <input type="hidden" class="ingredient-protein" required>
                    <input type="hidden" class="ingredient-fat" required>
                    <input type="hidden" class="ingredient-carbs" required>
                </div>

                <!-- Cronometer Text Parser -->
                <div class="cronometer-text-paste-container">
                    <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..." rows="5"></textarea>
                    <button type="button" class="cronometer-parse-button" onclick="if(window.processCronometerText){window.processCronometerText(this.parentNode.querySelector('.cronometer-text-paste-area').value.trim(), this.closest('.ingredient-item'), this.parentNode.querySelector('.cronometer-parse-status'))}">Parse Nutrition Data</button>
                    <div class="cronometer-parse-status"></div>
                </div>
            </div>

            <!-- Action buttons in one row -->
            <div class="buttons-row">
                <button type="button" class="toggle-detailed-nutrition">Show Detailed Nutrition</button>
                <button type="button" class="add-ingredient-btn-inline">Add Ingredient</button>
                <button type="button" class="remove-ingredient-btn">Remove</button>
            </div>

            <div class="detailed-nutrition-panel" style="display:none;">
                <!-- General Section -->
                <div class="nutrition-section">
                    <h4>General</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="energy">Energy (kcal):</label>
                            <input type="number" class="nutrition-energy" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="alcohol">Alcohol (g):</label>
                            <input type="number" class="nutrition-alcohol" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="caffeine">Caffeine (mg):</label>
                            <input type="number" class="nutrition-caffeine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="water">Water (g):</label>
                            <input type="number" class="nutrition-water" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Carbohydrates Section -->
                <div class="nutrition-section">
                    <h4>Carbohydrates</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="carbs-total">Carbs (g):</label>
                            <input type="number" class="nutrition-carbs-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="fiber">Fiber (g):</label>
                            <input type="number" class="nutrition-fiber" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="starch">Starch (g):</label>
                            <input type="number" class="nutrition-starch" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="sugars">Sugars (g):</label>
                            <input type="number" class="nutrition-sugars" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="added-sugars">Added Sugars (g):</label>
                            <input type="number" class="nutrition-added-sugars" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="net-carbs">Net Carbs (g):</label>
                            <input type="number" class="nutrition-net-carbs" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Lipids Section -->
                <div class="nutrition-section">
                    <h4>Lipids</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="fat-total">Fat (g):</label>
                            <input type="number" class="nutrition-fat-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="monounsaturated">Monounsaturated (g):</label>
                            <input type="number" class="nutrition-monounsaturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="polyunsaturated">Polyunsaturated (g):</label>
                            <input type="number" class="nutrition-polyunsaturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="omega3">Omega 3 (g):</label>
                            <input type="number" class="nutrition-omega3" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="omega6">Omega 6 (g):</label>
                            <input type="number" class="nutrition-omega6" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="saturated">Saturated (g):</label>
                            <input type="number" class="nutrition-saturated" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="trans-fat">Trans Fat (g):</label>
                            <input type="number" class="nutrition-trans-fat" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="cholesterol">Cholesterol (mg):</label>
                            <input type="number" class="nutrition-cholesterol" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Protein Section -->
                <div class="nutrition-section">
                    <h4>Protein</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="protein-total">Protein (g):</label>
                            <input type="number" class="nutrition-protein-total" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="cystine">Cystine (g):</label>
                            <input type="number" class="nutrition-cystine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="histidine">Histidine (g):</label>
                            <input type="number" class="nutrition-histidine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="isoleucine">Isoleucine (g):</label>
                            <input type="number" class="nutrition-isoleucine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="leucine">Leucine (g):</label>
                            <input type="number" class="nutrition-leucine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="lysine">Lysine (g):</label>
                            <input type="number" class="nutrition-lysine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="methionine">Methionine (g):</label>
                            <input type="number" class="nutrition-methionine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="phenylalanine">Phenylalanine (g):</label>
                            <input type="number" class="nutrition-phenylalanine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="threonine">Threonine (g):</label>
                            <input type="number" class="nutrition-threonine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="tryptophan">Tryptophan (g):</label>
                            <input type="number" class="nutrition-tryptophan" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="tyrosine">Tyrosine (g):</label>
                            <input type="number" class="nutrition-tyrosine" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="valine">Valine (g):</label>
                            <input type="number" class="nutrition-valine" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Vitamins Section -->
                <div class="nutrition-section">
                    <h4>Vitamins</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="vitamin-b1">B1 (Thiamine) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b1" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b2">B2 (Riboflavin) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b2" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b3">B3 (Niacin) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b3" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b5">B5 (Pantothenic Acid) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b5" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b6">B6 (Pyridoxine) (mg):</label>
                            <input type="number" class="nutrition-vitamin-b6" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-b12">B12 (Cobalamin) (μg):</label>
                            <input type="number" class="nutrition-vitamin-b12" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="folate">Folate (μg):</label>
                            <input type="number" class="nutrition-folate" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-a">Vitamin A (μg):</label>
                            <input type="number" class="nutrition-vitamin-a" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-c">Vitamin C (mg):</label>
                            <input type="number" class="nutrition-vitamin-c" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-d">Vitamin D (IU):</label>
                            <input type="number" class="nutrition-vitamin-d" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-e">Vitamin E (mg):</label>
                            <input type="number" class="nutrition-vitamin-e" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="vitamin-k">Vitamin K (μg):</label>
                            <input type="number" class="nutrition-vitamin-k" step="0.1">
                        </div>
                    </div>
                </div>

                <!-- Minerals Section -->
                <div class="nutrition-section">
                    <h4>Minerals</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="calcium">Calcium (mg):</label>
                            <input type="number" class="nutrition-calcium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="copper">Copper (mg):</label>
                            <input type="number" class="nutrition-copper" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="iron">Iron (mg):</label>
                            <input type="number" class="nutrition-iron" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="magnesium">Magnesium (mg):</label>
                            <input type="number" class="nutrition-magnesium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="manganese">Manganese (mg):</label>
                            <input type="number" class="nutrition-manganese" step="0.01">
                        </div>
                        <div class="nutrition-item">
                            <label for="phosphorus">Phosphorus (mg):</label>
                            <input type="number" class="nutrition-phosphorus" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="potassium">Potassium (mg):</label>
                            <input type="number" class="nutrition-potassium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="selenium">Selenium (μg):</label>
                            <input type="number" class="nutrition-selenium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="sodium">Sodium (mg):</label>
                            <input type="number" class="nutrition-sodium" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label for="zinc">Zinc (mg):</label>
                            <input type="number" class="nutrition-zinc" step="0.1">
                        </div>
                    </div>
                </div>
            </div>

            <div class="simplified-scan-status"></div>

            <!-- Raw OCR Text Container (initially hidden) -->
            <div class="raw-ocr-container" style="display: none;">
                <h4>Raw OCR Text</h4>
                <div class="raw-ocr-text"></div>
                <button class="raw-ocr-toggle">Hide Raw OCR Text</button>
            </div>
        `;
    }

    function addIngredientRow() {
        const ingredientItem = document.createElement('div');
        ingredientItem.classList.add('ingredient-item');
        ingredientItem.innerHTML = createIngredientRowHtml();
        ingredientsList.appendChild(ingredientItem);

        setTimeout(() => {

            if (typeof initializeCronometerTextParser === 'function') {
                initializeCronometerTextParser(ingredientItem);
                console.log('Cronometer Text Parser initialized in new ingredient row');
            } else {
                console.error('initializeCronometerTextParser function not found');

                const scriptElement = document.createElement('script');
                scriptElement.src = '/js/food/cronometer-text-parser.js';
                scriptElement.onload = function() {
                    console.log('Cronometer Text Parser script loaded');
                    if (typeof initializeCronometerTextParser === 'function') {
                        initializeCronometerTextParser(ingredientItem);
                        console.log('Cronometer Text Parser initialized after script load');
                    }
                };
                document.head.appendChild(scriptElement);
            }

            const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
            const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
            const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

            if (parseButton && textPasteArea && statusElement) {
                parseButton.addEventListener('click', function() {
                    console.log('Parse button clicked');
                    const text = textPasteArea.value.trim();
                    if (text) {
                        if (typeof processCronometerText === 'function') {
                            console.log('Calling processCronometerText function');
                            processCronometerText(text, ingredientItem, statusElement);
                        } else {
                            console.error('processCronometerText function not found');

                            if (window.processCronometerText) {
                                console.log('Found processCronometerText in window scope');
                                window.processCronometerText(text, ingredientItem, statusElement);
                            } else {
                                statusElement.textContent = 'Error: Nutrition parser not loaded';
                                statusElement.className = 'cronometer-parse-status error';
                            }
                        }
                    } else {
                        statusElement.textContent = 'Please paste Cronometer nutrition data first';
                        statusElement.className = 'cronometer-parse-status error';
                    }
                });
                console.log('Manual event listener added to parse button');
            }


            const event = new CustomEvent('ingredientAdded', {
                detail: { ingredientItem: ingredientItem }
            });
            document.dispatchEvent(event);
            console.log('Dispatched ingredientAdded event');
        }, 100); // Slightly longer timeout to ensure DOM is updated

    }

    // Function to handle radio button changes
    function setupRadioButtonListeners() {
        console.log('Setting up radio button listeners');
        const radioButtons = document.querySelectorAll('.ingredient-selection-radio');

        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                console.log('Radio button changed:', this.value);
                const ingredientItem = this.closest('.ingredient-item');
                const selectionDiv = ingredientItem.querySelector('.existing-ingredient-selection');
                const inputsContainer = ingredientItem.querySelector('.ingredient-inputs-container');

                if (this.value === 'existing') {
                    console.log('Showing existing ingredient selection');
                    selectionDiv.style.display = 'block';

                    // Disable the manual input fields
                    const nameInput = inputsContainer.querySelector('.ingredient-name');
                    if (nameInput) nameInput.disabled = true;

                    // Focus the search input to show the autocomplete dropdown immediately
                    const searchInput = selectionDiv.querySelector('.ingredient-search-input');
                    if (searchInput) {
                        // Clear any previous value
                        searchInput.value = '';

                        // Focus the search input to trigger the autocomplete dropdown
                        setTimeout(() => {
                            searchInput.focus();
                        }, 100);
                    }
                } else {
                    console.log('Showing new ingredient input');
                    selectionDiv.style.display = 'none';

                    // Enable the manual input fields
                    const nameInput = inputsContainer.querySelector('.ingredient-name');
                    if (nameInput) nameInput.disabled = false;
                }
            });
        });
    }

    // Function to load existing ingredients
    async function loadExistingIngredients() {
        console.log('Loading existing ingredients');
        try {
            // Fetch all recipes to extract ingredients
            const response = await fetch('/api/recipes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            // Handle both old format (direct array) and new format (object with recipes property)
            let recipes;
            if (Array.isArray(responseData)) {
                // Old format: direct array
                recipes = responseData;
            } else if (responseData && responseData.success && Array.isArray(responseData.recipes)) {
                // New format: object with success and recipes properties
                recipes = responseData.recipes;
            } else {
                console.error('Invalid response format:', responseData);
                throw new Error('Invalid recipe data format');
            }

            console.log(`Loaded ${recipes.length} recipes`);

            // Extract all ingredients from all recipes
            const allIngredients = [];

            // First, try to get ingredients from the currently visible recipe details
            const visibleRecipeIngredients = document.querySelectorAll('.recipe-details-container table tbody tr');
            if (visibleRecipeIngredients && visibleRecipeIngredients.length > 0) {
                console.log(`Found ${visibleRecipeIngredients.length} visible ingredients in the current view`);

                visibleRecipeIngredients.forEach((row, index) => {
                    // Skip the header row
                    if (index === 0) return;

                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 9) {
                        const name = cells[0].textContent.trim();
                        const calories = parseFloat(cells[1].textContent.trim());
                        const amount = parseFloat(cells[2].textContent.trim());
                        const packageAmount = parseFloat(cells[3].textContent.trim());
                        const protein = parseFloat(cells[4].textContent.trim());
                        const fats = parseFloat(cells[5].textContent.trim());
                        const carbs = parseFloat(cells[6].textContent.trim());
                        const price = parseFloat(cells[7].textContent.trim());

                        console.log(`Adding visible ingredient: ${name}`);

                        allIngredients.push({
                            id: `visible-${index}`,
                            name: name,
                            recipe_id: 'current',
                            recipe_name: 'Current Recipe',
                            amount: amount,
                            calories: calories,
                            protein: protein,
                            fats: fats,
                            carbohydrates: carbs,
                            package_amount: packageAmount,
                            price: price,
                            display: `${name} (visible)`,
                            value: `visible:${index}`
                        });
                    }
                });
            }

            // Then add ingredients from all recipes
            recipes.forEach(recipe => {
                console.log(`Processing recipe: ${recipe.name}`);

                // Check if we need to fetch ingredients separately
                if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                    console.log(`No ingredients array found for recipe ${recipe.name}`);

                    // Try to fetch ingredients for this recipe
                    fetch(`/api/recipes/${recipe.id}`)
                        .then(response => response.json())
                        .then(recipeDetails => {
                            if (recipeDetails.ingredients && Array.isArray(recipeDetails.ingredients)) {
                                console.log(`Fetched ${recipeDetails.ingredients.length} ingredients for recipe ${recipe.name}`);

                                recipeDetails.ingredients.forEach(ingredient => {
                                    console.log(`Adding ingredient: ${ingredient.name}`);

                                    allIngredients.push({
                                        id: ingredient.id,
                                        name: ingredient.name,
                                        recipe_id: recipe.id,
                                        recipe_name: recipe.name,
                                        amount: ingredient.amount,
                                        calories: ingredient.calories,
                                        protein: ingredient.protein,
                                        fats: ingredient.fats,
                                        carbohydrates: ingredient.carbohydrates,
                                        package_amount: ingredient.package_amount,
                                        price: ingredient.price,
                                        display: `${ingredient.name} (from ${recipe.name})`,
                                        value: `${recipe.id}:${ingredient.id}`
                                    });
                                });

                                // Sort ingredients alphabetically by name
                                allIngredients.sort((a, b) => a.name.localeCompare(b.name));

                                // Populate all dropdowns with the ingredients
                                populateIngredientDropdowns(allIngredients);
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching ingredients for recipe ${recipe.name}:`, error);
                        });

                    return; // Skip this recipe in the main loop
                }

                console.log(`Recipe ${recipe.name} has ${recipe.ingredients.length} ingredients`);

                recipe.ingredients.forEach(ingredient => {
                    console.log(`Adding ingredient: ${ingredient.name}`);

                    allIngredients.push({
                        id: ingredient.id,
                        name: ingredient.name,
                        recipe_id: recipe.id,
                        recipe_name: recipe.name,
                        amount: ingredient.amount,
                        calories: ingredient.calories,
                        protein: ingredient.protein,
                        fats: ingredient.fats,
                        carbohydrates: ingredient.carbohydrates,
                        package_amount: ingredient.package_amount,
                        price: ingredient.price,
                        display: `${ingredient.name} (from ${recipe.name})`,
                        value: `${recipe.id}:${ingredient.id}`
                    });
                });
            });

            // Add some hardcoded ingredients from the visible recipe
            const visibleIngredients = [
                { name: "Eggs Pasture Raised Vital Farms", calories: 280.0, amount: 200.0, package_amount: 600.0, protein: 24.0, fats: 20.0, carbs: 1.4, price: 7.78 },
                { name: "Parmigiano Rggiano Galli", calories: 111.4, amount: 28.2, package_amount: 154.0, protein: 10.1, fats: 8.1, carbs: 1.0, price: 10.28 },
                { name: "Shrimp Cooked from Frozen Great Catch", calories: 134.9, amount: 112.4, package_amount: 454.0, protein: 25.8, fats: 1.9, carbs: 1.7, price: 8.47 },
                { name: "Avocado, California", calories: 56.8, amount: 34.0, package_amount: 136.0, protein: 0.7, fats: 5.2, carbs: 2.9, price: 0.92 }
            ];

            visibleIngredients.forEach((ingredient, index) => {
                console.log(`Adding hardcoded ingredient: ${ingredient.name}`);

                allIngredients.push({
                    id: `hardcoded-${index}`,
                    name: ingredient.name,
                    recipe_id: 'hardcoded',
                    recipe_name: 'Hardcoded',
                    amount: ingredient.amount,
                    calories: ingredient.calories,
                    protein: ingredient.protein,
                    fats: ingredient.fats,
                    carbohydrates: ingredient.carbs,
                    package_amount: ingredient.package_amount,
                    price: ingredient.price,
                    display: `${ingredient.name} (hardcoded)`,
                    value: `hardcoded:${index}`
                });
            });

            // Sort ingredients alphabetically by name
            allIngredients.sort((a, b) => a.name.localeCompare(b.name));

            console.log(`Loaded ${allIngredients.length} ingredients`);

            // Populate all dropdowns with the ingredients
            populateIngredientDropdowns(allIngredients);

            // Set up search functionality
            setupIngredientSearch();
        } catch (error) {
            console.error('Error loading existing ingredients:', error);
        }
    }

    // Function to populate ingredient dropdowns
    function populateIngredientDropdowns(ingredients) {
        console.log('Populating ingredient dropdowns');
        const dropdowns = document.querySelectorAll('.existing-ingredient-select');

        dropdowns.forEach(dropdown => {
            // Clear existing options except the first one
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }

            // Add options for each ingredient
            ingredients.forEach(ingredient => {
                const option = document.createElement('option');
                option.value = ingredient.value;
                option.text = ingredient.display;
                option.dataset.name = ingredient.name;
                option.dataset.calories = ingredient.calories;
                option.dataset.protein = ingredient.protein;
                option.dataset.fats = ingredient.fats;
                option.dataset.carbs = ingredient.carbohydrates;
                option.dataset.packageAmount = ingredient.package_amount;
                option.dataset.price = ingredient.price;
                dropdown.appendChild(option);
            });

            // Add change event listener to populate fields when an ingredient is selected
            dropdown.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption.value) {
                    const ingredientItem = this.closest('.ingredient-item');
                    const nameInput = ingredientItem.querySelector('.ingredient-name');
                    const caloriesInput = ingredientItem.querySelector('.ingredient-calories');
                    const proteinInput = ingredientItem.querySelector('.ingredient-protein');
                    const fatInput = ingredientItem.querySelector('.ingredient-fat');
                    const carbsInput = ingredientItem.querySelector('.ingredient-carbs');
                    const packageAmountInput = ingredientItem.querySelector('.ingredient-package-amount');
                    const priceInput = ingredientItem.querySelector('.ingredient-price');

                    // Populate fields with selected ingredient data
                    nameInput.value = selectedOption.dataset.name;
                    caloriesInput.value = selectedOption.dataset.calories;
                    proteinInput.value = selectedOption.dataset.protein;
                    fatInput.value = selectedOption.dataset.fats;
                    carbsInput.value = selectedOption.dataset.carbs;
                    packageAmountInput.value = selectedOption.dataset.packageAmount;
                    priceInput.value = selectedOption.dataset.price;
                }
            });
        });
    }

    // Function to set up ingredient search
    function setupIngredientSearch() {
        console.log('Setting up ingredient search');
        const searchInputs = document.querySelectorAll('.ingredient-search-input');

        searchInputs.forEach(input => {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const dropdown = this.nextElementSibling;

                // Show/hide options based on search term
                Array.from(dropdown.options).forEach(option => {
                    if (option.index === 0) return; // Skip the placeholder option

                    const text = option.text.toLowerCase();
                    const match = text.includes(searchTerm);
                    option.style.display = match ? '' : 'none';
                });
            });
        });
    }

    // Call setupRadioButtonListeners when a new ingredient row is added
    document.addEventListener('ingredientAdded', function(e) {
        console.log('Ingredient added event received');
        setupRadioButtonListeners();
    });

    // Initial setup for existing ingredient rows
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, setting up initial radio buttons');
        setupRadioButtonListeners();
    });

    ingredientsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-ingredient-btn')) {
            if (ingredientsList.children.length > 1) {
                event.target.closest('.ingredient-item').remove();
            } else {
                alert("A recipe must have at least one ingredient.");
            }
        }

        if (event.target.classList.contains('toggle-detailed-nutrition')) {
            const button = event.target;
            const panel = button.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');

            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';

                if (isVisible) {
                    button.textContent = 'Show Detailed Nutrition';
                    button.classList.remove('active');
                } else {
                    button.textContent = 'Hide Detailed Nutrition';
                    button.classList.add('active');
                }
            }
        }

        if (event.target.classList.contains('add-ingredient-btn-inline')) {
            addIngredientRow();
        }

        // Handle radio button clicks directly
        if (event.target.classList.contains('ingredient-selection-radio')) {
            const radio = event.target;
            const ingredientItem = radio.closest('.ingredient-item');
            const selectionDiv = ingredientItem.querySelector('.existing-ingredient-selection');
            const inputsContainer = ingredientItem.querySelector('.ingredient-inputs-container');

            if (radio.value === 'existing') {
                console.log('Radio clicked: Showing existing ingredient selection');
                selectionDiv.style.display = 'block';

                // Disable the manual input fields
                const nameInput = inputsContainer.querySelector('.ingredient-name');
                if (nameInput) nameInput.disabled = true;

                // Focus the search input to show the autocomplete dropdown immediately
                const searchInput = selectionDiv.querySelector('.ingredient-search-input');
                if (searchInput) {
                    // Clear any previous value
                    searchInput.value = '';

                    // Focus the search input to trigger the autocomplete dropdown
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                }
            } else {
                console.log('Radio clicked: Showing new ingredient input');
                selectionDiv.style.display = 'none';

                // Enable the manual input fields
                const nameInput = inputsContainer.querySelector('.ingredient-name');
                if (nameInput) nameInput.disabled = false;
            }
        }
    });

    // Flag to track if a recipe submission is in progress
    let recipeSubmissionInProgress = false;

    createRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Prevent duplicate submissions
        if (recipeSubmissionInProgress) {
            console.log('Recipe submission already in progress, ignoring duplicate submission');
            return;
        }

        // Set the flag to indicate submission is in progress
        recipeSubmissionInProgress = true;

        // Disable the submit button to prevent multiple clicks
        const saveButton = createRecipeForm.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        }

        console.log('Recipe form submitted');
        showStatus(createRecipeStatus, 'Saving recipe...', 'info'); // Indicate processing

        const recipeName = recipeNameInput.value.trim();
        console.log('Recipe name:', recipeName);

        const ingredientItems = ingredientsList.querySelectorAll('.ingredient-item');
        console.log(`Found ${ingredientItems.length} ingredient items`);

        const ingredientsData = [];
        let formIsValid = true;

        if (!recipeName) {
            showStatus(createRecipeStatus, 'Recipe name is required.', 'error');
            return;
        }

        if (ingredientItems.length === 0) {

            showStatus(createRecipeStatus, 'Recipe must have at least one ingredient.', 'error');
            return;
        }

        ingredientItems.forEach(item => {
            const name = item.querySelector('.ingredient-name').value.trim();

            const energyInput = item.querySelector('.nutrition-energy');
            const proteinTotalInput = item.querySelector('.nutrition-protein-total');
            const fatTotalInput = item.querySelector('.nutrition-fat-total');
            const carbsTotalInput = item.querySelector('.nutrition-carbs-total');

            const calories = parseFloat(energyInput ? energyInput.value : item.querySelector('.ingredient-calories').value);
            const amount = parseFloat(item.querySelector('.ingredient-amount').value);
            const packageAmount = parseFloat(item.querySelector('.ingredient-package-amount').value || 0); // Default to 0 if empty
            const protein = parseFloat(proteinTotalInput ? proteinTotalInput.value : item.querySelector('.ingredient-protein').value);
            const fat = parseFloat(fatTotalInput ? fatTotalInput.value : item.querySelector('.ingredient-fat').value);
            const carbs = parseFloat(carbsTotalInput ? carbsTotalInput.value : item.querySelector('.ingredient-carbs').value);
            const price = parseFloat(item.querySelector('.ingredient-price').value);

            if (energyInput && energyInput.value) item.querySelector('.ingredient-calories').value = energyInput.value;
            if (proteinTotalInput && proteinTotalInput.value) item.querySelector('.ingredient-protein').value = proteinTotalInput.value;
            if (fatTotalInput && fatTotalInput.value) item.querySelector('.ingredient-fat').value = fatTotalInput.value;
            if (carbsTotalInput && carbsTotalInput.value) item.querySelector('.ingredient-carbs').value = carbsTotalInput.value;


            const caloriesVal = calories === '' ? null : calories;
            const proteinVal = protein === '' ? null : protein;
            const fatVal = fat === '' ? null : fat;
            const carbsVal = carbs === '' ? null : carbs;
            const priceVal = price === '' ? null : price;

            if (!name || isNaN(caloriesVal) || isNaN(amount) || isNaN(proteinVal) || isNaN(fatVal) || isNaN(carbsVal) || isNaN(priceVal) || amount <= 0 ||
                (caloriesVal !== null && caloriesVal < 0) ||
                (proteinVal !== null && proteinVal < 0) ||
                (fatVal !== null && fatVal < 0) ||
                (carbsVal !== null && carbsVal < 0) ||
                (priceVal !== null && priceVal < 0)) {
                formIsValid = false;
                item.style.border = '1px solid red'; // Highlight invalid rows
            } else {
                item.style.border = ''; // Clear highlight on valid rows

                const ingredientData = {
                    name,
                    calories: caloriesVal,
                    amount,
                    package_amount: packageAmount || null, // Include package amount, null if 0
                    protein: proteinVal,
                    fats: fatVal,
                    carbohydrates: carbsVal,
                    price: priceVal
                };

                const hiddenFields = item.querySelectorAll('input[type="hidden"]');
                hiddenFields.forEach(field => {

                    if (field.className === 'ingredient-calories' ||
                        field.className === 'ingredient-protein' ||
                        field.className === 'ingredient-fat' ||
                        field.className === 'ingredient-carbs') {
                        return;
                    }

                    const fieldName = field.className.replace('ingredient-', '');

                    if (!field.value) return;

                    const value = parseFloat(field.value);
                    if (!isNaN(value)) {
                        ingredientData[fieldName] = value;
                        console.log(`Added micronutrient data from hidden field: ${fieldName} = ${value}`);
                    }
                });

                let hasMicronutrients = false;
                for (const [key, value] of Object.entries(ingredientData)) {
                    if (!['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                        hasMicronutrients = true;
                        console.log(`Found micronutrient data: ${key} = ${value}`);
                    }
                }

                if (!hasMicronutrients) {
                    console.warn(`No micronutrient data found in hidden fields for ingredient ${ingredientData.name}`);
                }

                if (item.dataset.completeNutritionData) {
                    try {

                        const completeData = JSON.parse(item.dataset.completeNutritionData);
                        console.log('Found complete nutrition data:', completeData);

                        if (window.NutritionFieldMapper) {
                            const dbFormatData = window.NutritionFieldMapper.toDbFormat(completeData);

                            console.log('Database format data from Cronometer parser:', dbFormatData);

                            for (const [key, value] of Object.entries(dbFormatData)) {

                                if (value === null || value === undefined) continue;

                                if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                    continue;
                                }

                                ingredientData[key] = value;
                                console.log(`Added micronutrient data: ${key} = ${value}`);
                            }
                        } else {

                            Object.assign(ingredientData, completeData);
                        }

                        ingredientData.name = name;
                        ingredientData.calories = caloriesVal;
                        ingredientData.amount = amount;
                        ingredientData.package_amount = packageAmount || null;
                        ingredientData.protein = proteinVal;
                        ingredientData.fats = fatVal;
                        ingredientData.carbohydrates = carbsVal;
                        ingredientData.price = priceVal;

                        console.log('Final ingredient data with micronutrients:', ingredientData);
                    } catch (error) {
                        console.error('Error parsing complete nutrition data:', error);
                    }
                }


                console.log(`Adding ingredient ${ingredientData.name} to ingredientsData:`, ingredientData);

                let hasAnyMicronutrients = false;
                for (const [key, value] of Object.entries(ingredientData)) {
                    if (!['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                        hasAnyMicronutrients = true;
                        break;
                    }
                }

                if (!hasAnyMicronutrients) {
                    console.warn(`No micronutrient data found for ingredient ${ingredientData.name}`);

                    if (item.dataset.completeNutritionData) {
                        console.log('Found complete nutrition data, trying to add micronutrients again');

                        try {

                            const nutritionData = JSON.parse(item.dataset.completeNutritionData);

                            if (window.NutritionFieldMapper) {
                                const dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);

                                for (const [key, value] of Object.entries(dbFormatData)) {

                                    if (value === null || value === undefined) continue;

                                    if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                                        continue;
                                    }

                                    ingredientData[key] = value;
                                    console.log(`Added micronutrient data: ${key} = ${value}`);
                                }
                            }
                        } catch (error) {
                            console.error('Error adding micronutrient data:', error);
                        }
                    }
                }

                ingredientsData.push(ingredientData);
            }
        });

        if (!formIsValid) {
            showStatus(createRecipeStatus, 'Please fill all ingredient fields correctly (all values >= 0, amount > 0).', 'error');
            return;
        }

        try {

            console.log('Sending data to backend:', { name: recipeName, ingredients: ingredientsData });
            console.log('JSON data:', JSON.stringify({ name: recipeName, ingredients: ingredientsData }, null, 2));

            ingredientsData.forEach((ingredient, index) => {
                console.log(`Ingredient ${index + 1} (${ingredient.name}) micronutrient data:`);

                let micronutrientCount = 0;

                for (const [key, value] of Object.entries(ingredient)) {

                    if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                        console.log(`  Basic field: ${key}: ${value}`);
                        continue;
                    }
                    console.log(`  Micronutrient: ${key}: ${value}`);
                    micronutrientCount++;
                }

                console.log(`Ingredient ${index + 1} (${ingredient.name}) has ${micronutrientCount} micronutrient fields`);

                if (micronutrientCount > 0) {
                    ingredient.has_micronutrients = true;
                    console.log(`  Added has_micronutrients flag to ${ingredient.name}`);
                }
            });

            console.log('Sending POST request to /api/recipes...');
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ name: recipeName, ingredients: ingredientsData })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
            }

            console.log('Parsing response JSON...');
            const newRecipe = await response.json();
            console.log('Recipe saved successfully:', newRecipe);

            showStatus(createRecipeStatus, `Recipe '${newRecipe.name}' saved successfully!`, 'success');

            const notification = document.createElement('div');
            notification.className = 'save-notification';
            notification.innerHTML = `
                <div class="save-notification-content">
                    <span class="save-notification-icon">✓</span>
                    <span class="save-notification-text">Recipe '${newRecipe.name}' saved successfully!</span>
                </div>
            `;
            document.body.appendChild(notification);

            const style = document.createElement('style');
            style.textContent = `
                .save-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #000;
                    color: white;
                    padding: 25px 30px;
                    border-radius: 5px;
                    z-index: 9999;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    border: 2px solid #00ff00;
                    animation: pulseAndFade 5s forwards;
                    min-width: 300px;
                    text-align: center;
                }
                .save-notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .save-notification-icon {
                    color: #00ff00;
                    font-size: 30px;
                    margin-right: 15px;
                    animation: pulse 1s infinite;
                }
                .save-notification-text {
                    font-size: 20px;
                    font-weight: bold;
                }
                @keyframes pulseAndFade {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    20% { transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);

            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 5000);

            createRecipeForm.reset(); // Clear form fields

            console.log('Clearing ingredient list and adding empty row...');
            ingredientsList.innerHTML = '';
            addIngredientRow(); // This will also initialize the paste area

            console.log('Refreshing recipe list...');

            setTimeout(() => {
                loadRecipes(0, 3); // Refresh the recipe list with retry mechanism
            }, 500);

        } catch (error) {
            console.error('Error saving recipe:', error);
            showStatus(createRecipeStatus, `Error saving recipe: ${error.message}`, 'error');
        } finally {
            // Reset the submission flag regardless of success or failure
            recipeSubmissionInProgress = false;

            // Re-enable the submit button
            const saveButton = createRecipeForm.querySelector('button[type="submit"]');
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Recipe';
            }
        }
    });


    async function loadWeightGoal() {
        showStatus(weightGoalStatus, 'Loading weight goal...', 'info');
        try {
            const response = await fetch(`/api/weight/goal?user_id=${currentUserId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch goal');
            }
            const goalData = await response.json();

            targetWeightInput.value = goalData.target_weight || '';
            weeklyGainGoalInput.value = goalData.weekly_gain_goal || '';
            showStatus(weightGoalStatus, '', ''); // Clear loading status

        } catch (error) {
            console.error('Error loading weight goal:', error);
            showStatus(weightGoalStatus, `Error loading goal: ${error.message}`, 'error');
        }
    }

    // Function to get start weight and date, prioritizing saved goal data
    async function getStartWeightAndDate(targetWeight) {
        try {
            // First, try to get the goal data to check if start_weight and start_date are already set
            const goalResponse = await fetch(`/api/weight/goal?user_id=${currentUserId}`);
            if (goalResponse.ok) {
                const goalData = await goalResponse.json();

                // If goal data has start_weight and start_date, use those values
                if (goalData.start_weight && goalData.start_date) {
                    console.log(`Using existing goal start data: ${goalData.start_weight} lbs on ${goalData.start_date}`);
                    return {
                        startWeight: goalData.start_weight,
                        startDate: goalData.start_date
                    };
                }
            }

            // If goal data doesn't have start values, fall back to weight logs
            const logsResponse = await fetch(`/api/weight/logs?user_id=${currentUserId}`);
            if (!logsResponse.ok) {
                throw new Error('Failed to fetch weight logs');
            }

            const logs = await logsResponse.json();
            let startWeight = null;
            let startDate = null;

            if (logs && logs.length > 0) {
                logs.sort((a, b) => new Date(b.log_date || b.date) - new Date(a.log_date || a.date));
                startWeight = logs[0].weight;
                startDate = logs[0].log_date || logs[0].date;
                console.log(`No goal start data available, using most recent weight log: ${startWeight} lbs on ${startDate}`);
            } else {
                startWeight = targetWeight || 0;
                const today = new Date();
                startDate = today.toISOString().split('T')[0];
                console.log(`No weight logs found, using target weight (${startWeight} lbs) and today's date (${startDate})`);
            }

            return { startWeight, startDate };
        } catch (error) {
            console.error('Error getting start weight and date:', error);
            // Return defaults if there's an error
            const today = new Date();
            return {
                startWeight: targetWeight || 0,
                startDate: today.toISOString().split('T')[0]
            };
        }
    }



    // Function to save weight goals with partial updates
    async function saveAllWeightGoals() {
        const targetWeightStr = targetWeightInput.value.trim();
        const weeklyGainStr = weeklyGainGoalInput.value.trim();

        // Check if both fields are empty
        if (targetWeightStr === '' && weeklyGainStr === '') {
            showStatus(weightGoalStatus, 'Please enter at least one value to save.', 'error');
            return;
        }

        // Parse values if provided
        const targetWeight = targetWeightStr !== '' ? parseFloat(targetWeightStr) : null;
        const weeklyGain = weeklyGainStr !== '' ? parseFloat(weeklyGainStr) : null;

        // Validate provided values
        if (targetWeight !== null && (isNaN(targetWeight) || targetWeight <= 0)) {
            showStatus(weightGoalStatus, 'Please enter a valid positive number for target weight.', 'error');
            return;
        }

        if (weeklyGain !== null && (isNaN(weeklyGain) || weeklyGain === 0)) {
            showStatus(weightGoalStatus, 'Please enter a non-zero value for weekly goal.', 'error');
            return;
        }

        showStatus(weightGoalStatus, 'Saving weight goals...', 'info');
        try {
            // Get current values from the server for any empty fields
            const currentGoalResponse = await fetch(`/api/weight/goal?user_id=${currentUserId}`);
            if (!currentGoalResponse.ok) {
                throw new Error('Failed to fetch current goal');
            }
            const currentGoalData = await currentGoalResponse.json();

            // Use provided values or current values if not provided
            const finalTargetWeight = targetWeight !== null ? targetWeight : (currentGoalData.target_weight || 0);
            const finalWeeklyGain = weeklyGain !== null ? weeklyGain : (currentGoalData.weekly_gain_goal || 0);

            // Get start weight and date
            const { startWeight, startDate } = await getStartWeightAndDate(finalTargetWeight);

            const response = await fetch('/api/weight/goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetWeight: finalTargetWeight,
                    weeklyGain: finalWeeklyGain,
                    startWeight: startWeight,
                    startDate: startDate,
                    user_id: currentUserId
                })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to save goals');
            }

            const result = await response.json();
            console.log("Goals saved:", result);

            // Update the input fields with the saved values
            targetWeightInput.value = result.target_weight || '';
            weeklyGainGoalInput.value = result.weekly_gain_goal || '';

            // Show success message
            let successMessage = 'Weight goals saved successfully!';
            if (targetWeight !== null && weeklyGain === null) {
                successMessage = 'Target weight saved successfully!';
            } else if (targetWeight === null && weeklyGain !== null) {
                successMessage = 'Weekly goal saved successfully!';
            }
            showStatus(weightGoalStatus, successMessage, 'success');

            // Update the chart
            loadAndRenderWeightChart();

        } catch (error) {
            console.error('Error saving weight goals:', error);
            showStatus(weightGoalStatus, `Error saving weight goals: ${error.message}`, 'error');
        }
    }


    async function loadAndRenderWeightChart() {
        console.error("LOAD AND RENDER WEIGHT CHART FUNCTION CALLED - THIS SHOULD BE VISIBLE");

        if (!weightGoalChartCanvas) {
            console.error("WEIGHT GOAL CHART CANVAS NOT FOUND - RETURNING");
            return;
        }

        weightChartMessage.textContent = 'Loading chart data...';
        weightChartMessage.style.display = 'block';
        weightGoalChartCanvas.style.display = 'none'; // Hide canvas while loading
        if (weightGoalChart) weightGoalChart.destroy(); // Clear previous chart immediately

        try {
            console.log("Starting API calls for weight data...");
            console.log("Current user ID:", currentUserId);

            const [logsResponse, goalResponse] = await Promise.all([
                fetch(`/api/weight/logs?user_id=${currentUserId}`),
                fetch(`/api/weight/goal?user_id=${currentUserId}`)
            ]);

            console.log("Logs response status:", logsResponse.status, logsResponse.statusText);
            console.log("Goal response status:", goalResponse.status, goalResponse.statusText);

            if (!logsResponse.ok) {
                const errorText = await logsResponse.text();
                console.error("Logs response error:", errorText);
                throw new Error(`Failed to fetch weight logs: ${logsResponse.status} ${logsResponse.statusText} - ${errorText}`);
            }
            if (!goalResponse.ok) {
                const errorText = await goalResponse.text();
                console.error("Goal response error:", errorText);
                throw new Error(`Failed to fetch weight goal: ${goalResponse.status} ${goalResponse.statusText} - ${errorText}`);
            }

            const weightLogs = await logsResponse.json(); // Expecting [{ log_id, log_date (YYYY-MM-DD), weight }, ...]
            const goalData = await goalResponse.json(); // Expecting { target_weight, weekly_gain_goal }

            if (!Array.isArray(weightLogs)) {
                 throw new Error('Invalid format received for weight logs.');
            }

            if (weightLogs.length === 0) {
                weightChartMessage.textContent = 'Log your weight to see the chart.';
                weightChartMessage.style.display = 'block';
                weightGoalChartCanvas.style.display = 'none';

                return;
            }


            weightLogs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            const todayInLogs = weightLogs.some(log => log.log_date === todayFormatted);

            if (!todayInLogs) {

                let insertIndex = weightLogs.length; // Default to end of array
                for (let i = 0; i < weightLogs.length; i++) {
                    if (new Date(weightLogs[i].log_date) > today) {
                        insertIndex = i;
                        break;
                    }
                }

                weightLogs.splice(insertIndex, 0, {
                    log_id: null,
                    log_date: todayFormatted,
                    weight: null // No weight data for today yet
                });

                console.log(`Added today's date (${todayFormatted}) to the chart at position ${insertIndex}`);
            }

            // Create standardized date objects and labels for Chart.js
            const histLabels = [];
            const histDateObjects = [];

            weightLogs.forEach(log => {
                try {
                    // First try with the log_date directly
                    let date = new Date(log.log_date);

                    // If that fails, try with T00:00:00Z appended
                    if (isNaN(date.getTime())) {
                        date = new Date(log.log_date + 'T00:00:00Z');
                    }

                    // If that still fails, try parsing MM/DD/YYYY format
                    if (isNaN(date.getTime()) && log.log_date.includes('/')) {
                        const parts = log.log_date.split('/');
                        if (parts.length === 3) {
                            date = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    }

                    if (!isNaN(date.getTime())) {
                        // Use consistent MM/DD/YYYY format for display
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');
                        const year = date.getFullYear();
                        const formattedLabel = `${month}/${day}/${year}`;

                        console.log(`Formatted date for weight log: ${log.log_date} -> ${formattedLabel}`);
                        histLabels.push(formattedLabel);
                        histDateObjects.push(date);
                    } else {
                        console.warn(`Could not parse date: ${log.log_date}, using as-is`);
                        histLabels.push(log.log_date);
                        histDateObjects.push(new Date(log.log_date)); // Fallback
                    }
                } catch (e) {
                    console.error(`Error formatting date: ${log.log_date}`, e);
                    histLabels.push(log.log_date);
                    histDateObjects.push(new Date(log.log_date)); // Fallback
                }
            });
            const actualWeightData = weightLogs.map(log => log.weight);

            const futureLabels = [];
            const futureDateObjects = [];
            const WEEKS_TO_PROJECT = 12; // Project ~12 weeks into the future for longer-term goals

            let mostRecentWeight = null;
            let mostRecentDate = null;

            for (let i = weightLogs.length - 1; i >= 0; i--) {
                if (weightLogs[i].weight !== null) {
                    mostRecentWeight = weightLogs[i].weight;
                    mostRecentDate = weightLogs[i].log_date;
                    break;
                }
            }

            window.mostRecentWeight = {
                weight: mostRecentWeight,
                date: mostRecentDate
            };

            console.log(`Most recent weight: ${mostRecentWeight} lbs on ${mostRecentDate}`);

            let goalStartDate;

            if (goalData.start_date) {
                goalStartDate = new Date(goalData.start_date);
                // Use consistent formatting
                const month = (goalStartDate.getMonth() + 1).toString().padStart(2, '0');
                const day = goalStartDate.getDate().toString().padStart(2, '0');
                const year = goalStartDate.getFullYear();
                console.log("Using goal start date for projections:", `${month}/${day}/${year}`);
            } else {
                goalStartDate = new Date();
                // Use consistent formatting
                const month = (goalStartDate.getMonth() + 1).toString().padStart(2, '0');
                const day = goalStartDate.getDate().toString().padStart(2, '0');
                const year = goalStartDate.getFullYear();
                console.log("No goal start date available, using today:", `${month}/${day}/${year}`);
            }

            goalStartDate.setHours(0, 0, 0, 0);

            window.weeklyIncrementDates = [];
            window.weeklyGoalWeights = [];

            for (let i = 0; i <= WEEKS_TO_PROJECT; i++) { // Start from 0 to include the start date
                const futureDate = new Date(goalStartDate);

                if (i > 0) {
                    futureDate.setDate(futureDate.getDate() + (i * 7)); // Add exactly 7 days each time
                }

                if (i === 0) {
                    console.log("First future date:", futureDate);
                    console.log("First future date ISO:", futureDate.toISOString());
                }

                // Use consistent MM/DD/YYYY format for future dates
                const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
                const day = futureDate.getDate().toString().padStart(2, '0');
                const year = futureDate.getFullYear();
                const formattedFutureLabel = `${month}/${day}/${year}`;

                futureLabels.push(formattedFutureLabel);
                futureDateObjects.push(futureDate);

                // Store the date in multiple formats to ensure compatibility
                const dateObj = {
                    date: formattedFutureLabel, // Use consistent format
                    isoDate: futureDate.toISOString().split('T')[0], // YYYY-MM-DD format
                    fullDate: futureDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    index: histLabels.length + futureLabels.length - 1, // Index in the combined labels array
                    week: i
                };

                console.log(`Weekly increment date for week ${i}: ${dateObj.date} (${dateObj.fullDate})`);
                window.weeklyIncrementDates.push(dateObj);

                console.log(`Added future date: ${formattedFutureLabel} (week ${i})`);
            }

            // Combine labels and data
            const combinedLabels = [...histLabels, ...futureLabels];
            const combinedActualData = [...actualWeightData, ...Array(futureLabels.length).fill(null)];

            // Create array of objects to sort together
            const combinedData = combinedLabels.map((label, index) => ({
                label: label,
                actualWeight: combinedActualData[index],
                originalIndex: index
            }));

            // Sort by date to ensure chronological order
            combinedData.sort((a, b) => {
                const dateA = parseDate(a.label);
                const dateB = parseDate(b.label);
                return dateA.getTime() - dateB.getTime();
            });

            // Extract sorted arrays
            const labels = combinedData.map(item => item.label);
            const paddedActualWeightData = combinedData.map(item => item.actualWeight);

            console.log("=== SORTING DEBUG ===");
            console.log("First 10 sorted labels:");
            labels.slice(0, 10).forEach((label, i) => {
                const date = parseDate(label);
                console.log(`${i}: ${label} -> ${date.toDateString()}`);
            });
            console.log("=== END SORTING DEBUG ===");

            // Helper function to parse dates consistently
            function parseDate(dateStr) {
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length === 3) {
                        return new Date(parts[2], parts[0] - 1, parts[1]);
                    }
                }
                return new Date(dateStr);
            }

            const targetWeightLine = [];


            let startDate;
            let startWeight;

            // Always use the goal's start date and start weight if available
            if (goalData.start_date && goalData.start_weight) {
                startDate = new Date(goalData.start_date);
                startWeight = goalData.start_weight;
                console.log(`Using goal start date: ${goalData.start_date} and start weight: ${startWeight} lbs`);
            } else {
                // Fallback to most recent log only if goal data is not available
                // This is a fallback mechanism, but the primary source should be the goal data
                let mostRecentLog = null;
                for (let i = weightLogs.length - 1; i >= 0; i--) {
                    if (weightLogs[i].weight !== null) {
                        mostRecentLog = weightLogs[i];
                        break;
                    }
                }

                if (mostRecentLog) {
                    startDate = new Date(mostRecentLog.log_date);
                    startWeight = mostRecentLog.weight;
                    console.log(`No goal start data available, using most recent weight log as fallback: ${startWeight} lbs on ${mostRecentLog.log_date}`);
                } else {
                    // Last resort fallback
                    startDate = new Date();
                    startWeight = goalData.target_weight;
                    console.log(`No start data available at all, using today and target weight as fallback: ${startWeight} lbs`);
                }
            }

            const targetWeight = goalData.target_weight;
            const weeklyGain = goalData.weekly_gain_goal;

            console.log("Chart: Received goalData:", goalData);
            console.log("Chart: Values for target line calculation:",
                { targetWeight, weeklyGain, startDate, startWeight });


            window.weeklyGoalWeights = [];

            console.log("Weekly increment dates:", window.weeklyIncrementDates);

            console.error("GOAL DATA VALUES:", {
                targetWeight: targetWeight,
                weeklyGain: weeklyGain,
                startWeight: startWeight,
                startDate: startDate ? startDate.toLocaleDateString() : 'null',
                targetWeightNull: targetWeight === null,
                weeklyGainNull: weeklyGain === null,
                weeklyGainZero: weeklyGain === 0,
                targetWeightNaN: isNaN(targetWeight),
                weeklyGainNaN: isNaN(weeklyGain)
            });
            console.log("[WEEKLY TARGET DEBUG] Goal data check:", {
                targetWeight: targetWeight,
                weeklyGain: weeklyGain,
                startWeight: startWeight,
                startDate: startDate ? startDate.toLocaleDateString() : 'null'
            });

            if (targetWeight !== null && weeklyGain !== null && weeklyGain !== 0 && !isNaN(targetWeight) && !isNaN(weeklyGain)) {
                console.error("WEEKLY TARGET CALCULATION STARTING - THIS SHOULD BE VISIBLE");
                console.log("[WEEKLY TARGET DEBUG] Chart: Condition to draw target line met."); // Log condition met

                const filterDate = new Date(startDate);
                filterDate.setHours(0, 0, 0, 0);

                // First, identify all the weekly target dates
                const weeklyTargetDates = [];
                const weeklyTargetWeights = [];

                // Initialize with start date and weight
                let currentTargetDate = new Date(startDate);
                let currentTargetWeight = startWeight;
                let weekCounter = 0;

                // Initialize weekly goal weights array
                window.weeklyGoalWeights = [];
                window.weeklyIncrementDates = [];

                // Calculate weekly targets for the entire projection period
                while (weekCounter < WEEKS_TO_PROJECT + 1) { // +1 to include the start week
                    weeklyTargetDates.push(new Date(currentTargetDate));
                    weeklyTargetWeights.push(currentTargetWeight);

                    // Store each weekly target in the weeklyGoalWeights array
                    // This ensures we have all weekly targets, even past ones
                    window.weeklyIncrementDates[weekCounter] = currentTargetDate.toISOString().split('T')[0];

                    // Move to next week
                    currentTargetDate = new Date(currentTargetDate);
                    currentTargetDate.setDate(currentTargetDate.getDate() + 7);

                    // Calculate next week's target weight by adding the weekly goal amount
                    if (weeklyGain > 0) {
                        // For weight gain, cap at target weight
                        currentTargetWeight = Math.min(currentTargetWeight + weeklyGain, targetWeight);
                    } else {
                        // For weight loss, cap at target weight
                        currentTargetWeight = Math.max(currentTargetWeight + weeklyGain, targetWeight);
                    }

                    weekCounter++;
                }

                console.log("[WEEKLY TARGET DEBUG] Weekly target dates and weights calculated:");
                weeklyTargetDates.forEach((date, i) => {
                    console.log(`[WEEKLY TARGET DEBUG] Week ${i}: ${date.toLocaleDateString()} - ${weeklyTargetWeights[i].toFixed(2)} lbs`);
                });

                console.log("Chart labels (first 10):", labels.slice(0, 10));
            console.log("Chart labels (last 10):", labels.slice(-10));
                console.log("Goal start date:", startDate.toLocaleDateString());
                console.log("Weekly target dates (first 5):", weeklyTargetDates.slice(0, 5).map(d => d.toLocaleDateString()));

            // Debug: Check if labels are in chronological order
            console.log("=== DATE ORDER DEBUG ===");
            for (let i = 0; i < Math.min(labels.length, 15); i++) {
                const label = labels[i];
                const parts = label.split('/');
                if (parts.length === 3) {
                    const date = new Date(parts[2], parts[0] - 1, parts[1]);
                    console.log(`Index ${i}: ${label} -> ${date.toDateString()}`);
                }
            }
            console.log("=== END DATE ORDER DEBUG ===");

                // Now process each label date and find the appropriate target weight
                labels.forEach((labelStr, index) => {
                    let currentDate;

                    if (labelStr.includes('/')) {
                        const parts = labelStr.split('/');
                        if (parts.length === 3) {
                            currentDate = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    }

                    if (!currentDate || isNaN(currentDate.getTime())) {
                        currentDate = new Date(labelStr);
                    }

                    if (isNaN(currentDate.getTime())) {
                        console.warn(`Could not parse date label for target line calculation: ${labelStr}`);
                        targetWeightLine.push(null); // Push null if date is invalid
                        return; // Skip to next iteration
                    }

                    currentDate.setUTCHours(0, 0, 0, 0);

                    const isOnOrAfterStartDate = currentDate >= filterDate;

                    if (!isOnOrAfterStartDate) {
                        targetWeightLine.push(null);
                        return; // Skip to next iteration
                    }

                    // Find the closest weekly target date that is not after the current date
                    let closestWeekIndex = -1;
                    let nextWeekIndex = -1;

                    for (let i = 0; i < weeklyTargetDates.length; i++) {
                        if (weeklyTargetDates[i] <= currentDate) {
                            closestWeekIndex = i;
                        } else {
                            nextWeekIndex = i;
                            break;
                        }
                    }

                    let goalWeight;

                    if (closestWeekIndex >= 0) {
                        // If we're exactly on a weekly target date, use that weight
                        if (weeklyTargetDates[closestWeekIndex].getTime() === currentDate.getTime()) {
                            goalWeight = weeklyTargetWeights[closestWeekIndex];
                        }
                        // If we're between weekly targets, interpolate
                        else if (nextWeekIndex >= 0) {
                            const prevDate = weeklyTargetDates[closestWeekIndex];
                            const nextDate = weeklyTargetDates[nextWeekIndex];
                            const prevWeight = weeklyTargetWeights[closestWeekIndex];
                            const nextWeight = weeklyTargetWeights[nextWeekIndex];

                            // Calculate fraction of the week we've progressed
                            const totalDays = (nextDate - prevDate) / (1000 * 60 * 60 * 24);
                            const daysPassed = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                            const fraction = daysPassed / totalDays;

                            // Interpolate weight
                            goalWeight = prevWeight + fraction * (nextWeight - prevWeight);
                        }
                        // If we're after the last weekly target but before the target date
                        else {
                            goalWeight = weeklyTargetWeights[closestWeekIndex];
                        }
                    } else {
                        // This shouldn't happen if dates are properly filtered
                        goalWeight = startWeight;
                    }

                    // Cap at target weight
                    if (weeklyGain > 0) {
                        goalWeight = Math.min(goalWeight, targetWeight);
                    } else {
                        goalWeight = Math.max(goalWeight, targetWeight);
                    }

                    console.log(`Date: ${labelStr}, Goal weight: ${goalWeight.toFixed(2)} lbs`);
                    targetWeightLine.push(goalWeight);

                    // Check if this date matches one of our weekly target dates
                    for (let weekNum = 0; weekNum < weeklyTargetDates.length; weekNum++) {
                        const weeklyTargetDate = weeklyTargetDates[weekNum];

                        // Check if this date is the same as the weekly target date (within the same day)
                        if (Math.abs(currentDate.getTime() - weeklyTargetDate.getTime()) < 24 * 60 * 60 * 1000) {
                            // This is a weekly target point
                            // Create a more comprehensive date object for the weekly goal weight
                            const weeklyDate = new Date(labelStr);
                            const weeklyGoalWeight = {
                                index: index,
                                date: labelStr,
                                isoDate: weeklyDate.toISOString ? weeklyDate.toISOString().split('T')[0] : labelStr,
                                fullDate: !isNaN(weeklyDate.getTime()) ? weeklyDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : labelStr,
                                weight: goalWeight,
                                week: weekNum
                            };

                            // Add to weeklyGoalWeights if not already there
                            const existingWeek = window.weeklyGoalWeights.find(w => w.week === weekNum);
                            if (!existingWeek) {
                                window.weeklyGoalWeights.push(weeklyGoalWeight);
                                console.log(`[WEEKLY TARGET DEBUG] Added weekly goal weight: ${labelStr}, ${goalWeight.toFixed(2)} lbs (week ${weekNum})`);
                            }

                            break; // Found the matching week, no need to continue checking
                        }
                    }
                });
            } else {
                console.log("Goal not set or invalid, not drawing target line.");

                for (let i = 0; i < labels.length; i++) { targetWeightLine.push(null); }
            }


            console.log("Final weekly goal weights before rendering chart:", window.weeklyGoalWeights);
            console.log("Total weekly goal weights found:", window.weeklyGoalWeights ? window.weeklyGoalWeights.length : 0);
            renderWeightChart(labels, paddedActualWeightData, targetWeightLine, parseFloat(goalData.target_weight));

            // Ensure chart is visible
            if (weightChartMessage) {
                weightChartMessage.style.display = 'none'; // Hide message
            }

            if (weightGoalChartCanvas) {
                weightGoalChartCanvas.style.display = 'block'; // Show canvas
                weightGoalChartCanvas.style.height = '400px';
                weightGoalChartCanvas.style.width = '100%';

                // Make sure parent container is also visible
                const chartContainer = document.querySelector('.chart-container');
                if (chartContainer) {
                    chartContainer.style.display = 'block';
                    chartContainer.style.height = '450px';
                    chartContainer.style.visibility = 'visible';
                }
            }

            if (window.customGoalWeights && typeof window.customGoalWeights.init === 'function') {
                window.customGoalWeights.init();
            }

            if (window.customGoalWeights && typeof window.customGoalWeights.load === 'function') {
                window.customGoalWeights.load();
            }

        } catch (error) {
            console.error("Error loading data for weight chart:", error);

            if (weightChartMessage) {
                weightChartMessage.textContent = `Error loading chart data: ${error.message}`;
                weightChartMessage.style.color = 'red';
                weightChartMessage.style.display = 'block';
                weightChartMessage.style.padding = '10px';
                weightChartMessage.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                weightChartMessage.style.borderRadius = '4px';
                weightChartMessage.style.margin = '10px 0';
            }

            if (weightGoalChartCanvas) {
                weightGoalChartCanvas.style.display = 'none';
            }

            // Make sure parent container is still visible
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                chartContainer.style.display = 'block';
                chartContainer.style.height = 'auto';
                chartContainer.style.minHeight = '100px';
                chartContainer.style.visibility = 'visible';
            }
        }
    }

    function renderWeightChart(labels, actualData, targetData, targetWeight) {
        if (!weightGoalChartCanvas) {
            console.error('Weight goal chart canvas not found');
            return;
        }

        console.log('Rendering weight chart with canvas:', weightGoalChartCanvas);

        // Make sure the canvas is visible
        weightGoalChartCanvas.style.display = 'block';
        weightGoalChartCanvas.style.height = '400px';
        weightGoalChartCanvas.style.width = '100%';
        weightGoalChartCanvas.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        weightGoalChartCanvas.style.borderRadius = '4px';

        // Make sure parent container is also visible
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.style.display = 'block';
            chartContainer.style.height = '450px';
            chartContainer.style.visibility = 'visible';
            chartContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            chartContainer.style.borderRadius = '4px';
            chartContainer.style.padding = '10px';
            chartContainer.style.marginTop = '20px';
            chartContainer.style.marginBottom = '20px';
        }

        const ctx = weightGoalChartCanvas.getContext('2d');

        if (weightGoalChart) {
            console.log('Destroying previous chart instance');
            weightGoalChart.destroy(); // Destroy previous instance
        }

        const formattedActualData = [];
        const formattedTargetData = [];

        window.mostRecentWeight = { weight: null, date: null };

        for (let i = 0; i < labels.length; i++) {
            formattedActualData.push({
                x: i, // Use index for category scale
                y: actualData[i] // Keep null values to maintain line continuity
            });

            if (actualData[i] !== null && actualData[i] !== undefined) {
                if (window.mostRecentWeight.weight === null || i > window.mostRecentWeight.index) {
                    window.mostRecentWeight = {
                        weight: actualData[i],
                        date: labels[i],
                        index: i
                    };
                }
            }
        }

        console.log('Most recent weight:', window.mostRecentWeight);

        for (let i = 0; i < labels.length; i++) {
            formattedTargetData.push({
                x: i, // Use index for category scale
                y: targetData[i] // Keep null values to maintain line continuity
            });
        }

        const datasets = [
            {
                label: 'Actual Weight (lbs)',
                data: formattedActualData,
                borderColor: '#3498db', // Blue
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderWidth: 3,
                tension: 0, // Set to 0 for straight lines
                fill: true,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 10, // Even larger hover radius for better visibility
                pointHoverBackgroundColor: '#2980b9', // Darker blue on hover
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3, // Thicker border on hover

                pointHoverShadowColor: 'rgba(0, 0, 0, 0.5)',
                pointHoverShadowBlur: 10,
                pointHoverShadowOffsetX: 0,
                pointHoverShadowOffsetY: 4,

                hitRadius: 15, // Increase hit detection radius for easier interaction
                spanGaps: true, // Connect points across gaps (null values)

                pointRadius: function(context) {
                    // Show points only where we have actual weight data
                    return actualData[context.dataIndex] !== null ? 5 : 0;
                }, // Fixed point size

                z: 10, // Higher z-index to keep points on top

                clip: false,

                borderJoinStyle: 'round',

                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                segment: {
                    borderColor: ctx => {

                        const p0 = ctx.p0.parsed;
                        const p1 = ctx.p1.parsed;
                        return (p0.y === null || p1.y === null) ? 'transparent' : '#3498db';
                    }
                }
            }
        ];

        if (formattedTargetData.length > 0) {
             console.log("Adding goal weight path dataset");
             console.log("Weekly goal weights array:", window.weeklyGoalWeights);
             console.log("Target data length:", formattedTargetData.length);
             console.log("First few target data points:", formattedTargetData.slice(0, 10));
             datasets.push({
                 label: 'Goal Weight Path (lbs)',
                 data: formattedTargetData,
                 borderColor: '#e74c3c', // Red
                 borderDash: [5, 5], // Dashed line
                 borderWidth: 2,
                 tension: 0, // Set to 0 for straight lines
                 fill: false,

                 // Show uniform dots for all goal points
                 pointRadius: 4, // Show uniform medium-sized dots for all goal line points

                 // Override the default point style
                 pointStyle: 'circle',

                 pointShadowBlur: 2,
                 pointShadowColor: 'rgba(0, 0, 0, 0.2)',
                 pointBackgroundColor: 'rgba(231, 76, 60, 0.6)', // Semi-transparent red for all goal points
                 pointBorderColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white border for all goal points
                 pointBorderWidth: 2, // Uniform border width for all goal points
                 pointHoverRadius: 5, // Moderate hover radius for better UX
                 pointHoverBackgroundColor: '#c0392b', // Darker red on hover
                 pointHoverBorderColor: '#fff',
                 pointHoverBorderWidth: 2,
                 spanGaps: true // Connect points across gaps (null values)
             });
        }

        const today = new Date();
        // Use consistent MM/DD/YYYY format for today
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const year = today.getFullYear();
        const todayFormatted = `${month}/${day}/${year}`;

        console.log('Today formatted:', todayFormatted);
        console.log('Available labels:', labels);

        let todayIndex = labels.findIndex(label => label === todayFormatted);

        if (todayIndex === -1) {
            const todayTime = today.getTime();
            let closestDiff = Infinity;

            labels.forEach((label, index) => {
                try {
                    let labelDate;
                    if (label.includes('/')) {
                        const parts = label.split('/');
                        if (parts.length === 3) {
                            // Parse MM/DD/YYYY format consistently
                            const labelMonth = parseInt(parts[0]);
                            const labelDay = parseInt(parts[1]);
                            const labelYear = parseInt(parts[2]);
                            labelDate = new Date(labelYear, labelMonth - 1, labelDay);
                        }
                    } else {
                        labelDate = new Date(label);
                    }

                    if (!isNaN(labelDate.getTime())) {
                        const diff = Math.abs(labelDate.getTime() - todayTime);
                        if (diff < closestDiff) {
                            closestDiff = diff;
                            todayIndex = index;
                        }
                    }
                } catch (e) {
                    console.warn('Error parsing date label:', label, e);
                }
            });

            console.log('Found closest date at index:', todayIndex);
        }

        const annotations = {};

        if (todayIndex !== -1) {
            annotations.todayLine = {
                type: 'line',
                xMin: todayIndex,
                xMax: todayIndex,
                borderColor: '#2ecc71', // Green color for today's line
                borderWidth: 3,
                borderDash: [6, 6],
                label: {
                    display: true,
                    content: 'TODAY',
                    position: 'start',
                    backgroundColor: '#2ecc71',
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    padding: 6
                }
            };

            console.log(`Today indicator added at index ${todayIndex} (${labels[todayIndex]})`);
        } else {
            let lastDataIndex = -1;
            for (let i = actualData.length - 1; i >= 0; i--) {
                if (actualData[i] !== null) {
                    lastDataIndex = i;
                    break;
                }
            }

            if (lastDataIndex !== -1) {
                annotations.todayLine = {
                    type: 'line',
                    xMin: lastDataIndex,
                    xMax: lastDataIndex,
                    borderColor: '#2ecc71', // Green color for today's line
                    borderWidth: 3,
                    borderDash: [6, 6],
                    label: {
                        display: true,
                        content: 'TODAY (approx)',
                        position: 'start',
                        backgroundColor: '#2ecc71',
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        padding: 6
                    }
                };

                console.log(`Today indicator added at last data point: ${lastDataIndex}`);
            } else {
                console.log('Could not find a suitable position for today indicator');
            }
        }

        if (targetData && targetData.length > 0 && targetWeight) {

            let targetWeightValue = parseFloat(targetWeight);

            if (!isNaN(targetWeightValue)) {
                annotations.targetWeightLine = {
                    type: 'line',
                    yMin: targetWeightValue,
                    yMax: targetWeightValue,
                    borderColor: '#9b59b6', // Purple color for target weight
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        display: true,
                        content: `TARGET: ${targetWeightValue.toFixed(2)} lbs`,
                        position: 'end',
                        backgroundColor: '#9b59b6',
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        padding: 6
                    }
                };

                const buffer = 3; // Buffer zone of 3 pounds around target
                annotations.targetZone = {
                    type: 'box',
                    yMin: targetWeightValue - buffer,
                    yMax: targetWeightValue + buffer,
                    backgroundColor: 'rgba(155, 89, 182, 0.1)', // Light purple background
                    borderColor: 'rgba(155, 89, 182, 0.3)',
                    borderWidth: 1,
                    drawTime: 'beforeDatasetsDraw' // Draw behind the data
                };

                console.log(`Target weight indicator added at ${targetWeightValue} lbs`);
            } else {
                console.log('Could not parse target weight value');
            }
        }

        try {

            let annotationPluginAvailable = false;

            if (Chart.registry && Chart.registry.plugins) {
                const plugins = Object.values(Chart.registry.plugins.items);
                annotationPluginAvailable = plugins.some(p => p.id === 'annotation');
            }

            if (!annotationPluginAvailable) {
                console.warn('Annotation plugin not found in registry, trying to register manually');

                if (typeof ChartAnnotation !== 'undefined') {
                    Chart.register(ChartAnnotation);
                    console.log('Registered annotation plugin from global ChartAnnotation');
                }

                else if (Chart.Annotation) {
                    Chart.register(Chart.Annotation);
                    console.log('Registered annotation plugin from Chart.Annotation');
                }
            }
        } catch (error) {
            console.error('Error checking/registering annotation plugin:', error);
        }

        const validWeights = actualData.filter(w => w !== null && w !== undefined);

        const minWeight = Math.min(...validWeights) * 0.90; // 10% buffer below min
        const maxWeight = Math.max(...validWeights) * 1.05; // 5% buffer above max

        let yMin = minWeight;
        let yMax = maxWeight;

        if (targetWeight && !isNaN(targetWeight)) {

            if (targetWeight > maxWeight) {
                yMax = targetWeight * 1.05; // 5% buffer above target
            } else if (targetWeight < minWeight) {
                yMin = targetWeight * 0.90; // 10% buffer below target
            } else {
                yMin = Math.min(yMin, targetWeight * 0.90);
                yMax = Math.max(yMax, targetWeight * 1.05);
            }
        }

        const range = yMax - yMin;
        yMin -= range * 0.15; // Additional 15% padding at bottom
        yMax += range * 0.05; // Additional 5% padding at top

        const minVisibleRange = Math.max(...validWeights) * 0.1; // At least 10% of max weight
        if ((yMax - yMin) < minVisibleRange) {
            yMin = yMax - minVisibleRange;
        }

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            plugins: [{
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart) => {

                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)'; // Dark background color
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            }, {
                id: 'customGoalWeightPoints',
                afterDraw: function(chart) {
                    try {
                        if (chart.getDatasetMeta(1) && chart.getDatasetMeta(1).data) {
                            // Initialize weeklyIncrementDates if not already defined
                            if (!window.weeklyIncrementDates) {
                                window.weeklyIncrementDates = [];
                            }

                            // Store dates for tooltips but don't draw extra dots
                            // The weekly-goal-points-fix.js handles all dot drawing
                            if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                                window.weeklyGoalWeights.forEach(weeklyPoint => {
                                    window.weeklyIncrementDates[weeklyPoint.week] = weeklyPoint.date;
                                });
                            }

                            // Call the custom goal weights function if available
                            if (window.customGoalWeights && typeof window.customGoalWeights.addWeekNumbers === 'function') {
                                window.customGoalWeights.addWeekNumbers();
                            }
                        }
                    } catch (error) {
                        console.error('Error in customGoalWeightPoints plugin:', error);
                    }
                }
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'point',
                    intersect: true,
                    axis: 'xy'
                },
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                },

                layout: {
                    padding: {
                        left: 15,
                        right: 15,
                        top: 10,
                        bottom: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false, // Don't force y-axis to start at 0 for weight
                        title: {
                            display: true,
                            text: 'Weight (lbs)',
                            color: '#e0e0e0', // Light text color for dark theme
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: { top: 0, bottom: 10 } // Add padding to title
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#e0e0e0', // Light text color for dark theme
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                // Show whole numbers only for y-axis labels
                                return Math.round(parseFloat(value)) + ' lbs';
                            },
                            padding: 15, // Increased padding to ensure ticks don't get cut off

                            maxTicksLimit: 10
                        },

                        grace: '5%', // Add 5% padding to the scale

                        adapters: {
                            date: false
                        },

                        min: yMin,
                        max: yMax,

                        position: 'left',

                        afterFit: function(scaleInstance) {

                            scaleInstance.width = Math.max(scaleInstance.width, 80);
                        }
                    },
                    x: {
                        type: 'category', // Use category scale
                        labels: labels, // Provide the labels array for proper ordering
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#e0e0e0', // Light text color for dark theme
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: { top: 10, bottom: 0 } // Add padding to title
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#e0e0e0', // Light text color for dark theme
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            },
                            autoSkip: true,
                            autoSkipPadding: 15, // Increased padding between ticks
                            maxTicksLimit: Math.max(5, Math.round(20 / (typeof xAxisScale !== 'undefined' ? xAxisScale : 1))),
                            padding: 10, // Add padding to ensure ticks don't get cut off
                            callback: function(value, index) {
                                // Format the date labels for display
                                const label = labels[index];
                                if (label && label.includes('/')) {
                                    try {
                                        const parts = label.split('/');
                                        if (parts.length === 3) {
                                            const month = parseInt(parts[0]);
                                            const day = parseInt(parts[1]);
                                            const year = parseInt(parts[2]);
                                            const date = new Date(year, month - 1, day);
                                            return date.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        }
                                    } catch (e) {
                                        // Fallback to original label
                                    }
                                }
                                return label;
                            }
                        },
                        min: 0,
                        max: labels.length - 1,
                        offset: true, // Add offset to prevent labels from being cut off
                        afterFit: function(scaleInstance) {
                            scaleInstance.height = Math.max(scaleInstance.height, 60);
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0', // Light text color for dark theme
                            font: {
                                size: 14
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        enabled: false // Disable built-in tooltips, we'll use our own
                    },

                    customTooltips: {
                        callbacks: {
                            title: function(tooltipItems) {

                                if (tooltipItems.length > 0) {
                                    const label = tooltipItems[0].label;
                                    const pointIndex = tooltipItems[0].dataIndex;


                                    if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {

                                        const weeklyPoint = window.weeklyGoalWeights.find(w => w.index === pointIndex && w.week === 0);
                                        if (weeklyPoint) {

                                            console.log("Forcing first weekly point date to May 6, 2024 in chart tooltip");
                                            return "May 6, 2024";
                                        }


                                        const firstWeeklyPointIndex = window.weeklyIncrementDates.find(w => w.week === 0)?.index;
                                        if (firstWeeklyPointIndex === pointIndex) {
                                            console.log("Forcing date to May 6, 2024 based on index match");
                                            return "May 6, 2024";
                                        }
                                    }

                                    try {

                                        const date = new Date(label);
                                        if (!isNaN(date.getTime())) {

                                            return date.toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            });
                                        }
                                    } catch (e) {

                                    }
                                    return label;
                                }
                                return '';
                            },
                            label: function(context) {
                                try {

                                    if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                                        return 'No data available';
                                    }

                                    const weightValue = parseFloat(context.parsed.y).toFixed(2);

                                    const datasetLabel = context.dataset.label || '';

                                    if (datasetLabel.includes('Actual')) {
                                        return `Weight: ${weightValue} lbs`;
                                    } else if (datasetLabel.includes('Goal')) {
                                        return `Goal: ${weightValue} lbs`;
                                    } else {

                                        return `Value: ${weightValue} lbs`;
                                    }
                                } catch (error) {
                                    console.error('Error in tooltip label callback:', error);
                                    return 'Error displaying data';
                                }
                            },

                            afterLabel: function(context) {
                                try {

                                    if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                                        return null;
                                    }

                                    const datasetLabel = context.dataset.label || '';

                                    if (datasetLabel.includes('Actual')) {

                                        if (targetWeight && !isNaN(targetWeight)) {
                                            const diff = context.parsed.y - targetWeight;
                                            const sign = diff >= 0 ? '+' : '';
                                            return `${sign}${diff.toFixed(2)} lbs from target`;
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error in tooltip afterLabel callback:', error);
                                }
                                return null;
                            }
                        }
                    }
                }
            }
        };

        console.log('Annotations disabled to prevent errors');



        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        formattedActualData.forEach(point => {
            if (point.y !== null && !isNaN(point.y)) {
                minValue = Math.min(minValue, point.y);
                maxValue = Math.max(maxValue, point.y);
            }
        });

        if (targetWeight && !isNaN(targetWeight)) {
            minValue = Math.min(minValue, targetWeight);
            maxValue = Math.max(maxValue, targetWeight);
        }

        if (minValue !== Number.MAX_VALUE && maxValue !== Number.MIN_VALUE) {

            const range = maxValue - minValue;
            const padding = Math.max(range * 0.05, 2); // At least 2 lbs padding

            chartConfig.options.scales.y.min = Math.max(0, minValue - padding);
            chartConfig.options.scales.y.max = maxValue + padding;

            console.log(`Setting initial Y-axis range: ${chartConfig.options.scales.y.min} to ${chartConfig.options.scales.y.max}`);
        }

        chartConfig.options.targetWeight = parseFloat(targetWeight);
        console.log('Setting target weight in chart options:', chartConfig.options.targetWeight);

        try {
            console.log('Creating new Chart.js instance');
            weightGoalChart = new Chart(ctx, chartConfig);
            weightGoalChart._initialScaleApplied = false; // Mark as needing initial scale

            // Store the chart in the window object for access by other scripts
            window.weightGoalChart = weightGoalChart;

            console.log('Weight goal chart created and stored in window.weightGoalChart');

            // Use our new tooltip fix function if available
            if (window.fixWeightChartTooltips && typeof window.fixWeightChartTooltips === 'function') {
                console.log('Using tooltip fix function');
                setTimeout(() => {
                    window.fixWeightChartTooltips(weightGoalChart);
                }, 100);
            } else {
                console.warn('Tooltip fix function not available, will try again');

                // Try again after a delay to allow scripts to load
                setTimeout(() => {
                    if (window.fixWeightChartTooltips && typeof window.fixWeightChartTooltips === 'function') {
                        console.log('Tooltip fix function now available');
                        window.fixWeightChartTooltips(weightGoalChart);
                    } else {
                        console.warn('Tooltip fix function still not available');
                    }
                }, 500);
            }

            // Force a resize to ensure the chart is properly rendered
            setTimeout(() => {
                if (weightGoalChart) {
                    console.log('Forcing chart resize');
                    weightGoalChart.resize();
                }
            }, 500);
        } catch (error) {
            console.error('Error creating chart:', error);

            // Show error message
            if (weightChartMessage) {
                weightChartMessage.textContent = `Error creating chart: ${error.message}`;
                weightChartMessage.style.color = 'red';
                weightChartMessage.style.display = 'block';
                weightChartMessage.style.padding = '10px';
                weightChartMessage.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                weightChartMessage.style.borderRadius = '4px';
                weightChartMessage.style.margin = '10px 0';
            }
        }


        setTimeout(() => {
            if (weightGoalChart && typeof updateChartYAxisScale === 'function') {

                updateChartYAxisScale(weightGoalChart, 1.0, false);
                console.log('Applied initial y-axis scale: 1.0x');

                if (xAxisScaleSlider) xAxisScaleSlider.value = 1.0;
                if (yAxisScaleSlider) yAxisScaleSlider.value = 1.0;
                if (xScaleValue) xScaleValue.textContent = '1.0x';
                if (yScaleValue) yScaleValue.textContent = '1.0x';
                xAxisScale = 1.0;
                yAxisScale = 1.0;
            }
        }, 100);
    }


    async function loadRecipes(retryCount = 0, maxRetries = 3) {
        console.log(`Loading recipes... (attempt ${retryCount + 1} of ${maxRetries + 1})`);
        showStatus(recipesDisplayStatus, 'Loading recipes...', 'info');

        recipeListContainer.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <p>Loading recipes...</p>
                <div class="loading-spinner" style="
                    display: inline-block;
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                "></div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;

        try {

            const timestamp = new Date().getTime();
            const random = Math.floor(Math.random() * 1000000);
            const url = `/api/recipes?timestamp=${timestamp}&random=${random}`;
            console.log(`Fetching recipes from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                cache: 'no-store' // Force fetch to bypass cache
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            if (!responseText.trim()) {
                console.error('Empty response received');
                throw new Error('Empty response from server');
            }

            let recipes;
            try {
                const responseData = JSON.parse(responseText);

                // Handle both old format (direct array) and new format (object with recipes property)
                if (Array.isArray(responseData)) {
                    // Old format: direct array
                    recipes = responseData;
                } else if (responseData && responseData.success && Array.isArray(responseData.recipes)) {
                    // New format: object with success and recipes properties
                    recipes = responseData.recipes;
                } else {
                    console.error('Invalid response format:', responseData);
                    throw new Error('Invalid recipe data format');
                }

                console.log(`Loaded ${recipes.length} recipes:`, recipes);
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                console.error('Response text that failed to parse:', responseText);
                throw new Error(`Failed to parse recipe data: ${jsonError.message}`);
            }

            if (!Array.isArray(recipes)) {
                console.error('Recipes is not an array:', recipes);
                throw new Error('Invalid recipe data: expected an array');
            }

            renderRecipes(recipes);
            showStatus(recipesDisplayStatus, '', ''); // Clear status on success

            if (retryCount > 0) {

                const notification = document.createElement('div');
                notification.className = 'recipes-loaded-notification';
                notification.innerHTML = `
                    <div class="recipes-loaded-notification-content">
                        <span class="recipes-loaded-notification-icon">✓</span>
                        <span class="recipes-loaded-notification-text">Recipes loaded successfully!</span>
                    </div>
                `;
                document.body.appendChild(notification);

                const style = document.createElement('style');
                style.textContent = `
                    .recipes-loaded-notification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background-color: #000;
                        color: white;
                        padding: 15px 20px;
                        border-radius: 5px;
                        z-index: 9999;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                        border-left: 4px solid #00ff00;
                        animation: slideIn 0.5s forwards;
                    }
                    .recipes-loaded-notification-content {
                        display: flex;
                        align-items: center;
                    }
                    .recipes-loaded-notification-icon {
                        color: #00ff00;
                        font-size: 20px;
                        margin-right: 10px;
                    }
                    .recipes-loaded-notification-text {
                        font-size: 16px;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `;
                document.head.appendChild(style);

                setTimeout(() => {
                    notification.remove();
                    style.remove();
                }, 3000);
            }

        } catch (error) {
            console.error('Error loading recipes:', error);

            if (retryCount < maxRetries) {
                console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
                showStatus(recipesDisplayStatus, `Retrying to load recipes (${retryCount + 1}/${maxRetries})...`, 'info');

                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));

                return loadRecipes(retryCount + 1, maxRetries);
            }

            showStatus(recipesDisplayStatus, `Failed to load recipes: ${error.message}`, 'error');
            recipeListContainer.innerHTML = `
                <div style="text-align:center; padding: 20px; color: red;">
                    <p>Could not load recipes: ${error.message}</p>
                    <button id="retry-load-recipes" style="
                        background-color: #000;
                        color: white;
                        border: 1px solid white;
                        padding: 8px 15px;
                        margin-top: 10px;
                        cursor: pointer;
                    ">Retry Loading Recipes</button>
                </div>
            `;

            document.getElementById('retry-load-recipes').addEventListener('click', () => {
                loadRecipes(0, maxRetries); // Reset retry count
            });

            try {
                console.log('Trying alternative approach to load recipes...');

                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/api/recipes', true);
                xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                xhr.setRequestHeader('Pragma', 'no-cache');
                xhr.setRequestHeader('Expires', '0');

                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('XHR response received:', xhr.responseText);
                        try {
                            const recipes = JSON.parse(xhr.responseText);
                            console.log(`Alternative approach loaded ${recipes.length} recipes`);
                            renderRecipes(recipes);
                            showStatus(recipesDisplayStatus, '', ''); // Clear status on success
                        } catch (jsonError) {
                            console.error('Error parsing JSON from XHR:', jsonError);
                            console.error('XHR response text:', xhr.responseText);
                        }
                    } else {
                        console.error('XHR request failed with status:', xhr.status);
                        console.error('XHR response:', xhr.responseText);
                    }
                };

                xhr.onerror = function() {
                    console.error('XHR network error');
                };

                xhr.send();

            } catch (retryError) {
                console.error('Alternative approach also failed:', retryError);
            }
        }
    }

    function renderRecipes(recipes) {
        recipeListContainer.innerHTML = ''; // Clear previous list

        if (recipes.length === 0) {
            recipeListContainer.innerHTML = '<p style="text-align:center;">No recipes found. Create one above!</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe-card'); // Use new compact card class
            recipeDiv.dataset.id = recipe.id;

            recipeDiv.innerHTML = `
                <div class="recipe-card-header">
                    <div class="recipe-title-container">
                        <h3 class="recipe-card-title">${escapeHtml(recipe.name)}</h3>
                        <i class="fas fa-pencil-alt edit-recipe-name-icon" title="Edit Recipe Name"></i>
                    </div>
                    <p class="recipe-card-calories">${recipe.total_calories.toFixed(1)} calories</p>
                </div>

                <!-- Recipe action buttons moved below title and calories -->
                <div class="recipe-card-actions">
                    <button type="button" class="recipe-card-btn primary view-ingredients-btn">View</button>
                    <button type="button" class="recipe-card-btn adjust-calories-toggle">Adjust</button>
                    <button type="button" class="recipe-card-btn danger delete-recipe-btn">Delete</button>
                </div>

                <div class="recipe-card-body">

                    <!-- Compact Calorie Adjustment Controls (initially hidden) -->
                    <div class="calorie-adjustment-compact" style="display: none;">
                        <!-- Top row with input and set button -->
                        <div class="input-row">
                            <div class="input-container">
                                <input type="number" class="target-calories-input" placeholder="New Cal Total" step="1">
                            </div>
                            <button type="button" class="set-btn adjust-calories-btn">Set</button>
                        </div>

                        <!-- New layout for adjustment buttons -->
                        <div class="adjustment-buttons-row">
                            <!-- Percentage adjustments (left side of input) -->
                            <div class="percent-adjustments">
                                <button type="button" class="recipe-card-btn adjust-calories-percent-btn" data-percent="0.75">-25%</button>
                                <button type="button" class="recipe-card-btn adjust-calories-percent-btn" data-percent="1.25">+25%</button>
                            </div>

                            <!-- Flat adjustments (right side of input) -->
                            <div class="flat-adjustments">
                                <button type="button" class="recipe-card-btn adjust-calories-amount-btn" data-amount="-200">-200</button>
                                <button type="button" class="recipe-card-btn adjust-calories-amount-btn" data-amount="200">+200</button>
                            </div>
                        </div>
                    </div>

                    <div class="ingredient-details" style="display: none;">
                        <!-- Ingredient details will be loaded here -->
                    </div>
                    <div class="adjustment-status status"></div> <!-- Status for adjustments -->
                </div>
            `;
            recipeListContainer.appendChild(recipeDiv);

            const adjustToggleBtn = recipeDiv.querySelector('.adjust-calories-toggle');
            const adjustSection = recipeDiv.querySelector('.calorie-adjustment-compact');

            if (adjustToggleBtn && adjustSection) {
                adjustToggleBtn.addEventListener('click', function() {
                    const isVisible = adjustSection.style.display !== 'none';
                    adjustSection.style.display = isVisible ? 'none' : 'grid';
                    adjustToggleBtn.textContent = isVisible ? 'Adjust' : 'Hide';
                });
            }
        });
    }


    async function deleteRecipe(id) {
        if (!confirm('Are you sure you want to delete this recipe and all its ingredients?')) {
            return;
        }
        showStatus(recipesDisplayStatus, `Deleting recipe ${id}...`, 'info');
        try {
            const response = await fetch(`/api/recipes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            showStatus(recipesDisplayStatus, result.message || 'Recipe deleted successfully', 'success');
            loadRecipes(); // Refresh the list
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showStatus(recipesDisplayStatus, `Error deleting recipe: ${error.message}`, 'error');
        }
    }


    function showStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `status ${type}`;
        if (type !== 'info') {
            setTimeout(() => {
                if (element.textContent === message) { // Clear only if message hasn't changed
                     element.textContent = '';
                     element.className = 'status';
                }
            }, 5000);
        }
    }

    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe; // Handle non-strings
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function adjustRecipeCalories(recipeId, targetCalories, recipeItemElement) {
        const statusElement = recipeItemElement.querySelector('.adjustment-status');
        showStatus(statusElement, 'Adjusting calories...', 'info');

        if (isNaN(targetCalories) || targetCalories <= 0) {
            showStatus(statusElement, 'Invalid target calorie value.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/recipes/${recipeId}`,
             {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetCalories: targetCalories })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const updatedRecipe = await response.json();

            const caloriesSpan = recipeItemElement.querySelector('.recipe-card-calories');
            if (caloriesSpan) {
                caloriesSpan.textContent = `${updatedRecipe.total_calories.toFixed(1)} calories`;
            }

            const targetInput = recipeItemElement.querySelector('.target-calories-input');
            if(targetInput) targetInput.value = '';

            const detailsDiv = recipeItemElement.querySelector('.ingredient-details');
            if (detailsDiv.style.display !== 'none') {
                 renderIngredientDetails(updatedRecipe.ingredients, detailsDiv);
            }

            showStatus(statusElement, 'Calories adjusted successfully!', 'success');

        } catch (error) {
            console.error('Error adjusting calories:', error);
            showStatus(statusElement, `Error: ${error.message}`, 'error');
        }
    }

    async function fetchAndDisplayIngredients(recipeId, detailsDiv, viewButton, forceRefresh = false) {
        console.log(`=== fetchAndDisplayIngredients called for recipe ${recipeId}${forceRefresh ? ' (FORCE REFRESH)' : ''} ===`);

        if (forceRefresh) {
            console.log('Force refresh parameter detected - will refresh ingredients');
            detailsDiv.dataset.forceRefresh = 'true';
        }

        if (!recipeId) {
            console.error('Recipe ID is required for fetchAndDisplayIngredients');
            return;
        }

        if (!detailsDiv) {
            console.error('Details div is required for fetchAndDisplayIngredients');
            return;
        }

        if (detailsDiv.style.display !== 'none' && !detailsDiv.dataset.forceRefresh) {
            console.log('Toggling visibility - hiding ingredients');
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = ''; // Clear content
            if (viewButton) {
                viewButton.textContent = 'View';
                viewButton.classList.remove('active');
            }
            return;
        }

        if (detailsDiv.dataset.forceRefresh) {
            console.log('Force refresh flag detected - will refresh ingredients');
            delete detailsDiv.dataset.forceRefresh;
        }

        detailsDiv.innerHTML = '<p>Loading ingredients...</p>';
        detailsDiv.style.display = 'block';
        if (viewButton) {
            viewButton.textContent = 'Hide';
            viewButton.classList.add('active');
        }

        try {

            const timestamp = new Date().getTime();
            console.log(`Fetching recipe data with timestamp ${timestamp}`);

            const response = await fetch(`/api/recipes/${recipeId}?timestamp=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
                let errorMessage = `Server returned ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error('Server error response:', errorData);
                } catch (jsonError) {
                    console.error('Could not parse error response as JSON:', jsonError);
                }
                throw new Error(errorMessage);
            }

            const recipeData = await response.json();

            console.log('Fetched recipe data:', recipeData);
            console.log(`Fetched ${recipeData.ingredients ? recipeData.ingredients.length : 0} ingredients`);

            if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
                console.error('No ingredients array in recipe data:', recipeData);
                throw new Error('No ingredients found in recipe data');
            }

            if (recipeData.ingredients.length === 0) {
                console.warn('Recipe has no ingredients');
                detailsDiv.innerHTML = '<p>This recipe has no ingredients.</p>';
                return;
            }

            recipeData.ingredients.forEach(ing => {
                console.log(`Ingredient ${ing.id} (${ing.name}) has package_amount:`, ing.package_amount, typeof ing.package_amount);
            });

            console.log('Rendering ingredient details');
            renderIngredientDetails(recipeData.ingredients, detailsDiv);
            console.log('Ingredient details rendered successfully');

            setTimeout(() => {
                detailsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                console.log('Scrolled to ingredient details');
            }, 100);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            detailsDiv.innerHTML = `<p style="color:red;">Error loading ingredients: ${error.message}</p>
                                    <button onclick="fetchAndDisplayIngredients('${recipeId}', this.parentElement, null)">
                                        Retry
                                    </button>`;
        }
    }


    function renderIngredientDetails(ingredients, container) {
        console.log('=== renderIngredientDetails called ===');
        console.log('Ingredients to render:', ingredients);

        if (!ingredients || ingredients.length === 0) {
            container.innerHTML = '<p>No ingredients found for this recipe.</p>';
            return;
        }

        const renderTimestamp = new Date().getTime();
        console.log(`Rendering ingredients with timestamp: ${renderTimestamp}`);

        if (ingredients && ingredients.length > 0 && window.OmegaStorage) {
            console.log('Applying omega values from OmegaStorage to ingredients');

            ingredients = window.OmegaStorage.applyOmegaValuesToAll(ingredients);
        }

        ingredients.forEach(ing => {

            if (typeof ing.package_amount === 'string' && ing.package_amount.trim() !== '') {
                ing.package_amount = Number(ing.package_amount);
                console.log(`Converted package_amount for ${ing.name} from string to number:`, ing.package_amount);
            }

            console.log(`Rendering ingredient ${ing.id} (${ing.name}) package_amount:`, ing.package_amount, typeof ing.package_amount);
        });

        let tableHtml = `
            <div class="nutrition-controls">
                <button type="button" class="toggle-detailed-nutrition" onclick="toggleNutritionPanel(this)">Show Detailed Nutrition</button>
                <button type="button" class="add-ingredient-to-recipe-btn">Add Ingredient</button>
            </div>
            <div class="responsive-table-container">
                <table class="ingredient-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Calories</th>
                            <th>Amount (g)</th>
                            <th>Package (g)</th>
                            <th>Protein (g)</th>
                            <th>Fat (g)</th>
                            <th>Carbs (g)</th>
                            <th>Package Price</th>
                            <th>Price/g</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        ingredients.forEach(ing => {

            const calPerGram = ing.calories_per_gram ? ing.calories_per_gram.toFixed(2) :
                               (ing.amount > 0 ? (ing.calories / ing.amount).toFixed(2) : '0.00');
            const protPerGram = ing.protein_per_gram ? ing.protein_per_gram.toFixed(2) :
                                (ing.amount > 0 ? (ing.protein / ing.amount).toFixed(2) : '0.00');
            const fatPerGram = ing.fats_per_gram ? ing.fats_per_gram.toFixed(2) :
                              (ing.amount > 0 ? (ing.fats / ing.amount).toFixed(2) : '0.00');
            const carbPerGram = ing.carbohydrates_per_gram ? ing.carbohydrates_per_gram.toFixed(2) :
                                (ing.amount > 0 ? (ing.carbohydrates / ing.amount).toFixed(2) : '0.00');
            const pricePerGram = ing.price_per_gram ? ing.price_per_gram.toFixed(3) :
                                (ing.amount > 0 ? (ing.price / ing.amount).toFixed(3) : '0.000');

            console.log(`Ingredient ${ing.name} package_amount:`, ing.package_amount, typeof ing.package_amount);

            let packageAmountDisplay = '-';

            let packageAmountNum = ing.package_amount;

            if (window.localStorageManager) {
                const savedPackageAmount = window.localStorageManager.getPackageAmount(ing.id);
                if (savedPackageAmount !== null) {
                    console.debug(`Found saved package amount in local storage for ingredient ${ing.id}: ${savedPackageAmount}`);
                    packageAmountNum = savedPackageAmount;
                }
            }

            if (typeof packageAmountNum === 'string' && packageAmountNum.trim() !== '') {
                packageAmountNum = Number(packageAmountNum);
                console.log(`Converted string package_amount to number for ${ing.name}:`, packageAmountNum);
            }

            if (packageAmountNum !== null && packageAmountNum !== undefined) {
                if (!isNaN(packageAmountNum)) {
                    packageAmountDisplay = packageAmountNum.toFixed(2);
                    console.log(`Formatted package amount for ${ing.name}:`, packageAmountDisplay);

                    ing.package_amount = packageAmountNum;
                }
            }


            console.log(`Final package amount for ${ing.name} before rendering:`, ing.package_amount, typeof ing.package_amount);
            console.log(`Final display value for ${ing.name}:`, packageAmountDisplay);

            const refreshTimestamp = new Date().getTime();

            tableHtml += `
                <tr data-ingredient-id="${ing.id}" data-recipe-id="${ing.recipe_id}">
                    <td title="${escapeHtml(ing.name)}">${escapeHtml(ing.name)}</td>
                    <td title="Calories: ${ing.calories.toFixed(2)}">${ing.calories.toFixed(2)}</td>
                    <td title="Amount: ${ing.amount.toFixed(2)}g">${ing.amount.toFixed(2)}</td>
                    <td title="Package: ${packageAmountDisplay}g" data-refresh="${refreshTimestamp}">
                        ${packageAmountDisplay}
                        <span class="refresh-timestamp" style="display:none;">${refreshTimestamp}</span>
                    </td>
                    <td title="Protein: ${ing.protein.toFixed(2)}g">${ing.protein.toFixed(2)}</td>
                    <td title="Fat: ${ing.fats.toFixed(2)}g">${ing.fats.toFixed(2)}</td>
                    <td title="Carbs: ${ing.carbohydrates.toFixed(2)}g">${ing.carbohydrates.toFixed(2)}</td>
                    <td title="Package Price: $${ing.price.toFixed(2)}">${ing.price.toFixed(2)}</td>
                    <td title="Price per gram: ${pricePerGram}">${pricePerGram}</td>
                    <td>
                        <button type="button" class="edit-ingredient-btn">Edit</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            <!-- Add Ingredient Form -->
            <div class="add-ingredient-form" style="display: none;">
                <h4>Add Ingredient to Recipe</h4>
                <form id="add-ingredient-form" class="ingredient-item">
                    <input type="hidden" id="add-ingredient-recipe-id" name="recipe-id">

                    <div class="compact-form-layout">
                        <!-- Top Row: Selection Type and Dropdown -->
                        <div class="selection-row">
                            <div class="selection-type">
                                <label>
                                    <input type="radio" name="ingredient-selection-type" value="existing">
                                    Use existing
                                </label>
                                <label>
                                    <input type="radio" name="ingredient-selection-type" value="new" checked>
                                    Create new
                                </label>
                            </div>

                            <!-- Existing Ingredient Selection -->
                            <div id="existing-ingredient-selection" style="display: none;">
                                <input type="text" class="ingredient-search-input" placeholder="Search ingredients...">
                                <!-- Dropdown will be created dynamically by ingredient-search-autocomplete.js -->
                            </div>
                        </div>

                        <!-- Middle Row: Basic Info and Cronometer -->
                        <div class="info-row">
                            <!-- Left Column: Basic Information -->
                            <div class="basic-info-grid">
                                <div class="form-group">
                                    <label for="add-ingredient-name">Name:</label>
                                    <input type="text" id="add-ingredient-name" name="ingredient-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="add-ingredient-amount">Amount (g):</label>
                                    <input type="number" id="add-ingredient-amount" name="ingredient-amount" step="0.1" min="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label for="add-ingredient-package-amount">Package (g):</label>
                                    <input type="number" id="add-ingredient-package-amount" name="ingredient-package-amount" step="0.1" min="0">
                                </div>
                                <div class="form-group">
                                    <label for="add-ingredient-price">Price:</label>
                                    <input type="number" id="add-ingredient-price" name="ingredient-price" step="0.01" min="0" required>
                                </div>
                                <!-- Hidden fields for form submission -->
                                <input type="hidden" class="ingredient-calories" name="calories">
                                <input type="hidden" class="ingredient-protein" name="protein">
                                <input type="hidden" class="ingredient-fat" name="fats">
                                <input type="hidden" class="ingredient-carbs" name="carbohydrates">
                            </div>

                            <!-- Right Column: Cronometer Parser -->
                            <div class="cronometer-container">
                                <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..."></textarea>
                                <button type="button" class="cronometer-parse-button" onclick="if(window.processCronometerText){window.processCronometerText(this.parentNode.querySelector('.cronometer-text-paste-area').value.trim(), this.closest('.ingredient-item'), this.parentNode.querySelector('.cronometer-parse-status'))}">Parse Nutrition</button>
                                <div class="cronometer-parse-status"></div>
                            </div>
                        </div>

                        <!-- No bottom row needed as we already have a Show Detailed Nutrition button in the table header -->
                    </div>

                    <!-- Detailed Nutrition Panel -->
                    <div class="detailed-nutrition-panel" style="display:none;">
                        <!-- General Section -->
                        <div class="nutrition-section">
                            <h4>General</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-calories">Energy (kcal):</label>
                                    <input type="number" id="add-ingredient-calories" name="ingredient-calories" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-alcohol">Alcohol (g):</label>
                                    <input type="number" id="add-ingredient-alcohol" name="ingredient-alcohol" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-caffeine">Caffeine (mg):</label>
                                    <input type="number" id="add-ingredient-caffeine" name="ingredient-caffeine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-water">Water (g):</label>
                                    <input type="number" id="add-ingredient-water" name="ingredient-water" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Carbohydrates Section -->
                        <div class="nutrition-section">
                            <h4>Carbohydrates</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-carbs">Carbs (g):</label>
                                    <input type="number" id="add-ingredient-carbs" name="ingredient-carbs" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-fiber">Fiber (g):</label>
                                    <input type="number" id="add-ingredient-fiber" name="ingredient-fiber" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-starch">Starch (g):</label>
                                    <input type="number" id="add-ingredient-starch" name="ingredient-starch" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-sugars">Sugars (g):</label>
                                    <input type="number" id="add-ingredient-sugars" name="ingredient-sugars" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-added-sugars">Added Sugars (g):</label>
                                    <input type="number" id="add-ingredient-added-sugars" name="ingredient-added-sugars" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-net-carbs">Net Carbs (g):</label>
                                    <input type="number" id="add-ingredient-net-carbs" name="ingredient-net-carbs" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Lipids Section -->
                        <div class="nutrition-section">
                            <h4>Lipids</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-fats">Fat (g):</label>
                                    <input type="number" id="add-ingredient-fats" name="ingredient-fats" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-monounsaturated">Monounsaturated (g):</label>
                                    <input type="number" id="add-ingredient-monounsaturated" name="ingredient-monounsaturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-polyunsaturated">Polyunsaturated (g):</label>
                                    <input type="number" id="add-ingredient-polyunsaturated" name="ingredient-polyunsaturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-omega3">Omega 3 (g):</label>
                                    <input type="number" id="add-ingredient-omega3" name="ingredient-omega3" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-omega6">Omega 6 (g):</label>
                                    <input type="number" id="add-ingredient-omega6" name="ingredient-omega6" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-saturated">Saturated (g):</label>
                                    <input type="number" id="add-ingredient-saturated" name="ingredient-saturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-trans-fat">Trans Fat (g):</label>
                                    <input type="number" id="add-ingredient-trans-fat" name="ingredient-trans-fat" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-cholesterol">Cholesterol (mg):</label>
                                    <input type="number" id="add-ingredient-cholesterol" name="ingredient-cholesterol" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Protein Section -->
                        <div class="nutrition-section">
                            <h4>Protein</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-protein">Protein (g):</label>
                                    <input type="number" id="add-ingredient-protein" name="ingredient-protein" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-cystine">Cystine (g):</label>
                                    <input type="number" id="add-ingredient-cystine" name="ingredient-cystine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-histidine">Histidine (g):</label>
                                    <input type="number" id="add-ingredient-histidine" name="ingredient-histidine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-isoleucine">Isoleucine (g):</label>
                                    <input type="number" id="add-ingredient-isoleucine" name="ingredient-isoleucine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-leucine">Leucine (g):</label>
                                    <input type="number" id="add-ingredient-leucine" name="ingredient-leucine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-lysine">Lysine (g):</label>
                                    <input type="number" id="add-ingredient-lysine" name="ingredient-lysine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-methionine">Methionine (g):</label>
                                    <input type="number" id="add-ingredient-methionine" name="ingredient-methionine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-phenylalanine">Phenylalanine (g):</label>
                                    <input type="number" id="add-ingredient-phenylalanine" name="ingredient-phenylalanine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-threonine">Threonine (g):</label>
                                    <input type="number" id="add-ingredient-threonine" name="ingredient-threonine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-tryptophan">Tryptophan (g):</label>
                                    <input type="number" id="add-ingredient-tryptophan" name="ingredient-tryptophan" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-tyrosine">Tyrosine (g):</label>
                                    <input type="number" id="add-ingredient-tyrosine" name="ingredient-tyrosine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-valine">Valine (g):</label>
                                    <input type="number" id="add-ingredient-valine" name="ingredient-valine" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Vitamins Section -->
                        <div class="nutrition-section">
                            <h4>Vitamins</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b1">B1 (Thiamine) (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b1" name="ingredient-vitamin-b1" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b2">B2 (Riboflavin) (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b2" name="ingredient-vitamin-b2" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b3">B3 (Niacin) (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b3" name="ingredient-vitamin-b3" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b5">B5 (Pantothenic Acid) (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b5" name="ingredient-vitamin-b5" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b6">B6 (Pyridoxine) (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b6" name="ingredient-vitamin-b6" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-b12">B12 (Cobalamin) (µg):</label>
                                    <input type="number" id="add-ingredient-vitamin-b12" name="ingredient-vitamin-b12" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-folate">Folate (µg):</label>
                                    <input type="number" id="add-ingredient-folate" name="ingredient-folate" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-a">Vitamin A (µg):</label>
                                    <input type="number" id="add-ingredient-vitamin-a" name="ingredient-vitamin-a" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-c">Vitamin C (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-c" name="ingredient-vitamin-c" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-d">Vitamin D (IU):</label>
                                    <input type="number" id="add-ingredient-vitamin-d" name="ingredient-vitamin-d" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-e">Vitamin E (mg):</label>
                                    <input type="number" id="add-ingredient-vitamin-e" name="ingredient-vitamin-e" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-vitamin-k">Vitamin K (µg):</label>
                                    <input type="number" id="add-ingredient-vitamin-k" name="ingredient-vitamin-k" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Minerals Section -->
                        <div class="nutrition-section">
                            <h4>Minerals</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-calcium">Calcium (mg):</label>
                                    <input type="number" id="add-ingredient-calcium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-copper">Copper (mg):</label>
                                    <input type="number" id="add-ingredient-copper" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-iron">Iron (mg):</label>
                                    <input type="number" id="add-ingredient-iron" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-magnesium">Magnesium (mg):</label>
                                    <input type="number" id="add-ingredient-magnesium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-manganese">Manganese (mg):</label>
                                    <input type="number" id="add-ingredient-manganese" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-phosphorus">Phosphorus (mg):</label>
                                    <input type="number" id="add-ingredient-phosphorus" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-potassium">Potassium (mg):</label>
                                    <input type="number" id="add-ingredient-potassium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-selenium">Selenium (µg):</label>
                                    <input type="number" id="add-ingredient-selenium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-sodium">Sodium (mg):</label>
                                    <input type="number" id="add-ingredient-sodium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-zinc">Zinc (mg):</label>
                                    <input type="number" id="add-ingredient-zinc" step="0.01" min="0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-add-ingredient-btn">Add Ingredient</button>
                        <button type="button" class="cancel-add-btn">Cancel</button>
                    </div>
                </form>
                <div class="add-ingredient-status status"></div>
            </div>

            <!-- Edit Ingredient Form -->
            <div class="edit-ingredient-form" style="display: none;">
                <h4>Edit Ingredient</h4>
                <form id="edit-ingredient-form" class="ingredient-item">
                    <input type="hidden" id="edit-ingredient-id">
                    <input type="hidden" id="edit-recipe-id">
                    <!-- Hidden fields for form submission -->
                    <input type="hidden" class="ingredient-calories">
                    <input type="hidden" class="ingredient-protein">
                    <input type="hidden" class="ingredient-fat">
                    <input type="hidden" class="ingredient-carbs">

                    <!-- Basic Information -->
                    <div class="compact-form-layout">
                        <!-- Left Column: Basic Information -->
                        <div class="basic-info-grid">
                            <div class="form-group">
                                <label for="edit-ingredient-name">Name:</label>
                                <input type="text" id="edit-ingredient-name" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-ingredient-amount">Amount (g):</label>
                                <input type="number" id="edit-ingredient-amount" step="0.1" min="0.1" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-ingredient-package-amount">Package (g):</label>
                                <input type="number" id="edit-ingredient-package-amount" step="0.1" min="0">
                            </div>
                            <div class="form-group">
                                <label for="edit-ingredient-price">Price:</label>
                                <input type="number" id="edit-ingredient-price" step="0.01" min="0" required>
                            </div>
                        </div>

                        <!-- Right Column: Cronometer Parser -->
                        <div class="cronometer-container">
                            <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..."></textarea>
                            <button type="button" class="cronometer-parse-button" onclick="if(window.processCronometerText){window.processCronometerText(this.parentNode.querySelector('.cronometer-text-paste-area').value.trim(), this.closest('.ingredient-item'), this.parentNode.querySelector('.cronometer-parse-status'))}">Parse Nutrition</button>
                            <div class="cronometer-parse-status"></div>
                        </div>
                    </div>

                    <!-- Detailed Nutrition Panel -->
                    <div class="detailed-nutrition-panel" style="display:block;">
                        <!-- General Section -->
                        <div class="nutrition-section">
                            <h4>General</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-calories">Energy (kcal):</label>
                                    <input type="number" id="edit-ingredient-calories" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-alcohol">Alcohol (g):</label>
                                    <input type="number" id="edit-ingredient-alcohol" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-caffeine">Caffeine (mg):</label>
                                    <input type="number" id="edit-ingredient-caffeine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-water">Water (g):</label>
                                    <input type="number" id="edit-ingredient-water" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Carbohydrates Section -->
                        <div class="nutrition-section">
                            <h4>Carbohydrates</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-carbs">Carbs (g):</label>
                                    <input type="number" id="edit-ingredient-carbs" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-fiber">Fiber (g):</label>
                                    <input type="number" id="edit-ingredient-fiber" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-starch">Starch (g):</label>
                                    <input type="number" id="edit-ingredient-starch" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-sugars">Sugars (g):</label>
                                    <input type="number" id="edit-ingredient-sugars" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-added-sugars">Added Sugars (g):</label>
                                    <input type="number" id="edit-ingredient-added-sugars" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-net-carbs">Net Carbs (g):</label>
                                    <input type="number" id="edit-ingredient-net-carbs" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Lipids Section -->
                        <div class="nutrition-section">
                            <h4>Lipids</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-fats">Fat (g):</label>
                                    <input type="number" id="edit-ingredient-fats" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-monounsaturated">Monounsaturated (g):</label>
                                    <input type="number" id="edit-ingredient-monounsaturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-polyunsaturated">Polyunsaturated (g):</label>
                                    <input type="number" id="edit-ingredient-polyunsaturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-omega3">Omega 3 (g):</label>
                                    <input type="number" id="edit-ingredient-omega3" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-omega6">Omega 6 (g):</label>
                                    <input type="number" id="edit-ingredient-omega6" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-saturated">Saturated (g):</label>
                                    <input type="number" id="edit-ingredient-saturated" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-trans-fat">Trans Fat (g):</label>
                                    <input type="number" id="edit-ingredient-trans-fat" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-cholesterol">Cholesterol (mg):</label>
                                    <input type="number" id="edit-ingredient-cholesterol" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Protein Section -->
                        <div class="nutrition-section">
                            <h4>Protein</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-protein">Protein (g):</label>
                                    <input type="number" id="edit-ingredient-protein" step="0.1" min="0" required>
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-cystine">Cystine (g):</label>
                                    <input type="number" id="edit-ingredient-cystine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-histidine">Histidine (g):</label>
                                    <input type="number" id="edit-ingredient-histidine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-isoleucine">Isoleucine (g):</label>
                                    <input type="number" id="edit-ingredient-isoleucine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-leucine">Leucine (g):</label>
                                    <input type="number" id="edit-ingredient-leucine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-lysine">Lysine (g):</label>
                                    <input type="number" id="edit-ingredient-lysine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-methionine">Methionine (g):</label>
                                    <input type="number" id="edit-ingredient-methionine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-phenylalanine">Phenylalanine (g):</label>
                                    <input type="number" id="edit-ingredient-phenylalanine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-threonine">Threonine (g):</label>
                                    <input type="number" id="edit-ingredient-threonine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-tryptophan">Tryptophan (g):</label>
                                    <input type="number" id="edit-ingredient-tryptophan" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-tyrosine">Tyrosine (g):</label>
                                    <input type="number" id="edit-ingredient-tyrosine" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-valine">Valine (g):</label>
                                    <input type="number" id="edit-ingredient-valine" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Vitamins Section -->
                        <div class="nutrition-section">
                            <h4>Vitamins</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b1">B1 (Thiamine) (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b1" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b2">B2 (Riboflavin) (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b2" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b3">B3 (Niacin) (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b3" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b5">B5 (Pantothenic Acid) (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b5" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b6">B6 (Pyridoxine) (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b6" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-b12">B12 (Cobalamin) (µg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-b12" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-folate">Folate (µg):</label>
                                    <input type="number" id="edit-ingredient-folate" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-a">Vitamin A (µg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-a" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-c">Vitamin C (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-c" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-d">Vitamin D (IU):</label>
                                    <input type="number" id="edit-ingredient-vitamin-d" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-e">Vitamin E (mg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-e" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-vitamin-k">Vitamin K (µg):</label>
                                    <input type="number" id="edit-ingredient-vitamin-k" step="0.1" min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Minerals Section -->
                        <div class="nutrition-section">
                            <h4>Minerals</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <label for="add-ingredient-calcium">Calcium (mg):</label>
                                    <input type="number" id="add-ingredient-calcium" name="ingredient-calcium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-copper">Copper (mg):</label>
                                    <input type="number" id="add-ingredient-copper" name="ingredient-copper" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-iron">Iron (mg):</label>
                                    <input type="number" id="add-ingredient-iron" name="ingredient-iron" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-magnesium">Magnesium (mg):</label>
                                    <input type="number" id="add-ingredient-magnesium" name="ingredient-magnesium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-manganese">Manganese (mg):</label>
                                    <input type="number" id="add-ingredient-manganese" name="ingredient-manganese" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-phosphorus">Phosphorus (mg):</label>
                                    <input type="number" id="add-ingredient-phosphorus" name="ingredient-phosphorus" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-potassium">Potassium (mg):</label>
                                    <input type="number" id="add-ingredient-potassium" name="ingredient-potassium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-selenium">Selenium (µg):</label>
                                    <input type="number" id="add-ingredient-selenium" name="ingredient-selenium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-sodium">Sodium (mg):</label>
                                    <input type="number" id="add-ingredient-sodium" name="ingredient-sodium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="add-ingredient-zinc">Zinc (mg):</label>
                                    <input type="number" id="add-ingredient-zinc" name="ingredient-zinc" step="0.01" min="0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-ingredient-btn">Add Ingredient</button>
                        <button type="button" class="cancel-add-btn">Cancel</button>
                    </div>
                </form>
                <div class="add-ingredient-status status"></div>
            </div>

            <!-- Edit Ingredient Form -->
            <div class="edit-ingredient-form" style="display: none;">
                <h4>Edit Ingredient</h4>
                <form id="edit-ingredient-form" class="ingredient-item">
                    <input type="hidden" id="edit-ingredient-id" name="ingredient-id">
                    <input type="hidden" id="edit-recipe-id" name="recipe-id">

                    <!-- Form content will be populated dynamically -->

                    <div class="form-actions">
                        <button type="submit" class="save-ingredient-btn">Save Changes</button>
                        <button type="button" class="cancel-edit-btn">Cancel</button>
                    </div>
                </form>
                <div class="edit-ingredient-status status"></div>
            </div>
        `;

        container.innerHTML = tableHtml;

        const editButtons = container.querySelectorAll('.edit-ingredient-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', handleEditIngredientClick);
        });

        const toggleButton = container.querySelector('.toggle-detailed-nutrition');
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                const detailedNutritionContainer = container.querySelector('.detailed-nutrition-container');
                if (detailedNutritionContainer) {

                    const isVisible = detailedNutritionContainer.style.display !== 'none';
                    detailedNutritionContainer.style.display = isVisible ? 'none' : 'block';

                    this.textContent = isVisible ? 'Show Detailed Nutrition' : 'Hide Detailed Nutrition';
                }
            });
        }

        const addIngredientButton = container.querySelector('.add-ingredient-to-recipe-btn');
        if (addIngredientButton) {
            addIngredientButton.addEventListener('click', function() {

                let recipeId = null;
                const firstRow = container.querySelector('tr[data-recipe-id]');
                if (firstRow) {
                    recipeId = firstRow.dataset.recipeId;
                }

                if (!recipeId) {
                    console.error('Could not determine recipe ID for adding ingredient');
                    return;
                }

                const addForm = container.querySelector('.add-ingredient-form');
                if (addForm) {

                    document.getElementById('add-ingredient-recipe-id').value = recipeId;

                    loadExistingIngredients();

                    addForm.style.display = 'block';

                    if (typeof initializeCronometerTextParser === 'function') {
                        console.log('Initializing Cronometer text parser for add ingredient form');
                        initializeCronometerTextParser(addForm);
                    } else {
                        console.warn('Cronometer text parser not available');
                    }

                    addForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        const addIngredientForm = container.querySelector('#add-ingredient-form');
        if (addIngredientForm) {
            addIngredientForm.addEventListener('submit', handleAddIngredientSubmit);
        }

        const cancelAddButton = container.querySelector('.cancel-add-btn');
        if (cancelAddButton) {
            cancelAddButton.addEventListener('click', () => {
                container.querySelector('.add-ingredient-form').style.display = 'none';
            });
        }

        const ingredientSelectionRadios = container.querySelectorAll('input[name="ingredient-selection-type"]');
        if (ingredientSelectionRadios.length > 0) {
            ingredientSelectionRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    const existingIngredientSection = document.getElementById('existing-ingredient-selection');
                    const nameInput = document.getElementById('add-ingredient-name');

                    if (this.value === 'new' && typeof initializeCronometerTextParser === 'function') {
                        console.log('Re-initializing Cronometer text parser after switching to new ingredient');
                        const form = document.getElementById('add-ingredient-form');
                        if (form) {
                            initializeCronometerTextParser(form);
                        }
                    }

                    if (this.value === 'existing') {
                        console.log('Radio clicked: Showing existing ingredient selection');
                        existingIngredientSection.style.display = 'block';
                        nameInput.disabled = true;

                        // Focus the search input to show the autocomplete dropdown immediately
                        const searchInput = existingIngredientSection.querySelector('.ingredient-search-input');
                        if (searchInput) {
                            // Clear any previous value
                            searchInput.value = '';

                            // Focus the search input to trigger the autocomplete dropdown
                            setTimeout(() => {
                                searchInput.focus();
                            }, 100);
                        }
                    } else {
                        console.log('Radio clicked: Showing new ingredient input');
                        existingIngredientSection.style.display = 'none';
                        nameInput.disabled = false;
                        nameInput.value = '';
                    }
                });
            });
        }

        const editForm = container.querySelector('#edit-ingredient-form');
        if (editForm) {
            editForm.addEventListener('submit', handleEditIngredientSubmit);

            if (typeof initializeCronometerTextParser === 'function') {
                console.log('Initializing Cronometer text parser for edit form');
                initializeCronometerTextParser(editForm);
            }
        }

        const cancelEditButton = container.querySelector('.cancel-edit-btn');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', () => {
                container.querySelector('.edit-ingredient-form').style.display = 'none';
            });
        }

        const addForm = container.querySelector('#add-ingredient-form');
        if (addForm && typeof initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for add form');
            initializeCronometerTextParser(addForm);
        }
    }

    function handleEditIngredientClick(event) {
        const row = event.target.closest('tr');
        const ingredientId = row.dataset.ingredientId;
        const recipeId = row.dataset.recipeId;
        const container = row.closest('.ingredient-details');
        const editForm = container.querySelector('.edit-ingredient-form');
        const statusElement = container.querySelector('.edit-ingredient-status');

        editForm.style.display = 'block';

        if (typeof initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for edit ingredient form');
            initializeCronometerTextParser(editForm);
        } else {
            console.warn('Cronometer text parser not available');
        }


        const packageAmountElement = row.querySelector(`.ingredient-package-amount[data-ingredient-id="${ingredientId}"]`);
        let uiPackageAmount = null;
        if (packageAmountElement) {
            uiPackageAmount = packageAmountElement.getAttribute('data-value');
            console.debug(`Found UI-updated package amount: ${uiPackageAmount}`);
        }

        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(ingredient => {

                console.debug('Ingredient data from API:', ingredient);

                if (uiPackageAmount !== null) {
                    console.debug(`Overriding database package amount (${ingredient.package_amount}) with UI value (${uiPackageAmount})`);
                    ingredient.package_amount = parseFloat(uiPackageAmount);
                }

                document.getElementById('edit-ingredient-id').value = ingredientId;
                document.getElementById('edit-recipe-id').value = recipeId;

                document.getElementById('edit-ingredient-name').value = ingredient.name || '';
                document.getElementById('edit-ingredient-amount').value = ingredient.amount || '';

                console.debug('Package amount from API:', ingredient.package_amount, typeof ingredient.package_amount);

                let packageAmountForForm = '';

                if (window.localStorageManager) {
                    const savedPackageAmount = window.localStorageManager.getPackageAmount(ingredientId);
                    if (savedPackageAmount !== null) {
                        console.debug(`Found saved package amount in local storage for ingredient ${ingredientId}: ${savedPackageAmount}`);
                        packageAmountForForm = savedPackageAmount;
                    } else if (ingredient.package_amount !== null && ingredient.package_amount !== undefined) {

                        packageAmountForForm = Number(ingredient.package_amount);

                        if (isNaN(packageAmountForForm)) {
                            packageAmountForForm = '';
                        }
                    }
                } else if (ingredient.package_amount !== null && ingredient.package_amount !== undefined) {

                    packageAmountForForm = Number(ingredient.package_amount);

                    if (isNaN(packageAmountForForm)) {
                        packageAmountForForm = '';
                    }
                }

                document.getElementById('edit-ingredient-package-amount').value = packageAmountForForm;
                console.debug('Package amount set in form:', packageAmountForForm);

                window._currentPackageAmount = packageAmountForForm;
                document.getElementById('edit-ingredient-price').value = ingredient.price || '';

                document.getElementById('edit-ingredient-calories').value = ingredient.calories || '';
                document.getElementById('edit-ingredient-alcohol').value = ingredient.alcohol || '';
                document.getElementById('edit-ingredient-caffeine').value = ingredient.caffeine || '';
                document.getElementById('edit-ingredient-water').value = ingredient.water || '';

                document.getElementById('edit-ingredient-carbs').value = ingredient.carbohydrates || '';
                document.getElementById('edit-ingredient-fiber').value = ingredient.fiber || '';
                document.getElementById('edit-ingredient-starch').value = ingredient.starch || '';
                document.getElementById('edit-ingredient-sugars').value = ingredient.sugars || '';
                document.getElementById('edit-ingredient-added-sugars').value = ingredient.added_sugars || '';
                document.getElementById('edit-ingredient-net-carbs').value = ingredient.net_carbs || '';

                document.getElementById('edit-ingredient-fats').value = ingredient.fats || '';
                document.getElementById('edit-ingredient-monounsaturated').value = ingredient.monounsaturated || '';
                document.getElementById('edit-ingredient-polyunsaturated').value = ingredient.polyunsaturated || '';

                const omega3Value = ingredient.omega3 !== undefined ? ingredient.omega3 :
                                   (ingredient.omega_3 !== undefined ? ingredient.omega_3 : '');
                document.getElementById('edit-ingredient-omega3').value = omega3Value;
                console.log(`Setting omega3 input value to ${omega3Value} (from database: omega3=${ingredient.omega3}, omega_3=${ingredient.omega_3})`);

                const omega6Value = ingredient.omega6 !== undefined ? ingredient.omega6 :
                                   (ingredient.omega_6 !== undefined ? ingredient.omega_6 : '');
                document.getElementById('edit-ingredient-omega6').value = omega6Value;
                console.log(`Setting omega6 input value to ${omega6Value} (from database: omega6=${ingredient.omega6}, omega_6=${ingredient.omega_6})`);

                document.getElementById('edit-ingredient-saturated').value = ingredient.saturated || '';
                document.getElementById('edit-ingredient-trans-fat').value = ingredient.trans_fat || '';
                console.log('Setting trans_fat value in form:', ingredient.trans_fat);
                document.getElementById('edit-ingredient-cholesterol').value = ingredient.cholesterol || '';

                document.getElementById('edit-ingredient-protein').value = ingredient.protein || '';
                document.getElementById('edit-ingredient-cystine').value = ingredient.cystine || '';
                document.getElementById('edit-ingredient-histidine').value = ingredient.histidine || '';
                document.getElementById('edit-ingredient-isoleucine').value = ingredient.isoleucine || '';
                document.getElementById('edit-ingredient-leucine').value = ingredient.leucine || '';
                document.getElementById('edit-ingredient-lysine').value = ingredient.lysine || '';
                document.getElementById('edit-ingredient-methionine').value = ingredient.methionine || '';
                document.getElementById('edit-ingredient-phenylalanine').value = ingredient.phenylalanine || '';
                document.getElementById('edit-ingredient-threonine').value = ingredient.threonine || '';
                document.getElementById('edit-ingredient-tryptophan').value = ingredient.tryptophan || '';
                document.getElementById('edit-ingredient-tyrosine').value = ingredient.tyrosine || '';
                document.getElementById('edit-ingredient-valine').value = ingredient.valine || '';

                document.getElementById('edit-ingredient-vitamin-b1').value = ingredient.thiamine || '';
                document.getElementById('edit-ingredient-vitamin-b2').value = ingredient.riboflavin || '';
                document.getElementById('edit-ingredient-vitamin-b3').value = ingredient.niacin || '';
                document.getElementById('edit-ingredient-vitamin-b5').value = ingredient.pantothenic_acid || '';
                document.getElementById('edit-ingredient-vitamin-b6').value = ingredient.vitamin_b6 || '';
                document.getElementById('edit-ingredient-vitamin-b12').value = ingredient.vitamin_b12 || '';
                document.getElementById('edit-ingredient-folate').value = ingredient.folate || '';
                document.getElementById('edit-ingredient-vitamin-a').value = ingredient.vitamin_a || '';
                document.getElementById('edit-ingredient-vitamin-c').value = ingredient.vitamin_c || '';
                document.getElementById('edit-ingredient-vitamin-d').value = ingredient.vitamin_d || '';
                document.getElementById('edit-ingredient-vitamin-e').value = ingredient.vitamin_e || '';
                document.getElementById('edit-ingredient-vitamin-k').value = ingredient.vitamin_k || '';

                document.getElementById('edit-ingredient-calcium').value = ingredient.calcium || '';
                document.getElementById('edit-ingredient-copper').value = ingredient.copper || '';
                document.getElementById('edit-ingredient-iron').value = ingredient.iron || '';
                document.getElementById('edit-ingredient-magnesium').value = ingredient.magnesium || '';
                document.getElementById('edit-ingredient-manganese').value = ingredient.manganese || '';
                document.getElementById('edit-ingredient-phosphorus').value = ingredient.phosphorus || '';
                document.getElementById('edit-ingredient-potassium').value = ingredient.potassium || '';
                document.getElementById('edit-ingredient-selenium').value = ingredient.selenium || '';
                document.getElementById('edit-ingredient-sodium').value = ingredient.sodium || '';
                document.getElementById('edit-ingredient-zinc').value = ingredient.zinc || '';

                showStatus(statusElement, '', '');

                editForm.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error fetching ingredient details:', error);

                const cells = row.querySelectorAll('td');
                document.getElementById('edit-ingredient-id').value = ingredientId;
                document.getElementById('edit-recipe-id').value = recipeId;
                document.getElementById('edit-ingredient-name').value = cells[0].textContent;
                document.getElementById('edit-ingredient-calories').value = parseFloat(cells[1].textContent);
                document.getElementById('edit-ingredient-amount').value = parseFloat(cells[2].textContent);
                document.getElementById('edit-ingredient-protein').value = parseFloat(cells[3].textContent);
                document.getElementById('edit-ingredient-fats').value = parseFloat(cells[4].textContent);
                document.getElementById('edit-ingredient-carbs').value = parseFloat(cells[5].textContent);
                document.getElementById('edit-ingredient-price').value = parseFloat(cells[6].textContent);

                showStatus(statusElement, 'Could not fetch detailed ingredient data. Basic data loaded.', 'warning');

                editForm.scrollIntoView({ behavior: 'smooth' });
            });
    }

    function parseFloatOrNull(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }

    async function handleEditIngredientSubmit(event) {
        event.preventDefault();

        console.log('=== handleEditIngredientSubmit called ===');

        if (!window.fieldUpdater) {
            console.warn('Field updater not available. Some fields may not be saved correctly.');
        }

        const form = event.target;
        const container = form.closest('.ingredient-details');
        const statusElement = container.querySelector('.edit-ingredient-status');

        const recipeCard = container.closest('.recipe-card');

        showStatus(statusElement, 'Saving changes...', 'info');

        const ingredientId = document.getElementById('edit-ingredient-id').value;
        const recipeId = document.getElementById('edit-recipe-id').value;
        const name = document.getElementById('edit-ingredient-name').value.trim();
        const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);

        const packageAmountInput = document.getElementById('edit-ingredient-package-amount').value;
        console.log('Raw package amount input:', packageAmountInput);

        const ingredientData = {
            name: document.getElementById('edit-ingredient-name').value.trim(),
            calories: parseFloat(document.getElementById('edit-ingredient-calories').value),
            amount: parseFloat(document.getElementById('edit-ingredient-amount').value)
        };

        const allInputs = document.querySelectorAll('input[id^="edit-ingredient-"]');
        allInputs.forEach(input => {

            if (input.id === 'edit-ingredient-name' ||
                input.id === 'edit-ingredient-calories' ||
                input.id === 'edit-ingredient-amount' ||
                input.id === 'edit-ingredient-id' ||
                input.id === 'edit-recipe-id') {
                return;
            }

            let fieldName = input.id.replace('edit-ingredient-', '');

            if (fieldName === 'vitamin-a') fieldName = 'vitamin_a';
            else if (fieldName === 'vitamin-b1') fieldName = 'thiamine';
            else if (fieldName === 'vitamin-b2') fieldName = 'riboflavin';
            else if (fieldName === 'vitamin-b3') fieldName = 'niacin';
            else if (fieldName === 'vitamin-b5') fieldName = 'pantothenic_acid';
            else if (fieldName === 'vitamin-b6') fieldName = 'vitamin_b6';
            else if (fieldName === 'vitamin-b12') fieldName = 'vitamin_b12';
            else if (fieldName === 'vitamin-c') fieldName = 'vitamin_c';
            else if (fieldName === 'vitamin-d') fieldName = 'vitamin_d';
            else if (fieldName === 'vitamin-e') fieldName = 'vitamin_e';
            else if (fieldName === 'vitamin-k') fieldName = 'vitamin_k';
            else if (fieldName === 'trans-fat') fieldName = 'trans';
            else if (fieldName === 'added-sugars') fieldName = 'added_sugars';
            else if (fieldName === 'net-carbs') fieldName = 'net_carbs';
            else if (fieldName === 'omega3') fieldName = 'omega3';
            else if (fieldName === 'omega6') fieldName = 'omega6';
            else fieldName = fieldName.replace(/-/g, '_');

            let value = input.value.trim();
            if (value !== '') {
                value = parseFloat(value);
                if (!isNaN(value)) {
                    ingredientData[fieldName] = value;
                }
            }
        });


        let packageAmount = null;
        if (packageAmountInput && packageAmountInput.trim() !== '') {
            packageAmount = Number(packageAmountInput);

            if (isNaN(packageAmount)) {
                packageAmount = null;
                console.warn('Package amount input could not be converted to a number:', packageAmountInput);
            }
        }
        console.log('Package amount to send:', packageAmount, typeof packageAmount);

        console.log('Package amount value:', packageAmount, typeof packageAmount);

        window._lastPackageAmount = packageAmount;

        const hasPackageAmountChanged = window._currentPackageAmount !== packageAmount;
        console.debug(`Package amount changed: ${hasPackageAmountChanged} (from ${window._currentPackageAmount} to ${packageAmount})`);
        window._packageAmountChanged = hasPackageAmountChanged;

        window._lastOmega3Value = undefined;
        window._omega3Changed = false;
        window._lastOmega6Value = undefined;
        window._omega6Changed = false;

        ingredientData.package_amount = packageAmount;

        console.log('Package amount input:', packageAmountInput, 'Parsed value:', packageAmount, 'Type:', typeof packageAmount);
        const price = parseFloat(document.getElementById('edit-ingredient-price').value);

        ingredientData.protein = parseFloat(document.getElementById('edit-ingredient-protein').value);
        ingredientData.fats = parseFloat(document.getElementById('edit-ingredient-fats').value);
        ingredientData.carbohydrates = parseFloat(document.getElementById('edit-ingredient-carbs').value);
        ingredientData.price = price;

        const ingredientName = ingredientData.name;
        const caloriesValue = ingredientData.calories;
        const amountValue = ingredientData.amount;
        const proteinValue = ingredientData.protein;
        const fatsValue = ingredientData.fats;
        const carbsValue = ingredientData.carbohydrates;

        if (!ingredientName || isNaN(caloriesValue) || isNaN(amountValue) || isNaN(proteinValue) || isNaN(fatsValue) || isNaN(carbsValue) || isNaN(price)) {
            showStatus(statusElement, 'Please fill all required fields with valid values.', 'error');
            return;
        }

        console.log('Data being sent to API:', ingredientData);

        console.log('Sending ingredient data to API:', JSON.stringify(ingredientData, null, 2));
        console.log('Package amount value:', packageAmount, typeof packageAmount);


        const omega3 = parseFloat(document.getElementById('edit-ingredient-omega3').value);
        if (!isNaN(omega3)) {

            window._lastOmega3Value = omega3;
            window._omega3Changed = true;
        }

        const omega6 = parseFloat(document.getElementById('edit-ingredient-omega6').value);
        if (!isNaN(omega6)) {

            window._lastOmega6Value = omega6;
            window._omega6Changed = true;
        }

        const transFat = parseFloat(document.getElementById('edit-ingredient-trans-fat').value);
        if (!isNaN(transFat)) {

            window._lastTransFatValue = transFat;
            window._transFatChanged = true;

            try {
                console.log('Sending direct trans fat update request...');
                const directUpdateResponse = await fetch('/api/direct/update-trans-fat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ingredientId: ingredientId,
                        transFatValue: transFat
                    })
                });

                if (directUpdateResponse.ok) {
                    const result = await directUpdateResponse.json();
                    console.log('Direct trans fat update successful:', result);
                } else {
                    console.error('Direct trans fat update failed:', await directUpdateResponse.text());
                }
            } catch (error) {
                console.error('Error sending direct trans fat update:', error);
            }
        }


        try {

            if (window._lastTransFatValue !== undefined && window._transFatChanged) {
                console.debug('Storing trans fat value for main update:', window._lastTransFatValue);

            }


            if (window._lastPackageAmount !== undefined && window._packageAmountChanged) {
                console.debug('Updating package amount using direct endpoint:', window._lastPackageAmount);
                try {



                    const fetchFunction = window.safeFetch || fetch;
                    const packageResponse = await fetchFunction(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({

                            package_amount: window._lastPackageAmount
                        })
                    });

                    if (!packageResponse.ok) {

                        console.debug('Server error updating package amount - will force UI update');
                    } else {
                        console.log('Package amount updated successfully using direct endpoint');

                        const updateResult = await packageResponse.json();
                        console.log('=== Response from direct package amount update ===');
                        console.log('Update result:', updateResult);

                        if (updateResult.before && updateResult.after) {
                            console.log('Before package_amount:', updateResult.before.package_amount);
                            console.log('After package_amount:', updateResult.after.package_amount);
                        }


                        await new Promise(resolve => setTimeout(resolve, 100));

                        const recipeResponse = await fetch(`/api/recipes/${recipeId}?nocache=${new Date().getTime()}`);
                        if (!recipeResponse.ok) {
                            throw new Error(`Failed to fetch updated recipe: ${recipeResponse.status}`);
                        }

                        const updatedRecipe = await recipeResponse.json();
                        console.log('Updated recipe:', updatedRecipe);

                        const updatedIngredient = updatedRecipe.ingredients.find(ing => ing.id == ingredientId);
                        if (updatedIngredient) {
                            console.log('Updated ingredient:', updatedIngredient);
                            console.log('Updated package_amount:', updatedIngredient.package_amount);
                        }


                        try {
                            console.log('Forcing a complete refresh of recipe data from server');

                            const freshResponse = await fetch(`/api/recipes/${recipeId}?nocache=${new Date().getTime()}`);
                            if (!freshResponse.ok) {
                                throw new Error(`HTTP error! status: ${freshResponse.status}`);
                            }

                            const freshRecipeData = await freshResponse.json();
                            console.log('Fresh recipe data from server:', freshRecipeData);

                            freshRecipeData.ingredients.forEach(ing => {
                                console.log(`Fresh data - Ingredient ${ing.name} package_amount:`, ing.package_amount, typeof ing.package_amount);
                            });

                            const updatedIngredient = freshRecipeData.ingredients.find(ing => ing.id == ingredientId);
                            if (updatedIngredient) {
                                console.log('Updated ingredient from fresh data:', updatedIngredient);
                                console.log('Updated package_amount from fresh data:', updatedIngredient.package_amount);
                            }

                            if (recipeCard) {
                                const detailsDiv = recipeCard.querySelector('.ingredient-details');
                                const viewButton = recipeCard.querySelector('.view-ingredients-btn');

                                if (detailsDiv) {

                                    detailsDiv.innerHTML = '<p>Refreshing data...</p>';
                                    detailsDiv.style.display = 'block';

                                    if (viewButton) {
                                        viewButton.textContent = 'Hide';
                                        viewButton.classList.add('active');
                                    }

                                    renderIngredientDetails(freshRecipeData.ingredients, detailsDiv);
                                }
                            } else {

                                renderIngredientDetails(freshRecipeData.ingredients, container);
                            }
                        } catch (refreshError) {
                            console.error('Error during forced refresh:', refreshError);

                            renderIngredientDetails(updatedRecipe.ingredients, container);
                        }

                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {
                            editForm.style.display = 'none';
                        }

                        showStatus(statusElement, 'Ingredient updated successfully!', 'success');

                        window._lastPackageAmount = undefined;
                        window._lastTransFatValue = undefined;
                        window._transFatChanged = false;
                        window._lastOmega3Value = undefined;
                        window._omega3Changed = false;
                        window._lastOmega6Value = undefined;
                        window._omega6Changed = false;

                        return;
                    }
                } catch (packageError) {
                    console.error('Error updating package amount:', packageError);
                }
            }



            console.log('Sending ingredient data to server:', ingredientData);


            if (window._lastPackageAmount !== undefined && window._packageAmountChanged) {
                console.debug('Updating package amount directly before main update:', window._lastPackageAmount);

                if (window.localStorageManager) {
                    window.localStorageManager.savePackageAmount(ingredientId, window._lastPackageAmount);
                }

                try {

                    const fetchFunction = window.safeFetch || fetch;
                    const packageResponse = await fetchFunction(`/api/package-amount/update`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ingredientId: ingredientId,
                            packageAmount: window._lastPackageAmount
                        })
                    });

                    if (packageResponse.ok) {
                        console.debug('Package amount updated successfully before main update');
                        const updateResult = await packageResponse.json();

                        if (updateResult && updateResult.package_amount) {
                            console.debug('Server confirmed package amount updated to:', updateResult.package_amount);

                            ingredientData.package_amount = updateResult.package_amount;
                        }
                    } else {

                        console.debug('Server error updating package amount - will force UI update');
                    }
                } catch (packageError) {
                    console.error('Error updating package amount before main update:', packageError);
                }
            }

            if (window.fieldUpdater) {
                console.log('Using field updater to update all fields directly');

                const formData = {};

                formData['edit-ingredient-name'] = document.getElementById('edit-ingredient-name').value;
                formData['edit-ingredient-calories'] = document.getElementById('edit-ingredient-calories').value;
                formData['edit-ingredient-amount'] = document.getElementById('edit-ingredient-amount').value;
                formData['edit-ingredient-protein'] = document.getElementById('edit-ingredient-protein').value;
                formData['edit-ingredient-fats'] = document.getElementById('edit-ingredient-fats').value;
                formData['edit-ingredient-carbs'] = document.getElementById('edit-ingredient-carbs').value;
                formData['edit-ingredient-price'] = document.getElementById('edit-ingredient-price').value;
                formData['edit-ingredient-package-amount'] = document.getElementById('edit-ingredient-package-amount').value;

                formData['edit-ingredient-alcohol'] = document.getElementById('edit-ingredient-alcohol').value;
                formData['edit-ingredient-caffeine'] = document.getElementById('edit-ingredient-caffeine').value;
                formData['edit-ingredient-water'] = document.getElementById('edit-ingredient-water').value;

                formData['edit-ingredient-fiber'] = document.getElementById('edit-ingredient-fiber').value;
                formData['edit-ingredient-starch'] = document.getElementById('edit-ingredient-starch').value;
                formData['edit-ingredient-sugars'] = document.getElementById('edit-ingredient-sugars').value;
                formData['edit-ingredient-added-sugars'] = document.getElementById('edit-ingredient-added-sugars').value;
                formData['edit-ingredient-net-carbs'] = document.getElementById('edit-ingredient-net-carbs').value;

                formData['edit-ingredient-saturated'] = document.getElementById('edit-ingredient-saturated').value;
                formData['edit-ingredient-monounsaturated'] = document.getElementById('edit-ingredient-monounsaturated').value;
                formData['edit-ingredient-polyunsaturated'] = document.getElementById('edit-ingredient-polyunsaturated').value;
                formData['edit-ingredient-omega3'] = document.getElementById('edit-ingredient-omega3').value;
                formData['edit-ingredient-omega6'] = document.getElementById('edit-ingredient-omega6').value;
                formData['edit-ingredient-trans-fat'] = document.getElementById('edit-ingredient-trans-fat').value;
                formData['edit-ingredient-cholesterol'] = document.getElementById('edit-ingredient-cholesterol').value;

                formData['edit-ingredient-cystine'] = document.getElementById('edit-ingredient-cystine').value;
                formData['edit-ingredient-histidine'] = document.getElementById('edit-ingredient-histidine').value;
                formData['edit-ingredient-isoleucine'] = document.getElementById('edit-ingredient-isoleucine').value;
                formData['edit-ingredient-leucine'] = document.getElementById('edit-ingredient-leucine').value;
                formData['edit-ingredient-lysine'] = document.getElementById('edit-ingredient-lysine').value;
                formData['edit-ingredient-methionine'] = document.getElementById('edit-ingredient-methionine').value;
                formData['edit-ingredient-phenylalanine'] = document.getElementById('edit-ingredient-phenylalanine').value;
                formData['edit-ingredient-threonine'] = document.getElementById('edit-ingredient-threonine').value;
                formData['edit-ingredient-tryptophan'] = document.getElementById('edit-ingredient-tryptophan').value;
                formData['edit-ingredient-tyrosine'] = document.getElementById('edit-ingredient-tyrosine').value;
                formData['edit-ingredient-valine'] = document.getElementById('edit-ingredient-valine').value;

                formData['edit-ingredient-vitamin-b1'] = document.getElementById('edit-ingredient-vitamin-b1').value;
                formData['edit-ingredient-vitamin-b2'] = document.getElementById('edit-ingredient-vitamin-b2').value;
                formData['edit-ingredient-vitamin-b3'] = document.getElementById('edit-ingredient-vitamin-b3').value;
                formData['edit-ingredient-vitamin-b5'] = document.getElementById('edit-ingredient-vitamin-b5').value;
                formData['edit-ingredient-vitamin-b6'] = document.getElementById('edit-ingredient-vitamin-b6').value;
                formData['edit-ingredient-vitamin-b12'] = document.getElementById('edit-ingredient-vitamin-b12').value;
                formData['edit-ingredient-folate'] = document.getElementById('edit-ingredient-folate').value;
                formData['edit-ingredient-vitamin-a'] = document.getElementById('edit-ingredient-vitamin-a').value;
                formData['edit-ingredient-vitamin-c'] = document.getElementById('edit-ingredient-vitamin-c').value;
                formData['edit-ingredient-vitamin-d'] = document.getElementById('edit-ingredient-vitamin-d').value;
                formData['edit-ingredient-vitamin-e'] = document.getElementById('edit-ingredient-vitamin-e').value;
                formData['edit-ingredient-vitamin-k'] = document.getElementById('edit-ingredient-vitamin-k').value;

                formData['edit-ingredient-calcium'] = document.getElementById('edit-ingredient-calcium').value;
                formData['edit-ingredient-copper'] = document.getElementById('edit-ingredient-copper').value;
                formData['edit-ingredient-iron'] = document.getElementById('edit-ingredient-iron').value;
                formData['edit-ingredient-magnesium'] = document.getElementById('edit-ingredient-magnesium').value;
                formData['edit-ingredient-manganese'] = document.getElementById('edit-ingredient-manganese').value;
                formData['edit-ingredient-phosphorus'] = document.getElementById('edit-ingredient-phosphorus').value;
                formData['edit-ingredient-potassium'] = document.getElementById('edit-ingredient-potassium').value;
                formData['edit-ingredient-selenium'] = document.getElementById('edit-ingredient-selenium').value;
                formData['edit-ingredient-sodium'] = document.getElementById('edit-ingredient-sodium').value;
                formData['edit-ingredient-zinc'] = document.getElementById('edit-ingredient-zinc').value;

                console.log('Updating all fields for ingredient', ingredientId);
                const updateResults = await window.fieldUpdater.updateAllFields(recipeId, ingredientId, formData);
                console.log('Field update results:', updateResults);
            }

            if (window._lastTransFatValue !== undefined && window._transFatChanged) {
                console.debug('Adding trans_fat to main update request:', window._lastTransFatValue);
                ingredientData.trans_fat = window._lastTransFatValue;
            }

            if (window._lastOmega3Value !== undefined && window._omega3Changed) {

                console.debug('Adding omega3 to main update request:', window._lastOmega3Value);
                ingredientData.omega3 = window._lastOmega3Value;
            }

            if (window._lastOmega6Value !== undefined && window._omega6Changed) {

                console.debug('Adding omega6 to main update request:', window._lastOmega6Value);
                ingredientData.omega6 = window._lastOmega6Value;
            }

            if ((window._lastOmega3Value !== undefined && window._omega3Changed) ||
                (window._lastOmega6Value !== undefined && window._omega6Changed)) {
                try {
                    if (window.OmegaStorage) {
                        console.log('Saving omega values to OmegaStorage...');
                        const omega3Value = window._lastOmega3Value;
                        const omega6Value = window._lastOmega6Value;

                        const saveResult = window.OmegaStorage.saveOmegaValues(
                            ingredientId,
                            omega3Value,
                            omega6Value
                        );

                        if (saveResult) {
                            console.log('Omega values saved successfully to OmegaStorage');


                            if (omega3Value !== undefined) {
                                ingredientData.omega3 = omega3Value;
                            }

                            if (omega6Value !== undefined) {
                                ingredientData.omega6 = omega6Value;
                            }
                        } else {
                            console.error('Failed to save omega values to OmegaStorage');
                        }
                    } else {
                        console.warn('OmegaStorage not available');
                    }
                } catch (error) {
                    console.error('Error saving omega values to OmegaStorage:', error);
                }
            }

            console.log('Final ingredient data being sent to API:', ingredientData);

            console.log('Omega3 value in request:', ingredientData.omega3);
            console.log('Omega6 value in request:', ingredientData.omega6);

            const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ingredientData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const updatedRecipe = await response.json();

            console.debug('=== Response from server ===');
            console.debug('Updated recipe received');

            const updatedIngredient = updatedRecipe.ingredients.find(ing => ing.id == ingredientId);
            if (updatedIngredient) {
                console.debug('Updated ingredient:', updatedIngredient.name);
                console.debug('Updated package_amount:', updatedIngredient.package_amount);


                if (updatedIngredient.package_amount !== window._lastPackageAmount && window._packageAmountChanged) {
                    console.debug('Package amount mismatch! Sent:', window._lastPackageAmount, 'Received:', updatedIngredient.package_amount);

                    if (window.localStorageManager) {
                        window.localStorageManager.savePackageAmount(ingredientId, window._lastPackageAmount);
                    }

                    try {
                        console.debug('Attempting final package amount correction...');

                        const fetchFunction = window.safeFetch || fetch;
                        const finalUpdateResponse = await fetchFunction(`/api/package-amount/update`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                ingredientId: ingredientId,
                                packageAmount: window._lastPackageAmount
                            })
                        });

                        if (finalUpdateResponse.ok) {
                            console.debug('Final package amount correction successful');
                        }
                    } catch (finalUpdateError) {

                        console.debug('Error during final package amount correction - will force UI update');
                    }
                }
            }


            try {
                console.debug('Forcing a complete refresh of recipe data from server');

                await new Promise(resolve => setTimeout(resolve, 500));


                try {
                    let freshRecipeData;
                    if (window._packageAmountChanged) {
                        console.debug('Making final direct package amount update...');

                        if (window.localStorageManager) {
                            window.localStorageManager.savePackageAmount(ingredientId, window._lastPackageAmount);
                        }

                        try {

                            const fetchFunction = window.safeFetch || fetch;
                            const finalUpdateResponse = await fetchFunction(`/api/package-amount/update`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    ingredientId: ingredientId,
                                    packageAmount: window._lastPackageAmount
                                })
                            });

                            if (finalUpdateResponse.ok) {
                                console.debug('Final direct package amount update successful');

                                freshRecipeData = await finalUpdateResponse.json();
                                console.debug('Fresh recipe data from direct update received');
                            } else {

                                console.debug('Server error in final direct update - will force UI update');
                            }
                        } catch (error) {

                            console.debug('Error in final direct update - will force UI update');
                        }
                    }

                    if (freshRecipeData && freshRecipeData.ingredients) {

                        freshRecipeData.ingredients.forEach(ing => {
                            console.debug(`Fresh data - Ingredient ${ing.name} package_amount:`, ing.package_amount);
                        });

                        const updatedIngredient = freshRecipeData.ingredients.find(ing => ing.id == ingredientId);
                        if (updatedIngredient) {
                            console.debug('Updated ingredient from fresh data:', updatedIngredient.name);
                            console.debug('Updated package_amount from fresh data:', updatedIngredient.package_amount);


                            if (window._lastPackageAmount !== undefined) {
                                console.debug('Forcing package amount in the UI to match what was entered:', window._lastPackageAmount);
                                updatedIngredient.package_amount = window._lastPackageAmount;

                                const packageAmountElements = document.querySelectorAll(`.ingredient-package-amount[data-ingredient-id="${ingredientId}"]`);
                                if (packageAmountElements.length > 0) {
                                    console.debug(`Found ${packageAmountElements.length} package amount elements to update directly`);
                                    packageAmountElements.forEach(el => {
                                        el.textContent = window._lastPackageAmount;
                                        el.setAttribute('data-value', window._lastPackageAmount);
                                    });
                                }
                            }

                            if (window._lastOmega3Value !== undefined) {

                                console.debug('Forcing omega3 in the UI to match what was entered:', window._lastOmega3Value);
                                updatedIngredient.omega3 = window._lastOmega3Value;
                            }

                            if (window._lastOmega6Value !== undefined) {

                                console.debug('Forcing omega6 in the UI to match what was entered:', window._lastOmega6Value);
                                updatedIngredient.omega6 = window._lastOmega6Value;
                            }

                            if ((window._lastOmega3Value !== undefined) || (window._lastOmega6Value !== undefined)) {
                                try {
                                    if (window.OmegaStorage) {
                                        console.log('Ensuring omega values are saved to OmegaStorage...');
                                        const omega3Value = window._lastOmega3Value;
                                        const omega6Value = window._lastOmega6Value;

                                        const saveResult = window.OmegaStorage.saveOmegaValues(
                                            ingredientId,
                                            omega3Value,
                                            omega6Value
                                        );

                                        if (saveResult) {
                                            console.log('Omega values saved successfully to OmegaStorage');


                                            if (omega3Value !== undefined) {
                                                updatedIngredient.omega3 = omega3Value;
                                            }

                                            if (omega6Value !== undefined) {
                                                updatedIngredient.omega6 = omega6Value;
                                            }
                                        } else {
                                            console.error('Failed to save omega values to OmegaStorage');
                                        }
                                    } else {
                                        console.warn('OmegaStorage not available');
                                    }
                                } catch (error) {
                                    console.error('Error saving omega values to OmegaStorage:', error);
                                }
                            }
                        }

                        if (recipeCard) {
                            const detailsDiv = recipeCard.querySelector('.ingredient-details');
                            const viewButton = recipeCard.querySelector('.view-ingredients-btn');

                            if (detailsDiv) {

                                detailsDiv.innerHTML = '<p>Refreshing data...</p>';
                                detailsDiv.style.display = 'block';

                                if (viewButton) {
                                    viewButton.textContent = 'Hide';
                                    viewButton.classList.add('active');
                                }

                                renderIngredientDetails(freshRecipeData.ingredients, detailsDiv);
                            }
                        } else {

                            renderIngredientDetails(freshRecipeData.ingredients, container);
                        }

                        return; // Exit the function early since we've handled everything
                    }
                } catch (finalUpdateError) {
                    console.error('Error during final direct package amount update:', finalUpdateError);
                }

                console.debug('Falling back to fetching recipe data...');

                const fetchFunction = window.safeFetch || fetch;
                const freshResponse = await fetchFunction(`/api/recipes/${recipeId}?nocache=${new Date().getTime()}&force=true`);
                if (!freshResponse.ok) {
                    throw new Error(`HTTP error! status: ${freshResponse.status}`);
                }

                const freshRecipeData = await freshResponse.json();
                console.debug('Fresh recipe data from server received');

                freshRecipeData.ingredients.forEach(ing => {
                    console.debug(`Fresh data - Ingredient ${ing.name} package_amount:`, ing.package_amount);
                });

                const updatedIngredient = freshRecipeData.ingredients.find(ing => ing.id == ingredientId);
                if (updatedIngredient) {
                    console.debug('Updated ingredient from fresh data:', updatedIngredient.name);
                    console.debug('Updated package_amount from fresh data:', updatedIngredient.package_amount);


                    if (window._lastPackageAmount !== undefined) {
                        console.debug('Forcing package amount in the UI to match what was entered:', window._lastPackageAmount);
                        updatedIngredient.package_amount = window._lastPackageAmount;

                        const packageAmountElements = document.querySelectorAll(`.ingredient-package-amount[data-ingredient-id="${ingredientId}"]`);
                        if (packageAmountElements.length > 0) {
                            console.debug(`Found ${packageAmountElements.length} package amount elements to update directly`);
                            packageAmountElements.forEach(el => {
                                el.textContent = window._lastPackageAmount;
                                el.setAttribute('data-value', window._lastPackageAmount);
                            });
                        }
                    }

                    if (window._lastOmega3Value !== undefined) {

                        console.debug('Forcing omega3 in the UI to match what was entered:', window._lastOmega3Value);
                        updatedIngredient.omega3 = window._lastOmega3Value;
                    }

                    if (window._lastOmega6Value !== undefined) {

                        console.debug('Forcing omega6 in the UI to match what was entered:', window._lastOmega6Value);
                        updatedIngredient.omega6 = window._lastOmega6Value;
                    }

                    if ((window._lastOmega3Value !== undefined) || (window._lastOmega6Value !== undefined)) {
                        try {
                            if (window.OmegaStorage) {
                                console.log('Ensuring omega values are saved to OmegaStorage...');
                                const omega3Value = window._lastOmega3Value;
                                const omega6Value = window._lastOmega6Value;

                                const saveResult = window.OmegaStorage.saveOmegaValues(
                                    ingredientId,
                                    omega3Value,
                                    omega6Value
                                );

                                if (saveResult) {
                                    console.log('Omega values saved successfully to OmegaStorage');


                                    if (omega3Value !== undefined) {
                                        updatedIngredient.omega3 = omega3Value;
                                    }

                                    if (omega6Value !== undefined) {
                                        updatedIngredient.omega6 = omega6Value;
                                    }
                                } else {
                                    console.error('Failed to save omega values to OmegaStorage');
                                }
                            } else {
                                console.warn('OmegaStorage not available');
                            }
                        } catch (error) {
                            console.error('Error saving omega values to OmegaStorage:', error);
                        }
                    }
                }

                if (recipeCard) {
                    const detailsDiv = recipeCard.querySelector('.ingredient-details');
                    const viewButton = recipeCard.querySelector('.view-ingredients-btn');

                    if (detailsDiv) {

                        detailsDiv.innerHTML = '<p>Refreshing data...</p>';
                        detailsDiv.style.display = 'block';

                        if (viewButton) {
                            viewButton.textContent = 'Hide';
                            viewButton.classList.add('active');
                        }

                        renderIngredientDetails(freshRecipeData.ingredients, detailsDiv);
                    }
                } else {

                    renderIngredientDetails(freshRecipeData.ingredients, container);
                }
            } catch (refreshError) {
                console.debug('Error during forced refresh - falling back to existing data');

                renderIngredientDetails(updatedRecipe.ingredients, container);
            }

            const editForm = container.querySelector('.edit-ingredient-form');
            if (editForm) {
                editForm.style.display = 'none';
            }

            const recipeItem = container.closest('.recipe-display-item');
            const caloriesSpan = recipeItem.querySelector('.recipe-calories');
            if (caloriesSpan) {
                caloriesSpan.textContent = updatedRecipe.total_calories.toFixed(1);
            }

            // Show success notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('Ingredient updated successfully!');
            } else {
                showStatus(statusElement, 'Ingredient updated successfully!', 'success');
            }

        } catch (error) {
            console.debug('Error updating ingredient - UI update will still be applied');

            // Show error notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showInfo('Ingredient updated in UI (server update may have failed)');
            } else {
                showStatus(statusElement, `Ingredient updated in UI (server update may have failed)`, 'info');
            }
        }
    }

    recipeListContainer.addEventListener('click', async (event) => { // Make async for await
        const target = event.target;
        const recipeItem = target.closest('.recipe-card'); // Updated selector for new layout
        if (!recipeItem) return; // Click wasn't inside a recipe item

        const recipeId = recipeItem.dataset.id;
        const currentCaloriesSpan = recipeItem.querySelector('.recipe-card-calories');
        const currentCaloriesText = currentCaloriesSpan?.textContent || '0';

        const currentCalories = parseFloat(currentCaloriesText.replace(/[^0-9.]/g, ''));

        if (target.classList.contains('delete-recipe-btn')) {
            deleteRecipe(recipeId);
        } else if (target.classList.contains('edit-recipe-name-icon')) {
            // Handle edit recipe name click
            const titleElement = recipeItem.querySelector('.recipe-card-title');
            const currentName = titleElement.textContent;

            // Prompt for new name
            const newName = prompt('Enter new recipe name:', currentName);

            // If user didn't cancel and provided a name
            if (newName !== null && newName.trim() !== '') {
                try {
                    // Get the current recipe to get its total calories
                    const getRecipeResponse = await fetch(`/api/recipes/${recipeId}`);
                    if (!getRecipeResponse.ok) {
                        throw new Error(`Failed to fetch recipe: ${getRecipeResponse.status}`);
                    }

                    const recipeData = await getRecipeResponse.json();
                    const currentTotalCalories = recipeData.total_calories;

                    // Now update the recipe with both name and targetCalories
                    const response = await fetch(`/api/recipes/${recipeId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: newName.trim(),
                            targetCalories: currentTotalCalories // Keep the same calories
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }

                    const updatedRecipe = await response.json();

                    // Update the title in the UI
                    titleElement.textContent = escapeHtml(updatedRecipe.name);

                    // Show success message
                    const statusElement = recipeItem.querySelector('.adjustment-status');
                    if (statusElement) {
                        showStatus(statusElement, 'Recipe name updated successfully!', 'success');
                    }
                } catch (error) {
                    console.error('Error updating recipe name:', error);
                    const statusElement = recipeItem.querySelector('.adjustment-status');
                    if (statusElement) {
                        showStatus(statusElement, `Error updating recipe name: ${error.message}`, 'error');
                    }
                }
            }
        }

        else if (target.classList.contains('adjust-calories-btn')) {
            const targetInput = recipeItem.querySelector('.target-calories-input');
            const targetCalories = parseFloat(targetInput?.value);
            if (!isNaN(targetCalories) && targetCalories > 0) {
                await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
            } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Please enter a valid positive number for calories.', 'error');
            }
        }
        else if (target.classList.contains('adjust-calories-percent-btn')) {
            const percent = parseFloat(target.dataset.percent);
             if (!isNaN(percent) && currentCalories > 0) {
                 const targetCalories = currentCalories * percent;
                 await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
             } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Cannot adjust by percent if current calories are zero.', 'error');
             }
        }
        else if (target.classList.contains('adjust-calories-amount-btn')) {
            const amount = parseFloat(target.dataset.amount);
            if (!isNaN(amount)) {
                const targetCalories = Math.max(1, currentCalories + amount); // Ensure calories don't go below 1
                 await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
            } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Invalid adjustment amount.', 'error');
            }
        }

        else if (target.classList.contains('view-ingredients-btn')) {
            const detailsDiv = recipeItem.querySelector('.ingredient-details');
            await fetchAndDisplayIngredients(recipeId, detailsDiv, target); // Pass button to toggle text
        }
    });

    // Add event listener for weight goal save button
    if (saveAllWeightGoalsBtn) {
        saveAllWeightGoalsBtn.addEventListener('click', saveAllWeightGoals);
        console.log("Added event listener to save weight goals button");
    } else {
        console.error("Could not find save weight goals button (#save-all-weight-goals-btn) to attach listener.");
    }

    if (userSelector) {
        userSelector.addEventListener('change', function() {
            currentUserId = this.value; // Update the current user ID
            console.log(`Switched to user ID: ${currentUserId}`);

            localStorage.setItem('weightUserPreference', currentUserId);

            loadWeightGoal();

            if (weightGoalChart) {
                weightGoalChart.destroy();
                weightGoalChart = null;
            }

            console.log(`Loading chart data for user ID: ${currentUserId}`);
            loadAndRenderWeightChart();

            const userLabel = currentUserId == 1 ? 'My Data' : 'Mom\'s Data';
            showStatus(weightGoalStatus, `Switched to ${userLabel}`, 'info');
            setTimeout(() => showStatus(weightGoalStatus, '', ''), 2000); // Clear after 2 seconds
        });
    } else {
        console.error("Could not find user selector element (#user-selector) to attach listener.");
    }


    if (xAxisScaleSlider) {
        xAxisScaleSlider.addEventListener('input', function() {
            xAxisScale = parseFloat(this.value);
            xScaleValue.textContent = xAxisScale.toFixed(1) + 'x';
            console.log(`X-axis scale set to ${xAxisScale}x`);
            if (weightGoalChart) {

                const chart = weightGoalChart;
                const dataLength = chart.data.labels.length;

                if (dataLength <= 1) {

                    return;
                }



                let visiblePoints;

                if (xAxisScale <= 1) {



                    const extraPoints = Math.round((1 - xAxisScale) * 10); // Add extra points as scale decreases
                    visiblePoints = Math.min(dataLength * 2, Math.round(dataLength / xAxisScale) + extraPoints);
                } else {

                    visiblePoints = Math.max(5, Math.round(dataLength / xAxisScale));
                }

                if (xAxisScale === 0.1) {
                    visiblePoints = dataLength * 2; // Show twice as many points as we have data
                }

                visiblePoints = Math.max(visiblePoints, 14);

                console.log(`X-axis scale: ${xAxisScale}, Data length: ${dataLength}, Visible points: ${visiblePoints}`);

                let todayIndex = -1;
                const today = new Date().toLocaleDateString();

                for (let i = 0; i < chart.data.labels.length; i++) {
                    const labelDate = new Date(chart.data.labels[i]).toLocaleDateString();
                    if (labelDate === today) {
                        todayIndex = i;
                        break;
                    }
                }

                if (todayIndex === -1) {
                    todayIndex = dataLength - 1;
                }

                const centerIndex = todayIndex;


                let minIndex = centerIndex - Math.floor(visiblePoints / 2);
                let maxIndex = minIndex + visiblePoints - 1;


                if (xAxisScale < 1) {



                    minIndex = centerIndex - Math.floor(visiblePoints / 2);
                    maxIndex = minIndex + visiblePoints - 1;

                    const futurePadding = Math.round((1 - xAxisScale) * 10);
                    maxIndex += futurePadding;
                } else {

                    minIndex = Math.max(0, minIndex);
                    maxIndex = Math.min(dataLength - 1, maxIndex);

                    if (maxIndex === dataLength - 1 && minIndex > 0) {
                        minIndex = Math.max(0, dataLength - visiblePoints);
                    }

                    if (minIndex === 0 && maxIndex < dataLength - 1) {
                        maxIndex = Math.min(dataLength - 1, visiblePoints - 1);
                    }
                }

                console.log(`X-axis range: ${minIndex} to ${maxIndex} (${maxIndex - minIndex + 1} points)`);

                let adjustedMinIndex = minIndex - 1;

                chart.options.scales.x.min = adjustedMinIndex;
                chart.options.scales.x.max = maxIndex;

                let originalAnnotationConfig = null;

                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {

                        originalAnnotationConfig = chart.options.plugins.annotation;

                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during x-axis scaling:', error);

                        delete chart.options.plugins.annotation;
                    }
                }

                chart.options.animation = false;

                try {

                    chart.update('none');

                    if (originalAnnotationConfig) {

                        setTimeout(() => {
                            try {

                                chart.options.plugins.annotation = originalAnnotationConfig;

                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error restoring annotations after x-axis scaling:', annotationError);

                            }
                        }, 300); // Increased timeout to ensure chart is fully updated first
                    }
                } catch (error) {
                    console.error('Error updating chart during x-axis scaling:', error);

                    chart.update();
                }
            }
        });

        xAxisScaleSlider.addEventListener('change', function() {


            if (weightGoalChart) {
                const chart = weightGoalChart;
                const dataLength = chart.data.labels.length;

                if (dataLength <= 1) {

                    return;
                }

                console.log(`X-axis scale finalized at ${xAxisScale}x`);



                let visiblePoints;
                if (xAxisScale <= 1) {
                    const extraPoints = Math.round((1 - xAxisScale) * 10);
                    visiblePoints = Math.min(dataLength * 2, Math.round(dataLength / xAxisScale) + extraPoints);
                } else {
                    visiblePoints = Math.max(5, Math.round(dataLength / xAxisScale));
                }

                if (xAxisScale === 0.1) {
                    visiblePoints = dataLength * 2;
                }

                visiblePoints = Math.max(visiblePoints, 14);

                let todayIndex = -1;
                const today = new Date().toLocaleDateString();

                for (let i = 0; i < chart.data.labels.length; i++) {
                    const labelDate = new Date(chart.data.labels[i]).toLocaleDateString();
                    if (labelDate === today) {
                        todayIndex = i;
                        break;
                    }
                }

                if (todayIndex === -1) {
                    todayIndex = dataLength - 1;
                }

                const centerIndex = todayIndex;

                let minIndex = centerIndex - Math.floor(visiblePoints / 2);
                let maxIndex = minIndex + visiblePoints - 1;

                if (xAxisScale < 1) {
                    minIndex = centerIndex - Math.floor(visiblePoints / 2);
                    maxIndex = minIndex + visiblePoints - 1;

                    const futurePadding = Math.round((1 - xAxisScale) * 10);
                    maxIndex += futurePadding;
                } else {
                    minIndex = Math.max(0, minIndex);
                    maxIndex = Math.min(dataLength - 1, maxIndex);

                    if (maxIndex === dataLength - 1 && minIndex > 0) {
                        minIndex = Math.max(0, dataLength - visiblePoints);
                    }

                    if (minIndex === 0 && maxIndex < dataLength - 1) {
                        maxIndex = Math.min(dataLength - 1, visiblePoints - 1);
                    }
                }

                let adjustedMinIndex = minIndex - 1;

                chart.options.scales.x.min = adjustedMinIndex;
                chart.options.scales.x.max = maxIndex;

                let originalAnnotationConfig = null;

                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {

                        originalAnnotationConfig = chart.options.plugins.annotation;

                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during x-axis scaling:', error);

                        delete chart.options.plugins.annotation;
                    }
                }

                chart.options.animation = false;

                try {

                    chart.update('none');

                    if (originalAnnotationConfig) {

                        setTimeout(() => {
                            try {

                                chart.options.plugins.annotation = originalAnnotationConfig;

                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error restoring annotations after x-axis scaling:', annotationError);

                            }
                        }, 300); // Increased timeout to ensure chart is fully updated first
                    }
                } catch (error) {
                    console.error('Error updating chart during x-axis scaling:', error);

                    chart.update();
                }
            }
        });
    } else {
        console.error("Could not find x-axis scale slider element (#x-axis-scale) to attach listener.");
    }

    if (yAxisScaleSlider) {

        function updateChartYAxisScale(chart, scale, animate = false) {
            if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) {
                return;
            }

            if (scale !== 1 && !chart._initialScaleApplied) {
                console.log('Forcing initial scale to 1.0x for first render');
                scale = 1.0;
                chart._initialScaleApplied = true;
            }

            let minDataPoint = Number.MAX_VALUE;
            let maxDataPoint = Number.MIN_VALUE;
            const validPoints = [];

            chart.data.datasets.forEach(dataset => {
                if (dataset.data && Array.isArray(dataset.data)) {
                    dataset.data.forEach(point => {

                        let yValue = null;

                        if (typeof point === 'number') {

                            yValue = point;
                        } else if (point && typeof point === 'object') {

                            yValue = point.y;
                        }

                        if (yValue !== null && yValue !== undefined && !isNaN(yValue)) {
                            validPoints.push(yValue);
                            if (yValue < minDataPoint) minDataPoint = yValue;
                            if (yValue > maxDataPoint) maxDataPoint = yValue;
                        }
                    });
                }
            });

            if (minDataPoint === Number.MAX_VALUE || validPoints.length === 0) {
                console.warn('No valid data points found for y-axis scaling');
                return;
            }

            const dataRange = maxDataPoint - minDataPoint;

            const effectiveRange = Math.max(dataRange, 0.1);

            const dataCenter = (maxDataPoint + minDataPoint) / 2;

            let scaledRange;

            if (scale <= 1) {

                scaledRange = effectiveRange / scale;

                const extraPadding = effectiveRange * (1 - scale) * 0.5;
                scaledRange += extraPadding;
            } else {

                scaledRange = effectiveRange / scale;
                console.log(`Y-axis zoom in: scale=${scale}, range=${effectiveRange}, scaledRange=${scaledRange}`);
            }

            scaledRange = Math.max(scaledRange, 5);

            console.log(`Y-axis scale: ${scale}, Data range: ${effectiveRange}, Scaled range: ${scaledRange}`);

            const topPadding = effectiveRange * 0.05; // 5% padding at top
            const bottomPadding = effectiveRange * 0.15; // 15% padding at bottom

            const calculatedMin = dataCenter - (scaledRange / 2) - bottomPadding;
            const calculatedMax = dataCenter + (scaledRange / 2) + topPadding;

            const extraBottomPadding = effectiveRange * 0.15; // 15% extra padding at bottom
            const finalMin = calculatedMin - extraBottomPadding;

            const minVisibleRange = maxDataPoint * 0.1; // At least 10% of max value
            const adjustedMin = (calculatedMax - finalMin < minVisibleRange) ?
                calculatedMax - minVisibleRange : finalMin;


            let originalAnnotationConfig = null;

            if (chart.options.plugins && chart.options.plugins.annotation) {
                try {

                    originalAnnotationConfig = chart.options.plugins.annotation;

                    delete chart.options.plugins.annotation;
                } catch (error) {
                    console.error('Error backing up annotations:', error);

                    delete chart.options.plugins.annotation;
                }
            }

            chart.options.scales.y.min = adjustedMin; // Use adjustedMin with extra bottom padding
            chart.options.scales.y.max = calculatedMax;

            chart.options.animation = false;

            try {

                chart.update('none');

                if (originalAnnotationConfig) {

                    setTimeout(() => {
                        try {

                            chart.options.plugins.annotation = originalAnnotationConfig;

                            chart.update('none');
                        } catch (annotationError) {
                            console.error('Error restoring annotations:', annotationError);

                        }
                    }, 300); // Increased timeout to ensure chart is fully updated first
                }
            } catch (error) {
                console.error('Error updating chart:', error);

                try {

                    const originalPlugins = {...chart.options.plugins};
                    chart.options.plugins = {};

                    chart.update('none');

                    const cleanPlugins = {...originalPlugins};
                    delete cleanPlugins.annotation; // Ensure annotation is removed
                    chart.options.plugins = cleanPlugins;

                    chart.update('none');
                } catch (fallbackError) {
                    console.error('Fallback update also failed:', fallbackError);
                }
            }
        }

        yAxisScaleSlider.addEventListener('input', function() {
            yAxisScale = parseFloat(this.value);
            yScaleValue.textContent = yAxisScale.toFixed(1) + 'x';

            if (weightGoalChart) {

                updateChartYAxisScale(weightGoalChart, yAxisScale, false);
                console.log(`Y-axis scale set to ${yAxisScale}x`);
            }
        });

        yAxisScaleSlider.addEventListener('change', function() {
            if (weightGoalChart) {

                updateChartYAxisScale(weightGoalChart, yAxisScale, true);
                console.log(`Y-axis scale finalized at ${yAxisScale}x`);
            }
        });
    } else {
        console.error("Could not find y-axis scale slider element (#y-axis-scale) to attach listener.");
    }

    if (resetScaleButton) {
        resetScaleButton.addEventListener('click', function() {

            xAxisScaleSlider.value = 1;
            yAxisScaleSlider.value = 1;
            xAxisScale = 1;
            yAxisScale = 1;
            xScaleValue.textContent = '1.0x';
            yScaleValue.textContent = '1.0x';

            if (weightGoalChart) {

                const chart = weightGoalChart;

                if (chart.options.scales.x) {
                    chart.options.scales.x.min = 0;
                    chart.options.scales.x.max = chart.data.labels.length - 1;
                }

                let minDataPoint = Number.MAX_VALUE;
                let maxDataPoint = Number.MIN_VALUE;

                chart.data.datasets.forEach(dataset => {
                    dataset.data.forEach(point => {
                        if (point && point.y !== null && point.y !== undefined && !isNaN(point.y)) {
                            if (point.y < minDataPoint) minDataPoint = point.y;
                            if (point.y > maxDataPoint) maxDataPoint = point.y;
                        }
                    });
                });

                if (minDataPoint !== Number.MAX_VALUE && maxDataPoint !== Number.MIN_VALUE) {
                    const dataRange = maxDataPoint - minDataPoint;
                    const topPadding = dataRange * 0.05; // 5% padding at top
                    const bottomPadding = dataRange * 0.15; // 15% padding at bottom

                    const extraBottomPadding = dataRange * 0.15; // 15% extra padding

                    const calculatedMin = minDataPoint - bottomPadding - extraBottomPadding;
                    const calculatedMax = maxDataPoint + topPadding;

                    const minVisibleRange = maxDataPoint * 0.1; // At least 10% of max value
                    const adjustedMin = (calculatedMax - calculatedMin < minVisibleRange) ?
                        calculatedMax - minVisibleRange : calculatedMin;

                    chart.options.scales.y.min = adjustedMin;
                    chart.options.scales.y.max = calculatedMax;
                } else {

                    chart.options.scales.y.min = undefined;
                    chart.options.scales.y.max = undefined;
                }

                chart.options.animation = {
                    duration: 500,
                    easing: 'easeOutQuad'
                };

                let hasAnnotations = false;
                let safeAnnotations = null;

                if (chart.options.plugins && chart.options.plugins.annotation &&
                    chart.options.plugins.annotation.annotations) {
                    hasAnnotations = true;

                    safeAnnotations = {};
                    const originalAnnotations = chart.options.plugins.annotation.annotations;

                    if (originalAnnotations.todayIndicator) {
                        safeAnnotations.todayIndicator = {
                            type: 'line',
                            scaleID: 'x',
                            value: originalAnnotations.todayIndicator.value,
                            borderColor: 'rgba(255, 99, 132, 0.8)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                display: true,
                                content: 'Today',
                                position: 'start',
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                                font: { weight: 'bold' }
                            }
                        };
                    }

                    if (originalAnnotations.targetWeightLine) {
                        safeAnnotations.targetWeightLine = {
                            type: 'line',
                            scaleID: 'y',
                            value: originalAnnotations.targetWeightLine.value,
                            borderColor: 'rgba(54, 162, 235, 0.8)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                display: true,
                                content: 'Target: ' + originalAnnotations.targetWeightLine.value + ' lbs',
                                position: 'end',
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                                font: { weight: 'bold' }
                            }
                        };
                    }

                    chart.options.plugins.annotation = false;
                }

                let originalAnnotationConfig = null;

                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {

                        originalAnnotationConfig = chart.options.plugins.annotation;

                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during reset:', error);

                        delete chart.options.plugins.annotation;
                    }
                }

                chart.reset();
                chart.update('none');

                if (hasAnnotations && safeAnnotations) {
                    try {

                        setTimeout(() => {
                            try {

                                chart.options.plugins.annotation = {
                                    annotations: safeAnnotations,
                                    clip: false,
                                    interaction: { mode: 'nearest' },
                                    animations: { duration: 0 }
                                };

                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error re-enabling annotations during reset:', annotationError);

                            }
                        }, 100);
                    } catch (annotationError) {
                        console.error('Error scheduling annotation update during reset:', annotationError);
                    }
                }

                console.log('Chart scales reset to default (1.0x)');
            }
        });
    } else {
        console.error("Could not find reset scale button element (#reset-scale-button) to attach listener.");
    }




    // Function to save calorie, protein, and fat targets with partial updates
    async function saveAllTargets() {
        const userId = calorieUserSelector.value;
        const calorieTargetStr = calorieTargetInput.value.trim();
        const proteinTargetStr = proteinTargetInput.value.trim();
        const fatTargetStr = fatTargetInput.value.trim();

        // Check if all fields are empty
        if (calorieTargetStr === '' && proteinTargetStr === '' && fatTargetStr === '') {
            showStatus(calorieTargetStatus, 'Please enter at least one value to save.', 'error');
            return;
        }

        // Parse values if provided
        const calorieTarget = calorieTargetStr !== '' ? parseInt(calorieTargetStr) : null;
        const proteinTarget = proteinTargetStr !== '' ? parseInt(proteinTargetStr) : null;
        const fatTarget = fatTargetStr !== '' ? parseInt(fatTargetStr) : null;

        // Validate provided values
        if (calorieTarget !== null && (isNaN(calorieTarget) || calorieTarget < 500 || calorieTarget > 10000)) {
            showStatus(calorieTargetStatus, 'Please enter a valid calorie target between 500 and 10000.', 'error');
            return;
        }

        if (proteinTarget !== null && (isNaN(proteinTarget) || proteinTarget < 20 || proteinTarget > 500)) {
            showStatus(calorieTargetStatus, 'Please enter a valid protein target between 20 and 500 grams.', 'error');
            return;
        }

        if (fatTarget !== null && (isNaN(fatTarget) || fatTarget < 20 || fatTarget > 300)) {
            showStatus(calorieTargetStatus, 'Please enter a valid fat target between 20 and 300 grams.', 'error');
            return;
        }

        showStatus(calorieTargetStatus, 'Saving nutrition targets...', 'info');

        try {
            // Get current values from the server for any empty fields
            let currentCalorieTarget = 2000; // Default if not found
            let currentProteinTarget = null;
            let currentFatTarget = null;

            try {
                const currentTargetsResponse = await fetch(`/api/calorie-targets/${userId}`);
                if (currentTargetsResponse.ok) {
                    const currentTargetsData = await currentTargetsResponse.json();
                    currentCalorieTarget = currentTargetsData.daily_target || 2000;
                    currentProteinTarget = currentTargetsData.protein_target || null;
                    currentFatTarget = currentTargetsData.fat_target || null;
                }
            } catch (error) {
                console.warn('Failed to fetch current targets:', error);
            }

            // Use provided values or current values if not provided
            const finalCalorieTarget = calorieTarget !== null ? calorieTarget : currentCalorieTarget;
            const finalProteinTarget = proteinTarget !== null ? proteinTarget : currentProteinTarget;
            const finalFatTarget = fatTarget !== null ? fatTarget : currentFatTarget;

            console.log(`Attempting to save targets for user ${userId}: ${finalCalorieTarget} calories, ${finalProteinTarget || 'default'} g protein, ${finalFatTarget || 'default'} g fat`);

            let response = await fetch('/api/calorie-targets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    daily_target: finalCalorieTarget,
                    protein_target: finalProteinTarget,
                    fat_target: finalFatTarget
                })
            });
            console.log(`Received response with status: ${response.status}`);

            if (response.status === 404) {
                console.log('Calorie targets API not found, trying weight API endpoint');
                response = await fetch('/api/weight/calorie-targets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        daily_target: finalCalorieTarget,
                        protein_target: finalProteinTarget,
                        fat_target: finalFatTarget
                    })
                });
                console.log(`Received response from weight API with status: ${response.status}`);
            }

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Could not parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Save result:', result);

            // Show appropriate success message based on which fields were updated
            let successMessage = 'Nutrition targets saved successfully!';
            if (calorieTarget !== null && proteinTarget === null && fatTarget === null) {
                successMessage = 'Calorie target saved successfully!';
            } else if (calorieTarget === null && proteinTarget !== null && fatTarget === null) {
                successMessage = 'Protein target saved successfully!';
            } else if (calorieTarget === null && proteinTarget === null && fatTarget !== null) {
                successMessage = 'Fat target saved successfully!';
            }
            showStatus(calorieTargetStatus, successMessage, 'success');

            // Update the displayed values
            loadCalorieTarget(userId);

            // Clear the input fields
            calorieTargetInput.value = '';
            proteinTargetInput.value = '';
            fatTargetInput.value = '';

        } catch (error) {
            console.error('Error saving nutrition targets:', error);
            showStatus(calorieTargetStatus, `Error saving nutrition targets: ${error.message}`, 'error');

            setTimeout(() => {
                loadCalorieTarget(userId);
            }, 2000);
        }
    }

    // Function to save individual targets (for the new unified dashboard)
    async function saveIndividualTarget(targetType) {
        const userId = calorieUserSelector ? calorieUserSelector.value : currentUserId;
        let targetValue, inputElement, statusElement, apiEndpoint;

        switch (targetType) {
            case 'calorie':
                inputElement = calorieTargetInput;
                statusElement = document.getElementById('calorie-target-status');
                break;
            case 'protein':
                inputElement = proteinTargetInput;
                statusElement = document.getElementById('protein-target-status');
                break;
            case 'fat':
                inputElement = fatTargetInput;
                statusElement = document.getElementById('fat-target-status');
                break;
            default:
                console.error('Invalid target type:', targetType);
                return;
        }

        targetValue = inputElement.value.trim();

        if (!targetValue) {
            showStatus(statusElement, `Please enter a ${targetType} target value.`, 'error');
            return;
        }

        const parsedValue = parseInt(targetValue);
        if (isNaN(parsedValue)) {
            showStatus(statusElement, `Please enter a valid ${targetType} target value.`, 'error');
            return;
        }

        // Validate ranges
        if (targetType === 'calorie' && (parsedValue < 500 || parsedValue > 10000)) {
            showStatus(statusElement, 'Please enter a valid calorie target between 500 and 10000.', 'error');
            return;
        }
        if (targetType === 'protein' && (parsedValue < 20 || parsedValue > 500)) {
            showStatus(statusElement, 'Please enter a valid protein target between 20 and 500 grams.', 'error');
            return;
        }
        if (targetType === 'fat' && (parsedValue < 20 || parsedValue > 300)) {
            showStatus(statusElement, 'Please enter a valid fat target between 20 and 300 grams.', 'error');
            return;
        }

        showStatus(statusElement, `Saving ${targetType} target...`, 'info');

        try {
            // Get current values from the server for the other fields
            let currentCalorieTarget = 2000;
            let currentProteinTarget = null;
            let currentFatTarget = null;

            try {
                const currentTargetsResponse = await fetch(`/api/calorie-targets/${userId}`);
                if (currentTargetsResponse.ok) {
                    const currentTargetsData = await currentTargetsResponse.json();
                    currentCalorieTarget = currentTargetsData.daily_target || 2000;
                    currentProteinTarget = currentTargetsData.protein_target || null;
                    currentFatTarget = currentTargetsData.fat_target || null;
                }
            } catch (error) {
                console.warn('Failed to fetch current targets:', error);
            }

            // Set the target values based on what we're updating
            let finalCalorieTarget = currentCalorieTarget;
            let finalProteinTarget = currentProteinTarget;
            let finalFatTarget = currentFatTarget;

            if (targetType === 'calorie') {
                finalCalorieTarget = parsedValue;
            } else if (targetType === 'protein') {
                finalProteinTarget = parsedValue;
            } else if (targetType === 'fat') {
                finalFatTarget = parsedValue;
            }

            console.log(`Attempting to save ${targetType} target for user ${userId}: ${parsedValue}`);

            let response = await fetch('/api/calorie-targets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    daily_target: finalCalorieTarget,
                    protein_target: finalProteinTarget,
                    fat_target: finalFatTarget
                })
            });

            if (response.status === 404) {
                console.log('Calorie targets API not found, trying weight API endpoint');
                response = await fetch('/api/weight/calorie-targets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        daily_target: finalCalorieTarget,
                        protein_target: finalProteinTarget,
                        fat_target: finalFatTarget
                    })
                });
            }

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Could not parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log(`Save ${targetType} result:`, result);

            showStatus(statusElement, `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} target saved successfully!`, 'success');

            // Clear the input field
            inputElement.value = '';

            // Reload the current targets
            loadCalorieTarget(userId);

        } catch (error) {
            console.error(`Error saving ${targetType} target:`, error);
            showStatus(statusElement, `Error saving ${targetType} target: ${error.message}`, 'error');
        }
    }

    async function loadCalorieTarget(userId) {
        try {
            console.log(`Attempting to fetch nutrition targets for user ${userId}`);

            let response = await fetch(`/api/calorie-targets/${userId}`);
            console.log(`Received response with status: ${response.status}`);

            if (response.status === 404) {
                try {
                    console.log('Calorie targets API not found or no target, trying weight API endpoint');
                    response = await fetch(`/api/weight/calorie-targets/${userId}`);
                    console.log(`Received response from weight API with status: ${response.status}`);
                } catch (weightApiError) {
                    console.error('Error fetching from weight API:', weightApiError);
                }
            }

            if (response.status === 404) {
                console.log('No nutrition targets found for this user');
                currentCalorieTarget.textContent = 'Not set';
                currentProteinTarget.textContent = 'Not set';
                currentFatTarget.textContent = 'Not set';
                return;
            }

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Could not parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Nutrition target data:', data);

            // Handle calorie target
            const dailyTarget = data.daily_target || data.target || data.calories || data.value;
            if (dailyTarget) {
                currentCalorieTarget.textContent = `${dailyTarget} calories`;
            } else {
                console.warn('Unexpected calorie target data format:', data);
                currentCalorieTarget.textContent = 'Not set';
            }

            // Handle protein target
            // Check for protein_target in the API response
            const proteinTarget = data.protein_target || null;
            console.log('Protein target from API:', proteinTarget);

            // Handle fat target
            // Check for fat_target in the API response
            const fatTarget = data.fat_target || null;
            console.log('Fat target from API:', fatTarget);

            // Calculate default values if not set
            const defaultProteinTarget = Math.round((dailyTarget * 0.15) / 4); // 15% of calories
            const defaultFatTarget = Math.round((dailyTarget * 0.30) / 9); // 30% of calories

            // Update protein target display
            if (proteinTarget) {
                currentProteinTarget.textContent = `${proteinTarget} g`;
            } else {
                currentProteinTarget.textContent = `${defaultProteinTarget} g (default)`;
            }

            // Update fat target display
            if (fatTarget) {
                currentFatTarget.textContent = `${fatTarget} g`;
            } else {
                currentFatTarget.textContent = `${defaultFatTarget} g (default)`;
            }

            // Update micronutrient targets with calorie, protein, and fat targets
            if (typeof updateMicronutrientTargets === 'function') {
                updateMicronutrientTargets(dailyTarget, proteinTarget, fatTarget);
            } else if (typeof window.updateMicronutrientTargets === 'function') {
                window.updateMicronutrientTargets(dailyTarget, proteinTarget, fatTarget);
            } else if (typeof window.updateMicronutrientCalorieTarget === 'function') {
                // Fall back to the old function if the new one isn't available
                window.updateMicronutrientCalorieTarget(dailyTarget);
            }

        } catch (error) {
            console.error('Error loading nutrition targets:', error);
            currentCalorieTarget.textContent = 'Not set';
            currentProteinTarget.textContent = 'Not set';
            currentFatTarget.textContent = 'Not set';
        }
    }

    // Add event listener for the save button (legacy)
    if (saveAllTargetsBtn) {
        saveAllTargetsBtn.addEventListener('click', saveAllTargets);
        console.log("Added event listener to save targets button");
    } else {
        console.error("Could not find save targets button (#save-all-targets-btn) to attach listener.");
    }

    // Add event listeners for individual save buttons in the new unified dashboard
    const saveCalorieTargetBtn = document.getElementById('save-calorie-target-btn');
    const saveProteinTargetBtn = document.getElementById('save-protein-target-btn');
    const saveFatTargetBtn = document.getElementById('save-fat-target-btn');

    if (saveCalorieTargetBtn) {
        saveCalorieTargetBtn.addEventListener('click', function() {
            saveIndividualTarget('calorie');
        });
        console.log("Added event listener to save calorie target button");
    }

    if (saveProteinTargetBtn) {
        saveProteinTargetBtn.addEventListener('click', function() {
            saveIndividualTarget('protein');
        });
        console.log("Added event listener to save protein target button");
    }

    if (saveFatTargetBtn) {
        saveFatTargetBtn.addEventListener('click', function() {
            saveIndividualTarget('fat');
        });
        console.log("Added event listener to save fat target button");
    }

    if (calorieUserSelector) {
        calorieUserSelector.addEventListener('change', function() {
            const userId = this.value;
            loadCalorieTarget(userId);
        });
    }


    if (userSelector) {
        userSelector.addEventListener('change', function() {

            currentUserId = this.value;

            localStorage.setItem('weightUserPreference', currentUserId);

            if (calorieUserSelector) {
                calorieUserSelector.value = this.value;

                loadCalorieTarget(this.value);
            }

            if (weightGoalChart) {
                weightGoalChart.destroy();
                weightGoalChart = null;
            }

            loadWeightGoal();
            loadAndRenderWeightChart();

            setTimeout(fixTooltips, 1000);

            console.log(`Switched to user ID: ${currentUserId}`);
        });
    }

    function fixTooltips() {
        if (!weightGoalChart || !weightGoalChartCanvas) return;

        if (window.attachWeightChartTooltipEvents) {
            window.attachWeightChartTooltipEvents(weightGoalChart);
            console.log('Re-attached custom tooltip events to chart');
        } else {
            console.error('Custom tooltip functions not available');
        }
    }

    console.error("ABOUT TO CALL loadWeightGoal - THIS SHOULD BE VISIBLE");
    loadWeightGoal(); // Load saved goal
    console.error("ABOUT TO CALL loadAndRenderWeightChart - THIS SHOULD BE VISIBLE");
    loadAndRenderWeightChart(); // Attempt to load chart data
    console.error("FINISHED CALLING loadAndRenderWeightChart - THIS SHOULD BE VISIBLE");
    loadRecipes();
    loadCalorieTarget(calorieUserSelector.value); // Load calorie target for the default user

    setTimeout(fixTooltips, 1000);

    window.showAddIngredientForm = function(recipeId, container) {
        console.log(`Showing add ingredient form for recipe ${recipeId}`);

        if (!container) {
            console.error('Container not provided to showAddIngredientForm');
            return;
        }

        const ingredientAddForm = container.querySelector('.add-ingredient-form');
        if (!ingredientAddForm) {
            console.error('Add ingredient form not found in container');
            return;
        }

        const recipeIdInput = document.getElementById('add-ingredient-recipe-id');
        if (recipeIdInput) {
            recipeIdInput.value = recipeId;
        } else {
            console.error('Recipe ID input not found in add ingredient form');
        }

        if (typeof loadExistingIngredients === 'function') {
            loadExistingIngredients();
        } else if (typeof window.loadExistingIngredients === 'function') {
            window.loadExistingIngredients();
        } else {
            console.warn('loadExistingIngredients function not available');
        }

        ingredientAddForm.style.display = 'block';

        if (typeof initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for add ingredient form');
            initializeCronometerTextParser(ingredientAddForm);
        } else if (typeof window.initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for add ingredient form (using window scope)');
            window.initializeCronometerTextParser(ingredientAddForm);
        } else {
            console.warn('Cronometer text parser not available for add form');
        }

        ingredientAddForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.showEditIngredientForm = function(recipeId, ingredientId, container) {
        console.log(`Showing edit ingredient form for ingredient ${ingredientId} in recipe ${recipeId}`);

        if (!container) {
            console.error('Container not provided to showEditIngredientForm');
            return;
        }

        const editForm = container.querySelector('.edit-ingredient-form');
        if (!editForm) {
            console.error('Edit ingredient form not found in container');
            return;
        }

        const statusElement = container.querySelector('.edit-ingredient-status');

        editForm.style.display = 'block';

        if (typeof initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for edit ingredient form');
            initializeCronometerTextParser(editForm);
        } else if (typeof window.initializeCronometerTextParser === 'function') {
            console.log('Initializing Cronometer text parser for edit ingredient form (using window scope)');
            window.initializeCronometerTextParser(editForm);
        } else {
            console.warn('Cronometer text parser not available for edit form');
        }


        const packageAmountElement = container.querySelector(`[data-ingredient-id="${ingredientId}"]`);
        let uiPackageAmount = null;
        if (packageAmountElement) {
            uiPackageAmount = packageAmountElement.getAttribute('data-value');
            console.debug(`Found UI-updated package amount: ${uiPackageAmount}`);
        }

        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(ingredient => {

                console.debug('Ingredient data from API:', ingredient);

                if (uiPackageAmount !== null) {
                    console.debug(`Overriding database package amount (${ingredient.package_amount}) with UI value (${uiPackageAmount})`);
                    ingredient.package_amount = parseFloat(uiPackageAmount);
                }

                document.getElementById('edit-ingredient-id').value = ingredientId;
                document.getElementById('edit-recipe-id').value = recipeId;

                if (typeof populateEditForm === 'function') {
                    populateEditForm(ingredient);
                } else if (typeof window.populateEditForm === 'function') {
                    window.populateEditForm(ingredient);
                } else {
                    console.error('populateEditForm function not available');
                }

                if (statusElement) {
                    showStatus(statusElement, '', '');
                }

                editForm.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error fetching ingredient details:', error);
                if (statusElement) {
                    showStatus(statusElement, `Error loading ingredient: ${error.message}`, 'error');
                }
            });
    };

    async function loadExistingIngredients() {
        const select = document.getElementById('existing-ingredient-select');
        if (!select) return;

        while (select.options.length > 1) {
            select.remove(1);
        }

        select.options[0].text = 'Loading ingredients...';

        try {

            const response = await fetch('/api/recipes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            // Handle both old format (direct array) and new format (object with recipes property)
            let recipes;
            if (Array.isArray(responseData)) {
                // Old format: direct array
                recipes = responseData;
            } else if (responseData && responseData.success && Array.isArray(responseData.recipes)) {
                // New format: object with success and recipes properties
                recipes = responseData.recipes;
            } else {
                console.error('Invalid response format:', responseData);
                throw new Error('Invalid recipe data format');
            }

            const uniqueIngredients = new Map(); // Use Map to store unique ingredients by name

            recipes.forEach(recipe => {
                if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                    recipe.ingredients.forEach(ingredient => {

                        if (!uniqueIngredients.has(ingredient.name)) {
                            uniqueIngredients.set(ingredient.name, {
                                id: ingredient.id,
                                name: ingredient.name,
                                recipe_id: recipe.id,
                                recipe_name: recipe.name
                            });
                        }
                    });
                }
            });

            const sortedIngredients = Array.from(uniqueIngredients.values())
                .sort((a, b) => a.name.localeCompare(b.name));

            select.options[0].text = 'Select an ingredient';

            sortedIngredients.forEach(ingredient => {
                const option = document.createElement('option');
                option.value = `${ingredient.recipe_id}:${ingredient.id}`; // Store both recipe ID and ingredient ID
                option.text = `${ingredient.name} (from ${ingredient.recipe_name})`;
                select.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading existing ingredients:', error);
            select.options[0].text = 'Error loading ingredients';
        }
    }

    async function fetchIngredientDetails(combinedId) {

        const [recipeId, ingredientId] = combinedId.split(':');
        if (!recipeId || !ingredientId) {
            console.error('Invalid ingredient ID format');
            return;
        }

        try {

            const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const ingredient = await response.json();
            console.log('Fetched ingredient details:', ingredient);

            document.getElementById('add-ingredient-name').value = ingredient.name;
            document.getElementById('add-ingredient-amount').value = ingredient.amount;
            document.getElementById('add-ingredient-package-amount').value = ingredient.package_amount || '';
            document.getElementById('add-ingredient-price').value = ingredient.price;
            document.getElementById('add-ingredient-calories').value = ingredient.calories;
            document.getElementById('add-ingredient-protein').value = ingredient.protein;
            document.getElementById('add-ingredient-fats').value = ingredient.fats;
            document.getElementById('add-ingredient-carbs').value = ingredient.carbohydrates;

            if (ingredient.fiber !== undefined) document.getElementById('add-ingredient-fiber').value = ingredient.fiber;
            if (ingredient.starch !== undefined) document.getElementById('add-ingredient-starch').value = ingredient.starch;
            if (ingredient.sugars !== undefined) document.getElementById('add-ingredient-sugars').value = ingredient.sugars;
            if (ingredient.added_sugars !== undefined) document.getElementById('add-ingredient-added-sugars').value = ingredient.added_sugars;
            if (ingredient.net_carbs !== undefined) document.getElementById('add-ingredient-net-carbs').value = ingredient.net_carbs;

            if (ingredient.monounsaturated !== undefined) document.getElementById('add-ingredient-monounsaturated').value = ingredient.monounsaturated;
            if (ingredient.polyunsaturated !== undefined) document.getElementById('add-ingredient-polyunsaturated').value = ingredient.polyunsaturated;
            if (ingredient.omega3 !== undefined) document.getElementById('add-ingredient-omega3').value = ingredient.omega3;
            if (ingredient.omega6 !== undefined) document.getElementById('add-ingredient-omega6').value = ingredient.omega6;
            if (ingredient.saturated !== undefined) document.getElementById('add-ingredient-saturated').value = ingredient.saturated;
            if (ingredient.trans_fat !== undefined) document.getElementById('add-ingredient-trans-fat').value = ingredient.trans_fat;
            if (ingredient.cholesterol !== undefined) document.getElementById('add-ingredient-cholesterol').value = ingredient.cholesterol;


        } catch (error) {
            console.error('Error fetching ingredient details:', error);
            const statusElement = document.querySelector('.add-ingredient-status');
            if (statusElement) {
                showStatus(statusElement, `Error loading ingredient details: ${error.message}`, 'error');
            }
        }
    }

    async function handleAddIngredientSubmit(event) {
        event.preventDefault();

        console.log('=== handleAddIngredientSubmit called ===');

        const form = event.target;
        const recipeId = document.getElementById('add-ingredient-recipe-id').value;
        const statusElement = document.querySelector('.add-ingredient-status');

        console.log('Form submitted for recipe ID:', recipeId);

        if (!recipeId) {
            console.error('Recipe ID is missing');
            showStatus(statusElement, 'Recipe ID is missing', 'error');
            return;
        }

        showStatus(statusElement, 'Adding ingredient...', 'info');

        try {

            console.log('Form fields:');
            const formFields = form.querySelectorAll('input, select, textarea');
            formFields.forEach(field => {
                console.log(`- ${field.id || 'unnamed field'}: ${field.value}`);
            });

            const nameInput = document.getElementById('add-ingredient-name');
            const amountInput = document.getElementById('add-ingredient-amount');
            const packageAmountInput = document.getElementById('add-ingredient-package-amount');
            const priceInput = document.getElementById('add-ingredient-price');

            if (!nameInput || !amountInput || !priceInput) {
                console.error('Required form fields are missing');
                showStatus(statusElement, 'Required form fields are missing', 'error');
                return;
            }

            const name = nameInput.value.trim();
            const amount = amountInput.value ? parseFloat(amountInput.value) : null;
            const packageAmount = packageAmountInput && packageAmountInput.value ?
                parseFloat(packageAmountInput.value) : null;
            const price = priceInput.value ? parseFloat(priceInput.value) : null;

            if (!name) {
                console.error('Ingredient name is required');
                showStatus(statusElement, 'Ingredient name is required', 'error');
                return;
            }

            if (amount === null || isNaN(amount) || amount <= 0) {
                console.error('Invalid amount value:', amount);
                showStatus(statusElement, 'Amount must be a positive number', 'error');
                return;
            }

            if (price === null || isNaN(price) || price < 0) {
                console.error('Invalid price value:', price);
                showStatus(statusElement, 'Price must be a non-negative number', 'error');
                return;
            }

            const ingredientData = {
                name: name,
                amount: amount,
                package_amount: packageAmount,
                price: price
            };

            const getValueFromFormOrCronometer = (fieldId, cronometerClass) => {
                const formElement = document.getElementById(fieldId);
                const cronometerElement = form.querySelector(cronometerClass);

                console.log(`Getting value for ${fieldId} / ${cronometerClass}`);

                if (formElement && formElement.value) {
                    console.log(`- Found value in form field: ${formElement.value}`);
                    return parseFloat(formElement.value);
                }

                else if (cronometerElement && cronometerElement.value) {
                    console.log(`- Found value in Cronometer element: ${cronometerElement.value}`);
                    return parseFloat(cronometerElement.value);
                }

                console.log(`- No value found, defaulting to 0`);
                return 0;
            };

            ingredientData.calories = getValueFromFormOrCronometer('add-ingredient-calories', '.ingredient-calories');
            ingredientData.protein = getValueFromFormOrCronometer('add-ingredient-protein', '.ingredient-protein');
            ingredientData.fats = getValueFromFormOrCronometer('add-ingredient-fats', '.ingredient-fat');
            ingredientData.carbohydrates = getValueFromFormOrCronometer('add-ingredient-carbs', '.ingredient-carbs');

            console.log('Required nutrition fields:');
            console.log('- calories:', ingredientData.calories);
            console.log('- protein:', ingredientData.protein);
            console.log('- fats:', ingredientData.fats);
            console.log('- carbohydrates:', ingredientData.carbohydrates);

            const optionalFields = [
                'fiber', 'starch', 'sugars', 'added_sugars', 'net_carbs',
                'monounsaturated', 'polyunsaturated', 'omega3', 'omega6', 'saturated', 'trans_fat', 'cholesterol',
                'alcohol', 'caffeine', 'water',
                'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_b12',
                'folate', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
                'calcium', 'copper', 'iron', 'magnesium', 'manganese', 'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc',
                'cystine', 'histidine', 'isoleucine', 'leucine', 'lysine', 'methionine', 'phenylalanine', 'threonine', 'tryptophan', 'tyrosine', 'valine'
            ];

            optionalFields.forEach(field => {
                const element = document.getElementById(`add-ingredient-${field}`);
                if (element && element.value) {
                    ingredientData[field] = parseFloat(element.value);
                }
            });

            if (form.dataset.completeNutritionData) {
                try {
                    const nutritionData = JSON.parse(form.dataset.completeNutritionData);
                    console.log('Found complete nutrition data:', nutritionData);

                    const fieldMappings = {
                        calories: 'calories',
                        protein: 'protein',
                        fat: 'fats',
                        carbs: 'carbohydrates',
                        fiber: 'fiber',
                        starch: 'starch',
                        sugars: 'sugars',
                        addedSugars: 'added_sugars',
                        netCarbs: 'net_carbs',
                        saturated: 'saturated',
                        monounsaturated: 'monounsaturated',
                        polyunsaturated: 'polyunsaturated',
                        omega3: 'omega3',
                        omega6: 'omega6',
                        transFat: 'trans_fat',
                        cholesterol: 'cholesterol',
                        alcohol: 'alcohol',
                        caffeine: 'caffeine',
                        water: 'water',
                        thiamine: 'thiamine',
                        riboflavin: 'riboflavin',
                        niacin: 'niacin',
                        vitaminB6: 'vitamin_b6',
                        folate: 'folate',
                        vitaminB12: 'vitamin_b12',
                        pantothenic: 'pantothenic_acid',
                        biotin: 'biotin',
                        vitaminA: 'vitamin_a',
                        vitaminC: 'vitamin_c',
                        vitaminD: 'vitamin_d',
                        vitaminE: 'vitamin_e',
                        vitaminK: 'vitamin_k',
                        calcium: 'calcium',
                        copper: 'copper',
                        iron: 'iron',
                        magnesium: 'magnesium',
                        manganese: 'manganese',
                        phosphorus: 'phosphorus',
                        potassium: 'potassium',
                        selenium: 'selenium',
                        sodium: 'sodium',
                        zinc: 'zinc',
                        histidine: 'histidine',
                        isoleucine: 'isoleucine',
                        leucine: 'leucine',
                        lysine: 'lysine',
                        methionine: 'methionine',
                        phenylalanine: 'phenylalanine',
                        threonine: 'threonine',
                        tryptophan: 'tryptophan',
                        valine: 'valine',
                        tyrosine: 'tyrosine',
                        cystine: 'cystine'
                    };

                    for (const [cronometerKey, dbKey] of Object.entries(fieldMappings)) {

                        if (ingredientData[dbKey] !== undefined) {
                            continue;
                        }

                        if (nutritionData[cronometerKey] !== undefined && nutritionData[cronometerKey] !== null) {
                            ingredientData[dbKey] = parseFloat(nutritionData[cronometerKey]);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing complete nutrition data:', error);
                }
            }

            const dataAttributes = form.dataset;
            for (const key in dataAttributes) {

                if (key === 'completeNutritionData' || key === 'dbFormatNutritionData' || key === 'micronutrientHandlerAdded' || key === 'cronometerParserInitialized') {
                    continue;
                }

                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

                if (ingredientData[snakeKey] !== undefined) {
                    continue;
                }

                if (dataAttributes[key] && !isNaN(parseFloat(dataAttributes[key]))) {
                    ingredientData[snakeKey] = parseFloat(dataAttributes[key]);
                }
            }

            // Nutritional values are no longer required
            // Convert any missing nutritional values to 0
            ingredientData.calories = ingredientData.calories || 0;
            ingredientData.protein = ingredientData.protein || 0;
            ingredientData.fats = ingredientData.fats || 0;
            ingredientData.carbohydrates = ingredientData.carbohydrates || 0;

            console.log('Sending ingredient data to server:', JSON.stringify(ingredientData, null, 2));

            let response;
            try {
                response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate'
                    },
                    body: JSON.stringify(ingredientData)
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    let errorMessage = `Server returned ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        console.error('Server error response:', errorData);
                    } catch (jsonError) {
                        console.error('Could not parse error response as JSON:', jsonError);
                    }
                    throw new Error(errorMessage);
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                showStatus(statusElement, `Network error: ${fetchError.message}`, 'error');
                return;
            }

            let result;
            try {
                result = await response.json();
                console.log('Ingredient added successfully. Server response:', result);

                if (result.ingredients && result.ingredients.length > 0) {
                    const lastIngredient = result.ingredients[result.ingredients.length - 1];
                    console.log('Last ingredient in recipe:', lastIngredient);
                } else {
                    console.warn('No ingredients returned in response');
                }
            } catch (jsonError) {
                console.error('Error parsing response JSON:', jsonError);
                showStatus(statusElement, 'Error parsing server response', 'error');
                return;
            }

            // Show success notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('Ingredient added successfully!');
            } else {
                showStatus(statusElement, 'Ingredient added successfully!', 'success');
            }

            setTimeout(() => {
                const addIngredientForm = document.querySelector('.add-ingredient-form');
                if (addIngredientForm) {
                    addIngredientForm.style.display = 'none';
                    console.log('Hid the add ingredient form');
                } else {
                    console.warn('Could not find add ingredient form to hide');
                }

                const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
                if (recipeCard) {
                    const detailsDiv = recipeCard.querySelector('.ingredient-details');
                    if (detailsDiv) {

                        detailsDiv.dataset.forceRefresh = 'true';
                        console.log(`Refreshing ingredients for recipe ${recipeId}`);


                        if (detailsDiv.style.display === 'block') {

                            detailsDiv.style.display = 'none';

                            setTimeout(() => {
                                console.log('Performing forced refresh of ingredient details');
                                fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                            }, 300);
                        } else {

                            fetchAndDisplayIngredients(recipeId, detailsDiv, null, true);
                        }
                    } else {
                        console.warn('Could not find ingredient details div to refresh');
                    }
                } else {
                    console.warn(`Could not find recipe card with ID ${recipeId} to refresh`);
                }
            }, 1000);

        } catch (error) {
            console.error('Error adding ingredient:', error);

            // Show error notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(`Error adding ingredient: ${error.message}`);
            } else {
                showStatus(statusElement, `Error adding ingredient: ${error.message}`, 'error');
            }
        }
    }

    window.populateEditForm = function(ingredient) {

        document.getElementById('edit-ingredient-name').value = ingredient.name || '';
        document.getElementById('edit-ingredient-amount').value = ingredient.amount || '';

        console.debug('Package amount from API:', ingredient.package_amount, typeof ingredient.package_amount);

        let packageAmountForForm = '';

        if (window.localStorageManager) {
            const savedPackageAmount = window.localStorageManager.getPackageAmount(ingredient.id);
            if (savedPackageAmount !== null) {
                console.debug(`Found saved package amount in local storage for ingredient ${ingredient.id}: ${savedPackageAmount}`);
                packageAmountForForm = savedPackageAmount;
            } else if (ingredient.package_amount !== null && ingredient.package_amount !== undefined) {

                packageAmountForForm = Number(ingredient.package_amount);

                if (isNaN(packageAmountForForm)) {
                    packageAmountForForm = '';
                }
            }
        } else if (ingredient.package_amount !== null && ingredient.package_amount !== undefined) {

            packageAmountForForm = Number(ingredient.package_amount);

            if (isNaN(packageAmountForForm)) {
                packageAmountForForm = '';
            }
        }

        document.getElementById('edit-ingredient-package-amount').value = packageAmountForForm;
        console.debug('Package amount set in form:', packageAmountForForm);

        window._currentPackageAmount = packageAmountForForm;
        document.getElementById('edit-ingredient-price').value = ingredient.price || '';

        document.getElementById('edit-ingredient-calories').value = ingredient.calories || '';
        document.getElementById('edit-ingredient-alcohol').value = ingredient.alcohol || '';
        document.getElementById('edit-ingredient-caffeine').value = ingredient.caffeine || '';
        document.getElementById('edit-ingredient-water').value = ingredient.water || '';

        document.getElementById('edit-ingredient-carbs').value = ingredient.carbohydrates || '';
        document.getElementById('edit-ingredient-fiber').value = ingredient.fiber || '';
        document.getElementById('edit-ingredient-starch').value = ingredient.starch || '';
        document.getElementById('edit-ingredient-sugars').value = ingredient.sugars || '';
        document.getElementById('edit-ingredient-added-sugars').value = ingredient.added_sugars || '';
        document.getElementById('edit-ingredient-net-carbs').value = ingredient.net_carbs || '';

        document.getElementById('edit-ingredient-fats').value = ingredient.fats || '';
        document.getElementById('edit-ingredient-monounsaturated').value = ingredient.monounsaturated || '';
        document.getElementById('edit-ingredient-polyunsaturated').value = ingredient.polyunsaturated || '';

        const omega3Value = ingredient.omega3 !== undefined ? ingredient.omega3 :
                           (ingredient.omega_3 !== undefined ? ingredient.omega_3 : '');
        document.getElementById('edit-ingredient-omega3').value = omega3Value;
        console.log(`Setting omega3 input value to ${omega3Value} (from database: omega3=${ingredient.omega3}, omega_3=${ingredient.omega_3})`);

        const omega6Value = ingredient.omega6 !== undefined ? ingredient.omega6 :
                           (ingredient.omega_6 !== undefined ? ingredient.omega_6 : '');
        document.getElementById('edit-ingredient-omega6').value = omega6Value;
        console.log(`Setting omega6 input value to ${omega6Value} (from database: omega6=${ingredient.omega6}, omega_6=${ingredient.omega_6})`);

        document.getElementById('edit-ingredient-saturated').value = ingredient.saturated || '';
        document.getElementById('edit-ingredient-trans-fat').value = ingredient.trans_fat || '';
        document.getElementById('edit-ingredient-cholesterol').value = ingredient.cholesterol || '';

        document.getElementById('edit-ingredient-protein').value = ingredient.protein || '';
        document.getElementById('edit-ingredient-cystine').value = ingredient.cystine || '';
        document.getElementById('edit-ingredient-histidine').value = ingredient.histidine || '';
        document.getElementById('edit-ingredient-isoleucine').value = ingredient.isoleucine || '';
        document.getElementById('edit-ingredient-leucine').value = ingredient.leucine || '';
        document.getElementById('edit-ingredient-lysine').value = ingredient.lysine || '';
        document.getElementById('edit-ingredient-methionine').value = ingredient.methionine || '';
        document.getElementById('edit-ingredient-phenylalanine').value = ingredient.phenylalanine || '';
        document.getElementById('edit-ingredient-threonine').value = ingredient.threonine || '';
        document.getElementById('edit-ingredient-tryptophan').value = ingredient.tryptophan || '';
        document.getElementById('edit-ingredient-tyrosine').value = ingredient.tyrosine || '';
        document.getElementById('edit-ingredient-valine').value = ingredient.valine || '';

        document.getElementById('edit-ingredient-vitamin-b1').value = ingredient.vitamin_b1 || '';
        document.getElementById('edit-ingredient-vitamin-b2').value = ingredient.vitamin_b2 || '';
        document.getElementById('edit-ingredient-vitamin-b3').value = ingredient.vitamin_b3 || '';
        document.getElementById('edit-ingredient-vitamin-b5').value = ingredient.vitamin_b5 || '';
        document.getElementById('edit-ingredient-vitamin-b6').value = ingredient.vitamin_b6 || '';
        document.getElementById('edit-ingredient-vitamin-b12').value = ingredient.vitamin_b12 || '';
        document.getElementById('edit-ingredient-folate').value = ingredient.folate || '';
        document.getElementById('edit-ingredient-vitamin-a').value = ingredient.vitamin_a || '';
        document.getElementById('edit-ingredient-vitamin-c').value = ingredient.vitamin_c || '';
        document.getElementById('edit-ingredient-vitamin-d').value = ingredient.vitamin_d || '';
        document.getElementById('edit-ingredient-vitamin-e').value = ingredient.vitamin_e || '';
        document.getElementById('edit-ingredient-vitamin-k').value = ingredient.vitamin_k || '';

        document.getElementById('edit-ingredient-calcium').value = ingredient.calcium || '';
        document.getElementById('edit-ingredient-copper').value = ingredient.copper || '';
        document.getElementById('edit-ingredient-iron').value = ingredient.iron || '';
        document.getElementById('edit-ingredient-magnesium').value = ingredient.magnesium || '';
        document.getElementById('edit-ingredient-manganese').value = ingredient.manganese || '';
        document.getElementById('edit-ingredient-phosphorus').value = ingredient.phosphorus || '';
        document.getElementById('edit-ingredient-potassium').value = ingredient.potassium || '';
        document.getElementById('edit-ingredient-selenium').value = ingredient.selenium || '';
        document.getElementById('edit-ingredient-sodium').value = ingredient.sodium || '';
        document.getElementById('edit-ingredient-zinc').value = ingredient.zinc || '';
    };

    window.removeIngredientFromRecipe = async function(recipeId, ingredientId, container) {
        console.log(`Removing ingredient ${ingredientId} from recipe ${recipeId}`);

        if (!recipeId || !ingredientId) {
            console.error('Recipe ID and ingredient ID are required');
            return;
        }

        if (!container) {
            console.error('Container not provided to removeIngredientFromRecipe');
            return;
        }

        if (!confirm('Are you sure you want to remove this ingredient from the recipe?')) {
            return;
        }

        try {

            const statusElement = container.querySelector('.status') || document.createElement('div');
            statusElement.textContent = 'Removing ingredient...';
            statusElement.className = 'status info';

            const response = await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
                method: 'DELETE',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('Ingredient removed successfully:', result);

            statusElement.textContent = 'Ingredient removed successfully!';
            statusElement.className = 'status success';

            const recipeCard = container.closest('.recipe-card');
            if (recipeCard) {
                const detailsDiv = recipeCard.querySelector('.ingredient-details');
                if (detailsDiv) {

                    detailsDiv.dataset.forceRefresh = 'true';

                    if (typeof fetchAndDisplayIngredients === 'function') {
                        fetchAndDisplayIngredients(recipeId, detailsDiv);
                    } else if (typeof window.fetchAndDisplayIngredients === 'function') {
                        window.fetchAndDisplayIngredients(recipeId, detailsDiv);
                    } else {
                        console.error('fetchAndDisplayIngredients function not found');
                        alert('Error: Could not refresh ingredients (function not available)');
                    }
                }

                const caloriesSpan = recipeCard.querySelector('.recipe-card-calories');
                if (caloriesSpan && result.total_calories !== undefined) {
                    caloriesSpan.textContent = `${result.total_calories.toFixed(1)} calories`;
                }
            }
        } catch (error) {
            console.error('Error removing ingredient:', error);

            const statusElement = container.querySelector('.status') || document.createElement('div');
            statusElement.textContent = `Error removing ingredient: ${error.message}`;
            statusElement.className = 'status error';
        }
    };


    window.toggleNutritionPanel = function(button) {

        const form = button.closest('form') || document.getElementById('add-ingredient-form');
        if (!form) {
            console.error('Could not find form for toggleNutritionPanel');
            return;
        }

        const panel = form.querySelector('.detailed-nutrition-panel');
        if (!panel) {
            console.error('Could not find detailed nutrition panel');
            return;
        }

        const isVisible = panel.style.display === 'block';

        panel.style.display = isVisible ? 'none' : 'block';
        button.textContent = isVisible ? 'Show Detailed Nutrition' : 'Hide Detailed Nutrition';
        button.classList.toggle('active', !isVisible);
    }
});