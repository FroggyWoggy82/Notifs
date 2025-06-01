/**
 * Ingredient Search Autocomplete
 * Provides enhanced autocomplete search functionality for ingredients
 */



// Store the list of ingredients
let searchableIngredients = []; // All ingredients from the database
let recentIngredients = []; // 5 most recent ingredients for initial display
let searchResults = [];
let activeDropdown = null;
let activeSearchInput = null;

// Hardcoded ingredients for testing
const hardcodedIngredients = [
    {
        id: 1,
        name: "Eggs Pasture Raised Vital Farms",
        calories: 280.0,
        amount: 200.0,
        package_amount: 600.0,
        protein: 24.0,
        fats: 20.0,
        carbohydrates: 1.4,
        price: 7.78,
        display: "Eggs Pasture Raised Vital Farms",
        value: "1:1"
    },
    {
        id: 2,
        name: "Parmigiano Reggiano Galli",
        calories: 111.4,
        amount: 28.2,
        package_amount: 154.0,
        protein: 10.1,
        fats: 8.1,
        carbohydrates: 1.0,
        price: 10.28,
        display: "Parmigiano Reggiano Galli",
        value: "1:2"
    },
    {
        id: 3,
        name: "Shrimp Cooked from Frozen Great Catch",
        calories: 134.9,
        amount: 112.4,
        package_amount: 454.0,
        protein: 25.8,
        fats: 1.9,
        carbohydrates: 1.7,
        price: 8.47,
        display: "Shrimp Cooked from Frozen Great Catch",
        value: "1:3"
    },
    {
        id: 4,
        name: "Avocado, California",
        calories: 56.8,
        amount: 34.0,
        package_amount: 136.0,
        protein: 0.7,
        fats: 5.2,
        carbohydrates: 2.9,
        price: 0.92,
        display: "Avocado, California",
        value: "1:4"
    },
    {
        id: 5,
        name: "Chicken Breast, Boneless Skinless",
        calories: 165.0,
        amount: 100.0,
        package_amount: 500.0,
        protein: 31.0,
        fats: 3.6,
        carbohydrates: 0.0,
        price: 5.99,
        display: "Chicken Breast, Boneless Skinless",
        value: "1:5"
    }
];

