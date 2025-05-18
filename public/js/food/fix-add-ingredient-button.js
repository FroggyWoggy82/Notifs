/**
 * Fix Add Ingredient Button
 * Ensures the Add Ingredient button works correctly
 */

(function() {
    console.log('[Fix Add Ingredient Button] Initializing');

    // Store original function
    const originalShowAddIngredientForm = window.showAddIngredientForm;

    // Override the function
    window.showAddIngredientForm = function(recipeId, container) {
        console.log('[Fix Add Ingredient Button] Called showAddIngredientForm with recipeId:', recipeId);

        if (!container) {
            console.error('[Fix Add Ingredient Button] Container not provided');
            
            // Try to find the container based on the recipe ID
            const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
            if (recipeCard) {
                container = recipeCard.querySelector('.ingredient-details');
                console.log('[Fix Add Ingredient Button] Found container from recipe card:', container);
            } else {
                console.error('[Fix Add Ingredient Button] Could not find recipe card');
                return;
            }
        }

        // Find the add ingredient form
        const ingredientAddForm = container.querySelector('.add-ingredient-form');
        if (!ingredientAddForm) {
            console.error('[Fix Add Ingredient Button] Add ingredient form not found in container');
            
            // Try to create the form if it doesn't exist
            createAddIngredientForm(recipeId, container);
            return;
        }

        // Set the recipe ID
        const recipeIdInput = ingredientAddForm.querySelector('#add-ingredient-recipe-id');
        if (recipeIdInput) {
            recipeIdInput.value = recipeId;
        } else {
            console.error('[Fix Add Ingredient Button] Recipe ID input not found in add ingredient form');
        }

        // Show the form
        ingredientAddForm.style.display = 'block';
        
        // Initialize the Cronometer text parser
        if (typeof initializeCronometerTextParser === 'function') {
            console.log('[Fix Add Ingredient Button] Initializing Cronometer text parser');
            initializeCronometerTextParser(ingredientAddForm);
        } else if (typeof window.initializeCronometerTextParser === 'function') {
            console.log('[Fix Add Ingredient Button] Initializing Cronometer text parser (using window scope)');
            window.initializeCronometerTextParser(ingredientAddForm);
        } else {
            console.warn('[Fix Add Ingredient Button] Cronometer text parser not available');
        }

        // Load existing ingredients
        if (typeof loadExistingIngredients === 'function') {
            loadExistingIngredients();
        } else if (typeof window.loadExistingIngredients === 'function') {
            window.loadExistingIngredients();
        } else {
            console.warn('[Fix Add Ingredient Button] loadExistingIngredients function not available');
        }

        // Scroll to the form
        ingredientAddForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Create add ingredient form if it doesn't exist
    function createAddIngredientForm(recipeId, container) {
        console.log('[Fix Add Ingredient Button] Creating add ingredient form for recipe ID:', recipeId);

        // Create the form element
        const form = document.createElement('div');
        form.className = 'add-ingredient-form';
        form.style.display = 'block';
        form.innerHTML = `
            <h4>Add Ingredient</h4>
            <form id="add-ingredient-form">
                <input type="hidden" id="add-ingredient-recipe-id" value="${recipeId}">
                
                <div class="basic-information">
                    <h4>Basic Information</h4>
                    <div class="form-group-column">
                        <div class="form-group">
                            <label for="add-ingredient-name">Name:</label>
                            <input type="text" id="add-ingredient-name" required>
                        </div>
                        <div class="form-group">
                            <label for="add-ingredient-amount">Amount (g):</label>
                            <input type="number" id="add-ingredient-amount" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="add-ingredient-package-amount">Package Amount (g):</label>
                            <input type="number" id="add-ingredient-package-amount" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="add-ingredient-price">Package Price:</label>
                            <input type="number" id="add-ingredient-price" step="0.01" required>
                        </div>
                    </div>
                </div>
                
                <div class="nutrition-section">
                    <h4>General</h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <label for="add-ingredient-calories">Energy (kcal):</label>
                            <input type="number" id="add-ingredient-calories" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="add-ingredient-protein">Protein (g):</label>
                            <input type="number" id="add-ingredient-protein" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="add-ingredient-fats">Fat (g):</label>
                            <input type="number" id="add-ingredient-fats" step="0.1" required>
                        </div>
                        <div class="nutrition-item">
                            <label for="add-ingredient-carbs">Carbs (g):</label>
                            <input type="number" id="add-ingredient-carbs" step="0.1" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="save-ingredient-btn">Add Ingredient</button>
                    <button type="button" class="cancel-add-btn">Cancel</button>
                </div>
            </form>
            <div class="add-ingredient-status status"></div>
        `;

        // Add the form to the container
        container.appendChild(form);

        // Add event listeners
        const addForm = form.querySelector('form');
        addForm.addEventListener('submit', function(event) {
            if (typeof handleAddIngredientSubmit === 'function') {
                handleAddIngredientSubmit(event);
            } else if (typeof window.handleAddIngredientSubmit === 'function') {
                window.handleAddIngredientSubmit(event);
            } else {
                console.error('[Fix Add Ingredient Button] handleAddIngredientSubmit function not available');
                event.preventDefault();
            }
        });

        const cancelButton = form.querySelector('.cancel-add-btn');
        cancelButton.addEventListener('click', function() {
            form.style.display = 'none';
        });

        return form;
    }

    // Add event listeners to all Add Ingredient buttons
    function addEventListeners() {
        console.log('[Fix Add Ingredient Button] Adding event listeners');

        // Find all Add Ingredient buttons
        const addButtons = document.querySelectorAll('.add-ingredient-btn');
        addButtons.forEach(button => {
            console.log('[Fix Add Ingredient Button] Found Add Ingredient button:', button);
            
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Find the recipe ID
                const recipeCard = this.closest('.recipe-card');
                if (!recipeCard) {
                    console.error('[Fix Add Ingredient Button] Could not find recipe card');
                    return;
                }
                
                const recipeId = recipeCard.dataset.id;
                if (!recipeId) {
                    console.error('[Fix Add Ingredient Button] Recipe ID not found');
                    return;
                }
                
                // Find the container
                const container = recipeCard.querySelector('.ingredient-details');
                if (!container) {
                    console.error('[Fix Add Ingredient Button] Could not find ingredient details container');
                    return;
                }
                
                // Show the add ingredient form
                window.showAddIngredientForm(recipeId, container);
            });
        });
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addEventListeners, 500);
        });
    } else {
        setTimeout(addEventListeners, 500);
    }

    // Set up a mutation observer to watch for new Add Ingredient buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(addEventListeners, 500);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Fix Add Ingredient Button] Initialized');
})();
