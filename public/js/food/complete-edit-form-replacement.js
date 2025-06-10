/**
 * Complete Edit Form Replacement
 * Completely replaces the edit ingredient form with a new implementation
 * that has consistent styling across all sections
 */

(function() {

    let initialized = false;

    function createNewEditForm(ingredientId, recipeId, container) {
        console.log('Creating new edit form for ingredient:', ingredientId, 'in recipe:', recipeId);

        const existingForm = container.querySelector('.edit-ingredient-form');
        if (!existingForm) {
            console.error('Could not find existing edit form');
            return;
        }

        existingForm.originalContent = existingForm.innerHTML;

        existingForm.innerHTML = '';

        existingForm.innerHTML = `
            <h4>Edit Ingredient</h4>
            <form id="edit-ingredient-form" style="margin: 0; padding: 0;">
                <input type="hidden" id="edit-ingredient-id" value="${ingredientId}">
                <input type="hidden" id="edit-recipe-id" value="${recipeId}">

                <!-- Form content will be added here -->

                <div class="form-actions">
                    <button type="submit" class="save-ingredient-btn">Save Changes</button>
                    <button type="button" class="cancel-edit-btn">Cancel</button>
                </div>
            </form>
            <div class="edit-ingredient-status status"></div>
        `;

        const formElement = existingForm.querySelector('form');

        formElement.addEventListener('submit', handleEditIngredientSubmit);

        const cancelButton = existingForm.querySelector('.cancel-edit-btn');
        if (cancelButton) {

            const newCancelButton = cancelButton.cloneNode(true);
            if (cancelButton.parentNode) {
                cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
            }

            newCancelButton.addEventListener('click', function(event) {

                event.preventDefault();
                event.stopPropagation();

                console.log('Cancel button clicked, hiding form');

                existingForm.style.display = 'none';
                existingForm.classList.remove('show-edit-form');
                existingForm.classList.add('hide-edit-form');

                existingForm.setAttribute('data-force-hidden', 'true');

                setTimeout(function() {
                    existingForm.style.display = 'none';
                    console.log('Edit form hidden (timeout)');
                }, 10);
            });
        } else {
            console.error('Cancel button not found in the form');
        }

        fetchAndPopulateForm(ingredientId, recipeId, formElement);

        return existingForm;
    }

    function fetchAndPopulateForm(ingredientId, recipeId, formElement) {
        if (DEBUG) console.log('fetchAndPopulateForm called');
        if (DEBUG) console.log('Fetching data for ingredient:', ingredientId, 'in recipe:', recipeId);

        const container = formElement.closest('.ingredient-details');
        const statusElement = container.querySelector('.edit-ingredient-status');

        if (statusElement) {
            statusElement.textContent = 'Loading ingredient data...';
            statusElement.className = 'status info';
        }

        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(ingredient => {
                console.log('Ingredient data received:', ingredient);

                if (statusElement) {
                    statusElement.textContent = '';
                    statusElement.className = 'status';
                }

                createFormSections(formElement, ingredient);
            })
            .catch(error => {
                console.error('Error fetching ingredient data:', error);

                if (statusElement) {
                    statusElement.textContent = 'Error loading ingredient data. Please try again.';
                    statusElement.className = 'status error';
                }
            });
    }

    function createFormSections(formElement, ingredient) {

        const sections = [
            createBasicInfoSection(ingredient),
            createGeneralSection(ingredient),
            createCarbohydratesSection(ingredient),
            createLipidsSection(ingredient),
            createProteinSection(ingredient),
            createVitaminsSection(ingredient),
            createMineralsSection(ingredient)
        ];

        const formActions = formElement.querySelector('.form-actions');
        sections.forEach(section => {
            formElement.insertBefore(section, formActions);
        });
    }

    // Comprehensive form sections with show/hide functionality for micronutrients
    function createComprehensiveFormSections(formElement, ingredient) {
        // Create basic info section (always visible)
        const basicInfoSection = createBasicInfoSection(ingredient);

        // Create show/hide button for micronutrients
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.id = 'toggle-micronutrients-btn';
        toggleButton.textContent = 'Show Micronutrients';
        toggleButton.style.cssText = `
            width: 100%;
            padding: 8px 16px;
            margin: 10px 0;
            border: 1px solid #555;
            border-radius: 4px;
            background-color: rgba(60, 60, 60, 0.8);
            color: #ffffff;
            cursor: pointer;
            font-size: 0.9em;
        `;

        // Create micronutrients container (initially hidden)
        const micronutrientsContainer = document.createElement('div');
        micronutrientsContainer.id = 'micronutrients-container';
        micronutrientsContainer.style.display = 'none';

        // Add micronutrient sections to container
        const micronutrientSections = [
            createGeneralSection(ingredient),
            createCarbohydratesSection(ingredient),
            createLipidsSection(ingredient),
            createProteinSection(ingredient),
            createVitaminsSection(ingredient),
            createMineralsSection(ingredient)
        ];

        micronutrientSections.forEach(section => {
            micronutrientsContainer.appendChild(section);
        });

        // Add toggle functionality
        toggleButton.addEventListener('click', function() {
            const isHidden = micronutrientsContainer.style.display === 'none';
            micronutrientsContainer.style.display = isHidden ? 'block' : 'none';
            toggleButton.textContent = isHidden ? 'Hide Micronutrients' : 'Show Micronutrients';
        });

        // Insert sections into form
        const formActions = formElement.querySelector('.form-actions');
        formElement.insertBefore(basicInfoSection, formActions);
        formElement.insertBefore(toggleButton, formActions);
        formElement.insertBefore(micronutrientsContainer, formActions);
    }

    function createSection(title, fields) {
        const section = document.createElement('div');
        section.className = 'nutrition-section';
        section.style.marginBottom = '5px';
        section.style.paddingBottom = '3px';

        const header = document.createElement('h4');
        header.textContent = title;
        header.style.fontSize = '0.8em';
        header.style.marginTop = '0';
        header.style.marginBottom = '4px';
        header.style.paddingBottom = '2px';
        header.style.borderBottom = 'none';
        header.style.color = '#e0e0e0';
        header.style.fontWeight = '500';
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'nutrition-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
        grid.style.gap = '3px';
        section.appendChild(grid);

        fields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'nutrition-item';
            item.style.marginBottom = '3px';

            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.textContent = field.label;
            label.style.fontSize = '0.65em';
            label.style.marginBottom = '1px';
            label.style.color = '#aaa';
            label.style.display = 'block';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';

            const input = document.createElement('input');
            input.type = field.type || 'number';
            input.id = field.id;

            // Format numeric values with 2 decimal places for display
            if (input.type !== 'text' && field.value !== '' && !isNaN(parseFloat(field.value))) {
                input.value = parseFloat(field.value).toFixed(2);
            } else {
                input.value = field.value || '';
            }

            if (input.type === 'number') {
                input.step = field.step || '0.01'; // Default to 0.01 for 2 decimal places
                input.min = field.min || '0';
            }

            input.style.width = field.id === 'edit-ingredient-name' ? '140px' : '45px';
            input.style.padding = '0px 2px';
            input.style.height = '18px';
            input.style.fontSize = '0.7em';
            input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            input.style.color = '#e0e0e0';
            input.style.borderRadius = '2px';

            if (field.required) {
                input.required = true;
            }

            item.appendChild(label);
            item.appendChild(input);
            grid.appendChild(item);
        });

        return section;
    }

    function createBasicInfoSection(ingredient) {
        return createSection('Basic Information', [
            {
                id: 'edit-ingredient-name',
                label: 'Name:',
                value: ingredient.name || '',
                type: 'text',
                required: true
            },
            {
                id: 'edit-ingredient-amount',
                label: 'Amount (g):',
                value: ingredient.amount || '',
                required: true
            },
            {
                id: 'edit-ingredient-package-amount',
                label: 'Package Amount (g):',
                value: ingredient.package_amount || ''
            },
            {
                id: 'edit-ingredient-price',
                label: 'Package Price:',
                value: ingredient.price || '',
                required: true
            },
            {
                id: 'edit-ingredient-grocery-store',
                label: 'Grocery Store:',
                value: ingredient.grocery_store || '',
                type: 'text'
            },
            // Essential nutrition fields (always visible)
            {
                id: 'edit-ingredient-calories',
                label: 'Energy (kcal):',
                value: ingredient.calories || '',
                required: true
            },
            {
                id: 'edit-ingredient-protein',
                label: 'Protein (g):',
                value: ingredient.protein || '',
                required: true
            },
            {
                id: 'edit-ingredient-fats',
                label: 'Fat (g):',
                value: ingredient.fats || '',
                required: true
            },
            {
                id: 'edit-ingredient-carbs',
                label: 'Carbs (g):',
                value: ingredient.carbohydrates || '',
                required: true
            }
        ]);
    }

    function createGeneralSection(ingredient) {
        return createSection('General', [
            {
                id: 'edit-ingredient-alcohol',
                label: 'Alcohol (g):',
                value: ingredient.alcohol || ''
            },
            {
                id: 'edit-ingredient-caffeine',
                label: 'Caffeine (mg):',
                value: ingredient.caffeine || ''
            },
            {
                id: 'edit-ingredient-water',
                label: 'Water (g):',
                value: ingredient.water || ''
            }
        ]);
    }

    function createCarbohydratesSection(ingredient) {
        return createSection('Carbohydrates', [
            {
                id: 'edit-ingredient-fiber',
                label: 'Fiber (g):',
                value: ingredient.fiber || ''
            },
            {
                id: 'edit-ingredient-starch',
                label: 'Starch (g):',
                value: ingredient.starch || ''
            },
            {
                id: 'edit-ingredient-sugars',
                label: 'Sugars (g):',
                value: ingredient.sugars || ''
            },
            {
                id: 'edit-ingredient-added-sugars',
                label: 'Added Sugars (g):',
                value: ingredient.added_sugars || ''
            },
            {
                id: 'edit-ingredient-net-carbs',
                label: 'Net Carbs (g):',
                value: ingredient.net_carbs || ''
            }
        ]);
    }

    function createLipidsSection(ingredient) {

        const omega3Value = ingredient.omega3 !== undefined ? ingredient.omega3 :
                           (ingredient.omega_3 !== undefined ? ingredient.omega_3 : '');
        const omega6Value = ingredient.omega6 !== undefined ? ingredient.omega6 :
                           (ingredient.omega_6 !== undefined ? ingredient.omega_6 : '');

        return createSection('Lipids', [
            {
                id: 'edit-ingredient-monounsaturated',
                label: 'Monounsaturated (g):',
                value: ingredient.monounsaturated || ''
            },
            {
                id: 'edit-ingredient-polyunsaturated',
                label: 'Polyunsaturated (g):',
                value: ingredient.polyunsaturated || ''
            },
            {
                id: 'edit-ingredient-omega3',
                label: 'Omega 3 (g):',
                value: omega3Value
            },
            {
                id: 'edit-ingredient-omega6',
                label: 'Omega 6 (g):',
                value: omega6Value
            },
            {
                id: 'edit-ingredient-saturated',
                label: 'Saturated (g):',
                value: ingredient.saturated || ''
            },
            {
                id: 'edit-ingredient-trans-fat',
                label: 'Trans Fat (g):',
                value: ingredient.trans_fat || '0'
            },
            {
                id: 'edit-ingredient-cholesterol',
                label: 'Cholesterol (mg):',
                value: ingredient.cholesterol || ''
            }
        ]);
    }

    function createProteinSection(ingredient) {
        return createSection('Amino Acids', [
            {
                id: 'edit-ingredient-cystine',
                label: 'Cystine (g):',
                value: ingredient.cystine || ''
            },
            {
                id: 'edit-ingredient-histidine',
                label: 'Histidine (g):',
                value: ingredient.histidine || ''
            },
            {
                id: 'edit-ingredient-isoleucine',
                label: 'Isoleucine (g):',
                value: ingredient.isoleucine || ''
            },
            {
                id: 'edit-ingredient-leucine',
                label: 'Leucine (g):',
                value: ingredient.leucine || ''
            },
            {
                id: 'edit-ingredient-lysine',
                label: 'Lysine (g):',
                value: ingredient.lysine || ''
            },
            {
                id: 'edit-ingredient-methionine',
                label: 'Methionine (g):',
                value: ingredient.methionine || ''
            },
            {
                id: 'edit-ingredient-phenylalanine',
                label: 'Phenylalanine (g):',
                value: ingredient.phenylalanine || ''
            },
            {
                id: 'edit-ingredient-threonine',
                label: 'Threonine (g):',
                value: ingredient.threonine || ''
            },
            {
                id: 'edit-ingredient-tryptophan',
                label: 'Tryptophan (g):',
                value: ingredient.tryptophan || ''
            },
            {
                id: 'edit-ingredient-tyrosine',
                label: 'Tyrosine (g):',
                value: ingredient.tyrosine || ''
            },
            {
                id: 'edit-ingredient-valine',
                label: 'Valine (g):',
                value: ingredient.valine || ''
            }
        ]);
    }

    function createVitaminsSection(ingredient) {
        return createSection('Vitamins', [
            {
                id: 'edit-ingredient-vitamin-b1',
                label: 'B1 (Thiamine) (mg):',
                value: ingredient.thiamine || '0',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-b2',
                label: 'B2 (Riboflavin) (mg):',
                value: ingredient.riboflavin || '0',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-b3',
                label: 'B3 (Niacin) (mg):',
                value: ingredient.niacin || '0',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-b5',
                label: 'B5 (Pantothenic Acid) (mg):',
                value: ingredient.pantothenic_acid || '0',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-b6',
                label: 'B6 (Pyridoxine) (mg):',
                value: ingredient.vitamin_b6 || '',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-b12',
                label: 'B12 (Cobalamin) (μg):',
                value: ingredient.vitamin_b12 || '',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-folate',
                label: 'Folate (μg):',
                value: ingredient.folate || ''
            },
            {
                id: 'edit-ingredient-vitamin-a',
                label: 'Vitamin A (μg):',
                value: ingredient.vitamin_a || ''
            },
            {
                id: 'edit-ingredient-vitamin-c',
                label: 'Vitamin C (mg):',
                value: ingredient.vitamin_c || ''
            },
            {
                id: 'edit-ingredient-vitamin-d',
                label: 'Vitamin D (IU):',
                value: ingredient.vitamin_d || ''
            },
            {
                id: 'edit-ingredient-vitamin-e',
                label: 'Vitamin E (mg):',
                value: ingredient.vitamin_e || '',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-vitamin-k',
                label: 'Vitamin K (μg):',
                value: ingredient.vitamin_k || ''
            }
        ]);
    }

    function createMineralsSection(ingredient) {
        return createSection('Minerals', [
            {
                id: 'edit-ingredient-calcium',
                label: 'Calcium (mg):',
                value: ingredient.calcium || ''
            },
            {
                id: 'edit-ingredient-copper',
                label: 'Copper (mg):',
                value: ingredient.copper || '',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-iron',
                label: 'Iron (mg):',
                value: ingredient.iron || ''
            },
            {
                id: 'edit-ingredient-magnesium',
                label: 'Magnesium (mg):',
                value: ingredient.magnesium || ''
            },
            {
                id: 'edit-ingredient-manganese',
                label: 'Manganese (mg):',
                value: ingredient.manganese || '',
                step: '0.01'
            },
            {
                id: 'edit-ingredient-phosphorus',
                label: 'Phosphorus (mg):',
                value: ingredient.phosphorus || ''
            },
            {
                id: 'edit-ingredient-potassium',
                label: 'Potassium (mg):',
                value: ingredient.potassium || ''
            },
            {
                id: 'edit-ingredient-selenium',
                label: 'Selenium (μg):',
                value: ingredient.selenium || ''
            },
            {
                id: 'edit-ingredient-sodium',
                label: 'Sodium (mg):',
                value: ingredient.sodium || ''
            },
            {
                id: 'edit-ingredient-zinc',
                label: 'Zinc (mg):',
                value: ingredient.zinc || '',
                step: '0.01'
            }
        ]);
    }

    function handleEditIngredientSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const container = form.closest('.edit-ingredient-form');
        const statusElement = container.querySelector('.edit-ingredient-status');

        const ingredientId = form.querySelector('#edit-ingredient-id').value;
        const recipeId = form.querySelector('#edit-recipe-id').value;

        if (statusElement) {
            statusElement.textContent = 'Saving changes...';
            statusElement.className = 'status info';
        }

        const formData = {
            name: form.querySelector('#edit-ingredient-name').value,
            amount: parseFloat(form.querySelector('#edit-ingredient-amount').value),
            package_amount: parseFloat(form.querySelector('#edit-ingredient-package-amount').value) || null,
            price: parseFloat(form.querySelector('#edit-ingredient-price').value) || 0,
            grocery_store: form.querySelector('#edit-ingredient-grocery-store')?.value || '',
            calories: parseFloat(form.querySelector('#edit-ingredient-calories').value) || 0,
            protein: parseFloat(form.querySelector('#edit-ingredient-protein').value) || 0,
            fats: parseFloat(form.querySelector('#edit-ingredient-fats').value) || 0,
            carbohydrates: parseFloat(form.querySelector('#edit-ingredient-carbs').value) || 0
        };

        const optionalFields = [
            'alcohol', 'caffeine', 'water', 'fiber', 'starch', 'sugars', 'added_sugars', 'net_carbs',
            'monounsaturated', 'polyunsaturated', 'omega3', 'omega6', 'saturated', 'trans_fat', 'cholesterol',
            'cystine', 'histidine', 'isoleucine', 'leucine', 'lysine', 'methionine', 'phenylalanine',
            'threonine', 'tryptophan', 'tyrosine', 'valine',
            // 'thiamine', 'riboflavin', // DISABLED: cause 500 errors due to database column issues
            'niacin', 'pantothenic_acid', 'vitamin_b6', 'vitamin_b12',
            'folate', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
            'calcium', 'copper', 'iron', 'magnesium', 'manganese', 'phosphorus', 'potassium',
            'selenium', 'sodium', 'zinc'
        ];

        optionalFields.forEach(field => {

            const inputId = 'edit-ingredient-' + field.replace(/_/g, '-');
            const input = form.querySelector('#' + inputId);
            if (input && input.value !== '') {
                formData[field] = parseFloat(input.value) || 0;
            }
        });

        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ingredient updated successfully:', data);

            if (statusElement) {
                statusElement.textContent = 'Ingredient updated successfully!';
                statusElement.className = 'status success';
            }

            setTimeout(() => {
                container.style.display = 'none';

                if (typeof fetchAndDisplayIngredients === 'function') {
                    fetchAndDisplayIngredients(recipeId);
                } else {

                    window.location.reload();
                }
            }, 1500);
        })
        .catch(error => {
            console.error('Error updating ingredient:', error);

            if (statusElement) {
                statusElement.textContent = 'Error updating ingredient. Please try again.';
                statusElement.className = 'status error';
            }
        });
    }

    const DEBUG = false;

    function handleEditButtonClick(event) {
        if (DEBUG) console.log('Click event detected, checking if it was on an edit button');

        if (event.target.classList.contains('edit-ingredient-btn') ||
            (event.target.tagName === 'BUTTON' &&
             event.target.textContent === 'Edit' &&
             event.target.closest('tr'))) {

            if (DEBUG) console.log('Edit button clicked, replacing edit form');

            event.stopPropagation();
            event.preventDefault();

            const row = event.target.closest('tr');
            if (!row) return;

            const ingredientId = row.dataset.ingredientId;
            const recipeId = row.dataset.recipeId;

            if (DEBUG) console.log('Found ingredientId:', ingredientId, 'recipeId:', recipeId);

            const container = row.closest('.ingredient-details');
            if (!container) {
                if (DEBUG) console.log('Could not find container');
                return;
            }

            const editForm = container.querySelector('.edit-ingredient-form');
            if (editForm) {
                if (DEBUG) console.log('Found edit form, making it visible');

                editForm.style.display = 'block';

                createNewEditForm(ingredientId, recipeId, container);
            } else {
                if (DEBUG) console.log('Could not find edit form');
            }
        }
    }

    function init() {
        if (initialized) return;

        if (DEBUG) console.log('Initializing complete edit form replacement');

        document.body.addEventListener('click', handleEditButtonClick, true);

        document.body.addEventListener('click', function(event) {

            if (event.target.classList.contains('cancel-edit-btn') ||
                (event.target.textContent === 'Cancel' && event.target.closest('.edit-ingredient-form'))) {

                if (DEBUG) console.log('Cancel button clicked (global handler)');

                const editForm = event.target.closest('.edit-ingredient-form');
                if (editForm) {

                    editForm.style.display = 'none';
                    editForm.classList.remove('show-edit-form');
                    editForm.classList.add('hide-edit-form');

                    editForm.setAttribute('data-force-hidden', 'true');

                    const style = document.createElement('style');
                    style.textContent = '.edit-ingredient-form[data-force-hidden="true"] { display: none !important; }';
                    document.head.appendChild(style);

                    setTimeout(function() {
                        editForm.style.display = 'none';
                        if (DEBUG) console.log('Edit form hidden (timeout)');
                    }, 10);

                    if (DEBUG) console.log('Edit form hidden (global handler)');
                }

                event.stopPropagation();
                event.preventDefault();
            }
        }, true); // Use capture phase to ensure this runs before other handlers

        initialized = true;

        if (DEBUG) console.log('Complete edit form replacement initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally for use by comprehensive edit modal
    window.createFormSections = createFormSections;
    window.createComprehensiveFormSections = createComprehensiveFormSections;
    window.createSection = createSection;
    window.createBasicInfoSection = createBasicInfoSection;
    window.createGeneralSection = createGeneralSection;
    window.createCarbohydratesSection = createCarbohydratesSection;
    window.createLipidsSection = createLipidsSection;
    window.createProteinSection = createProteinSection;
    window.createVitaminsSection = createVitaminsSection;
    window.createMineralsSection = createMineralsSection;

})();