// Function to fetch all ingredients from the database
async function fetchRecentIngredients() {
    try {
        

        // Use the existing recipes API to get all recipes
        const recipesResponse = await fetch('/api/recipes');
        if (!recipesResponse.ok) {
            console.error('Failed to fetch recipes:', recipesResponse.status);
            searchableIngredients = hardcodedIngredients;
            return hardcodedIngredients; // Fallback to hardcoded ingredients
        }

        const responseData = await recipesResponse.json();

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
            searchableIngredients = hardcodedIngredients;
            return hardcodedIngredients;
        }

        

        // Extract all ingredients from all recipes
        const extractedIngredients = [];

        // Fetch detailed recipe data for each recipe to get ingredients
        for (const recipe of recipes) {
            try {
                const recipeDetailResponse = await fetch(`/api/recipes/${recipe.id}`);
                if (!recipeDetailResponse.ok) {
                    console.error(`Failed to fetch details for recipe ${recipe.id}:`, recipeDetailResponse.status);
                    continue;
                }

                const recipeDetailData = await recipeDetailResponse.json();

                // Handle both old format (direct object) and new format (object with recipe property)
                let recipeDetail;
                if (recipeDetailData && recipeDetailData.success && recipeDetailData.recipe) {
                    // New format: object with success and recipe properties
                    recipeDetail = recipeDetailData.recipe;
                } else if (recipeDetailData && recipeDetailData.ingredients) {
                    // Old format: direct recipe object
                    recipeDetail = recipeDetailData;
                } else {
                    console.error('Invalid recipe detail format:', recipeDetailData);
                    continue;
                }

                

                if (recipeDetail.ingredients && Array.isArray(recipeDetail.ingredients)) {
                    recipeDetail.ingredients.forEach(ingredient => {
                        // Create a base ingredient object with the standard fields
                        const ingredientObj = {
                            id: ingredient.id,
                            name: ingredient.name,
                            calories: ingredient.calories,
                            amount: ingredient.amount,
                            package_amount: ingredient.package_amount,
                            protein: ingredient.protein,
                            fats: ingredient.fats,
                            carbohydrates: ingredient.carbohydrates,
                            price: ingredient.price,
                            recipe_id: recipe.id,
                            recipe_name: recipe.name,
                            display: ingredient.name,
                            value: `${recipe.id}:${ingredient.id}`
                        };

                        // Add all micronutrient data from the ingredient
                        for (const [key, value] of Object.entries(ingredient)) {
                            // Skip fields we've already added and null/undefined values
                            if (!ingredientObj.hasOwnProperty(key) && value !== null && value !== undefined) {
                                ingredientObj[key] = value;
                            }
                        }

                        // Count micronutrient fields for logging
                        const micronutrientFields = Object.keys(ingredientObj).filter(key =>
                            !['id', 'name', 'calories', 'amount', 'package_amount', 'protein', 'fats', 'carbohydrates', 'price',
                             'recipe_id', 'recipe_name', 'display', 'value', 'created_at', 'updated_at'].includes(key)
                        );

                        

                        extractedIngredients.push(ingredientObj);
                    });
                    
                } else {
                    
                }
            } catch (error) {
                console.error(`Error fetching details for recipe ${recipe.id}:`, error);
            }
        }

        // Sort by most recently added (assuming higher IDs are more recent)
        extractedIngredients.sort((a, b) => b.id - a.id);

        // Remove duplicates based on ingredient name
        const uniqueIngredients = [];
        const seenNames = new Set();

        for (const ingredient of extractedIngredients) {
            if (!seenNames.has(ingredient.name.toLowerCase())) {
                seenNames.add(ingredient.name.toLowerCase());
                uniqueIngredients.push(ingredient);
            }
        }

        // Store all unique ingredients for later use
        searchableIngredients = uniqueIngredients;
        

        // Return only the 5 most recent unique ingredients for initial display
        const recentIngredientsToShow = uniqueIngredients.slice(0, 5);
        

        // If no ingredients found, return hardcoded ingredients
        if (recentIngredientsToShow.length === 0) {
            
            searchableIngredients = hardcodedIngredients;
            return hardcodedIngredients;
        }

        return recentIngredientsToShow;
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        searchableIngredients = hardcodedIngredients;
        return hardcodedIngredients; // Fallback to hardcoded ingredients
    }
}

// Function to search for ingredients by name from the database
async function searchIngredients(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return recentIngredients;
    }

    try {
        

        // Search through all ingredients if available
        if (searchableIngredients.length > 0 && searchableIngredients !== hardcodedIngredients) {
            // Filter all ingredients by search term
            const filteredIngredients = searchableIngredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            

            if (filteredIngredients.length > 0) {
                return filteredIngredients;
            }
        }

        // If no matching ingredients found or allIngredients is empty, fallback to hardcoded ingredients
        const filteredHardcoded = hardcodedIngredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return filteredHardcoded;
    } catch (error) {
        console.error('Error searching for ingredients:', error);
        // Fallback to filtering hardcoded ingredients
        const filteredHardcoded = hardcodedIngredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return filteredHardcoded;
    }
}

// Function to create the autocomplete dropdown
function createAutocompleteDropdown(searchInput) {
    // First, check if there's already a dropdown for this input
    const existingDropdown = searchInput.nextElementSibling;
    if (existingDropdown && existingDropdown.classList.contains('autocomplete-dropdown')) {
        
        return existingDropdown;
    }

    // Ensure the search input has an ID and name
    if (!searchInput.id) {
        // Generate a unique ID based on timestamp
        searchInput.id = `ingredient-search-${Date.now()}`;
        
    }

    if (!searchInput.name) {
        // Use the ID as the name, but remove any timestamp suffix
        searchInput.name = searchInput.id.replace(/-\d+$/, '');
        
    }

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'autocomplete-dropdown';
    dropdownContainer.style.display = 'none';

    // Add an ID to the dropdown container for accessibility
    dropdownContainer.id = `${searchInput.id}-dropdown`;

    // Add ARIA attributes for accessibility
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-controls', dropdownContainer.id);
    searchInput.setAttribute('aria-expanded', 'false');

    // Set inline styles to ensure the dropdown is visible and properly positioned
    dropdownContainer.style.position = 'absolute';
    dropdownContainer.style.width = '100%';
    dropdownContainer.style.top = `${searchInput.offsetHeight + 2}px`;
    dropdownContainer.style.left = '0';
    dropdownContainer.style.zIndex = '1000';
    dropdownContainer.style.backgroundColor = '#1e1e1e';
    dropdownContainer.style.border = '1px solid #444';
    dropdownContainer.style.borderRadius = '4px';
    dropdownContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    dropdownContainer.style.maxHeight = '200px';
    dropdownContainer.style.overflowY = 'auto';

    // Make sure the parent has position relative
    const parent = searchInput.parentNode;
    if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }

    // Insert the dropdown right after the search input
    searchInput.insertAdjacentElement('afterend', dropdownContainer);

    

    return dropdownContainer;
}

