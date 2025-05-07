/**
 * Cronometer Text Parser
 *
 * This module parses text copied from Cronometer.com and extracts nutrition data.
 * It's designed to work with text copied from the Cronometer nutrition details panel.
 */


window.CRONOMETER_PATTERNS = window.CRONOMETER_PATTERNS || {

    ENERGY: /Energy\s*(\d+\.?\d*)\s*kcal/i,
    ALCOHOL: /Alcohol\s*(\d+\.?\d*)\s*g/i,
    CAFFEINE: /Caffeine\s*(\d+\.?\d*)\s*mg/i,
    WATER: /Water\s*(\d+\.?\d*)\s*g/i,

    CARBS: /Carbs\s*(\d+\.?\d*)\s*g/i,
    FIBER: /Fiber\s*(\d+\.?\d*)\s*g/i,
    STARCH: /Starch\s*(\d+\.?\d*)\s*g/i,
    SUGARS: /Sugars\s*(\d+\.?\d*)\s*g/i,
    ADDED_SUGARS: /Added Sugars\s*(\d+\.?\d*)\s*g/i,
    NET_CARBS: /Net Carbs\s*(\d+\.?\d*)\s*g/i,

    FAT: /Fat\s*(\d+\.?\d*)\s*g/i,
    MONOUNSATURATED: /Monounsaturated\s*(\d+\.?\d*)\s*g/i,
    POLYUNSATURATED: /Polyunsaturated\s*(\d+\.?\d*)\s*g/i,
    OMEGA3: /Omega-3\s*(\d+\.?\d*)\s*g/i,
    OMEGA6: /Omega-6\s*(\d+\.?\d*)\s*g/i,
    SATURATED: /Saturated\s*(\d+\.?\d*)\s*g/i,
    TRANS_FATS: /Trans-Fats\s*(\d+\.?\d*)\s*g/i,
    CHOLESTEROL: /Cholesterol\s*(\d+\.?\d*)\s*mg/i,

    PROTEIN: /Protein\s*(\d+\.?\d*)\s*g/i,
    CYSTINE: /Cystine\s*(\d+\.?\d*)\s*g/i,
    HISTIDINE: /Histidine\s*(\d+\.?\d*)\s*g/i,
    ISOLEUCINE: /Isoleucine\s*(\d+\.?\d*)\s*g/i,
    LEUCINE: /Leucine\s*(\d+\.?\d*)\s*g/i,
    LYSINE: /Lysine\s*(\d+\.?\d*)\s*g/i,
    METHIONINE: /Methionine\s*(\d+\.?\d*)\s*g/i,
    PHENYLALANINE: /Phenylalanine\s*(\d+\.?\d*)\s*g/i,
    THREONINE: /Threonine\s*(\d+\.?\d*)\s*g/i,
    TRYPTOPHAN: /Tryptophan\s*(\d+\.?\d*)\s*g/i,
    TYROSINE: /Tyrosine\s*(\d+\.?\d*)\s*g/i,
    VALINE: /Valine\s*(\d+\.?\d*)\s*g/i,

    THIAMINE: /B1 \(Thiamine\)\s*(\d+\.?\d*)\s*mg/i,
    RIBOFLAVIN: /B2 \(Riboflavin\)\s*(\d+\.?\d*)\s*mg/i,
    NIACIN: /B3 \(Niacin\)\s*(\d+\.?\d*)\s*mg/i,
    PANTOTHENIC_ACID: /B5 \(Pantothenic Acid\)\s*(\d+\.?\d*)\s*mg/i,
    PYRIDOXINE: /B6 \(Pyridoxine\)\s*(\d+\.?\d*)\s*mg/i,
    COBALAMIN: /B12 \(Cobalamin\)\s*(\d+\.?\d*)\s*µg/i,
    FOLATE: /Folate\s*(\d+\.?\d*)\s*µg/i,
    VITAMIN_A: /Vitamin A\s*(\d+\.?\d*)\s*µg/i,
    VITAMIN_C: /Vitamin C\s*(\d+\.?\d*)\s*mg/i,
    VITAMIN_D: /Vitamin D\s*(\d+\.?\d*)\s*IU/i,
    VITAMIN_E: /Vitamin E\s*(\d+\.?\d*)\s*mg/i,
    VITAMIN_K: /Vitamin K\s*(\d+\.?\d*)\s*µg/i,

    CALCIUM: /Calcium\s*(\d+\.?\d*)\s*mg/i,
    COPPER: /Copper\s*(\d+\.?\d*)\s*mg/i,
    IRON: /Iron\s*(\d+\.?\d*)\s*mg/i,
    MAGNESIUM: /Magnesium\s*(\d+\.?\d*)\s*mg/i,
    MANGANESE: /Manganese\s*(\d+\.?\d*)\s*mg/i,
    PHOSPHORUS: /Phosphorus\s*(\d+\.?\d*)\s*mg/i,
    POTASSIUM: /Potassium\s*(\d+\.?\d*)\s*mg/i,
    SELENIUM: /Selenium\s*(\d+\.?\d*)\s*µg/i,
    SODIUM: /Sodium\s*(\d+\.?\d*)\s*mg/i,
    ZINC: /Zinc\s*(\d+\.?\d*)\s*mg/i
};




