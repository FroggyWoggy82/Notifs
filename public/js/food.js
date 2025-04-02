document.addEventListener('DOMContentLoaded', () => {
    const ingredientsList = document.getElementById('ingredients-list');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const createRecipeForm = document.getElementById('create-recipe-form');
    const recipeNameInput = document.getElementById('recipeName');
    const createRecipeStatus = document.getElementById('create-recipe-status');
    const recipeListContainer = document.getElementById('recipe-list');
    const recipesDisplayStatus = document.getElementById('recipes-display-status');

    // Function to create HTML for a single ingredient row
    function createIngredientRowHtml() {
        return `
            <input type="text" placeholder="Ingredient Name" class="ingredient-name" required>
            <input type="number" placeholder="Calories" class="ingredient-calories" step="any" required>
            <input type="number" placeholder="Amount (g)" class="ingredient-amount" step="any" required>
            <input type="number" placeholder="Protein (g)" class="ingredient-protein" step="any" required>
            <input type="number" placeholder="Fat (g)" class="ingredient-fat" step="any" required>
            <input type="number" placeholder="Carbs (g)" class="ingredient-carbs" step="any" required>
            <input type="number" placeholder="Price" class="ingredient-price" step="any" required>
            <button type="button" class="remove-ingredient-btn">Remove</button>
        `;
    }

    // Function to add a new ingredient row to the DOM
    function addIngredientRow() {
        const ingredientItem = document.createElement('div');
        ingredientItem.classList.add('ingredient-item');
        ingredientItem.innerHTML = createIngredientRowHtml();
        ingredientsList.appendChild(ingredientItem);
        // Note: Remove button listener is handled by delegation
    }

    // Event listener for adding ingredients
    addIngredientBtn.addEventListener('click', addIngredientRow);

    // Event listener for removing ingredients (delegated to the list container)
    ingredientsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-ingredient-btn')) {
            // Prevent removing the last ingredient row
            if (ingredientsList.children.length > 1) {
                event.target.closest('.ingredient-item').remove();
            } else {
                alert("A recipe must have at least one ingredient.");
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
            const calories = parseFloat(item.querySelector('.ingredient-calories').value);
            const amount = parseFloat(item.querySelector('.ingredient-amount').value);
            const protein = parseFloat(item.querySelector('.ingredient-protein').value);
            const fat = parseFloat(item.querySelector('.ingredient-fat').value);
            const carbs = parseFloat(item.querySelector('.ingredient-carbs').value);
            const price = parseFloat(item.querySelector('.ingredient-price').value);

            if (!name || isNaN(calories) || isNaN(amount) || isNaN(protein) || isNaN(fat) || isNaN(carbs) || isNaN(price) || amount <= 0 || calories < 0 || protein < 0 || fat < 0 || carbs < 0 || price < 0) {
                formIsValid = false;
                item.style.border = '1px solid red'; // Highlight invalid rows
            } else {
                item.style.border = ''; // Clear highlight on valid rows
                ingredientsData.push({ name, calories, amount, protein, fat, carbs, price });
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
            addIngredientRow(); 
            loadRecipes(); // Refresh the recipe list

        } catch (error) {
            console.error('Error saving recipe:', error);
            showStatus(createRecipeStatus, `Error saving recipe: ${error.message}`, 'error');
        }
    });

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
                    </tr>
                </thead>
                <tbody>
        `;

        ingredients.forEach(ing => {
            tableHtml += `
                <tr>
                    <td>${escapeHtml(ing.name)}</td>
                    <td>${ing.calories.toFixed(1)}</td>
                    <td>${ing.amount.toFixed(1)}</td>
                    <td>${ing.protein.toFixed(1)}</td>
                    <td>${ing.fats.toFixed(1)}</td>
                    <td>${ing.carbohydrates.toFixed(1)}</td>
                    <td>${ing.price.toFixed(2)}</td>
                    <td>${ing.calories_per_gram.toFixed(2)}</td> 
                    <td>${ing.protein_per_gram.toFixed(2)}</td>
                    <td>${ing.fats_per_gram.toFixed(2)}</td>
                    <td>${ing.carbohydrates_per_gram.toFixed(2)}</td>
                    <td>${ing.price_per_gram.toFixed(3)}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
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

    // --- Initial Load --- //
    loadRecipes();
}); 