// Function to update the autocomplete dropdown with search results
function updateAutocompleteDropdown(dropdown, results) {
    

    // Get the associated search input
    const searchInput = dropdown.previousElementSibling;
    if (searchInput && searchInput.hasAttribute('aria-expanded')) {
        searchInput.setAttribute('aria-expanded', 'true');
    }

    // Clear the dropdown
    dropdown.innerHTML = '';

    // Create a proper list for accessibility
    const list = document.createElement('ul');
    list.className = 'autocomplete-list';
    list.setAttribute('role', 'listbox');

    // Add ID to the list for accessibility
    if (dropdown.id) {
        list.id = `${dropdown.id}-list`;
    } else {
        list.id = `autocomplete-list-${Date.now()}`;
    }

    // Update the search input's aria-controls attribute
    if (searchInput) {
        searchInput.setAttribute('aria-controls', list.id);
    }

    if (!results || results.length === 0) {
        // If no results, show a "No results found" message
        const noResults = document.createElement('li');
        noResults.className = 'autocomplete-item no-results';
        noResults.textContent = 'No ingredients found';
        noResults.setAttribute('role', 'option');
        noResults.setAttribute('aria-selected', 'false');
        list.appendChild(noResults);

        
    } else {
        // Create a list item for each result
        results.forEach((ingredient, index) => {
            const item = document.createElement('li');
            item.className = 'autocomplete-item';
            item.textContent = ingredient.name;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', 'false');
            item.setAttribute('id', `autocomplete-item-${index}`);
            item.dataset.id = ingredient.id;
            item.dataset.recipeId = ingredient.recipe_id;

            // Store all ingredient data as dataset attributes
            Object.keys(ingredient).forEach(key => {
                if (key !== 'id' && key !== 'name') {
                    // Make sure the value is a string for dataset
                    if (ingredient[key] !== null && ingredient[key] !== undefined) {
                        item.dataset[key] = String(ingredient[key]);
                    }
                }
            });

            // Log micronutrient data for debugging
            const micronutrientFields = Object.keys(ingredient).filter(key =>
                !['id', 'name', 'calories', 'amount', 'package_amount', 'protein', 'fats', 'carbohydrates', 'price',
                 'recipe_id', 'recipe_name', 'display', 'value', 'created_at', 'updated_at'].includes(key) &&
                ingredient[key] !== null && ingredient[key] !== undefined
            );

            if (micronutrientFields.length > 0) {
                
            }

            // Add click event listener
            item.addEventListener('click', () => {
                selectIngredient(ingredient);
            });

            list.appendChild(item);
        });

        
    }

    // Add the list to the dropdown
    dropdown.appendChild(list);

    // Force the dropdown to be visible with !important
    dropdown.style.cssText += 'display: block !important;';

    // Double-check that the dropdown is visible
    setTimeout(() => {
        if (getComputedStyle(dropdown).display !== 'block') {
            
            dropdown.style.cssText += 'display: block !important; visibility: visible !important;';
        }
    }, 10);

    
}

