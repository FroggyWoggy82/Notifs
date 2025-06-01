/**
 * Cronometer Parser
 *
 * This module parses text copied from Cronometer.com and extracts nutrition data.
 * It uses the NutritionCore module for data handling and field mapping.
 */

window.CronometerParser = (function() {
    // ===== REGEX PATTERNS =====
    
    /**
     * Regular expression patterns for extracting nutrition data from Cronometer text
     */
    const PATTERNS = {
        // General
        ENERGY: /Energy\s*(\d+\.?\d*)\s*kcal/i,
        ALCOHOL: /Alcohol\s*(\d+\.?\d*)\s*g/i,
        CAFFEINE: /Caffeine\s*(\d+\.?\d*)\s*mg/i,
        WATER: /Water\s*(\d+\.?\d*)\s*g/i,

        // Carbohydrates
        CARBS: /Carbs\s*(\d+\.?\d*)\s*g/i,
        FIBER: /Fiber\s*(\d+\.?\d*)\s*g/i,
        STARCH: /Starch\s*(\d+\.?\d*)\s*g/i,
        SUGARS: /Sugars\s*(\d+\.?\d*)\s*g/i,
        ADDED_SUGARS: /Added Sugars\s*(\d+\.?\d*)\s*g/i,
        NET_CARBS: /Net Carbs\s*(\d+\.?\d*)\s*g/i,

        // Lipids
        FAT: /Fat\s*(\d+\.?\d*)\s*g/i,
        MONOUNSATURATED: /Monounsaturated\s*(\d+\.?\d*)\s*g/i,
        POLYUNSATURATED: /Polyunsaturated\s*(\d+\.?\d*)\s*g/i,
        OMEGA3: /Omega-3\s*(\d+\.?\d*)\s*g/i,
        OMEGA6: /Omega-6\s*(\d+\.?\d*)\s*g/i,
        SATURATED: /Saturated\s*(\d+\.?\d*)\s*g/i,
        TRANS_FATS: /Trans-Fats\s*(\d+\.?\d*)\s*g/i,
        CHOLESTEROL: /Cholesterol\s*(\d+\.?\d*)\s*mg/i,

        // Protein and amino acids
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

        // Vitamins
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

        // Minerals
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

    // ===== PARSING FUNCTIONS =====
    
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
     * Parse Cronometer text and extract nutrition data
     * @param {string} text - Text copied from Cronometer
     * @returns {Object} - Extracted nutrition data
     */
    function parseText(text) {
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

            // Protein and amino acids
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
     * Process Cronometer text and update an ingredient item
     * @param {string} text - Text copied from Cronometer
     * @param {HTMLElement} ingredientItem - Ingredient item element
     * @param {HTMLElement} statusElement - Status element to show messages
     */
    function processText(text, ingredientItem, statusElement) {
        try {
            showStatus(statusElement, 'Processing Cronometer data...', 'loading');

            if (!ingredientItem || (ingredientItem.tagName !== 'FORM' && !ingredientItem.classList.contains('ingredient-item'))) {
                if (statusElement) {
                    const closestForm = statusElement.closest('form');
                    if (closestForm) {
                        ingredientItem = closestForm;
                    } else {
                        const addForm = document.getElementById('add-ingredient-form');
                        if (addForm) {
                            ingredientItem = addForm;
                        } else {
                            showStatus(statusElement, 'Error: Could not find a valid form to update', 'error');
                            return;
                        }
                    }
                }
            }

            const nutritionData = parseText(text);

            if (nutritionData.success) {
                // Update UI fields
                updateNutritionFields(nutritionData, ingredientItem);

                // Store the data for later use
                ingredientItem.dataset.completeNutritionData = JSON.stringify(nutritionData);
                
                // Convert to database format and store
                if (window.NutritionCore) {
                    const dbFormatData = window.NutritionCore.toDbFormat(nutritionData);
                    ingredientItem.dataset.dbFormatNutritionData = JSON.stringify(dbFormatData);
                    
                    // Update hidden fields
                    window.NutritionCore.updateHiddenFields(ingredientItem, dbFormatData);
                }

                showStatus(statusElement, 'Nutrition data extracted successfully!', 'success');

                // Don't automatically open the detailed nutrition panel
                // Let the user manually open it using the toggle button if they want to see details
            } else {
                showStatus(statusElement, 'Could not extract nutrition data. Please check the format.', 'error');
            }
        } catch (error) {
            console.error('[CronometerParser] Error processing text:', error);
            showStatus(statusElement, `Error: ${error.message}`, 'error');
        }
    }

    /**
     * Update nutrition fields with data from Cronometer text
     * @param {Object} data - Parsed nutrition data
     * @param {HTMLElement} ingredientItem - Ingredient item element
     */
    function updateNutritionFields(data, ingredientItem) {
        const isEditForm = ingredientItem.querySelector('#edit-ingredient-form') !== null;
        const prefix = isEditForm ? 'edit' : 'add';

        // Use NutritionCore if available
        if (window.NutritionCore) {
            // Update basic fields
            window.NutritionCore.updateFieldIfExists(ingredientItem, '.ingredient-calories', data.calories);
            window.NutritionCore.updateFieldIfExists(ingredientItem, '.ingredient-protein', data.protein);
            window.NutritionCore.updateFieldIfExists(ingredientItem, '.ingredient-fat', data.fat);
            window.NutritionCore.updateFieldIfExists(ingredientItem, '.ingredient-carbs', data.carbs);
            
            // Update detailed fields
            window.NutritionCore.updateDetailedNutritionFields(ingredientItem, data);
            return;
        }

        // Fallback if NutritionCore is not available
        updateFieldIfExists(ingredientItem, '.ingredient-calories', data.calories);
        updateFieldIfExists(ingredientItem, '.ingredient-protein', data.protein);
        updateFieldIfExists(ingredientItem, '.ingredient-fat', data.fat);
        updateFieldIfExists(ingredientItem, '.ingredient-carbs', data.carbs);
        
        // Update form fields
        updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-calories`, data.calories);
        updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-protein`, data.protein);
        updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-fats`, data.fat);
        updateFieldIfExists(ingredientItem, `#${prefix}-ingredient-carbs`, data.carbs);
        
        // And many more fields...
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
    function showStatus(statusElement, message, type) {
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `cronometer-parse-status ${type}`;
    }

    // ===== INITIALIZATION =====
    
    /**
     * Initialize the Cronometer parser functionality
     */
    function initialize() {
        console.log('[CronometerParser] Initializing...');
        
        // Find all ingredient items
        const ingredientItems = document.querySelectorAll('.ingredient-item');
        ingredientItems.forEach(initializeIngredientItem);
        
        // Set up a mutation observer to initialize new ingredient items
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('ingredient-item')) {
                                initializeIngredientItem(node);
                            } else {
                                const items = node.querySelectorAll('.ingredient-item');
                                items.forEach(initializeIngredientItem);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('[CronometerParser] Initialized');
    }

    /**
     * Initialize a single ingredient item with Cronometer parser
     * @param {HTMLElement} ingredientItem - The ingredient item element
     */
    function initializeIngredientItem(ingredientItem) {
        if (ingredientItem.dataset.cronometerParserInitialized === 'true') {
            return;
        }

        ingredientItem.dataset.cronometerParserInitialized = 'true';

        const textPasteArea = ingredientItem.querySelector('.cronometer-text-paste-area');
        const parseButton = ingredientItem.querySelector('.cronometer-parse-button');
        const statusElement = ingredientItem.querySelector('.cronometer-parse-status');

        if (textPasteArea && parseButton && statusElement) {
            parseButton.addEventListener('click', function() {
                const text = textPasteArea.value.trim();
                if (text) {
                    processText(text, ingredientItem, statusElement);
                } else {
                    showStatus(statusElement, 'Please paste Cronometer nutrition data first', 'error');
                }
            });

            textPasteArea.addEventListener('paste', () => {
                statusElement.textContent = '';
                statusElement.className = 'cronometer-parse-status';
            });
        }
    }

    // Initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initialize);

    // ===== PUBLIC API =====
    
    return {
        parseText,
        processText,
        updateNutritionFields,
        initialize,
        initializeIngredientItem
    };
})();

// Make the processText function available globally for backward compatibility
window.processCronometerText = window.CronometerParser.processText;