/**
 * Parse Cronometer text and extract nutrition data
 * @param {string} text - Text copied from Cronometer
 * @returns {Object} - Extracted nutrition data
 */
function parseCronometerText(text) {

    const result = {
        success: true,

        calories: extractValue(text, window.CRONOMETER_PATTERNS.ENERGY),
        alcohol: extractValue(text, window.CRONOMETER_PATTERNS.ALCOHOL),
        caffeine: extractValue(text, window.CRONOMETER_PATTERNS.CAFFEINE),
        water: extractValue(text, window.CRONOMETER_PATTERNS.WATER),

        carbs: extractValue(text, window.CRONOMETER_PATTERNS.CARBS),
        fiber: extractValue(text, window.CRONOMETER_PATTERNS.FIBER),
        starch: extractValue(text, window.CRONOMETER_PATTERNS.STARCH),
        sugars: extractValue(text, window.CRONOMETER_PATTERNS.SUGARS),
        addedSugars: extractValue(text, window.CRONOMETER_PATTERNS.ADDED_SUGARS),
        netCarbs: extractValue(text, window.CRONOMETER_PATTERNS.NET_CARBS),

        fat: extractValue(text, window.CRONOMETER_PATTERNS.FAT),
        monounsaturated: extractValue(text, window.CRONOMETER_PATTERNS.MONOUNSATURATED),
        polyunsaturated: extractValue(text, window.CRONOMETER_PATTERNS.POLYUNSATURATED),
        omega3: extractValue(text, window.CRONOMETER_PATTERNS.OMEGA3),
        omega6: extractValue(text, window.CRONOMETER_PATTERNS.OMEGA6),
        saturated: extractValue(text, window.CRONOMETER_PATTERNS.SATURATED),
        transFat: extractValue(text, window.CRONOMETER_PATTERNS.TRANS_FATS),
        cholesterol: extractValue(text, window.CRONOMETER_PATTERNS.CHOLESTEROL),

        protein: extractValue(text, window.CRONOMETER_PATTERNS.PROTEIN),
        cystine: extractValue(text, window.CRONOMETER_PATTERNS.CYSTINE),
        histidine: extractValue(text, window.CRONOMETER_PATTERNS.HISTIDINE),
        isoleucine: extractValue(text, window.CRONOMETER_PATTERNS.ISOLEUCINE),
        leucine: extractValue(text, window.CRONOMETER_PATTERNS.LEUCINE),
        lysine: extractValue(text, window.CRONOMETER_PATTERNS.LYSINE),
        methionine: extractValue(text, window.CRONOMETER_PATTERNS.METHIONINE),
        phenylalanine: extractValue(text, window.CRONOMETER_PATTERNS.PHENYLALANINE),
        threonine: extractValue(text, window.CRONOMETER_PATTERNS.THREONINE),
        tryptophan: extractValue(text, window.CRONOMETER_PATTERNS.TRYPTOPHAN),
        tyrosine: extractValue(text, window.CRONOMETER_PATTERNS.TYROSINE),
        valine: extractValue(text, window.CRONOMETER_PATTERNS.VALINE),

        vitaminB1: extractValue(text, window.CRONOMETER_PATTERNS.THIAMINE),
        vitaminB2: extractValue(text, window.CRONOMETER_PATTERNS.RIBOFLAVIN),
        vitaminB3: extractValue(text, window.CRONOMETER_PATTERNS.NIACIN),
        vitaminB5: extractValue(text, window.CRONOMETER_PATTERNS.PANTOTHENIC_ACID),
        vitaminB6: extractValue(text, window.CRONOMETER_PATTERNS.PYRIDOXINE),
        vitaminB12: extractValue(text, window.CRONOMETER_PATTERNS.COBALAMIN),
        folate: extractValue(text, window.CRONOMETER_PATTERNS.FOLATE),
        vitaminA: extractValue(text, window.CRONOMETER_PATTERNS.VITAMIN_A),
        vitaminC: extractValue(text, window.CRONOMETER_PATTERNS.VITAMIN_C),
        vitaminD: extractValue(text, window.CRONOMETER_PATTERNS.VITAMIN_D),
        vitaminE: extractValue(text, window.CRONOMETER_PATTERNS.VITAMIN_E),
        vitaminK: extractValue(text, window.CRONOMETER_PATTERNS.VITAMIN_K),

        calcium: extractValue(text, window.CRONOMETER_PATTERNS.CALCIUM),
        copper: extractValue(text, window.CRONOMETER_PATTERNS.COPPER),
        iron: extractValue(text, window.CRONOMETER_PATTERNS.IRON),
        magnesium: extractValue(text, window.CRONOMETER_PATTERNS.MAGNESIUM),
        manganese: extractValue(text, window.CRONOMETER_PATTERNS.MANGANESE),
        phosphorus: extractValue(text, window.CRONOMETER_PATTERNS.PHOSPHORUS),
        potassium: extractValue(text, window.CRONOMETER_PATTERNS.POTASSIUM),
        selenium: extractValue(text, window.CRONOMETER_PATTERNS.SELENIUM),
        sodium: extractValue(text, window.CRONOMETER_PATTERNS.SODIUM),
        zinc: extractValue(text, window.CRONOMETER_PATTERNS.ZINC)
    };

    const hasData = Object.values(result).some(value =>
        value !== null && value !== undefined && value !== false && value !== 0);

    if (!hasData) {
        result.success = false;
    }

    return result;
}

