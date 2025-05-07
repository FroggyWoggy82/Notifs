/**
 * Final Button Fix
 * A definitive solution to the duplicate buttons problem
 */

(function() {
    console.log('[Final Button Fix] Initializing...');

    // Function to completely replace the form actions
    function replaceFormActions() {
        // Find all edit ingredient forms that are currently visible
        const editForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        
        editForms.forEach(form => {
            console.log('[Final Button Fix] Processing visible form:', form);
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) {
                console.log('[Final Button Fix] No form element found');
                return;
            }
            
            // COMPLETELY REMOVE ALL BUTTONS from the form
            const allButtons = form.querySelectorAll('button');
            allButtons.forEach(button => {
                console.log('[Final Button Fix] Removing button:', button.textContent);
                button.remove();
            });
            
            // COMPLETELY REMOVE ALL FORM ACTIONS from the form
            const allFormActions = form.querySelectorAll('.form-actions');
            allFormActions.forEach(actions => {
                console.log('[Final Button Fix] Removing form actions');
                actions.remove();
            });
            
            // Create a single new form-actions element
            const newFormActions = document.createElement('div');
            newFormActions.className = 'form-actions';
            newFormActions.style.display = 'flex';
            newFormActions.style.justifyContent = 'space-between';
            newFormActions.style.marginTop = '15px';
            
            // Create Save Changes button
            const saveButton = document.createElement('button');
            saveButton.type = 'button'; // Use button type instead of submit
            saveButton.className = 'save-ingredient-btn';
            saveButton.textContent = 'Save Changes';
            saveButton.style.backgroundColor = '#333';
            saveButton.style.color = 'white';
            saveButton.style.border = '1px solid #444';
            saveButton.style.borderRadius = '3px';
            saveButton.style.padding = '8px 15px';
            saveButton.style.cursor = 'pointer';
            
            // Create Cancel button
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-edit-btn';
            cancelButton.textContent = 'Cancel';
            cancelButton.style.backgroundColor = '#333';
            cancelButton.style.color = 'white';
            cancelButton.style.border = '1px solid #444';
            cancelButton.style.borderRadius = '3px';
            cancelButton.style.padding = '8px 15px';
            cancelButton.style.cursor = 'pointer';
            
            // Add direct click handlers to the buttons
            saveButton.onclick = async function() {
                console.log('[Final Button Fix] Save button clicked');
                
                try {
                    // Get the container and status element
                    const container = form.closest('.ingredient-details');
                    const statusElement = container.querySelector('.edit-ingredient-status');
                    
                    // Show loading status
                    if (statusElement) {
                        statusElement.textContent = 'Saving changes...';
                        statusElement.className = 'status info';
                    }
                    
                    // Get basic form values
                    const ingredientId = document.getElementById('edit-ingredient-id').value;
                    const recipeId = document.getElementById('edit-recipe-id').value;
                    const name = document.getElementById('edit-ingredient-name').value.trim();
                    const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);
                    const price = parseFloat(document.getElementById('edit-ingredient-price').value);
                    
                    // Validate required fields
                    if (!name || isNaN(amount) || isNaN(price)) {
                        throw new Error('Please fill all required fields with valid values.');
                    }
                    
                    // Create the ingredient data object
                    const ingredientData = {
                        name: name,
                        amount: amount,
                        price: price
                    };
                    
                    // Add package amount if it exists
                    const packageAmountInput = document.getElementById('edit-ingredient-package-amount');
                    if (packageAmountInput) {
                        const packageAmount = parseFloat(packageAmountInput.value);
                        if (!isNaN(packageAmount)) {
                            ingredientData.package_amount = packageAmount;
                        }
                    }
                    
                    // Get all other input fields and add them to the data object
                    const allInputs = form.querySelectorAll('input[id^="edit-ingredient-"]');
                    allInputs.forEach(input => {
                        const fieldName = input.id.replace('edit-ingredient-', '');
                        if (fieldName !== 'id' && fieldName !== 'name' && fieldName !== 'amount' && fieldName !== 'price' && fieldName !== 'package-amount') {
                            const value = parseFloat(input.value);
                            if (!isNaN(value)) {
                                // Convert hyphenated names to camelCase
                                const camelCaseField = fieldName.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                                ingredientData[camelCaseField] = value;
                            }
                        }
                    });
                    
                    console.log('[Final Button Fix] Sending data:', ingredientData);
                    
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
                    
                    // Hide the edit form
                    form.style.display = 'none';
                    
                    // Show success message
                    if (statusElement) {
                        statusElement.textContent = 'Ingredient updated successfully!';
                        statusElement.className = 'status success';
                    }
                    
                    // Reload the page to show updated data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    console.error('[Final Button Fix] Error updating ingredient:', error);
                    
                    // Show error message
                    const container = form.closest('.ingredient-details');
                    const statusElement = container.querySelector('.edit-ingredient-status');
                    if (statusElement) {
                        statusElement.textContent = `Error: ${error.message}`;
                        statusElement.className = 'status error';
                    }
                }
            };
            
            // Add direct click handler to the cancel button
            cancelButton.onclick = function() {
                console.log('[Final Button Fix] Cancel button clicked');
                form.style.display = 'none';
            };
            
            // Add buttons to form actions
            newFormActions.appendChild(saveButton);
            newFormActions.appendChild(cancelButton);
            
            // Add form actions to the form element
            formElement.appendChild(newFormActions);
            
            console.log('[Final Button Fix] Added single set of buttons with direct handlers');
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Final Button Fix] Edit button clicked');
                
                // Wait for the form to be displayed
                setTimeout(replaceFormActions, 100);
                setTimeout(replaceFormActions, 300);
                setTimeout(replaceFormActions, 500);
            }
        });
    }

    // Function to run periodically
    function runPeriodically() {
        // Check for visible edit forms
        const visibleForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        if (visibleForms.length > 0) {
            console.log('[Final Button Fix] Found visible forms, replacing buttons');
            replaceFormActions();
        }
    }

    // Initialize
    function init() {
        console.log('[Final Button Fix] Initializing...');
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Run periodically to catch any forms that might be displayed
        setInterval(runPeriodically, 1000);
        
        console.log('[Final Button Fix] Initialized');
    }
    
    // Initialize when the window is fully loaded
    window.addEventListener('load', function() {
        // Wait a bit to ensure all other scripts have run
        setTimeout(init, 1000);
    });
})();