// Function to select an ingredient from the dropdown
function selectIngredient(ingredient) {
    if (!activeSearchInput) return;

    

    // Find the ingredient item container
    const ingredientItem = activeSearchInput.closest('.ingredient-item');
    if (!ingredientItem) {
        
        return;
    }

    // Check if we're in the recipe editing interface
    const isRecipeEditInterface = ingredientItem.id === 'add-ingredient-form';
    

    // Find all the input fields
    let nameInput, caloriesInput, amountInput, proteinInput, fatInput, carbsInput, packageAmountInput, priceInput;

    if (isRecipeEditInterface) {
        // Recipe editing interface has different IDs
        nameInput = document.getElementById('add-ingredient-name');
        caloriesInput = document.getElementById('add-ingredient-calories');
        amountInput = document.getElementById('add-ingredient-amount');
        proteinInput = document.getElementById('add-ingredient-protein');
        fatInput = document.getElementById('add-ingredient-fats');
        carbsInput = document.getElementById('add-ingredient-carbs');
        packageAmountInput = document.getElementById('add-ingredient-package-amount');
        priceInput = document.getElementById('add-ingredient-price');
    } else {
        // Regular ingredient item in Create New Recipe
        nameInput = ingredientItem.querySelector('.ingredient-name');
        caloriesInput = ingredientItem.querySelector('.ingredient-calories');
        amountInput = ingredientItem.querySelector('.ingredient-amount');
        proteinInput = ingredientItem.querySelector('.ingredient-protein');
        fatInput = ingredientItem.querySelector('.ingredient-fat');
        carbsInput = ingredientItem.querySelector('.ingredient-carbs');
        packageAmountInput = ingredientItem.querySelector('.ingredient-package-amount');
        priceInput = ingredientItem.querySelector('.ingredient-price');
    }

    // Populate the fields with the ingredient data
    if (nameInput) {
        nameInput.value = ingredient.name;
        
    }
    if (caloriesInput) {
        caloriesInput.value = ingredient.calories;
        
    }
    if (amountInput) {
        // Default to 100g if not specified
        amountInput.value = ingredient.amount || 100;
        
    }
    if (proteinInput) {
        proteinInput.value = ingredient.protein;
        
    }
    if (fatInput) {
        fatInput.value = ingredient.fats;
        
    }
    if (carbsInput) {
        carbsInput.value = ingredient.carbohydrates;
        
    }
    if (packageAmountInput) {
        packageAmountInput.value = ingredient.package_amount;
        
    }
    if (priceInput) {
        priceInput.value = ingredient.price;
        
    }

    // Populate micronutrient fields
    

    // Define micronutrient field mappings
    const micronutrientMappings = {
        // General
        'alcohol': { id: 'add-ingredient-alcohol', class: '.ingredient-alcohol' },
        'caffeine': { id: 'add-ingredient-caffeine', class: '.ingredient-caffeine' },
        'water': { id: 'add-ingredient-water', class: '.ingredient-water' },

        // Carbohydrates
        'fiber': { id: 'add-ingredient-fiber', class: '.ingredient-fiber' },
        'starch': { id: 'add-ingredient-starch', class: '.ingredient-starch' },
        'sugars': { id: 'add-ingredient-sugars', class: '.ingredient-sugars' },
        'added_sugars': { id: 'add-ingredient-added-sugars', class: '.ingredient-added-sugars' },
        'net_carbs': { id: 'add-ingredient-net-carbs', class: '.ingredient-net-carbs' },

        // Lipids
        'saturated': { id: 'add-ingredient-saturated', class: '.ingredient-saturated' },
        'monounsaturated': { id: 'add-ingredient-monounsaturated', class: '.ingredient-monounsaturated' },
        'polyunsaturated': { id: 'add-ingredient-polyunsaturated', class: '.ingredient-polyunsaturated' },
        'omega3': { id: 'add-ingredient-omega3', class: '.ingredient-omega3' },
        'omega6': { id: 'add-ingredient-omega6', class: '.ingredient-omega6' },
        'trans': { id: 'add-ingredient-trans', class: '.ingredient-trans' },
        'trans_fat': { id: 'add-ingredient-trans', class: '.ingredient-trans' }, // Added mapping for trans_fat
        'cholesterol': { id: 'add-ingredient-cholesterol', class: '.ingredient-cholesterol' },

        // Protein/Amino Acids
        'cystine': { id: 'add-ingredient-cystine', class: '.ingredient-cystine' },
        'histidine': { id: 'add-ingredient-histidine', class: '.ingredient-histidine' },
        'isoleucine': { id: 'add-ingredient-isoleucine', class: '.ingredient-isoleucine' },
        'leucine': { id: 'add-ingredient-leucine', class: '.ingredient-leucine' },
        'lysine': { id: 'add-ingredient-lysine', class: '.ingredient-lysine' },
        'methionine': { id: 'add-ingredient-methionine', class: '.ingredient-methionine' },
        'phenylalanine': { id: 'add-ingredient-phenylalanine', class: '.ingredient-phenylalanine' },
        'threonine': { id: 'add-ingredient-threonine', class: '.ingredient-threonine' },
        'tryptophan': { id: 'add-ingredient-tryptophan', class: '.ingredient-tryptophan' },
        'tyrosine': { id: 'add-ingredient-tyrosine', class: '.ingredient-tyrosine' },
        'valine': { id: 'add-ingredient-valine', class: '.ingredient-valine' },

        // Vitamins
        'vitamin_a': { id: 'add-ingredient-vitamin-a', class: '.ingredient-vitamin-a' },
        'vitamin_c': { id: 'add-ingredient-vitamin-c', class: '.ingredient-vitamin-c' },
        'vitamin_d': { id: 'add-ingredient-vitamin-d', class: '.ingredient-vitamin-d' },
        'vitamin_e': { id: 'add-ingredient-vitamin-e', class: '.ingredient-vitamin-e' },
        'vitamin_k': { id: 'add-ingredient-vitamin-k', class: '.ingredient-vitamin-k' },
        'thiamine': { id: 'add-ingredient-thiamine', class: '.ingredient-thiamine' },
        'vitamin_b1': { id: 'add-ingredient-thiamine', class: '.ingredient-thiamine' }, // Added mapping for vitamin_b1
        'riboflavin': { id: 'add-ingredient-riboflavin', class: '.ingredient-riboflavin' },
        'vitamin_b2': { id: 'add-ingredient-riboflavin', class: '.ingredient-riboflavin' }, // Added mapping for vitamin_b2
        'niacin': { id: 'add-ingredient-niacin', class: '.ingredient-niacin' },
        'vitamin_b3': { id: 'add-ingredient-niacin', class: '.ingredient-niacin' }, // Added mapping for vitamin_b3
        'vitamin_b6': { id: 'add-ingredient-vitamin-b6', class: '.ingredient-vitamin-b6' },
        'folate': { id: 'add-ingredient-folate', class: '.ingredient-folate' },
        'vitamin_b12': { id: 'add-ingredient-vitamin-b12', class: '.ingredient-vitamin-b12' },
        'pantothenic_acid': { id: 'add-ingredient-pantothenic-acid', class: '.ingredient-pantothenic-acid' },
        'vitamin_b5': { id: 'add-ingredient-pantothenic-acid', class: '.ingredient-pantothenic-acid' }, // Added mapping for vitamin_b5

        // Minerals
        'calcium': { id: 'add-ingredient-calcium', class: '.ingredient-calcium' },
        'copper': { id: 'add-ingredient-copper', class: '.ingredient-copper' },
        'iron': { id: 'add-ingredient-iron', class: '.ingredient-iron' },
        'magnesium': { id: 'add-ingredient-magnesium', class: '.ingredient-magnesium' },
        'manganese': { id: 'add-ingredient-manganese', class: '.ingredient-manganese' },
        'phosphorus': { id: 'add-ingredient-phosphorus', class: '.ingredient-phosphorus' },
        'potassium': { id: 'add-ingredient-potassium', class: '.ingredient-potassium' },
        'selenium': { id: 'add-ingredient-selenium', class: '.ingredient-selenium' },
        'sodium': { id: 'add-ingredient-sodium', class: '.ingredient-sodium' },
        'zinc': { id: 'add-ingredient-zinc', class: '.ingredient-zinc' }
    };

    // Count how many micronutrient fields were populated
    let micronutrientFieldsPopulated = 0;

    // Define fields that should always have at least a zero value
    const fieldsToEnsureZero = [
        'trans', 'trans_fat',
        'thiamine', 'vitamin_b1',
        'riboflavin', 'vitamin_b2',
        'niacin', 'vitamin_b3',
        'pantothenic_acid', 'vitamin_b5'
    ];

    // Create a map to track which fields have been populated
    const populatedFields = new Set();

    // Iterate through all properties of the ingredient
    for (const [key, value] of Object.entries(ingredient)) {
        // Skip basic properties that we've already handled
        if (['id', 'recipe_id', 'name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount',
             'created_at', 'updated_at'].includes(key)) {
            continue;
        }

        // Skip null or undefined values
        if (value === null || value === undefined) {
            continue;
        }

        // Check if we have a mapping for this micronutrient
        if (micronutrientMappings[key]) {
            let inputField = null;

            // Get the appropriate input field based on the interface
            if (isRecipeEditInterface) {
                // Recipe editing interface uses IDs
                inputField = document.getElementById(micronutrientMappings[key].id);
            } else {
                // Create New Recipe interface uses classes
                inputField = ingredientItem.querySelector(micronutrientMappings[key].class);
            }

            // If we found the input field, set its value
            if (inputField) {
                inputField.value = value;
                
                micronutrientFieldsPopulated++;

                // Mark this field as populated
                populatedFields.add(micronutrientMappings[key].id);
                populatedFields.add(micronutrientMappings[key].class);
            }
        } else {
            // Handle special cases or fields that don't follow the standard naming convention
            
        }
    }

    // Directly set zero values for specific fields that must always have a value
    const criticalFields = [
        { name: 'Trans Fat', id: 'add-ingredient-trans', class: '.ingredient-trans' },
        { name: 'B1 (Thiamine)', id: 'add-ingredient-thiamine', class: '.ingredient-thiamine' },
        { name: 'B2 (Riboflavin)', id: 'add-ingredient-riboflavin', class: '.ingredient-riboflavin' },
        { name: 'B3 (Niacin)', id: 'add-ingredient-niacin', class: '.ingredient-niacin' },
        { name: 'B5 (Pantothenic Acid)', id: 'add-ingredient-pantothenic-acid', class: '.ingredient-pantothenic-acid' }
    ];

    

    // Force set these critical fields to zero regardless of current state
    setTimeout(() => {
        for (const field of criticalFields) {
            let inputField = null;

            // Get the appropriate input field based on the interface
            if (isRecipeEditInterface) {
                // Recipe editing interface uses IDs
                inputField = document.getElementById(field.id);
            } else {
                // Create New Recipe interface uses classes
                inputField = ingredientItem.querySelector(field.class);
            }

            // If we found the input field, set it to zero regardless of current value
            if (inputField) {
                // Always set to zero for these critical fields
                inputField.value = '0';
                
                micronutrientFieldsPopulated++;
            } else {
                
            }
        }
    }, 100); // Small delay to ensure DOM is ready

    // Ensure specific fields have at least a zero value (for other fields in fieldsToEnsureZero)
    for (const fieldKey of fieldsToEnsureZero) {
        if (micronutrientMappings[fieldKey]) {
            const mapping = micronutrientMappings[fieldKey];

            // Skip critical fields that we've already handled
            if (criticalFields.some(field => field.id === mapping.id)) {
                continue;
            }

            // Check if this field or its equivalent has already been populated
            if (!populatedFields.has(mapping.id) && !populatedFields.has(mapping.class)) {
                let inputField = null;

                // Get the appropriate input field based on the interface
                if (isRecipeEditInterface) {
                    // Recipe editing interface uses IDs
                    inputField = document.getElementById(mapping.id);
                } else {
                    // Create New Recipe interface uses classes
                    inputField = ingredientItem.querySelector(mapping.class);
                }

                // If we found the input field, set it to zero regardless of current value
                // This ensures these specific fields always have a value
                if (inputField) {
                    inputField.value = '0';
                    
                    micronutrientFieldsPopulated++;

                    // Mark this field as populated
                    populatedFields.add(mapping.id);
                    populatedFields.add(mapping.class);
                } else {
                    
                }
            }
        }
    }

    

    // Update the search input value
    activeSearchInput.value = ingredient.name;
    

    // Hide the dropdown and update ARIA attributes
    if (activeDropdown) {
        activeDropdown.style.display = 'none';

        // Update ARIA attributes on the search input
        if (activeSearchInput) {
            activeSearchInput.setAttribute('aria-expanded', 'false');
        }
    }
}