/**
 * Extract a numeric value from text using a regular expression
 * @param {string} text - Text to search in
 * @param {RegExp} pattern - Regular expression pattern with a capture group for the value
 * @returns {number|null} - Extracted numeric value or null if not found
 */
function extractValue(text, pattern) {
    const match = text.match(pattern);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    return null;
}

/**
 * Initialize the Cronometer text parser functionality
 * @param {HTMLElement} container - Container element (usually the document or a specific section)
 */
function initializeCronometerTextParser(container = document) {

    if (container.classList && container.classList.contains('ingredient-item')) {
        initializeIngredientItem(container);
        return;
    }

    const ingredientItems = container.querySelectorAll('.ingredient-item');

    ingredientItems.forEach(ingredientItem => {
        initializeIngredientItem(ingredientItem);
    });
}

/**
 * Initialize a single ingredient item with Cronometer text parser
 * @param {HTMLElement} ingredientItem - The ingredient item element
 */
function initializeIngredientItem(ingredientItem) {
    console.log('Initializing ingredient item:', ingredientItem);

    if (ingredientItem.dataset.cronometerParserInitialized === 'true') {
        console.log('Skipping already initialized ingredient item');
        return;
    }

    ingredientItem.dataset.cronometerParserInitialized = 'true';

    const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
    const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
    const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

    console.log('Found elements:', {
        textPasteArea: !!textPasteArea,
        parseButton: !!parseButton,
        statusElement: !!statusElement
    });

    if (textPasteArea && parseButton && statusElement) {
        console.log('Adding event listeners to Cronometer text parser elements');

        parseButton.removeEventListener('click', parseButtonClickHandler);

        function parseButtonClickHandler() {
            console.log('Parse button clicked (from cronometer-text-parser.js)');
            const text = textPasteArea.value.trim();
            if (text) {
                console.log('Processing text:', text.substring(0, 50) + '...');
                processCronometerText(text, ingredientItem, statusElement);
            } else {
                showParseStatus(statusElement, 'Please paste Cronometer nutrition data first', 'error');
            }
        }

        parseButton._parseButtonClickHandler = parseButtonClickHandler;

        parseButton.addEventListener('click', parseButtonClickHandler);

        parseButton.setAttribute('onclick', 'if(window.processCronometerText){window.processCronometerText(this.parentNode.querySelector(".cronometer-text-paste-area").value.trim(), this.closest(".ingredient-item"), this.parentNode.querySelector(".cronometer-parse-status"))}');

        textPasteArea.addEventListener('paste', () => {

            statusElement.textContent = '';
            statusElement.className = 'cronometer-parse-status';
        });

        console.log('Event listeners added successfully');
    } else {
        console.error('Cronometer text parser elements not found in ingredient item');
        console.log('ingredientItem HTML:', ingredientItem.innerHTML);
    }
}

