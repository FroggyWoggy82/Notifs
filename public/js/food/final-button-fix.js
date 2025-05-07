/**
 * Final Button Fix
 * A definitive solution to the duplicate buttons problem
 */

(function() {
    console.log('[Final Button Fix] Initializing...');

    function replaceFormActions() {

        const editForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        
        editForms.forEach(form => {
            console.log('[Final Button Fix] Processing visible form:', form);

            const formElement = form.querySelector('form');
            if (!formElement) {
                console.log('[Final Button Fix] No form element found');
                return;
            }

            const allButtons = form.querySelectorAll('button');
            allButtons.forEach(button => {
                console.log('[Final Button Fix] Removing button:', button.textContent);
                button.remove();
            });

            const allFormActions = form.querySelectorAll('.form-actions');
            allFormActions.forEach(actions => {
                console.log('[Final Button Fix] Removing form actions');
                actions.remove();
            });

            const newFormActions = document.createElement('div');
            newFormActions.className = 'form-actions';
            newFormActions.style.display = 'flex';
            newFormActions.style.justifyContent = 'space-between';
            newFormActions.style.marginTop = '15px';

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

            saveButton.onclick = async function() {
                console.log('[Final Button Fix] Save button clicked');
                
                try {

                    const container = form.closest('.ingredient-details');
                    const statusElement = container.querySelector('.edit-ingredient-status');

                    if (statusElement) {
                        statusElement.textContent = 'Saving changes...';
                        statusElement.className = 'status info';
                    }

                    const ingredientId = document.getElementById('edit-ingredient-id').value;
                    const recipeId = document.getElementById('edit-recipe-id').value;
                    const name = document.getElementById('edit-ingredient-name').value.trim();
                    const amount = parseFloat(document.getElementById('edit-ingredient-amount').value);
                    const price = parseFloat(document.getElementById('edit-ingredient-price').value);

                    if (!name || isNaN(amount) || isNaN(price)) {
                        throw new Error('Please fill all required fields with valid values.');
                    }

                    const ingredientData = {
                        name: name,
                        amount: amount,
                        price: price
                    };

                    const packageAmountInput = document.getElementById('edit-ingredient-package-amount');
                    if (packageAmountInput) {
                        const packageAmount = parseFloat(packageAmountInput.value);
                        if (!isNaN(packageAmount)) {
                            ingredientData.package_amount = packageAmount;
                        }
                    }

                    const allInputs = form.querySelectorAll('input[id^="edit-ingredient-"]');
                    allInputs.forEach(input => {
                        const fieldName = input.id.replace('edit-ingredient-', '');
                        if (fieldName !== 'id' && fieldName !== 'name' && fieldName !== 'amount' && fieldName !== 'price' && fieldName !== 'package-amount') {
                            const value = parseFloat(input.value);
                            if (!isNaN(value)) {

                                const camelCaseField = fieldName.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                                ingredientData[camelCaseField] = value;
                            }
                        }
                    });
                    
                    console.log('[Final Button Fix] Sending data:', ingredientData);

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

                    form.style.display = 'none';

                    if (statusElement) {
                        statusElement.textContent = 'Ingredient updated successfully!';
                        statusElement.className = 'status success';
                    }

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    console.error('[Final Button Fix] Error updating ingredient:', error);

                    const container = form.closest('.ingredient-details');
                    const statusElement = container.querySelector('.edit-ingredient-status');
                    if (statusElement) {
                        statusElement.textContent = `Error: ${error.message}`;
                        statusElement.className = 'status error';
                    }
                }
            };

            cancelButton.onclick = function() {
                console.log('[Final Button Fix] Cancel button clicked');
                form.style.display = 'none';
            };

            newFormActions.appendChild(saveButton);
            newFormActions.appendChild(cancelButton);

            formElement.appendChild(newFormActions);
            
            console.log('[Final Button Fix] Added single set of buttons with direct handlers');
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Final Button Fix] Edit button clicked');

                setTimeout(replaceFormActions, 100);
                setTimeout(replaceFormActions, 300);
                setTimeout(replaceFormActions, 500);
            }
        });
    }

    function runPeriodically() {

        const visibleForms = document.querySelectorAll('.edit-ingredient-form[style*="display: block"]');
        if (visibleForms.length > 0) {
            console.log('[Final Button Fix] Found visible forms, replacing buttons');
            replaceFormActions();
        }
    }

    function init() {
        console.log('[Final Button Fix] Initializing...');

        handleEditButtonClicks();

        setInterval(runPeriodically, 1000);
        
        console.log('[Final Button Fix] Initialized');
    }

    window.addEventListener('load', function() {

        setTimeout(init, 1000);
    });
})();
