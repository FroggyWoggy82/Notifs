/**
 * Grocery List Task Integration
 * Handles the integration between the grocery list and tasks
 * Supports subtasks for individual grocery items
 */

// Function to create a grocery list task with subtasks
async function createGroceryListTask(groceryList) {
    if (!groceryList || groceryList.length === 0) {
        showStatus('No grocery list to save as task.', 'error');
        return;
    }

    try {
        showStatus('Creating grocery list task...', 'info');

        // Format current date for the task title
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Get selected recipes for the task name
        const selectedRecipes = Array.from(document.querySelectorAll('.recipe-checkbox:checked'))
            .map(checkbox => {
                const nameElement = checkbox.nextElementSibling;
                return nameElement ? nameElement.textContent.trim() : '';
            })
            .filter(name => name);

        // Get nutritional information
        const totalCalories = document.querySelector('.total-calories')?.textContent.trim() || '';
        const calorieTarget = document.querySelector('.calorie-target')?.textContent.trim() || '';
        const caloriePercentage = document.querySelector('.calorie-percentage')?.textContent.trim() || '';
        const totalProtein = document.querySelector('.total-protein')?.textContent.trim() || '';
        const proteinTarget = document.querySelector('.protein-target')?.textContent.trim() || '';
        const proteinPercentage = document.querySelector('.protein-percentage')?.textContent.trim() || '';

        // Create a task title with calorie information
        const taskTitle = `Grocery List (${totalCalories}, ${caloriePercentage} of target)`;

        // Calculate total cost
        const totalCost = groceryList.reduce((sum, item) => {
            const itemCost = item.price && item.packageCount
                ? parseFloat(item.price) * item.packageCount
                : 0;
            return sum + itemCost;
        }, 0).toFixed(2);

        // Create a detailed description
        const description = `Grocery list generated on ${formattedDate}
Total Cost: $${totalCost}
Calories: ${totalCalories || 'N/A'} of ${calorieTarget || 'N/A'} (${caloriePercentage || 'N/A'})
Protein: ${totalProtein || 'N/A'} of ${proteinTarget || 'N/A'} (${proteinPercentage || 'N/A'})
Selected Recipes: ${selectedRecipes.join(', ') || 'None'}`;

        // Create the parent task with has_subtasks flag
        const parentTaskResponse = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: taskTitle,
                description: description,
                assigned_date: currentDate.toISOString().split('T')[0],
                is_complete: false,
                has_subtasks: true, // Explicitly set has_subtasks flag
                is_grocery_list: true // Additional flag to identify this as a grocery list task
            })
        });

        console.log('Parent task creation response status:', parentTaskResponse.status);

        if (!parentTaskResponse.ok) {
            throw new Error(`Failed to create parent task: ${parentTaskResponse.status} ${parentTaskResponse.statusText}`);
        }

        const parentTask = await parentTaskResponse.json();
        console.log('Parent task created:', parentTask);

        // Create subtasks for each ingredient
        const subtaskPromises = groceryList.map(async (ingredient) => {
            // Skip the TOTAL row if present
            if (ingredient.name === 'TOTAL') return null;

            // Calculate price information
            const totalPrice = ingredient.packageCount > 0 && ingredient.price
                ? (ingredient.packageCount * ingredient.price).toFixed(2)
                : 'N/A';

            // Format the subtask title to match the standard format
            // Format: "Ingredient Name - 100.0g - 1 package - $10.00"
            let subtaskTitle = ingredient.name;

            // Add amount
            if (ingredient.amount) {
                subtaskTitle += ` - ${ingredient.amount.toFixed(2)}g`;
            }

            // Add package count
            if (ingredient.packageCount > 0) {
                subtaskTitle += ` - ${ingredient.packageCount} package${ingredient.packageCount > 1 ? 's' : ''}`;
            }

            // Add price
            if (ingredient.price) {
                subtaskTitle += ` - $${ingredient.price.toFixed(2)}`;
            }

            // Create a description with detailed information
            const description = `Amount: ${ingredient.amount.toFixed(2)}g\n` +
                `Package Size: ${ingredient.package_amount ? ingredient.package_amount.toFixed(2) : 'N/A'}g\n` +
                `Packages to Buy: ${ingredient.packageCount > 0 ? ingredient.packageCount : 'N/A'}\n` +
                `Price per Package: ${ingredient.price ? `$${ingredient.price.toFixed(2)}` : 'N/A'}\n` +
                `Total Cost: ${totalPrice !== 'N/A' ? `$${totalPrice}` : 'N/A'}\n` +
                `Used in: ${ingredient.recipes ? ingredient.recipes.map(r => r.name).join(', ') : 'Unknown'}`;

            // Store grocery data in JSON format with standardized structure
            const groceryData = {
                name: ingredient.name,
                amount: ingredient.amount,
                unit: 'g', // Default unit is grams
                package_amount: ingredient.package_amount,
                packages: ingredient.packageCount, // Use 'packages' for consistency with subtask display
                packageCount: ingredient.packageCount, // Keep original for backward compatibility
                price: ingredient.price,
                totalPrice: totalPrice !== 'N/A' ? parseFloat(totalPrice) : null,
                recipes: ingredient.recipes ? ingredient.recipes.map(r => ({ name: r.name, amount: r.amount })) : []
            };

            try {
                // Create the subtask directly using the tasks endpoint to ensure it works
                const subtaskData = {
                    title: subtaskTitle,
                    description: description,
                    assigned_date: currentDate.toISOString().split('T')[0],
                    is_complete: false,
                    parent_task_id: parentTask.id,
                    is_subtask: true,
                    grocery_data: groceryData
                };

                console.log(`Creating subtask for parent task ${parentTask.id} with data:`, subtaskData);

                const subtaskResponse = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subtaskData)
                });

                if (!subtaskResponse.ok) {
                    throw new Error(`Failed to create subtask: ${subtaskResponse.status} ${subtaskResponse.statusText}`);
                }

                const result = await subtaskResponse.json();
                console.log(`Successfully created subtask for parent task ${parentTask.id}:`, result);
                return result;
            } catch (error) {
                console.error(`Error creating subtask ${subtaskTitle}:`, error);
                throw error;
            }
        });

        // Wait for all subtasks to be created
        const subtasks = await Promise.all(subtaskPromises.filter(p => p !== null));
        console.log(`Created ${subtasks.length} subtasks`);

        // Update the parent task to ensure has_subtasks flag is set
        const updateResponse = await fetch(`/api/tasks/${parentTask.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                has_subtasks: true
            })
        });

        if (!updateResponse.ok) {
            console.error(`Failed to update parent task has_subtasks flag: ${updateResponse.status} ${updateResponse.statusText}`);
        } else {
            console.log(`Successfully updated parent task ${parentTask.id} has_subtasks flag to true`);
        }

        showStatus('Grocery list saved as task successfully! Redirecting to tasks page...', 'success');

        // Redirect to the tasks page after a shorter delay
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

        return parentTask;
    } catch (error) {
        console.error('Error creating grocery list task:', error);
        showStatus(`Failed to save grocery list as task: ${error.message}`, 'error');
        return null;
    }
}

// Add a "Save as Task" button to the grocery list controls
function addSaveAsTaskButton() {
    const groceryListControls = document.querySelector('.grocery-list-controls');
    if (!groceryListControls) return;

    // Check if the button already exists
    if (document.getElementById('save-as-task-btn')) return;

    // Create the button
    const saveAsTaskBtn = document.createElement('button');
    saveAsTaskBtn.id = 'save-as-task-btn';
    saveAsTaskBtn.className = 'secondary-btn';
    saveAsTaskBtn.textContent = 'Save as Task';
    saveAsTaskBtn.disabled = true;

    // Add the button to the controls
    groceryListControls.appendChild(saveAsTaskBtn);

    // Add event listener
    saveAsTaskBtn.addEventListener('click', () => {
        if (window.groceryList && window.groceryList.length > 0) {
            createGroceryListTask(window.groceryList);
        } else {
            showStatus('No grocery list to save as task.', 'error');
        }
    });

    return saveAsTaskBtn;
}

// Initialize the integration
function initGroceryListTaskIntegration() {
    // Add the "Save as Task" button
    const saveAsTaskBtn = addSaveAsTaskButton();

    // Update the UI function to enable/disable the "Save as Task" button
    const originalUpdateUI = window.updateUI || function() {};
    window.updateUI = function() {
        originalUpdateUI();
        if (saveAsTaskBtn) {
            saveAsTaskBtn.disabled = !window.groceryList || window.groceryList.length === 0;
        }
    };

    // Add a direct event listener to the Generate Grocery List button
    const generateListBtn = document.getElementById('generate-list-btn');
    if (generateListBtn) {
        generateListBtn.addEventListener('click', function() {
            // Enable the Save as Task button after a short delay to ensure grocery list is generated
            setTimeout(() => {
                if (saveAsTaskBtn && window.groceryList && window.groceryList.length > 0) {
                    saveAsTaskBtn.disabled = false;
                    console.log('Save as Task button enabled after grocery list generation');
                }
            }, 1000);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGroceryListTaskIntegration);