/**
 * Process Cronometer text and update nutrition fields
 * @param {string} text - Text copied from Cronometer
 * @param {HTMLElement} ingredientItem - Ingredient item element
 * @param {HTMLElement} statusElement - Status element to show messages
 */
function processCronometerText(text, ingredientItem, statusElement) {
    try {

        showParseStatus(statusElement, 'Processing Cronometer data...', 'loading');

        if (!ingredientItem || (ingredientItem.tagName !== 'FORM' && !ingredientItem.classList.contains('ingredient-item'))) {
            console.log('ingredientItem is not a form or ingredient-item, trying to find the closest form');

            if (statusElement) {
                const closestForm = statusElement.closest('form');
                if (closestForm) {
                    ingredientItem = closestForm;
                    console.log('Found form from statusElement:', ingredientItem);
                } else {

                    const addForm = document.getElementById('add-ingredient-form');
                    if (addForm) {
                        ingredientItem = addForm;
                        console.log('Using add-ingredient-form:', ingredientItem);
                    } else {
                        console.error('Could not find a valid form to update');
                        showParseStatus(statusElement, 'Error: Could not find a valid form to update', 'error');
                        return;
                    }
                }
            }
        }

        console.log('Processing Cronometer text for:', ingredientItem);

        const nutritionData = parseCronometerText(text);
        console.log('Parsed nutrition data:', nutritionData);

        if (nutritionData.success) {

            updateNutritionFieldsFromText(nutritionData, ingredientItem);


            if (window.NutritionFieldMapper) {

                const dbFormatData = window.NutritionFieldMapper.toDbFormat(nutritionData);

                ingredientItem.dataset.completeNutritionData = JSON.stringify(nutritionData);
                ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);

                console.log('Stored complete nutrition data:', nutritionData);
                console.log('Stored DB format nutrition data:', dbFormatData);

                for (const [key, value] of Object.entries(dbFormatData)) {

                    if (value === null || value === undefined) continue;

                    if (['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].includes(key)) {
                        continue;
                    }

                    let hiddenField = ingredientItem.querySelector(`.ingredient-${key}`);
                    if (!hiddenField) {
                        hiddenField = document.createElement('input');
                        hiddenField.type = 'hidden';
                        hiddenField.name = `ingredient-${key}`;  // Add name attribute for form submission
                        hiddenField.className = `ingredient-${key}`;
                        ingredientItem.appendChild(hiddenField);
                    }

                    hiddenField.value = value;

                    console.log(`Created/updated hidden field for micronutrient: ${key} = ${value}`);
                }

                let micronutrientFlagField = ingredientItem.querySelector('.ingredient-has-micronutrients');
                if (!micronutrientFlagField) {
                    micronutrientFlagField = document.createElement('input');
                    micronutrientFlagField.type = 'hidden';
                    micronutrientFlagField.name = 'ingredient-has-micronutrients';
                    micronutrientFlagField.className = 'ingredient-has-micronutrients';
                    ingredientItem.appendChild(micronutrientFlagField);
                }
                micronutrientFlagField.value = 'true';

                const form = ingredientItem.tagName === 'FORM' ? ingredientItem : ingredientItem.closest('form');
                if (form && !form.dataset.micronutrientHandlerAdded) {
                    form.dataset.micronutrientHandlerAdded = 'true';

                    form.addEventListener('submit', function(event) {

                        console.log('Form submit intercepted by Cronometer parser');

                        const ingredientItems = form.querySelectorAll('.ingredient-item');
                        let hasMicronutrientData = false;

                        ingredientItems.forEach(item => {
                            if (item.querySelector('.ingredient-has-micronutrients')) {
                                hasMicronutrientData = true;
                                console.log('Found ingredient with micronutrient data:', item);

                                const hiddenFields = item.querySelectorAll('input[type="hidden"]');
                                hiddenFields.forEach(field => {
                                    if (!field.name && field.className) {
                                        field.name = field.className;
                                        console.log(`Added name attribute to hidden field: ${field.name}`);
                                    }
                                });
                            }
                        });

                        if (hasMicronutrientData) {
                            console.log('Form has micronutrient data, ensuring it will be included in submission');
                        }
                    });

                    console.log('Added micronutrient form submission handler');
                }
            } else {
                console.warn('NutritionFieldMapper not available. Complete nutrition data will not be stored.');
            }

            showParseStatus(statusElement, 'Nutrition data extracted successfully!', 'success');

            const detailedPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
            if (detailedPanel) {
                detailedPanel.style.display = 'block';

                const toggleButton = ingredientItem.querySelector('.toggle-detailed-nutrition') ||
                                    document.querySelector('.toggle-detailed-nutrition');
                if (toggleButton && toggleButton.textContent.includes('Show')) {
                    toggleButton.textContent = 'Hide Detailed Nutrition';
                    toggleButton.classList.add('active');
                }
            }
        } else {

            showParseStatus(statusElement, 'Could not extract nutrition data. Please check the format.', 'error');
        }
    } catch (error) {
        console.error('Error processing Cronometer text:', error);
        showParseStatus(statusElement, `Error: ${error.message}`, 'error');
    }
}

