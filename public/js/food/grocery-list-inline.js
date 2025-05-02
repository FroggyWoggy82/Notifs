/**
 * Grocery List Inline Functionality
 * Allows users to select recipes, adjust calories, and generate a grocery list
 * with package counts based on package amounts
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const recipeSelectionContainer = document.getElementById('grocery-recipe-selection');
    const calorieAdjustmentContainer = document.getElementById('calorie-adjustment-container');
    const generateListBtn = document.getElementById('generate-list-btn');
    const printListBtn = document.getElementById('print-list-btn');
    const saveListBtn = document.getElementById('save-list-btn');
    const groceryListResults = document.getElementById('grocery-list-results');
    const statusMessage = document.getElementById('grocery-status-message');

    // State
    let allRecipes = [];
    let selectedRecipeIds = [];
    let adjustedRecipes = [];
    let groceryList = null;

    // Initialize
    init();

    // Functions
    async function init() {
        try {
            // Load recipes
            await loadRecipes();
            
            // Add event listeners
            addEventListeners();
            
            // Update UI
            updateUI();
        } catch (error) {
            console.error('Initialization error:', error);
            showStatus('Failed to initialize the grocery list generator.', 'error');
        }
    }

    async function loadRecipes() {
        try {
            showStatus('Loading recipes...', 'info');
            
            const response = await fetch('/api/recipes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allRecipes = await response.json();
            
            // Clear loading message
            recipeSelectionContainer.innerHTML = '';
            
            // Render recipe checkboxes
            if (allRecipes.length === 0) {
                recipeSelectionContainer.innerHTML = '<p class="empty-message">No recipes available</p>';
            } else {
                renderRecipeCheckboxes();
            }
            
            showStatus('Recipes loaded successfully!', 'success');
            setTimeout(() => clearStatus(), 2000);
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipeSelectionContainer.innerHTML = '<p class="empty-message">Failed to load recipes</p>';
            showStatus('Failed to load recipes. Please try again.', 'error');
        }
    }

    function renderRecipeCheckboxes() {
        recipeSelectionContainer.innerHTML = '';
        
        allRecipes.forEach(recipe => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'recipe-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `recipe-checkbox-${recipe.id}`;
            checkbox.dataset.id = recipe.id;
            checkbox.checked = selectedRecipeIds.includes(recipe.id);
            
            const label = document.createElement('label');
            label.htmlFor = `recipe-checkbox-${recipe.id}`;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'recipe-name';
            nameSpan.textContent = recipe.name;
            
            const caloriesSpan = document.createElement('span');
            caloriesSpan.className = 'recipe-calories';
            caloriesSpan.textContent = `${recipe.total_calories.toFixed(1)} calories`;
            
            label.appendChild(nameSpan);
            label.appendChild(caloriesSpan);
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            
            // Add event listener
            checkbox.addEventListener('change', function() {
                handleRecipeSelection(recipe.id, this.checked);
            });
            
            recipeSelectionContainer.appendChild(checkboxItem);
        });
    }

    function handleRecipeSelection(recipeId, isSelected) {
        if (isSelected) {
            // Add to selected recipes if not already included
            if (!selectedRecipeIds.includes(recipeId)) {
                selectedRecipeIds.push(recipeId);
            }
        } else {
            // Remove from selected recipes
            selectedRecipeIds = selectedRecipeIds.filter(id => id !== recipeId);
        }
        
        // Update calorie adjustment section
        updateCalorieAdjustment();
        
        // Update generate button state
        updateGenerateButton();
    }

    function updateCalorieAdjustment() {
        calorieAdjustmentContainer.innerHTML = '';
        
        if (selectedRecipeIds.length === 0) {
            calorieAdjustmentContainer.innerHTML = '<p class="empty-message">Select recipes to adjust calories</p>';
            return;
        }
        
        // Get the selected recipes
        const selectedRecipes = allRecipes.filter(recipe => selectedRecipeIds.includes(recipe.id));
        
        // Initialize adjustedRecipes if it's empty
        if (adjustedRecipes.length === 0) {
            adjustedRecipes = selectedRecipes.map(recipe => ({
                ...recipe,
                originalCalories: recipe.total_calories,
                adjustedCalories: recipe.total_calories,
                scaleFactor: 1
            }));
        } else {
            // Update adjustedRecipes based on selectedRecipes
            // Add new recipes
            selectedRecipes.forEach(recipe => {
                if (!adjustedRecipes.some(r => r.id === recipe.id)) {
                    adjustedRecipes.push({
                        ...recipe,
                        originalCalories: recipe.total_calories,
                        adjustedCalories: recipe.total_calories,
                        scaleFactor: 1
                    });
                }
            });
            
            // Remove recipes that are no longer selected
            adjustedRecipes = adjustedRecipes.filter(recipe => 
                selectedRecipeIds.includes(recipe.id)
            );
        }
        
        // Render adjustment controls for each recipe
        adjustedRecipes.forEach(recipe => {
            const adjustmentItem = document.createElement('div');
            adjustmentItem.className = 'calorie-adjustment-item';
            adjustmentItem.dataset.id = recipe.id;
            
            const header = document.createElement('div');
            header.className = 'calorie-adjustment-header';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'calorie-adjustment-name';
            nameElement.textContent = recipe.name;
            
            const controlsElement = document.createElement('div');
            controlsElement.className = 'calorie-adjustment-controls';
            
            // Create calorie input
            const calorieInput = document.createElement('input');
            calorieInput.type = 'number';
            calorieInput.className = 'calorie-adjustment-input';
            calorieInput.value = recipe.adjustedCalories.toFixed(1);
            calorieInput.min = '1';
            calorieInput.step = '1';
            
            // Create adjustment buttons
            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'adjustment-btn';
            decreaseBtn.textContent = '-10%';
            
            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'adjustment-btn';
            increaseBtn.textContent = '+10%';
            
            const resetBtn = document.createElement('button');
            resetBtn.className = 'adjustment-btn';
            resetBtn.textContent = 'Reset';
            
            // Add event listeners
            calorieInput.addEventListener('change', function() {
                updateRecipeCalories(recipe.id, parseFloat(this.value));
            });
            
            decreaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 0.9;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(1);
            });
            
            increaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 1.1;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(1);
            });
            
            resetBtn.addEventListener('click', function() {
                updateRecipeCalories(recipe.id, recipe.originalCalories);
                calorieInput.value = recipe.originalCalories.toFixed(1);
            });
            
            // Assemble the controls
            controlsElement.appendChild(decreaseBtn);
            controlsElement.appendChild(calorieInput);
            controlsElement.appendChild(increaseBtn);
            controlsElement.appendChild(resetBtn);
            
            header.appendChild(nameElement);
            header.appendChild(controlsElement);
            
            // Create info element
            const infoElement = document.createElement('div');
            infoElement.className = 'calorie-adjustment-info';
            infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(1)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x`;
            
            // Assemble the adjustment item
            adjustmentItem.appendChild(header);
            adjustmentItem.appendChild(infoElement);
            
            calorieAdjustmentContainer.appendChild(adjustmentItem);
        });
    }

    function updateRecipeCalories(recipeId, newCalories) {
        const recipe = adjustedRecipes.find(r => r.id === recipeId);
        
        if (recipe) {
            recipe.adjustedCalories = newCalories;
            recipe.scaleFactor = newCalories / recipe.originalCalories;
            
            // Update the info text
            const adjustmentItem = document.querySelector(`.calorie-adjustment-item[data-id="${recipeId}"]`);
            if (adjustmentItem) {
                const infoElement = adjustmentItem.querySelector('.calorie-adjustment-info');
                infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(1)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x`;
            }
        }
    }

    function generateGroceryList() {
        if (adjustedRecipes.length === 0) {
            showStatus('Please select at least one recipe.', 'error');
            return;
        }
        
        showStatus('Generating grocery list...', 'info');
        
        // Fetch full recipe details for each adjusted recipe
        Promise.all(adjustedRecipes.map(recipe => 
            fetch(`/api/recipes/${recipe.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
        ))
        .then(fullRecipes => {
            // Combine ingredients from all recipes
            const combinedIngredients = {};
            
            fullRecipes.forEach((fullRecipe, index) => {
                const scaleFactor = adjustedRecipes[index].scaleFactor;
                
                fullRecipe.ingredients.forEach(ingredient => {
                    const key = ingredient.name.toLowerCase();
                    
                    if (!combinedIngredients[key]) {
                        combinedIngredients[key] = {
                            name: ingredient.name,
                            amount: 0,
                            package_amount: ingredient.package_amount || 0,
                            price: ingredient.price || 0,
                            recipes: []
                        };
                    }
                    
                    // Scale the amount based on the recipe's scale factor
                    const scaledAmount = ingredient.amount * scaleFactor;
                    
                    combinedIngredients[key].amount += scaledAmount;
                    combinedIngredients[key].recipes.push({
                        name: fullRecipe.name,
                        amount: scaledAmount
                    });
                });
            });
            
            // Convert to array and calculate package counts
            groceryList = Object.values(combinedIngredients).map(ingredient => {
                let packageCount = 0;
                
                if (ingredient.package_amount && ingredient.package_amount > 0) {
                    // Calculate how many packages are needed
                    packageCount = Math.ceil(ingredient.amount / ingredient.package_amount);
                }
                
                return {
                    ...ingredient,
                    packageCount
                };
            });
            
            // Sort by name
            groceryList.sort((a, b) => a.name.localeCompare(b.name));
            
            // Render the grocery list
            renderGroceryList();
            
            // Enable print and save buttons
            printListBtn.disabled = false;
            saveListBtn.disabled = false;
            
            showStatus('Grocery list generated successfully!', 'success');
        })
        .catch(error => {
            console.error('Error generating grocery list:', error);
            showStatus('Failed to generate grocery list. Please try again.', 'error');
        });
    }

    function renderGroceryList() {
        if (!groceryList || groceryList.length === 0) {
            groceryListResults.innerHTML = '<p class="empty-message">No ingredients to display</p>';
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'grocery-list-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Ingredient', 'Amount (g)', 'Package Size (g)', 'Packages Needed', 'Package Price', 'Total Cost', 'Used In'];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        groceryList.forEach(ingredient => {
            const row = document.createElement('tr');
            
            // Ingredient name
            const nameCell = document.createElement('td');
            nameCell.textContent = ingredient.name;
            row.appendChild(nameCell);
            
            // Amount
            const amountCell = document.createElement('td');
            amountCell.textContent = ingredient.amount.toFixed(1);
            row.appendChild(amountCell);
            
            // Package size
            const packageSizeCell = document.createElement('td');
            packageSizeCell.textContent = ingredient.package_amount ? ingredient.package_amount.toFixed(1) : '-';
            row.appendChild(packageSizeCell);
            
            // Packages needed
            const packagesCell = document.createElement('td');
            if (ingredient.packageCount > 0) {
                packagesCell.innerHTML = `<span class="package-count">${ingredient.packageCount}</span>`;
            } else {
                packagesCell.textContent = '-';
            }
            row.appendChild(packagesCell);
            
            // Package price
            const priceCell = document.createElement('td');
            priceCell.textContent = ingredient.price ? `$${ingredient.price.toFixed(2)}` : '-';
            row.appendChild(priceCell);
            
            // Total cost
            const totalCostCell = document.createElement('td');
            if (ingredient.packageCount > 0 && ingredient.price) {
                const totalCost = ingredient.packageCount * ingredient.price;
                totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
            } else {
                totalCostCell.textContent = '-';
            }
            row.appendChild(totalCostCell);
            
            // Used in recipes
            const usedInCell = document.createElement('td');
            usedInCell.textContent = ingredient.recipes.map(r => r.name).join(', ');
            row.appendChild(usedInCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'TOTAL';
        totalRow.appendChild(totalLabelCell);
        
        // Empty cells for amount and package size
        totalRow.appendChild(document.createElement('td'));
        totalRow.appendChild(document.createElement('td'));
        
        // Total packages
        const totalPackagesCell = document.createElement('td');
        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        totalPackagesCell.innerHTML = `<span class="package-count">${totalPackages}</span>`;
        totalRow.appendChild(totalPackagesCell);
        
        // Empty cell for package price
        totalRow.appendChild(document.createElement('td'));
        
        // Total cost
        const totalCostCell = document.createElement('td');
        const totalCost = groceryList.reduce((sum, ingredient) => {
            return sum + (ingredient.packageCount || 0) * (ingredient.price || 0);
        }, 0);
        totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
        totalRow.appendChild(totalCostCell);
        
        // Empty cell for used in
        totalRow.appendChild(document.createElement('td'));
        
        tbody.appendChild(totalRow);
        
        // Clear container and add table
        groceryListResults.innerHTML = '';
        groceryListResults.appendChild(table);
    }

    function printGroceryList() {
        if (!groceryList || groceryList.length === 0) {
            showStatus('No grocery list to print.', 'error');
            return;
        }
        
        // Create a printable version of the grocery list
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            showStatus('Please allow pop-ups to print the grocery list.', 'error');
            return;
        }
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Grocery List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .package-count {
                        font-weight: bold;
                    }
                    .recipe-list {
                        font-size: 0.9em;
                        color: #666;
                    }
                    .total-row {
                        font-weight: bold;
                    }
                    @media print {
                        button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Grocery List</h1>
                <button onclick="window.print()">Print</button>
                <table>
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Amount (g)</th>
                            <th>Package Size (g)</th>
                            <th>Packages</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `);
        
        groceryList.forEach(ingredient => {
            printWindow.document.write(`
                <tr>
                    <td>${ingredient.name}</td>
                    <td>${ingredient.amount.toFixed(1)}</td>
                    <td>${ingredient.package_amount ? ingredient.package_amount.toFixed(1) : '-'}</td>
                    <td>${ingredient.packageCount > 0 ? `<span class="package-count">${ingredient.packageCount}</span>` : '-'}</td>
                    <td>${ingredient.price ? `$${ingredient.price.toFixed(2)}` : '-'}</td>
                    <td>${ingredient.packageCount > 0 && ingredient.price ? `$${(ingredient.packageCount * ingredient.price).toFixed(2)}` : '-'}</td>
                </tr>
                <tr>
                    <td colspan="6" class="recipe-list">
                        <small>Used in: ${ingredient.recipes.map(r => `${r.name} (${r.amount.toFixed(1)}g)`).join(', ')}</small>
                    </td>
                </tr>
            `);
        });
        
        // Add total row
        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        const totalCost = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0) * (ingredient.price || 0), 0);
        
        printWindow.document.write(`
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td></td>
                    <td></td>
                    <td><span class="package-count">${totalPackages}</span></td>
                    <td></td>
                    <td>$${totalCost.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        </body>
        </html>
        `);
        
        printWindow.document.close();
    }

    function saveGroceryList() {
        if (!groceryList || groceryList.length === 0) {
            showStatus('No grocery list to save.', 'error');
            return;
        }
        
        // Create a CSV file
        let csvContent = 'Ingredient,Amount (g),Package Size (g),Packages Needed,Package Price,Total Cost,Used In\n';
        
        groceryList.forEach(ingredient => {
            const row = [
                `"${ingredient.name}"`,
                ingredient.amount.toFixed(1),
                ingredient.package_amount ? ingredient.package_amount.toFixed(1) : '',
                ingredient.packageCount > 0 ? ingredient.packageCount : '',
                ingredient.price ? ingredient.price.toFixed(2) : '',
                ingredient.packageCount > 0 && ingredient.price ? (ingredient.packageCount * ingredient.price).toFixed(2) : '',
                `"${ingredient.recipes.map(r => r.name).join(', ')}"`
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        // Add total row
        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        const totalCost = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0) * (ingredient.price || 0), 0);
        
        csvContent += `"TOTAL",,,"${totalPackages}",,"${totalCost.toFixed(2)}",\n`;
        
        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'grocery_list.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
        statusMessage.style.display = 'block';
    }

    function clearStatus() {
        statusMessage.textContent = '';
        statusMessage.className = 'status';
        statusMessage.style.display = 'none';
    }

    function updateGenerateButton() {
        generateListBtn.disabled = selectedRecipeIds.length === 0;
    }

    function updateUI() {
        updateGenerateButton();
        printListBtn.disabled = !groceryList;
        saveListBtn.disabled = !groceryList;
    }

    function addEventListeners() {
        // Generate list button
        generateListBtn.addEventListener('click', generateGroceryList);
        
        // Print list button
        printListBtn.addEventListener('click', printGroceryList);
        
        // Save list button
        saveListBtn.addEventListener('click', saveGroceryList);
    }
});