// Function to initialize the autocomplete search for an ingredient search input
function initializeIngredientSearchAutocomplete(searchInput) {
    if (!searchInput) return;

    

    // Create the autocomplete dropdown
    const dropdown = createAutocompleteDropdown(searchInput);

    // Function to update dropdown position
    function updateDropdownPosition() {
        // Update the position to ensure it's directly below the search input
        dropdown.style.top = `${searchInput.offsetHeight}px`;
        dropdown.style.width = `${searchInput.offsetWidth}px`;

        // Make sure it's visible if it should be
        if (dropdown.style.display !== 'none') {
            dropdown.style.display = 'block';
        }

        
    }

    // Add event listeners
    searchInput.addEventListener('focus', async () => {
        
        activeSearchInput = searchInput;
        activeDropdown = dropdown;

        // Make sure we have ingredients to show
        if (recentIngredients.length === 0) {
            
            recentIngredients = await fetchRecentIngredients();
        }

        // Update dropdown position
        updateDropdownPosition();

        // Show recent ingredients
        updateAutocompleteDropdown(dropdown, recentIngredients);

        // Force the dropdown to be visible with !important
        dropdown.style.cssText += 'display: block !important; visibility: visible !important;';

        

        // Double-check that the dropdown is visible after a short delay
        setTimeout(() => {
            if (getComputedStyle(dropdown).display !== 'block') {
                
                dropdown.style.cssText += 'display: block !important; visibility: visible !important;';
            }
        }, 50);
    });

    searchInput.addEventListener('input', async () => {
        
        const searchTerm = searchInput.value.trim();

        // Set active elements
        activeSearchInput = searchInput;
        activeDropdown = dropdown;

        // Update dropdown position
        updateDropdownPosition();

        // Search for ingredients
        searchResults = await searchIngredients(searchTerm);
        

        // Update the dropdown
        updateAutocompleteDropdown(dropdown, searchResults);

        // Force the dropdown to be visible if we have results
        if (searchResults.length > 0) {
            dropdown.style.display = 'block';
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (event.target !== searchInput && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Update position on window resize
    window.addEventListener('resize', () => {
        if (activeDropdown === dropdown && dropdown.style.display !== 'none') {
            updateDropdownPosition();
        }
    });

    // Update position on scroll
    document.addEventListener('scroll', () => {
        if (activeDropdown === dropdown && dropdown.style.display !== 'none') {
            updateDropdownPosition();
        }
    }, true);
}

// Function to setup all ingredient search inputs on the page
function setupIngredientSearchAutocomplete() {
    // Find all ingredient search inputs
    const searchInputs = document.querySelectorAll('.ingredient-search-input');

    // Initialize autocomplete for each search input
    searchInputs.forEach(input => {
        initializeIngredientSearchAutocomplete(input);
    });

    

    // If no search inputs found, wait a bit and try again
    if (searchInputs.length === 0) {
        
        setTimeout(() => {
            const newSearchInputs = document.querySelectorAll('.ingredient-search-input');
            

            newSearchInputs.forEach(input => {
                initializeIngredientSearchAutocomplete(input);
            });
        }, 1000);
    }

    // Set up a MutationObserver to watch for new search inputs added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are search inputs or contain search inputs
                mutation.addedNodes.forEach((node) => {
                    // Check if the node itself is a search input
                    if (node.classList && node.classList.contains('ingredient-search-input')) {
                        
                        initializeIngredientSearchAutocomplete(node);
                    }

                    // Check if the node contains search inputs
                    if (node.querySelectorAll) {
                        const newInputs = node.querySelectorAll('.ingredient-search-input');
                        if (newInputs.length > 0) {
                            
                            newInputs.forEach(input => {
                                initializeIngredientSearchAutocomplete(input);
                            });
                        }
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    

    // Add CSS if not already added
    if (!document.querySelector('link[href*="ingredient-autocomplete.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '../css/ingredient-autocomplete.css';
        document.head.appendChild(cssLink);
        
    }

    try {
        // Fetch recent ingredients from the database immediately
        
        const ingredients = await fetchRecentIngredients();
        recentIngredients = ingredients;
        

        // Setup autocomplete for all search inputs
        setupIngredientSearchAutocomplete();

        // Check again after a short delay to catch any inputs that might have been added dynamically
        setTimeout(() => {
            setupIngredientSearchAutocomplete();
        }, 500);

        // And check one more time after a longer delay
        setTimeout(() => {
            setupIngredientSearchAutocomplete();
        }, 1500);
    } catch (error) {
        console.error('Error loading recent ingredients:', error);
        // Fallback to hardcoded ingredients
        recentIngredients = hardcodedIngredients;

        // Still setup autocomplete even if ingredient loading failed
        setupIngredientSearchAutocomplete();
    }
});

// Listen for new ingredient rows being added
document.addEventListener('ingredientAdded', (event) => {
    

    // Find the new ingredient search input
    const newIngredientItem = event.detail.ingredientItem;
    if (!newIngredientItem) {
        
        return;
    }

    // Wait a short moment for the DOM to be fully updated
    setTimeout(() => {
        const searchInput = newIngredientItem.querySelector('.ingredient-search-input');
        if (searchInput) {
            
            initializeIngredientSearchAutocomplete(searchInput);
        } else {
            
            
        }
    }, 100);
});
