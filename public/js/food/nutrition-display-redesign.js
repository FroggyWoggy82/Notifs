/**
 * Nutrition Display Redesign
 * Creates a more compact, user-friendly, and visually appealing nutrition information display
 */

document.addEventListener('DOMContentLoaded', function() {

    function redesignNutritionDisplay() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.nutritionDisplayRedesigned === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            let detailedNutritionPanel = formElement.querySelector('.detailed-nutrition-panel');

            if (!detailedNutritionPanel) {
                console.log('Creating detailed nutrition panel');

                detailedNutritionPanel = document.createElement('div');
                detailedNutritionPanel.className = 'detailed-nutrition-panel';
                detailedNutritionPanel.style.display = 'block';
                detailedNutritionPanel.style.padding = '8px';
                detailedNutritionPanel.style.marginTop = '8px';

                formElement.appendChild(detailedNutritionPanel);
            }

            detailedNutritionPanel.innerHTML = '';

            const generalSection = createNutritionSection('General', [
                { id: 'edit-ingredient-calories', label: 'Energy', unit: 'kcal', primary: true, required: true },
                { id: 'edit-ingredient-water', label: 'Water', unit: 'g' },
                { id: 'edit-ingredient-alcohol', label: 'Alcohol', unit: 'g' },
                { id: 'edit-ingredient-caffeine', label: 'Caffeine', unit: 'mg' }
            ]);
            detailedNutritionPanel.appendChild(generalSection);

            const carbsSection = createNutritionSection('Carbohydrates', [
                { id: 'edit-ingredient-carbs', label: 'Total Carbs', unit: 'g', primary: true, required: true },
                { id: 'edit-ingredient-fiber', label: 'Fiber', unit: 'g', primary: true },
                { id: 'edit-ingredient-sugars', label: 'Sugars', unit: 'g', primary: true },
                { id: 'edit-ingredient-added-sugars', label: 'Added Sugars', unit: 'g' },
                { id: 'edit-ingredient-starch', label: 'Starch', unit: 'g' },
                { id: 'edit-ingredient-net-carbs', label: 'Net Carbs', unit: 'g' }
            ]);
            detailedNutritionPanel.appendChild(carbsSection);

            const lipidsSection = createNutritionSection('Lipids', [
                { id: 'edit-ingredient-fats', label: 'Total Fat', unit: 'g', primary: true, required: true },
                { id: 'edit-ingredient-saturated', label: 'Saturated', unit: 'g', primary: true },
                { id: 'edit-ingredient-monounsaturated', label: 'Monounsaturated', unit: 'g' },
                { id: 'edit-ingredient-polyunsaturated', label: 'Polyunsaturated', unit: 'g' },
                { id: 'edit-ingredient-omega3', label: 'Omega-3', unit: 'g' },
                { id: 'edit-ingredient-omega6', label: 'Omega-6', unit: 'g' },
                { id: 'edit-ingredient-trans-fat', label: 'Trans Fat', unit: 'g' },
                { id: 'edit-ingredient-cholesterol', label: 'Cholesterol', unit: 'mg' }
            ]);
            detailedNutritionPanel.appendChild(lipidsSection);

            const proteinSection = createNutritionSection('Proteins', [
                { id: 'edit-ingredient-protein', label: 'Total Protein', unit: 'g', primary: true, required: true },
                { id: 'edit-ingredient-leucine', label: 'Leucine', unit: 'g' },
                { id: 'edit-ingredient-isoleucine', label: 'Isoleucine', unit: 'g' },
                { id: 'edit-ingredient-valine', label: 'Valine', unit: 'g' },
                { id: 'edit-ingredient-lysine', label: 'Lysine', unit: 'g' },
                { id: 'edit-ingredient-methionine', label: 'Methionine', unit: 'g' },
                { id: 'edit-ingredient-phenylalanine', label: 'Phenylalanine', unit: 'g' },
                { id: 'edit-ingredient-threonine', label: 'Threonine', unit: 'g' },
                { id: 'edit-ingredient-tryptophan', label: 'Tryptophan', unit: 'g' },
                { id: 'edit-ingredient-histidine', label: 'Histidine', unit: 'g' },
                { id: 'edit-ingredient-cystine', label: 'Cystine', unit: 'g' },
                { id: 'edit-ingredient-tyrosine', label: 'Tyrosine', unit: 'g' }
            ]);
            detailedNutritionPanel.appendChild(proteinSection);

            const vitaminsSection = createNutritionSection('Vitamins', [
                { id: 'edit-ingredient-vitamin-a', label: 'Vitamin A', unit: 'μg', primary: true },
                { id: 'edit-ingredient-vitamin-c', label: 'Vitamin C', unit: 'mg', primary: true },
                { id: 'edit-ingredient-vitamin-d', label: 'Vitamin D', unit: 'IU', primary: true },
                { id: 'edit-ingredient-vitamin-e', label: 'Vitamin E', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-k', label: 'Vitamin K', unit: 'μg' },
                { id: 'edit-ingredient-vitamin-b1', label: 'B1 (Thiamine)', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-b2', label: 'B2 (Riboflavin)', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-b3', label: 'B3 (Niacin)', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-b5', label: 'B5 (Pantothenic)', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-b6', label: 'B6 (Pyridoxine)', unit: 'mg' },
                { id: 'edit-ingredient-vitamin-b12', label: 'B12 (Cobalamin)', unit: 'μg' },
                { id: 'edit-ingredient-folate', label: 'Folate', unit: 'μg' }
            ]);
            detailedNutritionPanel.appendChild(vitaminsSection);

            const mineralsSection = createNutritionSection('Minerals', [
                { id: 'edit-ingredient-calcium', label: 'Calcium', unit: 'mg', primary: true },
                { id: 'edit-ingredient-iron', label: 'Iron', unit: 'mg', primary: true },
                { id: 'edit-ingredient-potassium', label: 'Potassium', unit: 'mg', primary: true },
                { id: 'edit-ingredient-sodium', label: 'Sodium', unit: 'mg', primary: true },
                { id: 'edit-ingredient-magnesium', label: 'Magnesium', unit: 'mg' },
                { id: 'edit-ingredient-phosphorus', label: 'Phosphorus', unit: 'mg' },
                { id: 'edit-ingredient-zinc', label: 'Zinc', unit: 'mg' },
                { id: 'edit-ingredient-copper', label: 'Copper', unit: 'mg' },
                { id: 'edit-ingredient-manganese', label: 'Manganese', unit: 'mg' },
                { id: 'edit-ingredient-selenium', label: 'Selenium', unit: 'μg' }
            ]);
            detailedNutritionPanel.appendChild(mineralsSection);

            const formSubmitHandler = function(e) {

                const redesignedInputs = detailedNutritionPanel.querySelectorAll('input');

                redesignedInputs.forEach(input => {
                    const id = input.id;
                    const originalInput = document.getElementById(id);

                    if (originalInput && originalInput !== input) {
                        originalInput.value = input.value;
                    }
                });
            };

            formElement.removeEventListener('submit', formSubmitHandler);

            formElement.addEventListener('submit', formSubmitHandler);

            form.dataset.nutritionDisplayRedesigned = 'true';
        });
    }

    function createNutritionSection(title, fields) {
        const section = document.createElement('div');
        section.className = 'nutrition-section';
        section.style.marginBottom = '8px';
        section.style.paddingBottom = '6px';

        const header = document.createElement('h4');
        header.textContent = title;
        header.style.fontSize = '0.8em';
        header.style.marginBottom = '4px';
        header.style.paddingBottom = '2px';
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'nutrition-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
        grid.style.gap = '4px';

        fields.sort((a, b) => {
            if (a.primary && !b.primary) return -1;
            if (!a.primary && b.primary) return 1;
            return 0;
        });

        fields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'nutrition-item';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.marginBottom = '2px';
            if (field.primary) {
                item.classList.add('primary');
            }

            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.style.fontSize = '0.65em';
            label.style.marginBottom = '1px';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            label.style.display = 'flex';
            label.style.justifyContent = 'space-between';
            label.style.lineHeight = '1.2';

            const labelText = document.createElement('span');
            labelText.textContent = field.label;
            label.appendChild(labelText);

            const unitDisplay = document.createElement('span');
            unitDisplay.className = 'unit';
            unitDisplay.textContent = field.unit;
            unitDisplay.style.color = '#777777';
            unitDisplay.style.fontSize = '0.85em';
            unitDisplay.style.marginLeft = '2px';
            label.appendChild(unitDisplay);

            const input = document.createElement('input');
            input.type = 'number';
            input.id = field.id;
            input.step = '0.1';
            input.min = '0';
            input.style.width = '100%';
            input.style.padding = '1px 3px';
            input.style.height = '18px';
            input.style.fontSize = '0.7em';
            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            input.style.borderRadius = '2px';
            input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            input.style.color = '#e0e0e0';
            if (field.required) {
                input.required = true;
            }

            const existingInput = document.getElementById(field.id);
            if (existingInput && existingInput.value) {
                input.value = existingInput.value;
            }

            input.addEventListener('input', function() {
                const originalInput = document.getElementById(field.id);
                if (originalInput && originalInput !== input) {
                    originalInput.value = input.value;

                    const event = new Event('change', { bubbles: true });
                    originalInput.dispatchEvent(event);
                }
            });

            item.appendChild(label);
            item.appendChild(input);
            grid.appendChild(item);
        });

        section.appendChild(grid);
        return section;
    }

    setTimeout(redesignNutritionDisplay, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(redesignNutritionDisplay, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(redesignNutritionDisplay, 200);

            setTimeout(redesignNutritionDisplay, 500);
            setTimeout(redesignNutritionDisplay, 1000);
        }
    });

    setInterval(redesignNutritionDisplay, 2000);

    function syncInputValues() {
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            if (form.dataset.nutritionDisplayRedesigned === 'true') {
                const formElement = form.querySelector('form');
                if (!formElement) return;

                const detailedNutritionPanel = formElement.querySelector('.detailed-nutrition-panel');
                if (!detailedNutritionPanel) return;

                const redesignedInputs = detailedNutritionPanel.querySelectorAll('input');

                redesignedInputs.forEach(input => {
                    const id = input.id;
                    const originalInput = document.getElementById(id);

                    if (originalInput && originalInput !== input && originalInput.value !== input.value) {
                        input.value = originalInput.value;
                    }
                });
            }
        });
    }

    setInterval(syncInputValues, 500);
});