/**
 * Update nutrition fields with data from Cronometer text
 * @param {Object} data - Parsed nutrition data
 * @param {HTMLElement} ingredientItem - Ingredient item element
 */
function updateNutritionFieldsFromText(data, ingredientItem) {

    const isEditForm = ingredientItem.querySelector('#edit-ingredient-form') !== null;
    const prefix = isEditForm ? 'edit' : 'add';

    console.log(`Updating nutrition fields in ${isEditForm ? 'edit' : 'add'} form`);

    updateFieldIfExists(ingredientItem, '.ingredient-calories', data.calories);
    updateFieldIfExists(ingredientItem, '.ingredient-protein', data.protein);
    updateFieldIfExists(ingredientItem, '.ingredient-fat', data.fat);
    updateFieldIfExists(ingredientItem, '.ingredient-carbs', data.carbs);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-calories`, data.calories);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-alcohol`, data.alcohol);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-caffeine`, data.caffeine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-water`, data.water);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-carbs`, data.carbs);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-fiber`, data.fiber);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-starch`, data.starch);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-sugars`, data.sugars);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-added-sugars`, data.addedSugars);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-net-carbs`, data.netCarbs);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-fats`, data.fat);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-monounsaturated`, data.monounsaturated);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-polyunsaturated`, data.polyunsaturated);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-omega3`, data.omega3);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-omega6`, data.omega6);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-saturated`, data.saturated);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-trans-fat`, data.transFat);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-cholesterol`, data.cholesterol);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-protein`, data.protein);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-cystine`, data.cystine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-histidine`, data.histidine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-isoleucine`, data.isoleucine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-leucine`, data.leucine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-lysine`, data.lysine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-methionine`, data.methionine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-phenylalanine`, data.phenylalanine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-threonine`, data.threonine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-tryptophan`, data.tryptophan);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-tyrosine`, data.tyrosine);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-valine`, data.valine);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b1`, data.vitaminB1);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b2`, data.vitaminB2);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b3`, data.vitaminB3);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b5`, data.vitaminB5);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b6`, data.vitaminB6);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-b12`, data.vitaminB12);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-folate`, data.folate);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-a`, data.vitaminA);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-c`, data.vitaminC);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-d`, data.vitaminD);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-e`, data.vitaminE);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-vitamin-k`, data.vitaminK);

    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-calcium`, data.calcium);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-copper`, data.copper);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-iron`, data.iron);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-magnesium`, data.magnesium);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-manganese`, data.manganese);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-phosphorus`, data.phosphorus);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-potassium`, data.potassium);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-selenium`, data.selenium);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-sodium`, data.sodium);
    updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-zinc`, data.zinc);
}

