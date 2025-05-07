/**
 * Show Nutrition Panel
 * Ensures the detailed nutrition panel is displayed in the edit ingredient form
 */

document.addEventListener('DOMContentLoaded', function() {

    function showNutritionPanel() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.nutritionPanelFixed === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            let detailedNutritionPanel = formElement.querySelector('.detailed-nutrition-panel');

            if (!detailedNutritionPanel) {
                console.log('Creating detailed nutrition panel');

                detailedNutritionPanel = document.createElement('div');
                detailedNutritionPanel.className = 'detailed-nutrition-panel';
                detailedNutritionPanel.style.display = 'block';

                const basicInfoSection = createNutritionSection('Basic Information', [
                    { id: 'edit-ingredient-name', label: 'Name:', required: true, type: 'text' },
                    { id: 'edit-ingredient-amount', label: 'Amount (g):', required: true },
                    { id: 'edit-ingredient-package-amount', label: 'Package Amount (g):' },
                    { id: 'edit-ingredient-price', label: 'Package Price:', required: true }
                ]);
                detailedNutritionPanel.appendChild(basicInfoSection);

                const generalSection = createNutritionSection('General', [
                    { id: 'edit-ingredient-calories', label: 'Energy (kcal):', required: true },
                    { id: 'edit-ingredient-alcohol', label: 'Alcohol (g):' },
                    { id: 'edit-ingredient-caffeine', label: 'Caffeine (mg):' },
                    { id: 'edit-ingredient-water', label: 'Water (g):' }
                ]);
                detailedNutritionPanel.appendChild(generalSection);

                detailedNutritionPanel.style.padding = '10px';
                detailedNutritionPanel.style.marginTop = '10px';

                const carbsSection = createNutritionSection('Carbohydrates', [
                    { id: 'edit-ingredient-carbs', label: 'Carbs (g):', required: true },
                    { id: 'edit-ingredient-fiber', label: 'Fiber (g):' },
                    { id: 'edit-ingredient-starch', label: 'Starch (g):' },
                    { id: 'edit-ingredient-sugars', label: 'Sugars (g):' },
                    { id: 'edit-ingredient-added-sugars', label: 'Added Sugars (g):' },
                    { id: 'edit-ingredient-net-carbs', label: 'Net Carbs (g):' }
                ]);
                detailedNutritionPanel.appendChild(carbsSection);

                const lipidsSection = createNutritionSection('Lipids', [
                    { id: 'edit-ingredient-fats', label: 'Fat (g):', required: true },
                    { id: 'edit-ingredient-monounsaturated', label: 'Monounsaturated (g):' },
                    { id: 'edit-ingredient-polyunsaturated', label: 'Polyunsaturated (g):' },
                    { id: 'edit-ingredient-omega3', label: 'Omega 3 (g):' },
                    { id: 'edit-ingredient-omega6', label: 'Omega 6 (g):' },
                    { id: 'edit-ingredient-saturated', label: 'Saturated (g):' },
                    { id: 'edit-ingredient-trans-fat', label: 'Trans Fat (g):' },
                    { id: 'edit-ingredient-cholesterol', label: 'Cholesterol (mg):' }
                ]);
                detailedNutritionPanel.appendChild(lipidsSection);

                const proteinSection = createNutritionSection('Protein', [
                    { id: 'edit-ingredient-protein', label: 'Protein (g):', required: true },
                    { id: 'edit-ingredient-cystine', label: 'Cystine (g):' },
                    { id: 'edit-ingredient-histidine', label: 'Histidine (g):' },
                    { id: 'edit-ingredient-isoleucine', label: 'Isoleucine (g):' },
                    { id: 'edit-ingredient-leucine', label: 'Leucine (g):' },
                    { id: 'edit-ingredient-lysine', label: 'Lysine (g):' },
                    { id: 'edit-ingredient-methionine', label: 'Methionine (g):' },
                    { id: 'edit-ingredient-phenylalanine', label: 'Phenylalanine (g):' },
                    { id: 'edit-ingredient-threonine', label: 'Threonine (g):' },
                    { id: 'edit-ingredient-tryptophan', label: 'Tryptophan (g):' },
                    { id: 'edit-ingredient-tyrosine', label: 'Tyrosine (g):' },
                    { id: 'edit-ingredient-valine', label: 'Valine (g):' }
                ]);
                detailedNutritionPanel.appendChild(proteinSection);

                const vitaminsSection = createNutritionSection('Vitamins', [
                    { id: 'edit-ingredient-vitamin-b1', label: 'B1 (Thiamine) (mg):' },
                    { id: 'edit-ingredient-vitamin-b2', label: 'B2 (Riboflavin) (mg):' },
                    { id: 'edit-ingredient-vitamin-b3', label: 'B3 (Niacin) (mg):' },
                    { id: 'edit-ingredient-vitamin-b5', label: 'B5 (Pantothenic Acid) (mg):' },
                    { id: 'edit-ingredient-vitamin-b6', label: 'B6 (Pyridoxine) (mg):' },
                    { id: 'edit-ingredient-vitamin-b12', label: 'B12 (Cobalamin) (μg):' },
                    { id: 'edit-ingredient-folate', label: 'Folate (μg):' },
                    { id: 'edit-ingredient-vitamin-a', label: 'Vitamin A (μg):' },
                    { id: 'edit-ingredient-vitamin-c', label: 'Vitamin C (mg):' },
                    { id: 'edit-ingredient-vitamin-d', label: 'Vitamin D (IU):' },
                    { id: 'edit-ingredient-vitamin-e', label: 'Vitamin E (mg):' },
                    { id: 'edit-ingredient-vitamin-k', label: 'Vitamin K (μg):' }
                ]);
                detailedNutritionPanel.appendChild(vitaminsSection);

                const mineralsSection = createNutritionSection('Minerals', [
                    { id: 'edit-ingredient-calcium', label: 'Calcium (mg):' },
                    { id: 'edit-ingredient-copper', label: 'Copper (mg):' },
                    { id: 'edit-ingredient-iron', label: 'Iron (mg):' },
                    { id: 'edit-ingredient-magnesium', label: 'Magnesium (mg):' },
                    { id: 'edit-ingredient-manganese', label: 'Manganese (mg):' },
                    { id: 'edit-ingredient-phosphorus', label: 'Phosphorus (mg):' },
                    { id: 'edit-ingredient-potassium', label: 'Potassium (mg):' },
                    { id: 'edit-ingredient-selenium', label: 'Selenium (μg):' },
                    { id: 'edit-ingredient-sodium', label: 'Sodium (mg):' },
                    { id: 'edit-ingredient-zinc', label: 'Zinc (mg):' }
                ]);
                detailedNutritionPanel.appendChild(mineralsSection);

                formElement.appendChild(detailedNutritionPanel);
            } else {

                detailedNutritionPanel.style.display = 'block';
            }

            form.dataset.nutritionPanelFixed = 'true';
        });
    }

    function createNutritionSection(title, fields) {
        const section = document.createElement('div');
        section.className = 'nutrition-section';
        section.style.marginBottom = '12px';

        const header = document.createElement('h4');
        header.textContent = title;
        header.style.fontSize = '0.85em';
        header.style.marginBottom = '6px';
        header.style.paddingBottom = '3px';
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'nutrition-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
        grid.style.gap = '6px';

        fields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'nutrition-item';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';

            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.textContent = field.label;
            label.style.fontSize = '0.7em';
            label.style.marginBottom = '2px';
            label.style.color = '#aaaaaa';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';

            const input = document.createElement('input');
            input.type = field.type || 'number';
            input.id = field.id;

            if (input.type === 'number') {
                input.step = '0.1';
                input.min = '0';
            }

            input.style.width = field.id === 'edit-ingredient-name' ? '80px' : '50px';
            input.style.padding = '1px 3px';
            input.style.height = '20px';
            input.style.fontSize = '0.75em';
            input.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
            input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            input.style.color = '#e0e0e0';
            input.style.borderRadius = '3px';
            if (field.required) {
                input.required = true;
            }

            item.appendChild(label);
            item.appendChild(input);
            grid.appendChild(item);
        });

        section.appendChild(grid);
        return section;
    }

    setTimeout(showNutritionPanel, 200);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(showNutritionPanel, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(showNutritionPanel, 200);

            setTimeout(showNutritionPanel, 500);
            setTimeout(showNutritionPanel, 1000);

            console.log('Edit button clicked, applying nutrition panel with Basic Information section');
        }
    });

    setInterval(showNutritionPanel, 2000);
});
