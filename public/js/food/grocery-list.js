
document.addEventListener('DOMContentLoaded', function() {

    const availableRecipesContainer = document.querySelector('#available-recipes .recipe-list-container');
    const selectedRecipesContainer = document.querySelector('#selected-recipes .recipe-list-container');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const removeRecipeBtn = document.getElementById('remove-recipe-btn');
    const calorieAdjustmentContainer = document.getElementById('calorie-adjustment-container');
    const generateListBtn = document.getElementById('generate-list-btn');
    const printListBtn = document.getElementById('print-list-btn');
    const saveListBtn = document.getElementById('save-list-btn');
    const groceryListContainer = document.getElementById('grocery-list-container');
    const statusMessage = document.getElementById('status-message');

    let allRecipes = [];
    let selectedRecipes = [];
    let adjustedRecipes = [];
    let groceryList = null;

    init();

    async function init() {
        try {

            await loadRecipes();

            addEventListeners();

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

            availableRecipesContainer.innerHTML = '';

            if (allRecipes.length === 0) {
                availableRecipesContainer.innerHTML = '<p class="empty-message">No recipes available</p>';
            } else {
                renderAvailableRecipes();
            }

            showStatus('Recipes loaded successfully!', 'success');
            setTimeout(() => clearStatus(), 2000);
        } catch (error) {
            console.error('Error loading recipes:', error);
            availableRecipesContainer.innerHTML = '<p class="empty-message">Failed to load recipes</p>';
            showStatus('Failed to load recipes. Please try again.', 'error');
        }
    }

    function renderAvailableRecipes() {
        availableRecipesContainer.innerHTML = '';

        allRecipes.forEach(recipe => {

            if (selectedRecipes.some(r => r.id === recipe.id)) {
                return;
            }

            const recipeElement = createRecipeElement(recipe);
            availableRecipesContainer.appendChild(recipeElement);
        });

        if (availableRecipesContainer.children.length === 0) {
            availableRecipesContainer.innerHTML = '<p class="empty-message">All recipes selected</p>';
        }
    }

    function renderSelectedRecipes() {
        selectedRecipesContainer.innerHTML = '';

        if (selectedRecipes.length === 0) {
            selectedRecipesContainer.innerHTML = '<p class="empty-message">No recipes selected</p>';
            return;
        }

        selectedRecipes.forEach(recipe => {
            const recipeElement = createRecipeElement(recipe);
            selectedRecipesContainer.appendChild(recipeElement);
        });
    }

    function createRecipeElement(recipe) {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-item';
        recipeElement.dataset.id = recipe.id;

        const nameElement = document.createElement('div');
        nameElement.className = 'recipe-item-name';
        nameElement.textContent = recipe.name;

        const caloriesElement = document.createElement('div');
        caloriesElement.className = 'recipe-item-calories';
        caloriesElement.textContent = `${recipe.total_calories.toFixed(2)} calories`;

        recipeElement.appendChild(nameElement);
        recipeElement.appendChild(caloriesElement);

        recipeElement.addEventListener('click', function() {
            toggleRecipeSelection(recipeElement);
        });

        return recipeElement;
    }

    function toggleRecipeSelection(recipeElement) {
        recipeElement.classList.toggle('selected');
        updateSelectionButtons();
    }

    function updateSelectionButtons() {
        const availableSelected = document.querySelectorAll('#available-recipes .recipe-item.selected').length > 0;
        const selectedSelected = document.querySelectorAll('#selected-recipes .recipe-item.selected').length > 0;

        addRecipeBtn.disabled = !availableSelected;
        removeRecipeBtn.disabled = !selectedSelected;
    }

    function addSelectedRecipes() {
        const selectedElements = document.querySelectorAll('#available-recipes .recipe-item.selected');

        selectedElements.forEach(element => {
            const recipeId = element.dataset.id;
            const recipe = allRecipes.find(r => r.id === recipeId);

            if (recipe && !selectedRecipes.some(r => r.id === recipeId)) {
                selectedRecipes.push(recipe);
            }
        });

        renderAvailableRecipes();
        renderSelectedRecipes();
        updateCalorieAdjustment();
        updateSelectionButtons();
        updateGenerateButton();
    }

    function removeSelectedRecipes() {
        const selectedElements = document.querySelectorAll('#selected-recipes .recipe-item.selected');

        selectedElements.forEach(element => {
            const recipeId = element.dataset.id;
            selectedRecipes = selectedRecipes.filter(r => r.id !== recipeId);
        });

        renderAvailableRecipes();
        renderSelectedRecipes();
        updateCalorieAdjustment();
        updateSelectionButtons();
        updateGenerateButton();
    }

    function updateCalorieAdjustment() {
        calorieAdjustmentContainer.innerHTML = '';

        if (selectedRecipes.length === 0) {
            calorieAdjustmentContainer.innerHTML = '<p class="empty-message">Select recipes to adjust calories</p>';
            return;
        }

        if (adjustedRecipes.length === 0) {
            adjustedRecipes = selectedRecipes.map(recipe => ({
                ...recipe,
                originalCalories: recipe.total_calories,
                adjustedCalories: recipe.total_calories,
                scaleFactor: 1
            }));
        } else {


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

            adjustedRecipes = adjustedRecipes.filter(recipe =>
                selectedRecipes.some(r => r.id === recipe.id)
            );
        }

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

            const calorieInput = document.createElement('input');
            calorieInput.type = 'number';
            calorieInput.className = 'calorie-adjustment-input';
            calorieInput.value = recipe.adjustedCalories.toFixed(2);
            calorieInput.min = '1';
            calorieInput.step = '1';

            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'adjustment-btn';
            decreaseBtn.textContent = '-10%';

            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'adjustment-btn';
            increaseBtn.textContent = '+10%';

            const resetBtn = document.createElement('button');
            resetBtn.className = 'adjustment-btn';
            resetBtn.textContent = 'Reset';

            calorieInput.addEventListener('change', function() {
                updateRecipeCalories(recipe.id, parseFloat(this.value));
            });

            decreaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 0.9;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(2);
            });

            increaseBtn.addEventListener('click', function() {
                const newCalories = recipe.adjustedCalories * 1.1;
                updateRecipeCalories(recipe.id, newCalories);
                calorieInput.value = newCalories.toFixed(2);
            });

            resetBtn.addEventListener('click', function() {
                updateRecipeCalories(recipe.id, recipe.originalCalories);
                calorieInput.value = recipe.originalCalories.toFixed(2);
            });

            controlsElement.appendChild(decreaseBtn);
            controlsElement.appendChild(calorieInput);
            controlsElement.appendChild(increaseBtn);
            controlsElement.appendChild(resetBtn);

            header.appendChild(nameElement);
            header.appendChild(controlsElement);

            const infoElement = document.createElement('div');
            infoElement.className = 'calorie-adjustment-info';
            infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(2)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x`;

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

            const adjustmentItem = document.querySelector(`.calorie-adjustment-item[data-id="${recipeId}"]`);
            if (adjustmentItem) {
                const infoElement = adjustmentItem.querySelector('.calorie-adjustment-info');
                infoElement.textContent = `Original: ${recipe.originalCalories.toFixed(2)} calories | Scale Factor: ${recipe.scaleFactor.toFixed(2)}x`;
            }
        }
    }

    function generateGroceryList() {
        if (adjustedRecipes.length === 0) {
            showStatus('Please select at least one recipe.', 'error');
            return;
        }

        showStatus('Generating grocery list...', 'info');

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

                    const scaledAmount = ingredient.amount * scaleFactor;

                    combinedIngredients[key].amount += scaledAmount;
                    combinedIngredients[key].recipes.push({
                        name: fullRecipe.name,
                        amount: scaledAmount
                    });
                });
            });

            groceryList = Object.values(combinedIngredients).map(ingredient => {
                let packageCount = 0;

                if (ingredient.package_amount && ingredient.package_amount > 0) {

                    packageCount = Math.ceil(ingredient.amount / ingredient.package_amount);
                }

                return {
                    ...ingredient,
                    packageCount
                };
            });

            groceryList.sort((a, b) => a.name.localeCompare(b.name));

            renderGroceryList();

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
            groceryListContainer.innerHTML = '<p class="empty-message">No ingredients to display</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'grocery-list-table';

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

        const tbody = document.createElement('tbody');

        groceryList.forEach(ingredient => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = ingredient.name;
            row.appendChild(nameCell);

            const amountCell = document.createElement('td');
            amountCell.textContent = ingredient.amount.toFixed(2);
            row.appendChild(amountCell);

            const packageSizeCell = document.createElement('td');
            packageSizeCell.textContent = ingredient.package_amount ? ingredient.package_amount.toFixed(2) : '-';
            row.appendChild(packageSizeCell);

            const packagesCell = document.createElement('td');
            if (ingredient.packageCount > 0) {
                packagesCell.innerHTML = `<span class="package-count">${ingredient.packageCount}</span>`;
            } else {
                packagesCell.textContent = '-';
            }
            row.appendChild(packagesCell);

            const priceCell = document.createElement('td');
            priceCell.textContent = ingredient.price ? `$${ingredient.price.toFixed(2)}` : '-';
            row.appendChild(priceCell);

            const totalCostCell = document.createElement('td');
            if (ingredient.packageCount > 0 && ingredient.price) {
                const totalCost = ingredient.packageCount * ingredient.price;
                totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
            } else {
                totalCostCell.textContent = '-';
            }
            row.appendChild(totalCostCell);

            const usedInCell = document.createElement('td');
            usedInCell.textContent = ingredient.recipes.map(r => r.name).join(', ');
            row.appendChild(usedInCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';

        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'TOTAL';
        totalRow.appendChild(totalLabelCell);

        totalRow.appendChild(document.createElement('td'));
        totalRow.appendChild(document.createElement('td'));

        const totalPackagesCell = document.createElement('td');
        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        totalPackagesCell.innerHTML = `<span class="package-count">${totalPackages}</span>`;
        totalRow.appendChild(totalPackagesCell);

        totalRow.appendChild(document.createElement('td'));

        const totalCostCell = document.createElement('td');
        const totalCost = groceryList.reduce((sum, ingredient) => {
            return sum + (ingredient.packageCount || 0) * (ingredient.price || 0);
        }, 0);
        totalCostCell.textContent = `$${totalCost.toFixed(2)}`;
        totalRow.appendChild(totalCostCell);

        totalRow.appendChild(document.createElement('td'));

        tbody.appendChild(totalRow);

        groceryListContainer.innerHTML = '';
        groceryListContainer.appendChild(table);
    }

    function printGroceryList() {
        if (!groceryList || groceryList.length === 0) {
            showStatus('No grocery list to print.', 'error');
            return;
        }

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

        const totalPackages = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0), 0);
        const totalCost = groceryList.reduce((sum, ingredient) => sum + (ingredient.packageCount || 0) * (ingredient.price || 0), 0);

        csvContent += `"TOTAL",,,"${totalPackages}",,"${totalCost.toFixed(2)}",\n`;

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
        generateListBtn.disabled = selectedRecipes.length === 0;
    }

    function updateUI() {
        updateSelectionButtons();
        updateGenerateButton();
        printListBtn.disabled = !groceryList;
        saveListBtn.disabled = !groceryList;
    }

    function addEventListeners() {

        addRecipeBtn.addEventListener('click', addSelectedRecipes);

        removeRecipeBtn.addEventListener('click', removeSelectedRecipes);

        generateListBtn.addEventListener('click', generateGroceryList);

        printListBtn.addEventListener('click', printGroceryList);

        saveListBtn.addEventListener('click', saveGroceryList);
    }
});
