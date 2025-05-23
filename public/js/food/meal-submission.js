/**
 * Meal Submission
 * 
 * This module handles the meal submission functionality, including:
 * - Opening and closing the meal submission modal
 * - Searching for existing ingredients
 * - Adding new ingredients with the Cronometer processor
 * - Submitting meal data to the server
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addMealBtn = document.getElementById('add-meal-btn');
    const mealSubmissionModal = document.getElementById('meal-submission-modal');
    const newIngredientModal = document.getElementById('new-ingredient-modal');
    const mealSubmissionForm = document.getElementById('meal-submission-form');
    const newIngredientForm = document.getElementById('new-ingredient-form');
    const ingredientSearch = document.getElementById('ingredient-search');
    const ingredientSearchResults = document.getElementById('ingredient-search-results');
    const addNewIngredientBtn = document.getElementById('add-new-ingredient-btn');
    const selectedIngredientsList = document.querySelector('.selected-ingredients-list');
    const emptyMessage = selectedIngredientsList.querySelector('.empty-message');
    
    // Nutrition summary elements
    const mealCalories = document.getElementById('meal-calories');
    const mealProtein = document.getElementById('meal-protein');
    const mealCarbs = document.getElementById('meal-carbs');
    const mealFat = document.getElementById('meal-fat');
    
    // Cronometer parser elements
    const newIngredientCronometerText = document.getElementById('new-ingredient-cronometer-text');
    const newIngredientParseButton = document.getElementById('new-ingredient-parse-button');
    const newIngredientParseStatus = document.getElementById('new-ingredient-parse-status');
    
    // Hidden nutrition fields
    const newIngredientCalories = document.getElementById('new-ingredient-calories');
    const newIngredientProtein = document.getElementById('new-ingredient-protein');
    const newIngredientFat = document.getElementById('new-ingredient-fat');
    const newIngredientCarbs = document.getElementById('new-ingredient-carbs');
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close, .cancel-btn');
    
    // State
    let selectedIngredients = [];
    let allIngredients = [];
    
    // Set default date to today
    const today = new Date();
    const dateInput = document.getElementById('meal-date');
    dateInput.value = today.toISOString().split('T')[0];
    
    // Set default time to current time
    const timeInput = document.getElementById('meal-time');
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    timeInput.value = `${hours}:${minutes}`;
    
    // ===== EVENT LISTENERS =====
    
    // Open meal submission modal
    addMealBtn.addEventListener('click', function() {
        mealSubmissionModal.style.display = 'block';
        fetchIngredients();
    });
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            mealSubmissionModal.style.display = 'none';
            newIngredientModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === mealSubmissionModal) {
            mealSubmissionModal.style.display = 'none';
        }
        if (event.target === newIngredientModal) {
            newIngredientModal.style.display = 'none';
        }
    });
    
    // Ingredient search
    ingredientSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm.length < 2) {
            ingredientSearchResults.style.display = 'none';
            return;
        }
        
        const filteredIngredients = allIngredients.filter(ingredient => 
            ingredient.name.toLowerCase().includes(searchTerm)
        );
        
        displaySearchResults(filteredIngredients);
    });
    
    // Open new ingredient modal
    addNewIngredientBtn.addEventListener('click', function() {
        newIngredientModal.style.display = 'block';
        newIngredientForm.reset();
        newIngredientParseStatus.textContent = '';
        newIngredientParseStatus.className = 'cronometer-parse-status';
    });
    
    // Parse Cronometer text
    newIngredientParseButton.addEventListener('click', function() {
        const text = newIngredientCronometerText.value.trim();
        if (text) {
            parseCronometerText(text);
        } else {
            showParseStatus('Please paste Cronometer nutrition data first', 'error');
        }
    });
    
    // Add new ingredient to meal
    newIngredientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('new-ingredient-name').value.trim();
        const amount = parseFloat(document.getElementById('new-ingredient-amount').value);
        const calories = parseFloat(newIngredientCalories.value) || 0;
        const protein = parseFloat(newIngredientProtein.value) || 0;
        const fat = parseFloat(newIngredientFat.value) || 0;
        const carbs = parseFloat(newIngredientCarbs.value) || 0;
        
        if (!name || isNaN(amount) || amount <= 0) {
            showParseStatus('Please enter a valid name and amount', 'error');
            return;
        }
        
        if (calories <= 0) {
            showParseStatus('Please parse nutrition data first', 'error');
            return;
        }
        
        const newIngredient = {
            id: 'temp-' + Date.now(), // Temporary ID for new ingredients
            name,
            amount,
            calories,
            protein,
            fat,
            carbs,
            isNew: true // Flag to indicate this is a new ingredient
        };
        
        addIngredientToSelection(newIngredient);
        newIngredientModal.style.display = 'none';
        newIngredientForm.reset();
    });
    
    // Submit meal
    mealSubmissionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('meal-name').value.trim();
        const date = document.getElementById('meal-date').value;
        const time = document.getElementById('meal-time').value;
        
        if (!name) {
            alert('Please enter a meal name');
            return;
        }
        
        if (selectedIngredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }
        
        const mealData = {
            name,
            date,
            time,
            ingredients: selectedIngredients.map(ing => ({
                id: ing.id,
                name: ing.name,
                amount: ing.amount,
                calories: ing.calories,
                protein: ing.protein,
                fat: ing.fat,
                carbs: ing.carbs,
                isNew: ing.isNew || false
            }))
        };
        
        submitMeal(mealData);
    });
    
    // ===== FUNCTIONS =====
    
    /**
     * Fetch all ingredients from the server
     */
    function fetchIngredients() {
        // Show loading state
        ingredientSearch.placeholder = 'Loading ingredients...';
        ingredientSearch.disabled = true;
        
        // In a real implementation, this would be an API call
        // For now, we'll use a timeout to simulate an API call
        setTimeout(() => {
            // This is where you would fetch ingredients from the server
            // For now, we'll use some dummy data
            allIngredients = [
                { id: 1, name: 'Chicken Breast', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
                { id: 2, name: 'Brown Rice', calories: 112, protein: 2.6, fat: 0.9, carbs: 23.5 },
                { id: 3, name: 'Broccoli', calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
                { id: 4, name: 'Salmon', calories: 206, protein: 22, fat: 13, carbs: 0 },
                { id: 5, name: 'Sweet Potato', calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1 },
                { id: 6, name: 'Avocado', calories: 160, protein: 2, fat: 14.7, carbs: 8.5 },
                { id: 7, name: 'Egg', calories: 78, protein: 6.3, fat: 5.3, carbs: 0.6 },
                { id: 8, name: 'Greek Yogurt', calories: 59, protein: 10, fat: 0.4, carbs: 3.6 }
            ];
            
            // Reset search input
            ingredientSearch.placeholder = 'Type to search ingredients';
            ingredientSearch.disabled = false;
        }, 500);
    }
    
    /**
     * Display search results
     * @param {Array} results - Array of ingredient objects
     */
    function displaySearchResults(results) {
        ingredientSearchResults.innerHTML = '';
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No ingredients found';
            ingredientSearchResults.appendChild(noResults);
        } else {
            results.forEach(ingredient => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.textContent = ingredient.name;
                resultItem.addEventListener('click', () => {
                    addIngredientToSelection(ingredient);
                    ingredientSearch.value = '';
                    ingredientSearchResults.style.display = 'none';
                });
                ingredientSearchResults.appendChild(resultItem);
            });
        }
        
        ingredientSearchResults.style.display = 'block';
    }
    
    /**
     * Add an ingredient to the selected ingredients list
     * @param {Object} ingredient - Ingredient object
     */
    function addIngredientToSelection(ingredient) {
        // Check if ingredient is already selected
        const existingIndex = selectedIngredients.findIndex(ing => ing.id === ingredient.id);
        
        if (existingIndex !== -1) {
            // If already selected, increase the amount
            selectedIngredients[existingIndex].amount += ingredient.amount || 100;
            updateSelectedIngredientsList();
            return;
        }
        
        // Add default amount if not provided
        if (!ingredient.amount) {
            ingredient.amount = 100;
        }
        
        // Add to selected ingredients
        selectedIngredients.push(ingredient);
        
        // Update UI
        updateSelectedIngredientsList();
    }
    
    /**
     * Update the selected ingredients list in the UI
     */
    function updateSelectedIngredientsList() {
        // Clear the list
        selectedIngredientsList.innerHTML = '';
        
        if (selectedIngredients.length === 0) {
            selectedIngredientsList.appendChild(emptyMessage);
            updateNutritionSummary();
            return;
        }
        
        // Add each ingredient to the list
        selectedIngredients.forEach((ingredient, index) => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'selected-ingredient-item';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'selected-ingredient-info';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'selected-ingredient-name';
            nameSpan.textContent = ingredient.name;
            
            const nutritionSpan = document.createElement('span');
            nutritionSpan.className = 'selected-ingredient-nutrition';
            nutritionSpan.textContent = `${ingredient.calories} cal | ${ingredient.protein}g protein | ${ingredient.fat}g fat | ${ingredient.carbs}g carbs`;
            
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(nutritionSpan);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'selected-ingredient-actions';
            
            const amountDiv = document.createElement('div');
            amountDiv.className = 'selected-ingredient-amount';
            
            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.value = ingredient.amount;
            amountInput.min = '1';
            amountInput.step = '1';
            amountInput.addEventListener('change', () => {
                const newAmount = parseFloat(amountInput.value);
                if (!isNaN(newAmount) && newAmount > 0) {
                    selectedIngredients[index].amount = newAmount;
                    updateNutritionSummary();
                }
            });
            
            const amountLabel = document.createElement('span');
            amountLabel.textContent = 'g';
            
            amountDiv.appendChild(amountInput);
            amountDiv.appendChild(amountLabel);
            
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'remove-ingredient-btn';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                selectedIngredients.splice(index, 1);
                updateSelectedIngredientsList();
            });
            
            actionsDiv.appendChild(amountDiv);
            actionsDiv.appendChild(removeButton);
            
            ingredientItem.appendChild(infoDiv);
            ingredientItem.appendChild(actionsDiv);
            
            selectedIngredientsList.appendChild(ingredientItem);
        });
        
        // Update nutrition summary
        updateNutritionSummary();
    }
    
    /**
     * Update the nutrition summary
     */
    function updateNutritionSummary() {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        
        selectedIngredients.forEach(ingredient => {
            // Calculate nutrition based on amount
            const ratio = ingredient.amount / 100; // Assuming nutrition values are per 100g
            totalCalories += ingredient.calories * ratio;
            totalProtein += ingredient.protein * ratio;
            totalFat += ingredient.fat * ratio;
            totalCarbs += ingredient.carbs * ratio;
        });
        
        // Update UI
        mealCalories.textContent = Math.round(totalCalories);
        mealProtein.textContent = Math.round(totalProtein) + 'g';
        mealFat.textContent = Math.round(totalFat) + 'g';
        mealCarbs.textContent = Math.round(totalCarbs) + 'g';
    }
    
    /**
     * Parse Cronometer text using the CronometerParser
     * @param {string} text - Text from Cronometer
     */
    function parseCronometerText(text) {
        showParseStatus('Processing Cronometer data...', 'loading');
        
        try {
            // Use the global CronometerParser if available
            if (window.CronometerParser) {
                const nutritionData = window.CronometerParser.parseText(text);
                
                if (nutritionData.success) {
                    // Update hidden fields
                    newIngredientCalories.value = nutritionData.calories || 0;
                    newIngredientProtein.value = nutritionData.protein || 0;
                    newIngredientFat.value = nutritionData.fat || 0;
                    newIngredientCarbs.value = nutritionData.carbs || 0;
                    
                    showParseStatus('Nutrition data extracted successfully!', 'success');
                } else {
                    showParseStatus('Could not extract nutrition data. Please check the format.', 'error');
                }
            } else {
                // Fallback to a simple parser if CronometerParser is not available
                const caloriesMatch = text.match(/Energy\s*(\d+\.?\d*)\s*kcal/i);
                const proteinMatch = text.match(/Protein\s*(\d+\.?\d*)\s*g/i);
                const fatMatch = text.match(/Fat\s*(\d+\.?\d*)\s*g/i);
                const carbsMatch = text.match(/Carbs\s*(\d+\.?\d*)\s*g/i);
                
                if (caloriesMatch || proteinMatch || fatMatch || carbsMatch) {
                    newIngredientCalories.value = caloriesMatch ? parseFloat(caloriesMatch[1]) : 0;
                    newIngredientProtein.value = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
                    newIngredientFat.value = fatMatch ? parseFloat(fatMatch[1]) : 0;
                    newIngredientCarbs.value = carbsMatch ? parseFloat(carbsMatch[1]) : 0;
                    
                    showParseStatus('Nutrition data extracted successfully!', 'success');
                } else {
                    showParseStatus('Could not extract nutrition data. Please check the format.', 'error');
                }
            }
        } catch (error) {
            console.error('Error parsing Cronometer text:', error);
            showParseStatus(`Error: ${error.message}`, 'error');
        }
    }
    
    /**
     * Show a status message for the Cronometer parser
     * @param {string} message - Message to show
     * @param {string} type - Type of message (success, error, loading)
     */
    function showParseStatus(message, type) {
        newIngredientParseStatus.textContent = message;
        newIngredientParseStatus.className = `cronometer-parse-status ${type}`;
    }
    
    /**
     * Submit meal data to the server
     * @param {Object} mealData - Meal data object
     */
    function submitMeal(mealData) {
        console.log('Submitting meal:', mealData);
        
        // In a real implementation, this would be an API call
        // For now, we'll use a timeout to simulate an API call
        
        // Show loading state
        const submitButton = mealSubmissionForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            // This is where you would send the data to the server
            
            // Reset form and close modal
            mealSubmissionForm.reset();
            selectedIngredients = [];
            updateSelectedIngredientsList();
            mealSubmissionModal.style.display = 'none';
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Show success message
            alert('Meal saved successfully!');
            
            // In a real implementation, you would refresh the meals list
            // For now, we'll just add a dummy meal to the list
            addMealToList(mealData);
        }, 1000);
    }
    
    /**
     * Add a meal to the meals list
     * @param {Object} meal - Meal data object
     */
    function addMealToList(meal) {
        const mealsList = document.getElementById('meals-list');
        
        // Remove empty message if present
        const emptyMessage = mealsList.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        // Create meal card
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        // Create meal header
        const mealHeader = document.createElement('div');
        mealHeader.className = 'meal-header';
        
        const mealTitle = document.createElement('h3');
        mealTitle.className = 'meal-title';
        mealTitle.textContent = meal.name;
        
        const mealDatetime = document.createElement('div');
        mealDatetime.className = 'meal-datetime';
        mealDatetime.textContent = `${meal.date} ${meal.time}`;
        
        mealHeader.appendChild(mealTitle);
        mealHeader.appendChild(mealDatetime);
        
        // Create meal nutrition
        const mealNutrition = document.createElement('div');
        mealNutrition.className = 'meal-nutrition';
        
        // Calculate total nutrition
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        
        meal.ingredients.forEach(ingredient => {
            const ratio = ingredient.amount / 100;
            totalCalories += ingredient.calories * ratio;
            totalProtein += ingredient.protein * ratio;
            totalFat += ingredient.fat * ratio;
            totalCarbs += ingredient.carbs * ratio;
        });
        
        // Create nutrition items
        const caloriesItem = document.createElement('div');
        caloriesItem.className = 'meal-nutrition-item';
        caloriesItem.textContent = `${Math.round(totalCalories)} calories`;
        
        const proteinItem = document.createElement('div');
        proteinItem.className = 'meal-nutrition-item';
        proteinItem.textContent = `${Math.round(totalProtein)}g protein`;
        
        const fatItem = document.createElement('div');
        fatItem.className = 'meal-nutrition-item';
        fatItem.textContent = `${Math.round(totalFat)}g fat`;
        
        const carbsItem = document.createElement('div');
        carbsItem.className = 'meal-nutrition-item';
        carbsItem.textContent = `${Math.round(totalCarbs)}g carbs`;
        
        mealNutrition.appendChild(caloriesItem);
        mealNutrition.appendChild(proteinItem);
        mealNutrition.appendChild(fatItem);
        mealNutrition.appendChild(carbsItem);
        
        // Create ingredients section
        const mealIngredients = document.createElement('div');
        mealIngredients.className = 'meal-ingredients';
        
        const ingredientsTitle = document.createElement('div');
        ingredientsTitle.className = 'meal-ingredients-title';
        ingredientsTitle.textContent = 'Ingredients:';
        
        const ingredientsList = document.createElement('div');
        ingredientsList.className = 'meal-ingredients-list';
        
        meal.ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'meal-ingredient';
            ingredientItem.textContent = `${ingredient.name} (${ingredient.amount}g)`;
            ingredientsList.appendChild(ingredientItem);
        });
        
        mealIngredients.appendChild(ingredientsTitle);
        mealIngredients.appendChild(ingredientsList);
        
        // Create actions
        const mealActions = document.createElement('div');
        mealActions.className = 'meal-actions';
        
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'secondary-btn';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            alert('Edit functionality not implemented yet');
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'cancel-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this meal?')) {
                mealCard.remove();
                
                // If no meals left, show empty message
                if (mealsList.children.length === 0) {
                    const emptyMessage = document.createElement('p');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = 'No meals recorded yet';
                    mealsList.appendChild(emptyMessage);
                }
            }
        });
        
        mealActions.appendChild(editButton);
        mealActions.appendChild(deleteButton);
        
        // Assemble meal card
        mealCard.appendChild(mealHeader);
        mealCard.appendChild(mealNutrition);
        mealCard.appendChild(mealIngredients);
        mealCard.appendChild(mealActions);
        
        // Add to meals list
        mealsList.prepend(mealCard); // Add to the top of the list
    }
});
