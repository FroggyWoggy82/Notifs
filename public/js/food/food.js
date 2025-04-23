document.addEventListener('DOMContentLoaded', () => {
    const ingredientsList = document.getElementById('ingredients-list');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const createRecipeForm = document.getElementById('create-recipe-form');
    const recipeNameInput = document.getElementById('recipeName');
    const createRecipeStatus = document.getElementById('create-recipe-status');
    const recipeListContainer = document.getElementById('recipe-list');
    const recipesDisplayStatus = document.getElementById('recipes-display-status');

    // --- NEW: Weight Goal Elements ---
    const weightGoalForm = document.getElementById('weight-goal-form');
    const targetWeightInput = document.getElementById('targetWeight');
    const weeklyGainGoalInput = document.getElementById('weeklyGainGoal');
    const weightGoalStatus = document.getElementById('weight-goal-status');
    const weightGoalChartCanvas = document.getElementById('weight-goal-chart');
    const weightChartMessage = document.getElementById('weight-chart-message');
    const userSelector = document.getElementById('user-selector');
    const resetScaleButton = document.getElementById('reset-scale-button');
    const xAxisScaleSlider = document.getElementById('x-axis-scale');
    const yAxisScaleSlider = document.getElementById('y-axis-scale');
    const xScaleValue = document.getElementById('x-scale-value');
    const yScaleValue = document.getElementById('y-scale-value');
    let weightGoalChart = null; // To hold the Chart.js instance

    // Calorie Target Elements
    const calorieUserSelector = document.getElementById('calorie-user-selector');
    const calorieTargetInput = document.getElementById('calorie-target');
    const saveCalorieTargetBtn = document.getElementById('save-calorie-target');
    const currentCalorieTarget = document.getElementById('current-calorie-target');
    const calorieTargetStatus = document.getElementById('calorie-target-status');

    // Default scale values
    let xAxisScale = 1;
    let yAxisScale = 1;

    // Load saved user preference from localStorage or default to 1
    let currentUserId = localStorage.getItem('weightUserPreference') || 1;

    // Set the user selector to the saved preference
    if (userSelector && currentUserId) {
        userSelector.value = currentUserId;
    }
    // --- End Weight Goal Elements ---

    // Function to create HTML for a single ingredient row
    function createIngredientRowHtml() {
        return `
            <div class="ingredient-row">
                <input type="text" placeholder="Ingredient Name" class="ingredient-name" required>

                <!-- Cronometer Text Parser -->
                <div class="cronometer-text-paste-container">
                    <textarea class="cronometer-text-paste-area" placeholder="Paste Cronometer nutrition data here..." rows="5"></textarea>
                    <button type="button" class="cronometer-parse-button">Parse Nutrition Data</button>
                    <div class="cronometer-parse-status"></div>
                </div>
            </div>
            <div class="ingredient-row nutrition-inputs">
                <input type="number" placeholder="Amount (g)" class="ingredient-amount" step="any" required>
                <input type="number" placeholder="Price" class="ingredient-price" step="any" required>
                <button type="button" class="remove-ingredient-btn">Remove</button>
                <!-- Hidden fields for form submission -->
                <input type="hidden" class="ingredient-calories" required>
                <input type="hidden" class="ingredient-protein" required>
                <input type="hidden" class="ingredient-fat" required>
                <input type="hidden" class="ingredient-carbs" required>
            </div>

            <!-- Detailed Nutrition Information (Collapsible) -->
            <div class="detailed-nutrition-toggle">
                <button type="button" class="toggle-detailed-nutrition">Show Detailed Nutrition</button>
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

    // Function to add a new ingredient row to the DOM
    function addIngredientRow() {
        const ingredientItem = document.createElement('div');
        ingredientItem.classList.add('ingredient-item');
        ingredientItem.innerHTML = createIngredientRowHtml();
        ingredientsList.appendChild(ingredientItem);

        // Wait for the DOM to update before initializing
        setTimeout(() => {
            // Initialize the Cronometer Text Parser in the new row
            if (typeof initializeCronometerTextParser === 'function') {
                initializeCronometerTextParser(ingredientItem);
                console.log('Cronometer Text Parser initialized in new ingredient row');
            } else {
                console.error('initializeCronometerTextParser function not found');
                // Try to load the cronometer-text-parser.js script if it's not loaded
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

            // Manually add event listener to the parse button
            const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
            const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
            const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

            if (parseButton && textPasteArea && statusElement) {
                parseButton.addEventListener('click', () => {
                    const text = textPasteArea.value.trim();
                    if (text && typeof processCronometerText === 'function') {
                        processCronometerText(text, ingredientItem, statusElement);
                    } else if (text) {
                        statusElement.textContent = 'Please paste Cronometer nutrition data first';
                        statusElement.className = 'cronometer-parse-status error';
                    }
                });
                console.log('Manual event listener added to parse button');
            }

            // Dispatch an event to notify that a new ingredient has been added
            // This allows other modules to initialize their functionality for the new ingredient
            const event = new CustomEvent('ingredientAdded', {
                detail: { ingredientItem: ingredientItem }
            });
            document.dispatchEvent(event);
            console.log('Dispatched ingredientAdded event');
        }, 100); // Slightly longer timeout to ensure DOM is updated

        // Note: Remove button listener is handled by delegation
    }

    // Event listener for adding ingredients
    addIngredientBtn.addEventListener('click', addIngredientRow);

    // Event listener for removing ingredients and toggling detailed nutrition (delegated to the list container)
    ingredientsList.addEventListener('click', (event) => {
        // Handle remove ingredient button
        if (event.target.classList.contains('remove-ingredient-btn')) {
            // Prevent removing the last ingredient row
            if (ingredientsList.children.length > 1) {
                event.target.closest('.ingredient-item').remove();
            } else {
                alert("A recipe must have at least one ingredient.");
            }
        }

        // Handle detailed nutrition toggle button
        if (event.target.classList.contains('toggle-detailed-nutrition')) {
            const button = event.target;
            const panel = button.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');

            if (panel) {
                // Toggle visibility
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';

                // Update button text and class
                if (isVisible) {
                    button.textContent = 'Show Detailed Nutrition';
                    button.classList.remove('active');
                } else {
                    button.textContent = 'Hide Detailed Nutrition';
                    button.classList.add('active');
                }
            }
        }
    });

    // Event listener for form submission
    createRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        showStatus(createRecipeStatus, 'Saving recipe...', 'info'); // Indicate processing

        const recipeName = recipeNameInput.value.trim();
        const ingredientItems = ingredientsList.querySelectorAll('.ingredient-item');
        const ingredientsData = [];
        let formIsValid = true;

        if (!recipeName) {
            showStatus(createRecipeStatus, 'Recipe name is required.', 'error');
            return;
        }

        if (ingredientItems.length === 0) {
            // This case should ideally not happen due to the remove button logic, but check anyway
            showStatus(createRecipeStatus, 'Recipe must have at least one ingredient.', 'error');
            return;
        }

        // Collect and validate ingredient data
        ingredientItems.forEach(item => {
            const name = item.querySelector('.ingredient-name').value.trim();
            // Get values from detailed nutrition fields first, then fall back to hidden fields
            const energyInput = item.querySelector('.nutrition-energy');
            const proteinTotalInput = item.querySelector('.nutrition-protein-total');
            const fatTotalInput = item.querySelector('.nutrition-fat-total');
            const carbsTotalInput = item.querySelector('.nutrition-carbs-total');

            // Get values from detailed fields if available, otherwise use hidden fields
            const calories = parseFloat(energyInput ? energyInput.value : item.querySelector('.ingredient-calories').value);
            const amount = parseFloat(item.querySelector('.ingredient-amount').value);
            const protein = parseFloat(proteinTotalInput ? proteinTotalInput.value : item.querySelector('.ingredient-protein').value);
            const fat = parseFloat(fatTotalInput ? fatTotalInput.value : item.querySelector('.ingredient-fat').value);
            const carbs = parseFloat(carbsTotalInput ? carbsTotalInput.value : item.querySelector('.ingredient-carbs').value);
            const price = parseFloat(item.querySelector('.ingredient-price').value);

            // Update hidden fields with the latest values from detailed fields
            if (energyInput && energyInput.value) item.querySelector('.ingredient-calories').value = energyInput.value;
            if (proteinTotalInput && proteinTotalInput.value) item.querySelector('.ingredient-protein').value = proteinTotalInput.value;
            if (fatTotalInput && fatTotalInput.value) item.querySelector('.ingredient-fat').value = fatTotalInput.value;
            if (carbsTotalInput && carbsTotalInput.value) item.querySelector('.ingredient-carbs').value = carbsTotalInput.value;

            // Leave empty fields as empty (no default values)

            // Convert empty strings to null for validation
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
                // Use null for empty values instead of 0
                ingredientsData.push({
                    name,
                    calories: caloriesVal,
                    amount,
                    protein: proteinVal,
                    fats: fatVal,
                    carbohydrates: carbsVal,
                    price: priceVal
                });
            }
        });

        if (!formIsValid) {
            showStatus(createRecipeStatus, 'Please fill all ingredient fields correctly (all values >= 0, amount > 0).', 'error');
            return;
        }

        // --- Send data to backend --- //
        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: recipeName, ingredients: ingredientsData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newRecipe = await response.json();
            showStatus(createRecipeStatus, `Recipe '${newRecipe.name}' saved successfully!`, 'success');
            createRecipeForm.reset(); // Clear form fields
            // Reset ingredients list to one empty row
            ingredientsList.innerHTML = '';
            addIngredientRow(); // This will also initialize the paste area
            loadRecipes(); // Refresh the recipe list

        } catch (error) {
            console.error('Error saving recipe:', error);
            showStatus(createRecipeStatus, `Error saving recipe: ${error.message}`, 'error');
        }
    });

    // --- NEW: Weight Goal Functions --- //

    async function loadWeightGoal() {
        showStatus(weightGoalStatus, 'Loading weight goal...', 'info');
        try {
            const response = await fetch(`/api/weight/goal?user_id=${currentUserId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch goal');
            }
            const goalData = await response.json();

            // goalData might be { target_weight: null, weekly_gain_goal: null } if not set
            targetWeightInput.value = goalData.target_weight || '';
            weeklyGainGoalInput.value = goalData.weekly_gain_goal || '';
            showStatus(weightGoalStatus, '', ''); // Clear loading status

        } catch (error) {
            console.error('Error loading weight goal:', error);
            showStatus(weightGoalStatus, `Error loading goal: ${error.message}`, 'error');
        }
    }

    async function saveWeightGoal(event) {
        event.preventDefault();
        const targetWeight = parseFloat(targetWeightInput.value);
        const weeklyGain = parseFloat(weeklyGainGoalInput.value);

        if (isNaN(targetWeight) || targetWeight <= 0 || isNaN(weeklyGain) || weeklyGain === 0) {
            showStatus(weightGoalStatus, 'Please enter a valid positive number for target weight and a non-zero value for weekly goal.', 'error');
            return;
        }

        showStatus(weightGoalStatus, 'Saving goal...', 'info');
        try {
            const response = await fetch('/api/weight/goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetWeight: targetWeight,
                    weeklyGain: weeklyGain,
                    user_id: currentUserId
                })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to save goal');
            }

            const result = await response.json();
            console.log("Goal saved:", result);

            // Update inputs to reflect saved values (in case of rounding/validation on backend)
            targetWeightInput.value = result.target_weight || '';
            weeklyGainGoalInput.value = result.weekly_gain_goal || '';

            showStatus(weightGoalStatus, 'Weight goal saved successfully!', 'success');
            // Trigger graph update as the goal line might change
            loadAndRenderWeightChart();

        } catch (error) {
            console.error('Error saving weight goal:', error);
            showStatus(weightGoalStatus, `Error saving goal: ${error.message}`, 'error');
        }
    }

    // --- NEW: Weight Chart Functions --- //

    // Loads actual weight data and goal line, then renders the chart
    async function loadAndRenderWeightChart() {
        // IMPORTANT: Make sure Chart.js library is included in food.html
        // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        if (!weightGoalChartCanvas) return;

        weightChartMessage.textContent = 'Loading chart data...';
        weightChartMessage.style.display = 'block';
        weightGoalChartCanvas.style.display = 'none'; // Hide canvas while loading
        if (weightGoalChart) weightGoalChart.destroy(); // Clear previous chart immediately

        try {
            // Fetch both logs and goal data concurrently
            const [logsResponse, goalResponse] = await Promise.all([
                fetch(`/api/weight/logs?user_id=${currentUserId}`),
                fetch(`/api/weight/goal?user_id=${currentUserId}`)
            ]);

            if (!logsResponse.ok) {
                const errorData = await logsResponse.json();
                throw new Error(errorData.error || 'Failed to fetch weight logs');
            }
            if (!goalResponse.ok) {
                const errorData = await goalResponse.json();
                throw new Error(errorData.error || 'Failed to fetch weight goal');
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
                // No need to destroy chart again, done above
                return;
            }

            // --- Prepare data for Chart.js ---
            // Ensure logs are sorted by date (API should do this, but double-check)
            weightLogs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

            // Get today's date for the current day indicator
            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Check if today's date is already in the logs
            const todayInLogs = weightLogs.some(log => log.log_date === todayFormatted);

            // If today's date is not in the logs, add it to the logs array
            if (!todayInLogs) {
                // Find where to insert today's date (in chronological order)
                let insertIndex = weightLogs.length; // Default to end of array
                for (let i = 0; i < weightLogs.length; i++) {
                    if (new Date(weightLogs[i].log_date) > today) {
                        insertIndex = i;
                        break;
                    }
                }

                // Insert today's date at the appropriate position
                weightLogs.splice(insertIndex, 0, {
                    log_id: null,
                    log_date: todayFormatted,
                    weight: null // No weight data for today yet
                });

                console.log(`Added today's date (${todayFormatted}) to the chart at position ${insertIndex}`);
            }

            const histLabels = weightLogs.map(log => new Date(log.log_date + 'T00:00:00Z').toLocaleDateString()); // Use UTC date for consistency
            const actualWeightData = weightLogs.map(log => log.weight);

            // --- Generate Future Dates and Labels ---
            const futureLabels = [];
            const WEEKS_TO_PROJECT = 12; // Project ~12 weeks into the future for longer-term goals
            const lastLogDate = new Date(weightLogs[weightLogs.length - 1].log_date + 'T00:00:00Z');

            // Store weekly increment dates for tooltip reference
            window.weeklyIncrementDates = [];

            // Find the most recent actual weight (for comparison with goal weights)
            let mostRecentWeight = null;
            let mostRecentDate = null;

            // Loop through weight logs in reverse to find the most recent non-null weight
            for (let i = weightLogs.length - 1; i >= 0; i--) {
                if (weightLogs[i].weight !== null) {
                    mostRecentWeight = weightLogs[i].weight;
                    mostRecentDate = weightLogs[i].log_date;
                    break;
                }
            }

            // Store the most recent weight for tooltip reference
            window.mostRecentWeight = {
                weight: mostRecentWeight,
                date: mostRecentDate
            };

            console.log(`Most recent weight: ${mostRecentWeight} lbs on ${mostRecentDate}`);

            // Generate future dates exactly 7 days apart (weekly)
            for (let i = 1; i <= WEEKS_TO_PROJECT; i++) {
                const futureDate = new Date(lastLogDate);
                futureDate.setDate(lastLogDate.getDate() + (i * 7)); // Add exactly 7 days each time
                futureLabels.push(futureDate.toLocaleDateString());

                // Store this date as a weekly increment point
                window.weeklyIncrementDates.push({
                    date: futureDate.toLocaleDateString(),
                    index: histLabels.length + i - 1, // Index in the combined labels array
                    week: i
                });

                console.log(`Added future date: ${futureDate.toLocaleDateString()} (week ${i})`);
            }

            // --- Combine Labels and Pad Actual Data ---
            const labels = [...histLabels, ...futureLabels];
            // Pad actual weight data with nulls for the future dates
            const paddedActualWeightData = [...actualWeightData, ...Array(futureLabels.length).fill(null)];

            // --- Calculate Full Target Weight Line (Historical + Future) ---
            const targetWeightLine = [];
            const startDate = new Date(weightLogs[0].log_date + 'T00:00:00Z'); // Use first log date as start
            const startWeight = actualWeightData[0]; // Use first log weight as start
            const targetWeight = goalData.target_weight;
            const weeklyGain = goalData.weekly_gain_goal;

            // --- Add Logging ---
            console.log("Chart: Received goalData:", goalData);
            console.log("Chart: Values for target line calculation:",
                { targetWeight, weeklyGain, startDate, startWeight });
            // --- End Logging ---

            // Create an array to store weekly goal weights
            window.weeklyGoalWeights = [];

            if (targetWeight !== null && weeklyGain !== null && weeklyGain !== 0 && !isNaN(targetWeight) && !isNaN(weeklyGain)) {
                console.log("Chart: Condition to draw target line met."); // Log condition met
                // Iterate through the COMBINED labels array to calculate target for each date point
                labels.forEach((labelStr, index) => {
                    // Convert label string back to Date object for calculation
                    // We need to handle different date formats
                    let currentDate;

                    // Try parsing MM/DD/YYYY format first
                    if (labelStr.includes('/')) {
                        const parts = labelStr.split('/');
                        if (parts.length === 3) {
                            // MM/DD/YYYY format
                            currentDate = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    }

                    // If that didn't work, try direct parsing
                    if (!currentDate || isNaN(currentDate.getTime())) {
                        currentDate = new Date(labelStr);
                    }

                    // If still invalid, log and skip
                    if (isNaN(currentDate.getTime())) {
                        console.warn(`Could not parse date label for target line calculation: ${labelStr}`);
                        targetWeightLine.push(null); // Push null if date is invalid
                        return; // Skip to next iteration
                    }

                    // Ensure both dates use the same time basis
                    currentDate.setUTCHours(0, 0, 0, 0);

                    // Calculate exact number of weeks between dates
                    // Use milliseconds for precise calculation
                    const msDiff = currentDate.getTime() - startDate.getTime();
                    const daysDiff = msDiff / (1000 * 60 * 60 * 24);
                    const weeksDiff = daysDiff / 7;

                    console.log(`Date: ${labelStr}, Weeks diff: ${weeksDiff.toFixed(2)}`);

                    // Only calculate projection if weeksDiff is non-negative (i.e., date is after start)
                    if (weeksDiff >= 0) {
                        const projectedWeight = startWeight + (weeksDiff * weeklyGain);
                        let goalWeight;

                        // Handle weight gain vs weight loss differently
                        if (weeklyGain > 0) {
                            // For weight gain, cap at target weight (which is higher than start weight)
                            goalWeight = Math.min(projectedWeight, targetWeight);
                            targetWeightLine.push(goalWeight);
                        } else {
                            // For weight loss, cap at target weight (which is lower than start weight)
                            goalWeight = Math.max(projectedWeight, targetWeight);
                            targetWeightLine.push(goalWeight);
                        }

                        // Store the goal weight for this date
                        // Check if this is a weekly increment point
                        const weeklyPoint = window.weeklyIncrementDates.find(w => w.index === index);
                        if (weeklyPoint) {
                            window.weeklyGoalWeights.push({
                                index: index,
                                date: labelStr,
                                weight: goalWeight,
                                week: weeklyPoint.week
                            });
                        }
                    } else {
                        // If somehow a date before start date is processed, push null
                        targetWeightLine.push(null);
                    }
                });
            } else {
                console.log("Goal not set or invalid, not drawing target line.");
                // Ensure targetWeightLine has the same length as labels, filled with nulls
                for (let i = 0; i < labels.length; i++) { targetWeightLine.push(null); }
            }
            // --- End Target Line Calculation ---

            // Pass the target weight value to the renderWeightChart function
            renderWeightChart(labels, paddedActualWeightData, targetWeightLine, parseFloat(goalData.target_weight));
            weightChartMessage.style.display = 'none'; // Hide message
            weightGoalChartCanvas.style.display = 'block'; // Show canvas

        } catch (error) {
            console.error("Error loading data for weight chart:", error);
            weightChartMessage.textContent = `Error loading chart data: ${error.message}`;
            weightChartMessage.style.color = 'red';
            weightChartMessage.style.display = 'block';
            weightGoalChartCanvas.style.display = 'none';
            // No need to destroy chart again, done above
        }
    }

    function renderWeightChart(labels, actualData, targetData, targetWeight) {
        if (!weightGoalChartCanvas) return;
        const ctx = weightGoalChartCanvas.getContext('2d');

        if (weightGoalChart) {
            weightGoalChart.destroy(); // Destroy previous instance
        }

        // Convert data to proper format for Chart.js
        const formattedActualData = [];
        const formattedTargetData = [];

        // Track the most recent weight for comparison with goal weights
        window.mostRecentWeight = { weight: null, date: null };

        // Format actual weight data - use actual array indices for x values
        for (let i = 0; i < labels.length; i++) {
            formattedActualData.push({
                x: i,
                y: actualData[i] // Keep null values to maintain line continuity
            });

            // Update most recent weight if this entry has a weight value
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

        // Format target weight data - use actual array indices for x values
        for (let i = 0; i < labels.length; i++) {
            formattedTargetData.push({
                x: i,
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
                // Add shadow effect on hover
                pointHoverShadowColor: 'rgba(0, 0, 0, 0.5)',
                pointHoverShadowBlur: 10,
                pointHoverShadowOffsetX: 0,
                pointHoverShadowOffsetY: 4,
                // Ensure tooltips work properly
                hitRadius: 15, // Increase hit detection radius for easier interaction
                spanGaps: true, // Connect points across gaps (null values)
                // Ensure points are always drawn regardless of zoom level
                pointRadius: 5, // Fixed point size
                // Make sure points are always visible
                z: 10, // Higher z-index to keep points on top
                // Don't clip points at the edges
                clip: false,
                // Keep points in view when zooming
                borderJoinStyle: 'round',
                // Improve tooltip interaction
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                },
                segment: {
                    borderColor: ctx => {
                        // Only draw line segments where we have actual data
                        const p0 = ctx.p0.parsed;
                        const p1 = ctx.p1.parsed;
                        return (p0.y === null || p1.y === null) ? 'transparent' : '#3498db';
                    }
                }
            }
        ];

        // Add target weight line dataset if data exists
        if (formattedTargetData.length > 0) {
             datasets.push({
                 label: 'Goal Weight Path (lbs)',
                 data: formattedTargetData,
                 borderColor: '#e74c3c', // Red
                 borderDash: [5, 5], // Dashed line
                 borderWidth: 2,
                 tension: 0, // Set to 0 for straight lines
                 fill: false,
                 // Show points only at weekly increments
                 pointRadius: function(context) {
                     // Check if this is a weekly increment point
                     if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                         const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                         return isWeeklyPoint ? 6 : 0; // 6px radius for weekly points, 0 for others
                     }
                     return 0;
                 },
                 pointBackgroundColor: function(context) {
                     // Check if this is a weekly increment point
                     if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                         const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                         return isWeeklyPoint ? '#e74c3c' : 'transparent'; // Red for weekly points
                     }
                     return 'transparent';
                 },
                 pointBorderColor: function(context) {
                     // Check if this is a weekly increment point
                     if (window.weeklyGoalWeights && window.weeklyGoalWeights.length > 0) {
                         const isWeeklyPoint = window.weeklyGoalWeights.some(w => w.index === context.dataIndex);
                         return isWeeklyPoint ? '#fff' : 'transparent'; // White border for weekly points
                     }
                     return 'transparent';
                 },
                 pointBorderWidth: 2,
                 pointHoverRadius: 8, // Larger hover radius for better UX
                 pointHoverBackgroundColor: '#c0392b', // Darker red on hover
                 pointHoverBorderColor: '#fff',
                 pointHoverBorderWidth: 2,
                 spanGaps: true, // Connect points across gaps (null values)
                 segment: {
                     borderColor: ctx => {
                         // Only draw line segments where we have actual data
                         const p0 = ctx.p0.parsed;
                         const p1 = ctx.p1.parsed;
                         return (p0.y === null || p1.y === null) ? 'transparent' : '#e74c3c';
                     }
                 }
             });
        }

        // Find today's date in the labels array
        const today = new Date();
        const todayFormatted = today.toLocaleDateString();

        console.log('Today formatted:', todayFormatted);
        console.log('Available labels:', labels);

        // Try different date formats to find today in the labels
        let todayIndex = -1;

        // Method 1: Direct match
        todayIndex = labels.findIndex(label => label === todayFormatted);

        // Method 2: Try MM/DD/YYYY format
        if (todayIndex === -1) {
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const year = today.getFullYear();
            const altFormat = `${month}/${day}/${year}`;
            todayIndex = labels.findIndex(label => label === altFormat);
            console.log('Trying alternate format:', altFormat);
        }

        // Method 3: If still not found, find the closest date
        if (todayIndex === -1) {
            const todayTime = today.getTime();
            let closestDiff = Infinity;

            labels.forEach((label, index) => {
                try {
                    // Try to parse the date
                    let labelDate;
                    if (label.includes('/')) {
                        const parts = label.split('/');
                        if (parts.length === 3) {
                            // MM/DD/YYYY format
                            labelDate = new Date(parts[2], parts[0] - 1, parts[1]);
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
                    // Skip invalid dates
                }
            });

            console.log('Found closest date at index:', todayIndex);
        }

        // Create annotations for current day indicator and target weight
        const annotations = {};

        // 1. Today's date indicator
        if (todayIndex !== -1) {
            // Today's date is in our chart labels
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
            // If we still can't find today, add indicator at the last actual data point
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

        // 2. Target weight indicator - horizontal line across the chart
        if (targetData && targetData.length > 0 && targetWeight) {
            // Make sure targetWeight is a number
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

                // 3. Add a box highlight around the target weight area
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

        // Make sure the annotation plugin is registered before creating the chart
        try {
            // Check if annotation plugin is available
            let annotationPluginAvailable = false;

            if (Chart.registry && Chart.registry.plugins) {
                const plugins = Object.values(Chart.registry.plugins.items);
                annotationPluginAvailable = plugins.some(p => p.id === 'annotation');
            }

            if (!annotationPluginAvailable) {
                console.warn('Annotation plugin not found in registry, trying to register manually');

                // Try global ChartAnnotation
                if (typeof ChartAnnotation !== 'undefined') {
                    Chart.register(ChartAnnotation);
                    console.log('Registered annotation plugin from global ChartAnnotation');
                }
                // Try Chart.Annotation
                else if (Chart.Annotation) {
                    Chart.register(Chart.Annotation);
                    console.log('Registered annotation plugin from Chart.Annotation');
                }
            }
        } catch (error) {
            console.error('Error checking/registering annotation plugin:', error);
        }

        // Find the minimum and maximum weights for better scaling
        const validWeights = actualData.filter(w => w !== null && w !== undefined);

        // Add significant buffer below the minimum to ensure points don't go below the view
        const minWeight = Math.min(...validWeights) * 0.90; // 10% buffer below min
        const maxWeight = Math.max(...validWeights) * 1.05; // 5% buffer above max

        // If we have a target weight, include it in the scale calculation
        let yMin = minWeight;
        let yMax = maxWeight;

        if (targetWeight && !isNaN(targetWeight)) {
            // If target weight is higher than current weights, add more buffer
            if (targetWeight > maxWeight) {
                yMax = targetWeight * 1.05; // 5% buffer above target
            } else if (targetWeight < minWeight) {
                yMin = targetWeight * 0.90; // 10% buffer below target
            } else {
                yMin = Math.min(yMin, targetWeight * 0.90);
                yMax = Math.max(yMax, targetWeight * 1.05);
            }
        }

        // Add extra padding to ensure points are fully visible
        const range = yMax - yMin;
        yMin -= range * 0.15; // Additional 15% padding at bottom
        yMax += range * 0.05; // Additional 5% padding at top

        // Ensure there's always a minimum visible range, even with high zoom
        const minVisibleRange = Math.max(...validWeights) * 0.1; // At least 10% of max weight
        if ((yMax - yMin) < minVisibleRange) {
            yMin = yMax - minVisibleRange;
        }

        // Create the chart configuration
        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            plugins: [{
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart) => {
                    // Clear the canvas completely before drawing
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
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
                // Add layout configuration to ensure proper padding
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
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: { top: 0, bottom: 10 } // Add padding to title
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                // Round to 2 decimal places for y-axis labels
                                return parseFloat(value).toFixed(2) + ' lbs';
                            },
                            padding: 15, // Increased padding to ensure ticks don't get cut off
                            // Ensure we don't have too many ticks
                            maxTicksLimit: 10
                        },
                        // Add reasonable defaults for the y-axis
                        grace: '5%', // Add 5% padding to the scale
                        // Ensure the axis adapts to the data
                        adapters: {
                            date: false
                        },
                        // Set fixed min/max values to prevent scaling issues
                        min: yMin,
                        max: yMax,
                        // Ensure the axis doesn't get cut off
                        position: 'left',
                        // Add extra space to prevent overlap with y-axis labels
                        afterFit: function(scaleInstance) {
                            // Add extra width to ensure labels are fully visible
                            scaleInstance.width = Math.max(scaleInstance.width, 80);
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            padding: { top: 10, bottom: 0 } // Add padding to title
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        },
                        // Apply the x-axis scale factor by controlling how many ticks/labels are shown
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            },
                            // Control the number of ticks based on the scale factor
                            // Lower xAxisScale = more ticks (compressed view showing more dates)
                            // Higher xAxisScale = fewer ticks (expanded view showing fewer dates)
                            autoSkip: true,
                            autoSkipPadding: 15, // Increased padding between ticks
                            maxTicksLimit: Math.max(5, Math.round(20 / xAxisScale)),
                            padding: 10 // Add padding to ensure ticks don't get cut off
                        },
                        // Enable zooming on the x-axis
                        min: 0,
                        max: labels.length - 1,
                        // Ensure the axis doesn't get cut off
                        offset: true, // Add offset to prevent labels from being cut off
                        // Add extra space to prevent overlap with x-axis labels
                        afterFit: function(scaleInstance) {
                            // Add extra height to ensure labels are fully visible
                            scaleInstance.height = Math.max(scaleInstance.height, 60);
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
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
                    // Custom plugin for tooltips
                    customTooltips: {
                        callbacks: {
                            title: function(tooltipItems) {
                                // Format the date in the tooltip title
                                if (tooltipItems.length > 0) {
                                    const label = tooltipItems[0].label;
                                    try {
                                        // Try to parse and format the date
                                        const date = new Date(label);
                                        if (!isNaN(date.getTime())) {
                                            // Format as Month Day, Year (e.g., April 4, 2025)
                                            return date.toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            });
                                        }
                                    } catch (e) {
                                        // If parsing fails, return the original label
                                    }
                                    return label;
                                }
                                return '';
                            },
                            label: function(context) {
                                try {
                                    // First, check if we have valid data
                                    if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                                        return 'No data available';
                                    }

                                    // Get the weight value regardless of dataset type
                                    const weightValue = parseFloat(context.parsed.y).toFixed(2);

                                    // Check dataset type by label if available
                                    const datasetLabel = context.dataset.label || '';

                                    if (datasetLabel.includes('Actual')) {
                                        return `Weight: ${weightValue} lbs`;
                                    } else if (datasetLabel.includes('Goal')) {
                                        return `Goal: ${weightValue} lbs`;
                                    } else {
                                        // Fallback for any dataset
                                        return `Value: ${weightValue} lbs`;
                                    }
                                } catch (error) {
                                    console.error('Error in tooltip label callback:', error);
                                    return 'Error displaying data';
                                }
                            },
                            // Add afterLabel to show additional information
                            afterLabel: function(context) {
                                try {
                                    // First, check if we have valid data
                                    if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                                        return null;
                                    }

                                    const datasetLabel = context.dataset.label || '';

                                    // Only add this for actual weight points
                                    if (datasetLabel.includes('Actual')) {
                                        // If we have a target weight, show the difference
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

        // Temporarily disable annotations to prevent errors
        console.log('Annotations disabled to prevent errors');
        // We'll use simple lines instead of the annotation plugin

        // Set better default Y-axis range before creating the chart
        // Find min and max values in the actual data
        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        formattedActualData.forEach(point => {
            if (point.y !== null && !isNaN(point.y)) {
                minValue = Math.min(minValue, point.y);
                maxValue = Math.max(maxValue, point.y);
            }
        });

        // Add target weight to the range calculation if available
        if (targetWeight && !isNaN(targetWeight)) {
            minValue = Math.min(minValue, targetWeight);
            maxValue = Math.max(maxValue, targetWeight);
        }

        // If we have valid min/max values, set a reasonable range
        if (minValue !== Number.MAX_VALUE && maxValue !== Number.MIN_VALUE) {
            // Calculate a reasonable padding (about 5% of the range)
            const range = maxValue - minValue;
            const padding = Math.max(range * 0.05, 2); // At least 2 lbs padding

            // Set the min/max with padding
            chartConfig.options.scales.y.min = Math.max(0, minValue - padding);
            chartConfig.options.scales.y.max = maxValue + padding;

            console.log(`Setting initial Y-axis range: ${chartConfig.options.scales.y.min} to ${chartConfig.options.scales.y.max}`);
        }

        // Store target weight in chart options for tooltip access
        chartConfig.options.targetWeight = parseFloat(targetWeight);
        console.log('Setting target weight in chart options:', chartConfig.options.targetWeight);

        // Create the chart
        weightGoalChart = new Chart(ctx, chartConfig);
        weightGoalChart._initialScaleApplied = false; // Mark as needing initial scale

        // Attach custom tooltip events
        if (window.attachWeightChartTooltipEvents) {
            window.attachWeightChartTooltipEvents(weightGoalChart);
        } else {
            console.error('Custom tooltip functions not available');
        }

        // Initialize the chart with the current y-axis scale
        // This ensures the scale is applied correctly on initial load
        setTimeout(() => {
            if (weightGoalChart && typeof updateChartYAxisScale === 'function') {
                // Force scale to 1.0 for initial render
                updateChartYAxisScale(weightGoalChart, 1.0, false);
                console.log('Applied initial y-axis scale: 1.0x');

                // Reset the sliders to 1.0
                if (xAxisScaleSlider) xAxisScaleSlider.value = 1.0;
                if (yAxisScaleSlider) yAxisScaleSlider.value = 1.0;
                if (xScaleValue) xScaleValue.textContent = '1.0x';
                if (yScaleValue) yScaleValue.textContent = '1.0x';
                xAxisScale = 1.0;
                yAxisScale = 1.0;
            }
        }, 100);
    }

    // --- Recipe Loading and Display --- //

    async function loadRecipes() {
        showStatus(recipesDisplayStatus, 'Loading recipes...', 'info');
        try {
            // Add cache-busting query parameter
            const response = await fetch('/api/recipes?' + new Date().getTime());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recipes = await response.json();
            renderRecipes(recipes);
            showStatus(recipesDisplayStatus, '', ''); // Clear status on success
        } catch (error) {
            console.error('Error loading recipes:', error);
            showStatus(recipesDisplayStatus, 'Failed to load recipes.', 'error');
            recipeListContainer.innerHTML = '<p style="text-align:center; color: red;">Could not load recipes.</p>';
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
            recipeDiv.classList.add('recipe-display-item'); // Use class from food.css
            recipeDiv.dataset.id = recipe.id;

            recipeDiv.innerHTML = `
                <h4>${escapeHtml(recipe.name)}</h4>
                <p>Total Calories: <span class="recipe-calories">${recipe.total_calories.toFixed(1)}</span></p>

                <!-- Calorie Adjustment Controls -->
                <div class="calorie-adjustment">
                    <label>Adjust Calories:</label>
                    <input type="number" class="target-calories-input" placeholder="New Cal Total" step="1">
                    <button type="button" class="adjust-calories-btn">Set</button>
                    <button type="button" class="adjust-calories-percent-btn" data-percent="0.75">-25%</button>
                    <button type="button" class="adjust-calories-percent-btn" data-percent="1.25">+25%</button>
                    <button type="button" class="adjust-calories-amount-btn" data-amount="-200">-200</button>
                    <button type="button" class="adjust-calories-amount-btn" data-amount="200">+200</button>
                </div>

                <div class="recipe-actions">
                    <button type="button" class="view-ingredients-btn">View Ingredients</button>
                    <button type="button" class="delete-recipe-btn">Delete Recipe</button>
                </div>
                <div class="ingredient-details" style="display: none; margin-top: 10px;">
                    <!-- Ingredient details will be loaded here -->
                </div>
                <div class="adjustment-status status"></div> <!-- Status for adjustments -->
            `;
            recipeListContainer.appendChild(recipeDiv);
        });
    }

    // --- Recipe Deletion --- //

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

    // --- Utility Functions --- //

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

    // --- Calorie Adjustment Logic --- //
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

            // Update the displayed calories
            const caloriesSpan = recipeItemElement.querySelector('.recipe-calories');
            if (caloriesSpan) {
                caloriesSpan.textContent = updatedRecipe.total_calories.toFixed(1);
            }
            // Clear target input
            const targetInput = recipeItemElement.querySelector('.target-calories-input');
            if(targetInput) targetInput.value = '';

            // Update the ingredient details if they are currently displayed
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

    // --- View Ingredients Logic --- //
    async function fetchAndDisplayIngredients(recipeId, detailsDiv, viewButton) {
        // Toggle visibility
        if (detailsDiv.style.display !== 'none') {
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = ''; // Clear content
            viewButton.textContent = 'View Ingredients';
            return;
        }

        detailsDiv.innerHTML = '<p>Loading ingredients...</p>';
        detailsDiv.style.display = 'block';
        viewButton.textContent = 'Hide Ingredients';

        try {
             // Add cache-busting query parameter
            const response = await fetch(`/api/recipes/${recipeId}?` + new Date().getTime());
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
             }
             const recipeData = await response.json();
             renderIngredientDetails(recipeData.ingredients, detailsDiv);
        } catch (error) {
             console.error('Error fetching ingredients:', error);
             detailsDiv.innerHTML = `<p style="color:red;">Error loading ingredients: ${error.message}</p>`;
        }
    }

    function renderIngredientDetails(ingredients, container) {
        if (!ingredients || ingredients.length === 0) {
            container.innerHTML = '<p>No ingredients found for this recipe.</p>';
            return;
        }

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Calories</th>
                        <th>Amount (g)</th>
                        <th>Protein (g)</th>
                        <th>Fat (g)</th>
                        <th>Carbs (g)</th>
                        <th>Price</th>
                        <th>Cal/g</th>
                        <th>Prot/g</th>
                        <th>Fat/g</th>
                        <th>Carb/g</th>
                        <th>Price/g</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ingredients.forEach(ing => {
            // Calculate per gram values if not already provided
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

            tableHtml += `
                <tr data-ingredient-id="${ing.id}" data-recipe-id="${ing.recipe_id}">
                    <td>${escapeHtml(ing.name)}</td>
                    <td>${ing.calories.toFixed(1)}</td>
                    <td>${ing.amount.toFixed(1)}</td>
                    <td>${ing.protein.toFixed(1)}</td>
                    <td>${ing.fats.toFixed(1)}</td>
                    <td>${ing.carbohydrates.toFixed(1)}</td>
                    <td>${ing.price.toFixed(2)}</td>
                    <td>${calPerGram}</td>
                    <td>${protPerGram}</td>
                    <td>${fatPerGram}</td>
                    <td>${carbPerGram}</td>
                    <td>${pricePerGram}</td>
                    <td>
                        <button type="button" class="edit-ingredient-btn">Edit</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            <div class="edit-ingredient-form" style="display: none;">
                <h4>Edit Ingredient</h4>
                <form id="edit-ingredient-form">
                    <input type="hidden" id="edit-ingredient-id">
                    <input type="hidden" id="edit-recipe-id">

                    <!-- Basic Information -->
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="edit-ingredient-name">Name:</label>
                            <input type="text" id="edit-ingredient-name" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-ingredient-amount">Amount (g):</label>
                            <input type="number" id="edit-ingredient-amount" step="0.1" min="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-ingredient-price">Price:</label>
                            <input type="number" id="edit-ingredient-price" step="0.01" min="0" required>
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
                                    <label for="edit-ingredient-calcium">Calcium (mg):</label>
                                    <input type="number" id="edit-ingredient-calcium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-copper">Copper (mg):</label>
                                    <input type="number" id="edit-ingredient-copper" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-iron">Iron (mg):</label>
                                    <input type="number" id="edit-ingredient-iron" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-magnesium">Magnesium (mg):</label>
                                    <input type="number" id="edit-ingredient-magnesium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-manganese">Manganese (mg):</label>
                                    <input type="number" id="edit-ingredient-manganese" step="0.01" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-phosphorus">Phosphorus (mg):</label>
                                    <input type="number" id="edit-ingredient-phosphorus" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-potassium">Potassium (mg):</label>
                                    <input type="number" id="edit-ingredient-potassium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-selenium">Selenium (µg):</label>
                                    <input type="number" id="edit-ingredient-selenium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-sodium">Sodium (mg):</label>
                                    <input type="number" id="edit-ingredient-sodium" step="0.1" min="0">
                                </div>
                                <div class="nutrition-item">
                                    <label for="edit-ingredient-zinc">Zinc (mg):</label>
                                    <input type="number" id="edit-ingredient-zinc" step="0.01" min="0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-ingredient-btn">Save Changes</button>
                        <button type="button" class="cancel-edit-btn">Cancel</button>
                    </div>
                </form>
                <div class="edit-ingredient-status status"></div>
            </div>
        `;

        container.innerHTML = tableHtml;

        // Add event listeners for the edit buttons
        const editButtons = container.querySelectorAll('.edit-ingredient-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', handleEditIngredientClick);
        });

        // Add event listener for the edit form
        const editForm = container.querySelector('#edit-ingredient-form');
        if (editForm) {
            editForm.addEventListener('submit', handleEditIngredientSubmit);
        }

        // Add event listener for the cancel button
        const cancelButton = container.querySelector('.cancel-edit-btn');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                container.querySelector('.edit-ingredient-form').style.display = 'none';
            });
        }
    }

    // Handle edit ingredient button click
    function handleEditIngredientClick(event) {
        const row = event.target.closest('tr');
        const ingredientId = row.dataset.ingredientId;
        const recipeId = row.dataset.recipeId;
        const container = row.closest('.ingredient-details');
        const editForm = container.querySelector('.edit-ingredient-form');
        const statusElement = container.querySelector('.edit-ingredient-status');

        // Show the edit form
        editForm.style.display = 'block';

        // Fetch the full ingredient data from the API
        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(ingredient => {
                // Populate form fields with current values
                document.getElementById('edit-ingredient-id').value = ingredientId;
                document.getElementById('edit-recipe-id').value = recipeId;

                // Basic information
                document.getElementById('edit-ingredient-name').value = ingredient.name || '';
                document.getElementById('edit-ingredient-amount').value = ingredient.amount || '';
                document.getElementById('edit-ingredient-price').value = ingredient.price || '';

                // General section
                document.getElementById('edit-ingredient-calories').value = ingredient.calories || '';
                document.getElementById('edit-ingredient-alcohol').value = ingredient.alcohol || '';
                document.getElementById('edit-ingredient-caffeine').value = ingredient.caffeine || '';
                document.getElementById('edit-ingredient-water').value = ingredient.water || '';

                // Carbohydrates section
                document.getElementById('edit-ingredient-carbs').value = ingredient.carbohydrates || '';
                document.getElementById('edit-ingredient-fiber').value = ingredient.fiber || '';
                document.getElementById('edit-ingredient-starch').value = ingredient.starch || '';
                document.getElementById('edit-ingredient-sugars').value = ingredient.sugars || '';
                document.getElementById('edit-ingredient-added-sugars').value = ingredient.added_sugars || '';
                document.getElementById('edit-ingredient-net-carbs').value = ingredient.net_carbs || '';

                // Lipids section
                document.getElementById('edit-ingredient-fats').value = ingredient.fats || '';
                document.getElementById('edit-ingredient-monounsaturated').value = ingredient.monounsaturated || '';
                document.getElementById('edit-ingredient-polyunsaturated').value = ingredient.polyunsaturated || '';
                document.getElementById('edit-ingredient-omega3').value = ingredient.omega3 || '';
                document.getElementById('edit-ingredient-omega6').value = ingredient.omega6 || '';
                document.getElementById('edit-ingredient-saturated').value = ingredient.saturated || '';
                document.getElementById('edit-ingredient-trans-fat').value = ingredient.trans_fat || '';
                document.getElementById('edit-ingredient-cholesterol').value = ingredient.cholesterol || '';

                // Protein section
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

                // Vitamins section
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

                // Minerals section
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

                // Clear any previous status messages
                showStatus(statusElement, '', '');

                // Scroll to the edit form
                editForm.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error fetching ingredient details:', error);

                // Fallback to basic data from the table if API fails
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

                // Scroll to the edit form
                editForm.scrollIntoView({ behavior: 'smooth' });
            });
    }

    // Handle edit ingredient form submission
    async function handleEditIngredientSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const container = form.closest('.ingredient-details');
        const statusElement = container.querySelector('.edit-ingredient-status');

        // Show loading status
        showStatus(statusElement, 'Saving changes...', 'info');

        // Get basic form values
        const ingredientId = document.getElementById('edit-ingredient-id').value;
        const recipeId = document.getElementById('edit-recipe-id').value;
        const name = document.getElementById('edit-ingredient-name').value.trim();
        const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);
        const price = parseFloat(document.getElementById('edit-ingredient-price').value);

        // Get required nutrition values
        const calories = parseFloat(document.getElementById('edit-ingredient-calories').value);
        const protein = parseFloat(document.getElementById('edit-ingredient-protein').value);
        const fats = parseFloat(document.getElementById('edit-ingredient-fats').value);
        const carbohydrates = parseFloat(document.getElementById('edit-ingredient-carbs').value);

        // Validate required form values
        if (!name || isNaN(calories) || isNaN(amount) || isNaN(protein) || isNaN(fats) || isNaN(carbohydrates) || isNaN(price)) {
            showStatus(statusElement, 'Please fill all required fields with valid values.', 'error');
            return;
        }

        // Prepare data for API call - start with required fields
        const ingredientData = {
            name,
            calories,
            amount,
            protein,
            fats,
            carbohydrates,
            price
        };

        // Add optional General section fields
        const alcohol = parseFloat(document.getElementById('edit-ingredient-alcohol').value);
        if (!isNaN(alcohol)) ingredientData.alcohol = alcohol;

        const caffeine = parseFloat(document.getElementById('edit-ingredient-caffeine').value);
        if (!isNaN(caffeine)) ingredientData.caffeine = caffeine;

        const water = parseFloat(document.getElementById('edit-ingredient-water').value);
        if (!isNaN(water)) ingredientData.water = water;

        // Add optional Carbohydrates section fields
        const fiber = parseFloat(document.getElementById('edit-ingredient-fiber').value);
        if (!isNaN(fiber)) ingredientData.fiber = fiber;

        const starch = parseFloat(document.getElementById('edit-ingredient-starch').value);
        if (!isNaN(starch)) ingredientData.starch = starch;

        const sugars = parseFloat(document.getElementById('edit-ingredient-sugars').value);
        if (!isNaN(sugars)) ingredientData.sugars = sugars;

        const addedSugars = parseFloat(document.getElementById('edit-ingredient-added-sugars').value);
        if (!isNaN(addedSugars)) ingredientData.added_sugars = addedSugars;

        const netCarbs = parseFloat(document.getElementById('edit-ingredient-net-carbs').value);
        if (!isNaN(netCarbs)) ingredientData.net_carbs = netCarbs;

        // Add optional Lipids section fields
        const monounsaturated = parseFloat(document.getElementById('edit-ingredient-monounsaturated').value);
        if (!isNaN(monounsaturated)) ingredientData.monounsaturated = monounsaturated;

        const polyunsaturated = parseFloat(document.getElementById('edit-ingredient-polyunsaturated').value);
        if (!isNaN(polyunsaturated)) ingredientData.polyunsaturated = polyunsaturated;

        const omega3 = parseFloat(document.getElementById('edit-ingredient-omega3').value);
        if (!isNaN(omega3)) ingredientData.omega3 = omega3;

        const omega6 = parseFloat(document.getElementById('edit-ingredient-omega6').value);
        if (!isNaN(omega6)) ingredientData.omega6 = omega6;

        const saturated = parseFloat(document.getElementById('edit-ingredient-saturated').value);
        if (!isNaN(saturated)) ingredientData.saturated = saturated;

        const transFat = parseFloat(document.getElementById('edit-ingredient-trans-fat').value);
        if (!isNaN(transFat)) ingredientData.trans_fat = transFat;

        const cholesterol = parseFloat(document.getElementById('edit-ingredient-cholesterol').value);
        if (!isNaN(cholesterol)) ingredientData.cholesterol = cholesterol;

        // Add optional Protein section fields
        const cystine = parseFloat(document.getElementById('edit-ingredient-cystine').value);
        if (!isNaN(cystine)) ingredientData.cystine = cystine;

        const histidine = parseFloat(document.getElementById('edit-ingredient-histidine').value);
        if (!isNaN(histidine)) ingredientData.histidine = histidine;

        const isoleucine = parseFloat(document.getElementById('edit-ingredient-isoleucine').value);
        if (!isNaN(isoleucine)) ingredientData.isoleucine = isoleucine;

        const leucine = parseFloat(document.getElementById('edit-ingredient-leucine').value);
        if (!isNaN(leucine)) ingredientData.leucine = leucine;

        const lysine = parseFloat(document.getElementById('edit-ingredient-lysine').value);
        if (!isNaN(lysine)) ingredientData.lysine = lysine;

        const methionine = parseFloat(document.getElementById('edit-ingredient-methionine').value);
        if (!isNaN(methionine)) ingredientData.methionine = methionine;

        const phenylalanine = parseFloat(document.getElementById('edit-ingredient-phenylalanine').value);
        if (!isNaN(phenylalanine)) ingredientData.phenylalanine = phenylalanine;

        const threonine = parseFloat(document.getElementById('edit-ingredient-threonine').value);
        if (!isNaN(threonine)) ingredientData.threonine = threonine;

        const tryptophan = parseFloat(document.getElementById('edit-ingredient-tryptophan').value);
        if (!isNaN(tryptophan)) ingredientData.tryptophan = tryptophan;

        const tyrosine = parseFloat(document.getElementById('edit-ingredient-tyrosine').value);
        if (!isNaN(tyrosine)) ingredientData.tyrosine = tyrosine;

        const valine = parseFloat(document.getElementById('edit-ingredient-valine').value);
        if (!isNaN(valine)) ingredientData.valine = valine;

        // Add optional Vitamins section fields
        const vitaminB1 = parseFloat(document.getElementById('edit-ingredient-vitamin-b1').value);
        if (!isNaN(vitaminB1)) ingredientData.vitamin_b1 = vitaminB1;

        const vitaminB2 = parseFloat(document.getElementById('edit-ingredient-vitamin-b2').value);
        if (!isNaN(vitaminB2)) ingredientData.vitamin_b2 = vitaminB2;

        const vitaminB3 = parseFloat(document.getElementById('edit-ingredient-vitamin-b3').value);
        if (!isNaN(vitaminB3)) ingredientData.vitamin_b3 = vitaminB3;

        const vitaminB5 = parseFloat(document.getElementById('edit-ingredient-vitamin-b5').value);
        if (!isNaN(vitaminB5)) ingredientData.vitamin_b5 = vitaminB5;

        const vitaminB6 = parseFloat(document.getElementById('edit-ingredient-vitamin-b6').value);
        if (!isNaN(vitaminB6)) ingredientData.vitamin_b6 = vitaminB6;

        const vitaminB12 = parseFloat(document.getElementById('edit-ingredient-vitamin-b12').value);
        if (!isNaN(vitaminB12)) ingredientData.vitamin_b12 = vitaminB12;

        const folate = parseFloat(document.getElementById('edit-ingredient-folate').value);
        if (!isNaN(folate)) ingredientData.folate = folate;

        const vitaminA = parseFloat(document.getElementById('edit-ingredient-vitamin-a').value);
        if (!isNaN(vitaminA)) ingredientData.vitamin_a = vitaminA;

        const vitaminC = parseFloat(document.getElementById('edit-ingredient-vitamin-c').value);
        if (!isNaN(vitaminC)) ingredientData.vitamin_c = vitaminC;

        const vitaminD = parseFloat(document.getElementById('edit-ingredient-vitamin-d').value);
        if (!isNaN(vitaminD)) ingredientData.vitamin_d = vitaminD;

        const vitaminE = parseFloat(document.getElementById('edit-ingredient-vitamin-e').value);
        if (!isNaN(vitaminE)) ingredientData.vitamin_e = vitaminE;

        const vitaminK = parseFloat(document.getElementById('edit-ingredient-vitamin-k').value);
        if (!isNaN(vitaminK)) ingredientData.vitamin_k = vitaminK;

        // Add optional Minerals section fields
        const calcium = parseFloat(document.getElementById('edit-ingredient-calcium').value);
        if (!isNaN(calcium)) ingredientData.calcium = calcium;

        const copper = parseFloat(document.getElementById('edit-ingredient-copper').value);
        if (!isNaN(copper)) ingredientData.copper = copper;

        const iron = parseFloat(document.getElementById('edit-ingredient-iron').value);
        if (!isNaN(iron)) ingredientData.iron = iron;

        const magnesium = parseFloat(document.getElementById('edit-ingredient-magnesium').value);
        if (!isNaN(magnesium)) ingredientData.magnesium = magnesium;

        const manganese = parseFloat(document.getElementById('edit-ingredient-manganese').value);
        if (!isNaN(manganese)) ingredientData.manganese = manganese;

        const phosphorus = parseFloat(document.getElementById('edit-ingredient-phosphorus').value);
        if (!isNaN(phosphorus)) ingredientData.phosphorus = phosphorus;

        const potassium = parseFloat(document.getElementById('edit-ingredient-potassium').value);
        if (!isNaN(potassium)) ingredientData.potassium = potassium;

        const selenium = parseFloat(document.getElementById('edit-ingredient-selenium').value);
        if (!isNaN(selenium)) ingredientData.selenium = selenium;

        const sodium = parseFloat(document.getElementById('edit-ingredient-sodium').value);
        if (!isNaN(sodium)) ingredientData.sodium = sodium;

        const zinc = parseFloat(document.getElementById('edit-ingredient-zinc').value);
        if (!isNaN(zinc)) ingredientData.zinc = zinc;

        try {
            // Call the API to update the ingredient
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

            // Update the displayed ingredients
            renderIngredientDetails(updatedRecipe.ingredients, container);

            // Hide the edit form
            container.querySelector('.edit-ingredient-form').style.display = 'none';

            // Update the recipe calories display
            const recipeItem = container.closest('.recipe-display-item');
            const caloriesSpan = recipeItem.querySelector('.recipe-calories');
            if (caloriesSpan) {
                caloriesSpan.textContent = updatedRecipe.total_calories.toFixed(1);
            }

            showStatus(statusElement, 'Ingredient updated successfully!', 'success');

        } catch (error) {
            console.error('Error updating ingredient:', error);
            showStatus(statusElement, `Error: ${error.message}`, 'error');
        }
    }

    // Event delegation for recipe list actions (Delete, Adjust, View)
    recipeListContainer.addEventListener('click', async (event) => { // Make async for await
        const target = event.target;
        const recipeItem = target.closest('.recipe-display-item');
        if (!recipeItem) return; // Click wasn't inside a recipe item

        const recipeId = recipeItem.dataset.id;
        const currentCaloriesSpan = recipeItem.querySelector('.recipe-calories');
        const currentCalories = parseFloat(currentCaloriesSpan?.textContent || '0');

        if (target.classList.contains('delete-recipe-btn')) {
            deleteRecipe(recipeId);
        }
        // --- Calorie Adjustment Handlers ---
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
         // --- View Ingredients Handler ---
        else if (target.classList.contains('view-ingredients-btn')) {
            const detailsDiv = recipeItem.querySelector('.ingredient-details');
            await fetchAndDisplayIngredients(recipeId, detailsDiv, target); // Pass button to toggle text
        }
    });

    // --- Add Event Listener for Weight Goal Form --- //
    if (weightGoalForm) { // Ensure the form exists before adding listener
        weightGoalForm.addEventListener('submit', saveWeightGoal);
    } else {
        console.error("Could not find weight goal form element (#weight-goal-form) to attach listener.");
    }

    // --- Add Event Listener for User Selector --- //
    if (userSelector) {
        userSelector.addEventListener('change', function() {
            currentUserId = this.value; // Update the current user ID
            console.log(`Switched to user ID: ${currentUserId}`);

            // Save the user preference to localStorage
            localStorage.setItem('weightUserPreference', currentUserId);

            // Reload data for the selected user
            loadWeightGoal();

            // Destroy existing chart before loading new data
            if (weightGoalChart) {
                weightGoalChart.destroy();
                weightGoalChart = null;
            }

            // Load and render the chart with the new user data
            console.log(`Loading chart data for user ID: ${currentUserId}`);
            loadAndRenderWeightChart();

            // Update the user selector label
            const userLabel = currentUserId == 1 ? 'My Data' : 'Mom\'s Data';
            showStatus(weightGoalStatus, `Switched to ${userLabel}`, 'info');
            setTimeout(() => showStatus(weightGoalStatus, '', ''), 2000); // Clear after 2 seconds
        });
    } else {
        console.error("Could not find user selector element (#user-selector) to attach listener.");
    }

    // --- Add Event Listeners for Axis Scale Controls --- //

    // X-Axis Scale Slider
    if (xAxisScaleSlider) {
        xAxisScaleSlider.addEventListener('input', function() {
            xAxisScale = parseFloat(this.value);
            xScaleValue.textContent = xAxisScale.toFixed(1) + 'x';
            console.log(`X-axis scale set to ${xAxisScale}x`);
            if (weightGoalChart) {
                // Update the chart's x-axis min and max
                const chart = weightGoalChart;
                const dataLength = chart.data.labels.length;

                if (dataLength <= 1) {
                    // Not enough data points to scale
                    return;
                }

                // Calculate the visible range based on the scale
                // For values < 1: Show more data points (zoom out)
                // For values > 1: Show fewer data points (zoom in)
                let visiblePoints;

                // Base calculation on the total data length and scale
                if (xAxisScale <= 1) {
                    // Zoom out (show more data)
                    // When scale is very small, show more than the available data points
                    // to allow for future projections and past data
                    const extraPoints = Math.round((1 - xAxisScale) * 10); // Add extra points as scale decreases
                    visiblePoints = Math.min(dataLength * 2, Math.round(dataLength / xAxisScale) + extraPoints);
                } else {
                    // Zoom in (show less data)
                    visiblePoints = Math.max(5, Math.round(dataLength / xAxisScale));
                }

                // Always show all data points plus extra when scale is at minimum
                if (xAxisScale === 0.1) {
                    visiblePoints = dataLength * 2; // Show twice as many points as we have data
                }

                // Ensure we always show at least 2 weeks of data (14 points)
                visiblePoints = Math.max(visiblePoints, 14);

                console.log(`X-axis scale: ${xAxisScale}, Data length: ${dataLength}, Visible points: ${visiblePoints}`);

                // Find today's index or the most recent data point
                let todayIndex = -1;
                const today = new Date().toLocaleDateString();

                // First try to find exact match for today
                for (let i = 0; i < chart.data.labels.length; i++) {
                    const labelDate = new Date(chart.data.labels[i]).toLocaleDateString();
                    if (labelDate === today) {
                        todayIndex = i;
                        break;
                    }
                }

                // If today not found, use the most recent data point
                if (todayIndex === -1) {
                    todayIndex = dataLength - 1;
                }

                // Calculate the center point for our view
                const centerIndex = todayIndex;

                // Calculate min and max indices centered around today/most recent point
                // Allow for negative minIndex and maxIndex beyond dataLength to show past/future dates
                let minIndex = centerIndex - Math.floor(visiblePoints / 2);
                let maxIndex = minIndex + visiblePoints - 1;

                // When zoomed out (scale < 1), allow showing dates beyond the available data
                // This enables seeing future projections and past data
                if (xAxisScale < 1) {
                    // Allow negative minIndex (past dates before first data point)
                    // and maxIndex beyond dataLength (future dates after last data point)

                    // Ensure we're centered around today/most recent point
                    minIndex = centerIndex - Math.floor(visiblePoints / 2);
                    maxIndex = minIndex + visiblePoints - 1;

                    // Add extra padding for future dates when zoomed out
                    const futurePadding = Math.round((1 - xAxisScale) * 10);
                    maxIndex += futurePadding;
                } else {
                    // When zoomed in, ensure we stay within data boundaries
                    minIndex = Math.max(0, minIndex);
                    maxIndex = Math.min(dataLength - 1, maxIndex);

                    // If we hit the right boundary, adjust the left boundary
                    if (maxIndex === dataLength - 1 && minIndex > 0) {
                        minIndex = Math.max(0, dataLength - visiblePoints);
                    }

                    // If we hit the left boundary, adjust the right boundary
                    if (minIndex === 0 && maxIndex < dataLength - 1) {
                        maxIndex = Math.min(dataLength - 1, visiblePoints - 1);
                    }
                }

                console.log(`X-axis range: ${minIndex} to ${maxIndex} (${maxIndex - minIndex + 1} points)`);

                // Add margin to the left side of the chart (1 extra point)
                let adjustedMinIndex = minIndex - 1;

                // Set the min and max for the x-axis
                chart.options.scales.x.min = adjustedMinIndex;
                chart.options.scales.x.max = maxIndex;

                // IMPORTANT: Temporarily disable annotations during x-axis scaling
                let originalAnnotationConfig = null;

                // Safely backup and remove annotation plugin
                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {
                        // Store the original annotation configuration
                        originalAnnotationConfig = chart.options.plugins.annotation;

                        // Completely remove the annotation plugin during the update
                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during x-axis scaling:', error);
                        // If we can't backup, just remove the annotation plugin
                        delete chart.options.plugins.annotation;
                    }
                }

                // Disable animations during scale changes
                chart.options.animation = false;

                try {
                    // First update without annotations
                    chart.update('none');

                    // If we had annotations before, restore them after the update
                    if (originalAnnotationConfig) {
                        // Wait a short time before re-enabling annotations
                        setTimeout(() => {
                            try {
                                // Restore the annotation plugin with the original configuration
                                chart.options.plugins.annotation = originalAnnotationConfig;

                                // Update again with annotations, but with animations disabled
                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error restoring annotations after x-axis scaling:', annotationError);
                                // If restoring annotations fails, continue without them
                            }
                        }, 300); // Increased timeout to ensure chart is fully updated first
                    }
                } catch (error) {
                    console.error('Error updating chart during x-axis scaling:', error);
                    // If update fails, try a simpler update
                    chart.update();
                }
            }
        });

        // Also add change event for when slider is released
        xAxisScaleSlider.addEventListener('change', function() {
            // This event fires when the slider is released
            // Force a more aggressive update
            if (weightGoalChart) {
                const chart = weightGoalChart;
                const dataLength = chart.data.labels.length;

                if (dataLength <= 1) {
                    // Not enough data points to scale
                    return;
                }

                // Force update with the final scale value
                console.log(`X-axis scale finalized at ${xAxisScale}x`);

                // Recalculate everything and update
                // This is the same code as in the input event, but we call it again to ensure it takes effect
                // Calculate the visible range based on the scale
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

                // Find today's index or the most recent data point
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

                // Calculate min and max indices
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

                // IMPORTANT: Temporarily disable annotations during x-axis scaling
                let originalAnnotationConfig = null;

                // Safely backup and remove annotation plugin
                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {
                        // Store the original annotation configuration
                        originalAnnotationConfig = chart.options.plugins.annotation;

                        // Completely remove the annotation plugin during the update
                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during x-axis scaling:', error);
                        // If we can't backup, just remove the annotation plugin
                        delete chart.options.plugins.annotation;
                    }
                }

                // Disable animations during scale changes
                chart.options.animation = false;

                try {
                    // First update without annotations
                    chart.update('none');

                    // If we had annotations before, restore them after the update
                    if (originalAnnotationConfig) {
                        // Wait a short time before re-enabling annotations
                        setTimeout(() => {
                            try {
                                // Restore the annotation plugin with the original configuration
                                chart.options.plugins.annotation = originalAnnotationConfig;

                                // Update again with annotations, but with animations disabled
                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error restoring annotations after x-axis scaling:', annotationError);
                                // If restoring annotations fails, continue without them
                            }
                        }, 300); // Increased timeout to ensure chart is fully updated first
                    }
                } catch (error) {
                    console.error('Error updating chart during x-axis scaling:', error);
                    // If update fails, try a simpler update
                    chart.update();
                }
            }
        });
    } else {
        console.error("Could not find x-axis scale slider element (#x-axis-scale) to attach listener.");
    }

    // Y-Axis Scale Slider
    if (yAxisScaleSlider) {
        // Function to calculate and set y-axis min/max based on scale
        function updateChartYAxisScale(chart, scale, animate = false) {
            if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) {
                return;
            }

            // On initial load, use scale=1 to ensure proper display
            if (scale !== 1 && !chart._initialScaleApplied) {
                console.log('Forcing initial scale to 1.0x for first render');
                scale = 1.0;
                chart._initialScaleApplied = true;
            }

            // Find min and max data points
            let minDataPoint = Number.MAX_VALUE;
            let maxDataPoint = Number.MIN_VALUE;
            const validPoints = [];

            // Collect all valid data points
            chart.data.datasets.forEach(dataset => {
                if (dataset.data && Array.isArray(dataset.data)) {
                    dataset.data.forEach(point => {
                        // Handle different data formats
                        let yValue = null;

                        if (typeof point === 'number') {
                            // Simple number format
                            yValue = point;
                        } else if (point && typeof point === 'object') {
                            // Object format with y property
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

            // If no valid data points, return
            if (minDataPoint === Number.MAX_VALUE || validPoints.length === 0) {
                console.warn('No valid data points found for y-axis scaling');
                return;
            }

            // Calculate the range of the data
            const dataRange = maxDataPoint - minDataPoint;

            // Add a minimum range to prevent division by zero or tiny ranges
            const effectiveRange = Math.max(dataRange, 0.1);

            // Calculate the center of the data range
            const dataCenter = (maxDataPoint + minDataPoint) / 2;

            // Calculate the scaled range based on the scale factor
            let scaledRange;

            if (scale <= 1) {
                // Zoom out (show more data)
                scaledRange = effectiveRange / scale;

                // Add extra padding when zoomed out
                const extraPadding = effectiveRange * (1 - scale) * 0.5;
                scaledRange += extraPadding;
            } else {
                // Zoom in (show less data)
                scaledRange = effectiveRange / scale;
                console.log(`Y-axis zoom in: scale=${scale}, range=${effectiveRange}, scaledRange=${scaledRange}`);
            }

            // Ensure we have a reasonable minimum range (at least 5 units)
            scaledRange = Math.max(scaledRange, 5);

            // Log the calculation for debugging
            console.log(`Y-axis scale: ${scale}, Data range: ${effectiveRange}, Scaled range: ${scaledRange}`);

            // Calculate the new min/max based on the scaled range
            const topPadding = effectiveRange * 0.05; // 5% padding at top
            const bottomPadding = effectiveRange * 0.15; // 15% padding at bottom

            const calculatedMin = dataCenter - (scaledRange / 2) - bottomPadding;
            const calculatedMax = dataCenter + (scaledRange / 2) + topPadding;

            // Add extra padding at the bottom to ensure points don't go below view
            const extraBottomPadding = effectiveRange * 0.15; // 15% extra padding at bottom
            const finalMin = calculatedMin - extraBottomPadding;

            // Ensure there's always a minimum visible range, even with high zoom
            const minVisibleRange = maxDataPoint * 0.1; // At least 10% of max value
            const adjustedMin = (calculatedMax - finalMin < minVisibleRange) ?
                calculatedMax - minVisibleRange : finalMin;

            // IMPORTANT: Completely disable annotations during scaling to prevent errors
            // Store the original annotation configuration to restore it later
            let originalAnnotationConfig = null;

            // Safely backup and remove annotation plugin
            if (chart.options.plugins && chart.options.plugins.annotation) {
                try {
                    // Store the original annotation configuration
                    originalAnnotationConfig = chart.options.plugins.annotation;

                    // Completely remove the annotation plugin during the update
                    delete chart.options.plugins.annotation;
                } catch (error) {
                    console.error('Error backing up annotations:', error);
                    // If we can't backup, just remove the annotation plugin
                    delete chart.options.plugins.annotation;
                }
            }

            // Update the chart's y-axis min/max
            chart.options.scales.y.min = adjustedMin; // Use adjustedMin with extra bottom padding
            chart.options.scales.y.max = calculatedMax;

            // Disable animations during scale changes to prevent visual glitches
            chart.options.animation = false;

            try {
                // First update without annotations
                chart.update('none');

                // If we had annotations before, restore them after the update
                if (originalAnnotationConfig) {
                    // Wait a short time before re-enabling annotations
                    setTimeout(() => {
                        try {
                            // Restore the annotation plugin with the original configuration
                            chart.options.plugins.annotation = originalAnnotationConfig;

                            // Update again with annotations, but with animations disabled
                            chart.update('none');
                        } catch (annotationError) {
                            console.error('Error restoring annotations:', annotationError);
                            // If restoring annotations fails, continue without them
                        }
                    }, 300); // Increased timeout to ensure chart is fully updated first
                }
            } catch (error) {
                console.error('Error updating chart:', error);

                // If the update fails, try a more aggressive approach
                try {
                    // Disable all plugins temporarily
                    const originalPlugins = {...chart.options.plugins};
                    chart.options.plugins = {};

                    // Update with minimal configuration
                    chart.update('none');

                    // Restore original plugins except annotation
                    const cleanPlugins = {...originalPlugins};
                    delete cleanPlugins.annotation; // Ensure annotation is removed
                    chart.options.plugins = cleanPlugins;

                    // Final update with clean plugins
                    chart.update('none');
                } catch (fallbackError) {
                    console.error('Fallback update also failed:', fallbackError);
                }
            }
        }

        // Handle slider input (during drag)
        yAxisScaleSlider.addEventListener('input', function() {
            yAxisScale = parseFloat(this.value);
            yScaleValue.textContent = yAxisScale.toFixed(1) + 'x';

            if (weightGoalChart) {
                // Update the chart with the new scale (no animation during drag)
                updateChartYAxisScale(weightGoalChart, yAxisScale, false);
                console.log(`Y-axis scale set to ${yAxisScale}x`);
            }
        });

        // Handle slider change (on release)
        yAxisScaleSlider.addEventListener('change', function() {
            if (weightGoalChart) {
                // Update the chart with the new scale (with animation on release)
                updateChartYAxisScale(weightGoalChart, yAxisScale, true);
                console.log(`Y-axis scale finalized at ${yAxisScale}x`);
            }
        });
    } else {
        console.error("Could not find y-axis scale slider element (#y-axis-scale) to attach listener.");
    }

    // Reset Scale Button
    if (resetScaleButton) {
        resetScaleButton.addEventListener('click', function() {
            // Reset both sliders to default value (1)
            xAxisScaleSlider.value = 1;
            yAxisScaleSlider.value = 1;
            xAxisScale = 1;
            yAxisScale = 1;
            xScaleValue.textContent = '1.0x';
            yScaleValue.textContent = '1.0x';

            if (weightGoalChart) {
                // Reset the chart's axes to show all data
                const chart = weightGoalChart;

                // Reset x-axis limits to show all data
                if (chart.options.scales.x) {
                    chart.options.scales.x.min = 0;
                    chart.options.scales.x.max = chart.data.labels.length - 1;
                }

                // Find min and max data points for y-axis
                let minDataPoint = Number.MAX_VALUE;
                let maxDataPoint = Number.MIN_VALUE;

                // Collect all valid data points
                chart.data.datasets.forEach(dataset => {
                    dataset.data.forEach(point => {
                        if (point && point.y !== null && point.y !== undefined && !isNaN(point.y)) {
                            if (point.y < minDataPoint) minDataPoint = point.y;
                            if (point.y > maxDataPoint) maxDataPoint = point.y;
                        }
                    });
                });

                // If we have valid data points, set the y-axis range with generous padding
                if (minDataPoint !== Number.MAX_VALUE && maxDataPoint !== Number.MIN_VALUE) {
                    const dataRange = maxDataPoint - minDataPoint;
                    const topPadding = dataRange * 0.05; // 5% padding at top
                    const bottomPadding = dataRange * 0.15; // 15% padding at bottom

                    // Add extra padding at the bottom to ensure points don't go below view
                    const extraBottomPadding = dataRange * 0.15; // 15% extra padding

                    // Reset y-axis limits to show all data with padding
                    const calculatedMin = minDataPoint - bottomPadding - extraBottomPadding;
                    const calculatedMax = maxDataPoint + topPadding;

                    // Ensure there's always a minimum visible range
                    const minVisibleRange = maxDataPoint * 0.1; // At least 10% of max value
                    const adjustedMin = (calculatedMax - calculatedMin < minVisibleRange) ?
                        calculatedMax - minVisibleRange : calculatedMin;

                    chart.options.scales.y.min = adjustedMin;
                    chart.options.scales.y.max = calculatedMax;
                } else {
                    // If no valid data points, use undefined to let Chart.js decide
                    chart.options.scales.y.min = undefined;
                    chart.options.scales.y.max = undefined;
                }

                // Add a brief animation for the reset
                chart.options.animation = {
                    duration: 500,
                    easing: 'easeOutQuad'
                };

                // Save current annotations
                let hasAnnotations = false;
                let safeAnnotations = null;

                // Safely extract annotation configuration
                if (chart.options.plugins && chart.options.plugins.annotation &&
                    chart.options.plugins.annotation.annotations) {
                    hasAnnotations = true;

                    // Create a clean copy of annotations
                    safeAnnotations = {};
                    const originalAnnotations = chart.options.plugins.annotation.annotations;

                    // Only copy the essential properties to avoid reference issues
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

                    // Temporarily remove annotations
                    chart.options.plugins.annotation = false;
                }

                // IMPORTANT: Completely disable annotations during reset to prevent errors
                let originalAnnotationConfig = null;

                // Safely backup and remove annotation plugin
                if (chart.options.plugins && chart.options.plugins.annotation) {
                    try {
                        // Store the original annotation configuration
                        originalAnnotationConfig = chart.options.plugins.annotation;

                        // Completely remove the annotation plugin during the update
                        delete chart.options.plugins.annotation;
                    } catch (error) {
                        console.error('Error backing up annotations during reset:', error);
                        // If we can't backup, just remove the annotation plugin
                        delete chart.options.plugins.annotation;
                    }
                }

                // Perform a complete reset and update
                chart.reset();
                chart.update('none');

                // Re-add annotations after the update if they existed
                if (hasAnnotations && safeAnnotations) {
                    try {
                        // Wait a short time before re-enabling annotations
                        setTimeout(() => {
                            try {
                                // Re-enable annotation plugin with safe configuration
                                chart.options.plugins.annotation = {
                                    annotations: safeAnnotations,
                                    clip: false,
                                    interaction: { mode: 'nearest' },
                                    animations: { duration: 0 }
                                };

                                // Do a final update with annotations
                                chart.update('none');
                            } catch (annotationError) {
                                console.error('Error re-enabling annotations during reset:', annotationError);
                                // Continue without annotations if there's an error
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

    // --- Calorie Target Functions --- //

    // Save calorie target for the selected user
    async function saveCalorieTarget() {
        const userId = calorieUserSelector.value;
        const calorieTarget = parseInt(calorieTargetInput.value);

        if (isNaN(calorieTarget) || calorieTarget < 500 || calorieTarget > 10000) {
            showStatus(calorieTargetStatus, 'Please enter a valid calorie target between 500 and 10000.', 'error');
            return;
        }

        showStatus(calorieTargetStatus, 'Saving calorie target...', 'info');

        try {
            console.log(`Attempting to save calorie target for user ${userId}: ${calorieTarget} calories`);

            // First try the dedicated calorie targets API
            let response = await fetch('/api/calorie-targets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    daily_target: calorieTarget
                })
            });
            console.log(`Received response with status: ${response.status}`);

            // If the API returns 404, try the weight API endpoint
            if (response.status === 404) {
                console.log('Calorie targets API not found, trying weight API endpoint');
                response = await fetch('/api/weight/calorie-targets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        daily_target: calorieTarget
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
            showStatus(calorieTargetStatus, 'Calorie target saved successfully!', 'success');

            // Update the displayed current target
            loadCalorieTarget(userId);

            // Clear the input
            calorieTargetInput.value = '';

        } catch (error) {
            console.error('Error saving calorie target:', error);
            showStatus(calorieTargetStatus, `Error saving calorie target: ${error.message}`, 'error');

            // Still update the display to show the current value
            setTimeout(() => {
                loadCalorieTarget(userId);
            }, 2000);
        }
    }

    // Load calorie target for the specified user
    async function loadCalorieTarget(userId) {
        try {
            console.log(`Attempting to fetch calorie target for user ${userId}`);

            // First try the dedicated calorie targets API
            let response = await fetch(`/api/calorie-targets/${userId}`);
            console.log(`Received response with status: ${response.status}`);

            // If the API returns 404, try the weight API endpoint
            if (response.status === 404) {
                // Try the weight API endpoint
                try {
                    console.log('Calorie targets API not found or no target, trying weight API endpoint');
                    response = await fetch(`/api/weight/calorie-targets/${userId}`);
                    console.log(`Received response from weight API with status: ${response.status}`);
                } catch (weightApiError) {
                    console.error('Error fetching from weight API:', weightApiError);
                }
            }

            if (response.status === 404) {
                // No target set for this user in either API
                console.log('No calorie target found for this user');
                currentCalorieTarget.textContent = 'Not set';
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
            console.log('Calorie target data:', data);

            // Handle different response formats
            const dailyTarget = data.daily_target || data.target || data.calories || data.value;

            if (dailyTarget) {
                currentCalorieTarget.textContent = `${dailyTarget} calories`;
            } else {
                console.warn('Unexpected calorie target data format:', data);
                currentCalorieTarget.textContent = 'Not set';
            }

        } catch (error) {
            console.error('Error loading calorie target:', error);
            currentCalorieTarget.textContent = 'Not set'; // Default to 'Not set' instead of error
        }
    }

    // Event listener for the save calorie target button
    if (saveCalorieTargetBtn) {
        saveCalorieTargetBtn.addEventListener('click', saveCalorieTarget);
    }

    // Event listener for the calorie user selector
    if (calorieUserSelector) {
        calorieUserSelector.addEventListener('change', function() {
            const userId = this.value;
            loadCalorieTarget(userId);
        });
    }

    // Quick target buttons have been removed

    // Event listener for the user selector (weight goals)
    if (userSelector) {
        userSelector.addEventListener('change', function() {
            // Update the current user ID
            currentUserId = this.value;

            // Save the preference to localStorage
            localStorage.setItem('weightUserPreference', currentUserId);

            // Destroy the current chart to prevent tooltip issues
            if (weightGoalChart) {
                weightGoalChart.destroy();
                weightGoalChart = null;
            }

            // Load data for the new user
            loadWeightGoal();
            loadAndRenderWeightChart();

            // Fix tooltips after chart is reloaded
            setTimeout(fixTooltips, 1000);

            console.log(`Switched to user ID: ${currentUserId}`);
        });
    }

    // Function to ensure tooltips work properly
    function fixTooltips() {
        if (!weightGoalChart || !weightGoalChartCanvas) return;

        // Re-attach custom tooltip events
        if (window.attachWeightChartTooltipEvents) {
            window.attachWeightChartTooltipEvents(weightGoalChart);
            console.log('Re-attached custom tooltip events to chart');
        } else {
            console.error('Custom tooltip functions not available');
        }
    }

    // --- Initial Load --- //
    loadWeightGoal(); // Load saved goal
    loadAndRenderWeightChart(); // Attempt to load chart data
    loadRecipes();
    loadCalorieTarget(calorieUserSelector.value); // Load calorie target for the default user

    // Fix tooltips after a short delay to ensure chart is fully rendered
    setTimeout(fixTooltips, 1000);
});