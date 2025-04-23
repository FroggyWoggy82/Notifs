/**
 * Cronometer Text Parser
 *
 * This module parses text copied from Cronometer.com and extracts nutrition data.
 * It's designed to work with text copied from the Cronometer nutrition details panel.
 */

// Regular expressions for matching nutrition data patterns
const PATTERNS = {
    // General section
    ENERGY: /Energy\s*(\d+\.?\d*)\s*kcal/i,
    ALCOHOL: /Alcohol\s*(\d+\.?\d*)\s*g/i,
    CAFFEINE: /Caffeine\s*(\d+\.?\d*)\s*mg/i,
    WATER: /Water\s*(\d+\.?\d*)\s*g/i,

    // Carbohydrates section
    CARBS: /Carbs\s*(\d+\.?\d*)\s*g/i,
    FIBER: /Fiber\s*(\d+\.?\d*)\s*g/i,
    STARCH: /Starch\s*(\d+\.?\d*)\s*g/i,
    SUGARS: /Sugars\s*(\d+\.?\d*)\s*g/i,
    ADDED_SUGARS: /Added Sugars\s*(\d+\.?\d*)\s*g/i,
    NET_CARBS: /Net Carbs\s*(\d+\.?\d*)\s*g/i,

    // Lipids section
    FAT: /Fat\s*(\d+\.?\d*)\s*g/i,
    MONOUNSATURATED: /Monounsaturated\s*(\d+\.?\d*)\s*g/i,
    POLYUNSATURATED: /Polyunsaturated\s*(\d+\.?\d*)\s*g/i,
    OMEGA3: /Omega-3\s*(\d+\.?\d*)\s*g/i,
    OMEGA6: /Omega-6\s*(\d+\.?\d*)\s*g/i,
    SATURATED: /Saturated\s*(\d+\.?\d*)\s*g/i,
    TRANS_FATS: /Trans-Fats\s*(\d+\.?\d*)\s*g/i,
    CHOLESTEROL: /Cholesterol\s*(\d+\.?\d*)\s*mg/i,

    // Protein section
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

    // Vitamins section
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

    // Minerals section
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
    // Initialize result object
    const result = {
        success: true,
        // General
        calories: extractValue(text, PATTERNS.ENERGY),
        alcohol: extractValue(text, PATTERNS.ALCOHOL),
        caffeine: extractValue(text, PATTERNS.CAFFEINE),
        water: extractValue(text, PATTERNS.WATER),

        // Carbohydrates
        carbs: extractValue(text, PATTERNS.CARBS),
        fiber: extractValue(text, PATTERNS.FIBER),
        starch: extractValue(text, PATTERNS.STARCH),
        sugars: extractValue(text, PATTERNS.SUGARS),
        addedSugars: extractValue(text, PATTERNS.ADDED_SUGARS),
        netCarbs: extractValue(text, PATTERNS.NET_CARBS),

        // Lipids
        fat: extractValue(text, PATTERNS.FAT),
        monounsaturated: extractValue(text, PATTERNS.MONOUNSATURATED),
        polyunsaturated: extractValue(text, PATTERNS.POLYUNSATURATED),
        omega3: extractValue(text, PATTERNS.OMEGA3),
        omega6: extractValue(text, PATTERNS.OMEGA6),
        saturated: extractValue(text, PATTERNS.SATURATED),
        transFat: extractValue(text, PATTERNS.TRANS_FATS),
        cholesterol: extractValue(text, PATTERNS.CHOLESTEROL),

        // Protein
        protein: extractValue(text, PATTERNS.PROTEIN),
        cystine: extractValue(text, PATTERNS.CYSTINE),
        histidine: extractValue(text, PATTERNS.HISTIDINE),
        isoleucine: extractValue(text, PATTERNS.ISOLEUCINE),
        leucine: extractValue(text, PATTERNS.LEUCINE),
        lysine: extractValue(text, PATTERNS.LYSINE),
        methionine: extractValue(text, PATTERNS.METHIONINE),
        phenylalanine: extractValue(text, PATTERNS.PHENYLALANINE),
        threonine: extractValue(text, PATTERNS.THREONINE),
        tryptophan: extractValue(text, PATTERNS.TRYPTOPHAN),
        tyrosine: extractValue(text, PATTERNS.TYROSINE),
        valine: extractValue(text, PATTERNS.VALINE),

        // Vitamins
        vitaminB1: extractValue(text, PATTERNS.THIAMINE),
        vitaminB2: extractValue(text, PATTERNS.RIBOFLAVIN),
        vitaminB3: extractValue(text, PATTERNS.NIACIN),
        vitaminB5: extractValue(text, PATTERNS.PANTOTHENIC_ACID),
        vitaminB6: extractValue(text, PATTERNS.PYRIDOXINE),
        vitaminB12: extractValue(text, PATTERNS.COBALAMIN),
        folate: extractValue(text, PATTERNS.FOLATE),
        vitaminA: extractValue(text, PATTERNS.VITAMIN_A),
        vitaminC: extractValue(text, PATTERNS.VITAMIN_C),
        vitaminD: extractValue(text, PATTERNS.VITAMIN_D),
        vitaminE: extractValue(text, PATTERNS.VITAMIN_E),
        vitaminK: extractValue(text, PATTERNS.VITAMIN_K),

        // Minerals
        calcium: extractValue(text, PATTERNS.CALCIUM),
        copper: extractValue(text, PATTERNS.COPPER),
        iron: extractValue(text, PATTERNS.IRON),
        magnesium: extractValue(text, PATTERNS.MAGNESIUM),
        manganese: extractValue(text, PATTERNS.MANGANESE),
        phosphorus: extractValue(text, PATTERNS.PHOSPHORUS),
        potassium: extractValue(text, PATTERNS.POTASSIUM),
        selenium: extractValue(text, PATTERNS.SELENIUM),
        sodium: extractValue(text, PATTERNS.SODIUM),
        zinc: extractValue(text, PATTERNS.ZINC)
    };

    // Check if we found any data
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
    // Check if container is an ingredient item itself
    if (container.classList && container.classList.contains('ingredient-item')) {
        initializeIngredientItem(container);
        return;
    }

    // Find all ingredient items
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
    // Skip if already initialized
    if (ingredientItem.dataset.cronometerParserInitialized === 'true') {
        console.log('Skipping already initialized ingredient item');
        return;
    }

    // Mark as initialized
    ingredientItem.dataset.cronometerParserInitialized = 'true';

    // Find the existing text paste area
    const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
    const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
    const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

    if (textPasteArea && parseButton && statusElement) {
        console.log('Adding event listeners to Cronometer text parser elements');

        // Add event listener to the parse button
        parseButton.addEventListener('click', () => {
            const text = textPasteArea.value.trim();
            if (text) {
                processCronometerText(text, ingredientItem, statusElement);
            } else {
                showParseStatus(statusElement, 'Please paste Cronometer nutrition data first', 'error');
            }
        });

        // Add event listener for paste events
        textPasteArea.addEventListener('paste', () => {
            // Clear any previous status
            statusElement.textContent = '';
            statusElement.className = 'cronometer-parse-status';
        });
    } else {
        console.error('Cronometer text parser elements not found in ingredient item');
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
        // Show processing status
        showParseStatus(statusElement, 'Processing Cronometer data...', 'loading');

        // Parse the text
        const nutritionData = parseCronometerText(text);

        if (nutritionData.success) {
            // Update the nutrition fields
            updateNutritionFieldsFromText(nutritionData, ingredientItem);

            // Show success message
            showParseStatus(statusElement, 'Nutrition data extracted successfully!', 'success');

            // Expand the detailed nutrition panel
            const detailedPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
            if (detailedPanel) {
                detailedPanel.style.display = 'block';

                // Update the toggle button text if it exists
                const toggleButton = ingredientItem.querySelector('.toggle-detailed-nutrition');
                if (toggleButton && toggleButton.textContent === 'Show Detailed Nutrition') {
                    toggleButton.textContent = 'Hide Detailed Nutrition';
                }
            }
        } else {
            // Show error message
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
    // Basic fields
    updateFieldIfExists(ingredientItem, '.ingredient-calories', data.calories);
    updateFieldIfExists(ingredientItem, '.ingredient-protein', data.protein);
    updateFieldIfExists(ingredientItem, '.ingredient-fat', data.fat);
    updateFieldIfExists(ingredientItem, '.ingredient-carbs', data.carbs);

    // General section
    updateFieldIfExists(ingredientItem, '.nutrition-energy', data.calories);
    updateFieldIfExists(ingredientItem, '.nutrition-alcohol', data.alcohol);
    updateFieldIfExists(ingredientItem, '.nutrition-caffeine', data.caffeine);
    updateFieldIfExists(ingredientItem, '.nutrition-water', data.water);

    // Carbohydrates section
    updateFieldIfExists(ingredientItem, '.nutrition-carbs-total', data.carbs);
    updateFieldIfExists(ingredientItem, '.nutrition-fiber', data.fiber);
    updateFieldIfExists(ingredientItem, '.nutrition-starch', data.starch);
    updateFieldIfExists(ingredientItem, '.nutrition-sugars', data.sugars);
    updateFieldIfExists(ingredientItem, '.nutrition-added-sugars', data.addedSugars);
    updateFieldIfExists(ingredientItem, '.nutrition-net-carbs', data.netCarbs);

    // Lipids section
    updateFieldIfExists(ingredientItem, '.nutrition-fat-total', data.fat);
    updateFieldIfExists(ingredientItem, '.nutrition-monounsaturated', data.monounsaturated);
    updateFieldIfExists(ingredientItem, '.nutrition-polyunsaturated', data.polyunsaturated);
    updateFieldIfExists(ingredientItem, '.nutrition-omega3', data.omega3);
    updateFieldIfExists(ingredientItem, '.nutrition-omega6', data.omega6);
    updateFieldIfExists(ingredientItem, '.nutrition-saturated', data.saturated);
    updateFieldIfExists(ingredientItem, '.nutrition-trans-fat', data.transFat);
    updateFieldIfExists(ingredientItem, '.nutrition-cholesterol', data.cholesterol);

    // Protein section
    updateFieldIfExists(ingredientItem, '.nutrition-protein-total', data.protein);
    updateFieldIfExists(ingredientItem, '.nutrition-cystine', data.cystine);
    updateFieldIfExists(ingredientItem, '.nutrition-histidine', data.histidine);
    updateFieldIfExists(ingredientItem, '.nutrition-isoleucine', data.isoleucine);
    updateFieldIfExists(ingredientItem, '.nutrition-leucine', data.leucine);
    updateFieldIfExists(ingredientItem, '.nutrition-lysine', data.lysine);
    updateFieldIfExists(ingredientItem, '.nutrition-methionine', data.methionine);
    updateFieldIfExists(ingredientItem, '.nutrition-phenylalanine', data.phenylalanine);
    updateFieldIfExists(ingredientItem, '.nutrition-threonine', data.threonine);
    updateFieldIfExists(ingredientItem, '.nutrition-tryptophan', data.tryptophan);
    updateFieldIfExists(ingredientItem, '.nutrition-tyrosine', data.tyrosine);
    updateFieldIfExists(ingredientItem, '.nutrition-valine', data.valine);

    // Vitamins section
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b1', data.vitaminB1);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b2', data.vitaminB2);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b3', data.vitaminB3);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b5', data.vitaminB5);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b6', data.vitaminB6);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-b12', data.vitaminB12);
    updateFieldIfExists(ingredientItem, '.nutrition-folate', data.folate);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-a', data.vitaminA);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-c', data.vitaminC);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-d', data.vitaminD);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-e', data.vitaminE);
    updateFieldIfExists(ingredientItem, '.nutrition-vitamin-k', data.vitaminK);

    // Minerals section
    updateFieldIfExists(ingredientItem, '.nutrition-calcium', data.calcium);
    updateFieldIfExists(ingredientItem, '.nutrition-copper', data.copper);
    updateFieldIfExists(ingredientItem, '.nutrition-iron', data.iron);
    updateFieldIfExists(ingredientItem, '.nutrition-magnesium', data.magnesium);
    updateFieldIfExists(ingredientItem, '.nutrition-manganese', data.manganese);
    updateFieldIfExists(ingredientItem, '.nutrition-phosphorus', data.phosphorus);
    updateFieldIfExists(ingredientItem, '.nutrition-potassium', data.potassium);
    updateFieldIfExists(ingredientItem, '.nutrition-selenium', data.selenium);
    updateFieldIfExists(ingredientItem, '.nutrition-sodium', data.sodium);
    updateFieldIfExists(ingredientItem, '.nutrition-zinc', data.zinc);
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

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCronometerTextParser();

    // Also initialize when new ingredients are added
    document.addEventListener('ingredientAdded', (event) => {
        if (event.detail && event.detail.ingredientItem) {
            initializeCronometerTextParser(event.detail.ingredientItem);
        } else {
            initializeCronometerTextParser();
        }
    });
});
