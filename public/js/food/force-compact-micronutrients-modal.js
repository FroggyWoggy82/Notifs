/**
 * Force Compact Micronutrients Modal
 * Ensures the new compact micronutrients modal is used instead of the old one
 * and includes all Cronometer fields
 */

(function() {
    'use strict';

    console.log('[Force Compact Micronutrients] Initializing...');

    let initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;

        // Override the old micronutrients modal functions
        overrideMicronutrientsModal();
        
        // Set up observers for edit forms
        setupEditFormObserver();
        
        console.log('[Force Compact Micronutrients] Initialized successfully');
    }

    function overrideMicronutrientsModal() {
        // Disable old micronutrients modal scripts
        const oldScripts = [
            'micronutrient-display.js',
            'micronutrient-goals-modal.js'
        ];

        oldScripts.forEach(scriptName => {
            const script = document.querySelector(`script[src*="${scriptName}"]`);
            if (script) {
                script.disabled = true;
                console.log(`[Force Compact Micronutrients] Disabled ${scriptName}`);
            }
        });

        // Override any existing micronutrient modal functions
        if (window.showMicronutrientModal) {
            window.showMicronutrientModal = function() {
                console.log('[Force Compact Micronutrients] Blocked old micronutrient modal');
                return false;
            };
        }
    }

    function setupEditFormObserver() {
        // Watch for edit forms being created
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for edit ingredient modals
                        if (node.id === 'edit-ingredient-popup' || 
                            node.classList?.contains('edit-ingredient-form') ||
                            node.querySelector?.('#edit-ingredient-popup')) {
                            
                            console.log('[Force Compact Micronutrients] Edit form detected, applying compact modal');
                            setTimeout(() => {
                                applyCompactMicronutrientsModal(node);
                            }, 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function applyCompactMicronutrientsModal(container) {
        // Check if this is our new comprehensive edit form implementation
        const micronutrientsContainer = container.querySelector('#micronutrients-container');
        const toggleButton = container.querySelector('#toggle-micronutrients-btn');

        if (micronutrientsContainer && toggleButton) {
            console.log('[Force Compact Micronutrients] Found new comprehensive edit form, skipping override');
            return; // Don't interfere with the new implementation
        }

        // Find the old micronutrients section (for legacy forms)
        const micronutrientsSection = container.querySelector('#micronutrients-section') ||
                                    container.querySelector('.micronutrients-section') ||
                                    container.querySelector('[id*="micronutrient"]');

        if (micronutrientsSection) {
            console.log('[Force Compact Micronutrients] Found old micronutrients section, replacing...');

            // Replace with compact modal
            const compactModal = createCompactMicronutrientsModal();
            micronutrientsSection.parentNode.replaceChild(compactModal, micronutrientsSection);

            // Also check for toggle buttons (for legacy forms)
            const legacyToggleButton = container.querySelector('#toggle-micronutrients') ||
                               container.querySelector('[id*="toggle"]') ||
                               container.querySelector('button[onclick*="micronutrient"]');

            if (legacyToggleButton) {
                console.log('[Force Compact Micronutrients] Found toggle button, updating...');
                updateToggleButton(legacyToggleButton, compactModal);
            }
        }
    }

    function createCompactMicronutrientsModal() {
        const modal = document.createElement('div');
        modal.id = 'compact-micronutrients-modal';
        modal.className = 'compact-micronutrients-modal';
        modal.style.cssText = `
            background-color: rgba(40, 40, 40, 0.95);
            border: 1px solid #555;
            border-radius: 8px;
            padding: 16px;
            margin: 10px 0;
            max-height: 600px;
            overflow-y: auto;
            display: none;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #555;
        `;

        const title = document.createElement('h5');
        title.textContent = 'Detailed Nutrition Information (per 100g)';
        title.style.cssText = `
            color: #ffffff;
            margin: 0;
            font-size: 1.0em;
            font-weight: bold;
        `;

        header.appendChild(title);
        modal.appendChild(header);

        // Create compact grid layout
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        `;

        // Define complete micronutrient categories matching Cronometer
        // Organized with most important categories first
        const categories = {
            'Vitamins': [
                { key: 'vitamin-a', label: 'Vitamin A', unit: 'µg' },
                { key: 'vitamin-c', label: 'Vitamin C', unit: 'mg' },
                { key: 'vitamin-d', label: 'Vitamin D', unit: 'IU' },
                { key: 'vitamin-e', label: 'Vitamin E', unit: 'mg' },
                { key: 'vitamin-k', label: 'Vitamin K', unit: 'µg' },
                { key: 'vitamin-b1', label: 'B1 (Thiamine)', unit: 'mg' },
                { key: 'vitamin-b2', label: 'B2 (Riboflavin)', unit: 'mg' },
                { key: 'vitamin-b3', label: 'B3 (Niacin)', unit: 'mg' },
                { key: 'vitamin-b5', label: 'B5 (Pantothenic Acid)', unit: 'mg' },
                { key: 'vitamin-b6', label: 'B6 (Pyridoxine)', unit: 'mg' },
                { key: 'vitamin-b12', label: 'B12 (Cobalamin)', unit: 'µg' },
                { key: 'folate', label: 'Folate', unit: 'µg' }
            ],
            'Minerals': [
                { key: 'calcium', label: 'Calcium', unit: 'mg' },
                { key: 'iron', label: 'Iron', unit: 'mg' },
                { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
                { key: 'potassium', label: 'Potassium', unit: 'mg' },
                { key: 'sodium', label: 'Sodium', unit: 'mg' },
                { key: 'zinc', label: 'Zinc', unit: 'mg' },
                { key: 'copper', label: 'Copper', unit: 'mg' },
                { key: 'manganese', label: 'Manganese', unit: 'mg' },
                { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
                { key: 'selenium', label: 'Selenium', unit: 'µg' }
            ],
            'Carbohydrates': [
                { key: 'carbs', label: 'Carbs', unit: 'g' },
                { key: 'fiber', label: 'Fiber', unit: 'g' },
                { key: 'sugars', label: 'Sugars', unit: 'g' },
                { key: 'added-sugars', label: 'Added Sugars', unit: 'g' },
                { key: 'starch', label: 'Starch', unit: 'g' },
                { key: 'net-carbs', label: 'Net Carbs', unit: 'g' }
            ],
            'Lipids': [
                { key: 'fat', label: 'Fat', unit: 'g' },
                { key: 'saturated', label: 'Saturated', unit: 'g' },
                { key: 'monounsaturated', label: 'Monounsaturated', unit: 'g' },
                { key: 'polyunsaturated', label: 'Polyunsaturated', unit: 'g' },
                { key: 'omega3', label: 'Omega-3', unit: 'g' },
                { key: 'omega6', label: 'Omega-6', unit: 'g' },
                { key: 'trans-fat', label: 'Trans-Fats', unit: 'g' },
                { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' }
            ],
            'Protein & Amino Acids': [
                { key: 'protein', label: 'Protein', unit: 'g' },
                { key: 'histidine', label: 'Histidine', unit: 'g' },
                { key: 'isoleucine', label: 'Isoleucine', unit: 'g' },
                { key: 'leucine', label: 'Leucine', unit: 'g' },
                { key: 'lysine', label: 'Lysine', unit: 'g' },
                { key: 'methionine', label: 'Methionine', unit: 'g' },
                { key: 'phenylalanine', label: 'Phenylalanine', unit: 'g' },
                { key: 'threonine', label: 'Threonine', unit: 'g' },
                { key: 'tryptophan', label: 'Tryptophan', unit: 'g' },
                { key: 'tyrosine', label: 'Tyrosine', unit: 'g' },
                { key: 'valine', label: 'Valine', unit: 'g' },
                { key: 'cystine', label: 'Cystine', unit: 'g' }
            ],
            'Other': [
                { key: 'calories', label: 'Energy', unit: 'kcal' },
                { key: 'water', label: 'Water', unit: 'g' },
                { key: 'alcohol', label: 'Alcohol', unit: 'g' },
                { key: 'caffeine', label: 'Caffeine', unit: 'mg' }
            ]
        };

        // Create category sections
        Object.entries(categories).forEach(([categoryName, nutrients]) => {
            const categorySection = createCompactCategorySection(categoryName, nutrients);
            gridContainer.appendChild(categorySection);
        });

        modal.appendChild(gridContainer);
        return modal;
    }

    function createCompactCategorySection(categoryName, nutrients) {
        const section = document.createElement('div');
        section.style.cssText = `
            background-color: rgba(50, 50, 50, 0.8);
            border: 1px solid #666;
            border-radius: 6px;
            padding: 10px;
        `;

        const header = document.createElement('h4');
        header.textContent = categoryName;
        header.style.cssText = `
            color: #ffffff;
            margin: 0 0 6px 0;
            font-size: 0.85em;
            font-weight: bold;
            text-align: center;
            padding-bottom: 3px;
            border-bottom: 1px solid #777;
        `;
        section.appendChild(header);

        nutrients.forEach(nutrient => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3px;
                font-size: 0.75em;
            `;

            const label = document.createElement('span');
            label.textContent = nutrient.label;
            label.style.cssText = `
                color: #cccccc;
                flex: 1;
                margin-right: 6px;
                font-size: 0.75em;
            `;

            const inputContainer = document.createElement('div');
            inputContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 3px;
            `;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `edit-ingredient-${nutrient.key.replace(/_/g, '-')}`;
            input.name = nutrient.key;
            input.step = '0.1';
            input.min = '0';
            input.style.cssText = `
                width: 55px;
                padding: 1px 3px;
                border: 1px solid #555;
                border-radius: 3px;
                background-color: rgba(30, 30, 30, 0.8);
                color: #ffffff;
                font-size: 0.75em;
                text-align: right;
            `;

            const unit = document.createElement('span');
            unit.textContent = nutrient.unit;
            unit.style.cssText = `
                color: #999999;
                font-size: 0.65em;
                min-width: 18px;
            `;

            inputContainer.appendChild(input);
            inputContainer.appendChild(unit);

            row.appendChild(label);
            row.appendChild(inputContainer);
            section.appendChild(row);
        });

        return section;
    }

    function updateToggleButton(toggleButton, compactModal) {
        toggleButton.textContent = '▼ Show Detailed Micronutrients';
        toggleButton.onclick = function() {
            const isHidden = compactModal.style.display === 'none';
            compactModal.style.display = isHidden ? 'block' : 'none';
            toggleButton.textContent = isHidden ? '▲ Hide Detailed Micronutrients' : '▼ Show Detailed Micronutrients';
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also initialize on window load
    window.addEventListener('load', init);

})();