/**
 * Update a field if it exists and the value is not null
 * @param {HTMLElement} container - Container element
 * @param {string} selector - CSS selector for the field
 * @param {number|null} value - Value to set
 */
function updateFieldIfExists(container, selector, value) {
    if (value === null || value === undefined) return;

    const field = container.querySelector(selector);
    if (field) {
        field.value = value;
        field.classList.add('cronometer-parsed');
        console.log(`Updated field ${selector} with value ${value}`);
    } else {
        console.warn(`Field not found: ${selector}`);
    }
}

/**
 * Show a status message
 * @param {HTMLElement} statusElement - Status element to show the message
 * @param {string} message - Message to show
 * @param {string} type - Type of message (success, error, loading)
 */
function showParseStatus(statusElement, message, type) {
    statusElement.textContent = message;
    statusElement.className = `cronometer-parse-status ${type}`;
}

window.processCronometerText = processCronometerText;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Cronometer Text Parser: DOM loaded, initializing parser');
    initializeCronometerTextParser();

    document.addEventListener('ingredientAdded', (event) => {
        console.log('Cronometer Text Parser: ingredientAdded event received');
        if (event.detail && event.detail.ingredientItem) {
            console.log('Cronometer Text Parser: Initializing specific ingredient item');
            initializeCronometerTextParser(event.detail.ingredientItem);
        } else {
            console.log('Cronometer Text Parser: Initializing all ingredient items');
            initializeCronometerTextParser();
        }
    });

    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('cronometer-parse-button')) {
            console.log('Parse button clicked (from global event listener)');
            const ingredientItem = event.target.closest('.ingredient-item');
            const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
            const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

            if (ingredientItem && textPasteArea && statusElement) {
                const text = textPasteArea.value.trim();
                if (text) {
                    console.log('Processing text from global handler:', text.substring(0, 50) + '...');
                    processCronometerText(text, ingredientItem, statusElement);
                } else {
                    showParseStatus(statusElement, 'Please paste Cronometer nutrition data first', 'error');
                }
            }
        }
    });
});
