/**
 * Direct Cronometer Parser Fix
 *
 * This script directly fixes the issue with the Cronometer text parser not filling in form fields
 * when adding ingredients to recipes.
 */

(function() {
    console.log('[Direct Cronometer Fix] Initializing...');

    // Wait for the document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initFix();
    });

    // Also initialize immediately in case the DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initFix();
    }

    function initFix() {
        console.log('[Direct Cronometer Fix] Setting up fix...');

        // Add a global click event listener for all Parse Nutrition buttons
        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('cronometer-parse-button')) {
                console.log('[Direct Cronometer Fix] Parse button clicked');

                // Get the ingredient item
                const ingredientItem = event.target.closest('.ingredient-item') ||
                                      event.target.closest('form') ||
                                      document.getElementById('add-ingredient-form');

                if (!ingredientItem) {
                    console.error('[Direct Cronometer Fix] Could not find ingredient item');
                    return;
                }

                // Get the text area and status element
                // Find the correct container - it could be .cronometer-text-paste-container or a parent element
                const container = event.target.closest('.cronometer-text-paste-container') ||
                                 event.target.closest('.ingredient-item') ||
                                 event.target.closest('form');

                if (!container) {
                    console.error('[Direct Cronometer Fix] Could not find container element');
                    return;
                }

                const textPasteArea = container.querySelector('.cronometer-text-paste-area');
                const statusElement = container.querySelector('.cronometer-parse-status');

                if (!textPasteArea || !statusElement) {
                    console.error('[Direct Cronometer Fix] Could not find text area or status element');
                    return;
                }

                // Get the text from the text area
                const text = textPasteArea.value.trim();
                if (!text) {
                    statusElement.textContent = 'Please paste Cronometer nutrition data first';
                    statusElement.className = 'cronometer-parse-status error';
                    return;
                }

                // Parse the text directly
                directParseCronometerText(text, ingredientItem, statusElement);
            }
        }, true);

        console.log('[Direct Cronometer Fix] Fix applied successfully');
    }

    // Direct implementation of Cronometer text parsing
    function directParseCronometerText(text, ingredientItem, statusElement) {
        console.log('[Direct Cronometer Fix] Parsing text:', text.substring(0, 50) + '...');
        statusElement.textContent = 'Processing Cronometer data...';
        statusElement.className = 'cronometer-parse-status loading';

        try {
            // Parse the text to extract nutrition data
            const nutritionData = parseText(text);
            console.log('[Direct Cronometer Fix] Parsed nutrition data:', nutritionData);

            if (Object.keys(nutritionData).length === 0) {
                statusElement.textContent = 'Could not extract nutrition data. Please check the format.';
                statusElement.className = 'cronometer-parse-status error';
                return;
            }

            // Update the form fields with the parsed data
            const updated = updateFormFields(ingredientItem, nutritionData);

            if (updated) {
                statusElement.textContent = 'Nutrition data extracted successfully!';
                statusElement.className = 'cronometer-parse-status success';

                // Make sure the detailed nutrition panel is visible
                const detailedPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
                if (detailedPanel) {
                    detailedPanel.style.display = 'block';
                    console.log('[Direct Cronometer Fix] Made detailed nutrition panel visible');
                }
            } else {
                statusElement.textContent = 'Could not update form fields. Please check the form structure.';
                statusElement.className = 'cronometer-parse-status error';
            }
        } catch (error) {
            console.error('[Direct Cronometer Fix] Error parsing text:', error);
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.className = 'cronometer-parse-status error';
        }
    }

    // Parse Cronometer text to extract nutrition data
    function parseText(text) {
        const data = {
            // Initialize all fields with default value of 0
            // General
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            fiber: 0,
            sugars: 0,
            addedSugars: 0,
            netCarbs: 0,
            alcohol: 0,
            caffeine: 0,
            water: 0,
            starch: 0,

            // Fats
            saturated: 0,
            monounsaturated: 0,
            polyunsaturated: 0,
            omega3: 0,
            omega6: 0,
            transFat: 0,
            cholesterol: 0,

            // Amino Acids
            cystine: 0,
            histidine: 0,
            isoleucine: 0,
            leucine: 0,
            lysine: 0,
            methionine: 0,
            phenylalanine: 0,
            threonine: 0,
            tryptophan: 0,
            tyrosine: 0,
            valine: 0,

            // Vitamins
            vitaminA: 0,
            vitaminC: 0,
            vitaminD: 0,
            vitaminE: 0,
            vitaminK: 0,

            // B vitamins
            b1: 0,
            b2: 0,
            b3: 0,
            b5: 0,
            b6: 0,
            b12: 0,
            thiamine: 0,
            riboflavin: 0,
            niacin: 0,
            pantothenicAcid: 0,
            pyridoxine: 0,
            cobalamin: 0,
            folate: 0,

            // Minerals
            calcium: 0,
            copper: 0,
            iron: 0,
            magnesium: 0,
            manganese: 0,
            phosphorus: 0,
            potassium: 0,
            selenium: 0,
            sodium: 0,
            zinc: 0
        };

        // Define patterns for extracting nutrition data
        const patterns = {
            // General
            calories: /Energy\s*(\d+\.?\d*)\s*kcal/i,
            protein: /Protein\s*(\d+\.?\d*)\s*g/i,
            fat: /Fat\s*(\d+\.?\d*)\s*g/i,
            carbs: /Carbs\s*(\d+\.?\d*)\s*g/i,
            fiber: /Fiber\s*(\d+\.?\d*)\s*g/i,
            sugars: /Sugars\s*(\d+\.?\d*)\s*g/i,
            addedSugars: /Added Sugars\s*(\d+\.?\d*)\s*g/i,
            netCarbs: /Net Carbs\s*(\d+\.?\d*)\s*g/i,
            alcohol: /Alcohol\s*(\d+\.?\d*)\s*g/i,
            caffeine: /Caffeine\s*(\d+\.?\d*)\s*mg/i,
            water: /Water\s*(\d+\.?\d*)\s*g/i,
            starch: /Starch\s*(\d+\.?\d*)\s*g/i,

            // Fats
            saturated: /Saturated\s*(\d+\.?\d*)\s*g/i,
            monounsaturated: /Monounsaturated\s*(\d+\.?\d*)\s*g/i,
            polyunsaturated: /Polyunsaturated\s*(\d+\.?\d*)\s*g/i,
            omega3: /Omega-3\s*(\d+\.?\d*)\s*g/i,
            omega6: /Omega-6\s*(\d+\.?\d*)\s*g/i,
            transFat: /Trans-Fats?\s*(\d+\.?\d*)\s*g/i,
            cholesterol: /Cholesterol\s*(\d+\.?\d*)\s*mg/i,

            // Amino Acids
            cystine: /Cystine\s*(\d+\.?\d*)\s*g/i,
            histidine: /Histidine\s*(\d+\.?\d*)\s*g/i,
            isoleucine: /Isoleucine\s*(\d+\.?\d*)\s*g/i,
            leucine: /Leucine\s*(\d+\.?\d*)\s*g/i,
            lysine: /Lysine\s*(\d+\.?\d*)\s*g/i,
            methionine: /Methionine\s*(\d+\.?\d*)\s*g/i,
            phenylalanine: /Phenylalanine\s*(\d+\.?\d*)\s*g/i,
            threonine: /Threonine\s*(\d+\.?\d*)\s*g/i,
            tryptophan: /Tryptophan\s*(\d+\.?\d*)\s*g/i,
            tyrosine: /Tyrosine\s*(\d+\.?\d*)\s*g/i,
            valine: /Valine\s*(\d+\.?\d*)\s*g/i,

            // Vitamins
            vitaminA: /Vitamin A\s*(\d+\.?\d*)\s*µg/i,
            vitaminC: /Vitamin C\s*(\d+\.?\d*)\s*mg/i,
            vitaminD: /Vitamin D\s*(\d+\.?\d*)\s*(IU|µg)/i,
            vitaminE: /Vitamin E\s*(\d+\.?\d*)\s*mg/i,
            vitaminK: /Vitamin K\s*(\d+\.?\d*)\s*µg/i,

            // B vitamins - match both formats
            b1: /B1\s*\(?Thiamine\)?\s*(\d+\.?\d*)\s*mg/i,
            b2: /B2\s*\(?Riboflavin\)?\s*(\d+\.?\d*)\s*mg/i,
            b3: /B3\s*\(?Niacin\)?\s*(\d+\.?\d*)\s*mg/i,
            b5: /B5\s*\(?Pantothenic Acid\)?\s*(\d+\.?\d*)\s*mg/i,
            b6: /B6\s*\(?Pyridoxine\)?\s*(\d+\.?\d*)\s*mg/i,
            b12: /B12\s*\(?Cobalamin\)?\s*(\d+\.?\d*)\s*µg/i,

            // Alternative B vitamin patterns without B prefix
            thiamine: /Thiamine\s*(\d+\.?\d*)\s*mg/i,
            riboflavin: /Riboflavin\s*(\d+\.?\d*)\s*mg/i,
            niacin: /Niacin\s*(\d+\.?\d*)\s*mg/i,
            pantothenicAcid: /Pantothenic Acid\s*(\d+\.?\d*)\s*mg/i,
            pyridoxine: /Pyridoxine\s*(\d+\.?\d*)\s*mg/i,
            cobalamin: /Cobalamin\s*(\d+\.?\d*)\s*µg/i,

            folate: /Folate\s*(\d+\.?\d*)\s*µg/i,

            // Minerals
            calcium: /Calcium\s*(\d+\.?\d*)\s*mg/i,
            copper: /Copper\s*(\d+\.?\d*)\s*mg/i,
            iron: /Iron\s*(\d+\.?\d*)\s*mg/i,
            magnesium: /Magnesium\s*(\d+\.?\d*)\s*mg/i,
            manganese: /Manganese\s*(\d+\.?\d*)\s*mg/i,
            phosphorus: /Phosphorus\s*(\d+\.?\d*)\s*mg/i,
            potassium: /Potassium\s*(\d+\.?\d*)\s*mg/i,
            selenium: /Selenium\s*(\d+\.?\d*)\s*µg/i,
            sodium: /Sodium\s*(\d+\.?\d*)\s*mg/i,
            zinc: /Zinc\s*(\d+\.?\d*)\s*mg/i
        };

        // Extract values using patterns
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data[key] = parseFloat(match[1]);
            }
        }

        // Handle alternative B vitamin patterns
        if (!data.b1 && data.thiamine) {
            data.b1 = data.thiamine;
        }

        if (!data.b2 && data.riboflavin) {
            data.b2 = data.riboflavin;
        }

        if (!data.b3 && data.niacin) {
            data.b3 = data.niacin;
        }

        if (!data.b5 && data.pantothenicAcid) {
            data.b5 = data.pantothenicAcid;
        }

        if (!data.b6 && data.pyridoxine) {
            data.b6 = data.pyridoxine;
        }

        if (!data.b12 && data.cobalamin) {
            data.b12 = data.cobalamin;
        }

        // Log the extracted data for debugging
        console.log('[Direct Cronometer Fix] Extracted data:', data);

        return data;
    }

    // Update form fields with parsed nutrition data
    function updateFormFields(container, data) {
        console.log('[Direct Cronometer Fix] Updating form fields with data:', data);

        if (!container) {
            console.error('[Direct Cronometer Fix] Container is null or undefined');
            return false;
        }

        let updatedAnyField = false;

        // Make sure we have at least the basic nutrition data
        if (data.calories === undefined || data.calories === null) {
            console.warn('[Direct Cronometer Fix] No calorie data found, using default value of 0');
            data.calories = 0;
        }
        if (data.protein === undefined || data.protein === null) {
            console.warn('[Direct Cronometer Fix] No protein data found, using default value of 0');
            data.protein = 0;
        }
        if (data.fat === undefined || data.fat === null) {
            console.warn('[Direct Cronometer Fix] No fat data found, using default value of 0');
            data.fat = 0;
        }
        if (data.carbs === undefined || data.carbs === null) {
            console.warn('[Direct Cronometer Fix] No carbs data found, using default value of 0');
            data.carbs = 0;
        }

        // Define field mappings
        const fieldMappings = {
            // General
            calories: ['#add-ingredient-calories', '#edit-ingredient-calories', '.ingredient-calories', '.nutrition-energy', '[name="ingredient-calories"]', '[name="calories"]'],
            protein: ['#add-ingredient-protein', '#edit-ingredient-protein', '.ingredient-protein', '.nutrition-protein', '[name="ingredient-protein"]', '[name="protein"]'],
            fat: ['#add-ingredient-fats', '#edit-ingredient-fats', '.ingredient-fat', '.nutrition-fat', '[name="ingredient-fat"]', '[name="fat"]'],
            carbs: ['#add-ingredient-carbs', '#edit-ingredient-carbs', '.ingredient-carbs', '.nutrition-carbs', '.nutrition-carbs-total', '[name="ingredient-carbs"]', '[name="carbs"]'],
            fiber: ['#add-ingredient-fiber', '#edit-ingredient-fiber', '.nutrition-fiber', '[name="ingredient-fiber"]', '[name="fiber"]'],
            starch: ['#add-ingredient-starch', '#edit-ingredient-starch', '.nutrition-starch', '[name="ingredient-starch"]', '[name="starch"]'],
            sugars: ['#add-ingredient-sugars', '#edit-ingredient-sugars', '.nutrition-sugars', '[name="ingredient-sugars"]', '[name="sugars"]'],
            addedSugars: ['#add-ingredient-added-sugars', '#edit-ingredient-added-sugars', '.nutrition-added-sugars', '[name="ingredient-added-sugars"]', '[name="added_sugars"]'],
            netCarbs: ['#add-ingredient-net-carbs', '#edit-ingredient-net-carbs', '.nutrition-net-carbs', '[name="ingredient-net-carbs"]', '[name="net_carbs"]'],
            alcohol: ['#add-ingredient-alcohol', '#edit-ingredient-alcohol', '.nutrition-alcohol', '[name="ingredient-alcohol"]', '[name="alcohol"]'],
            caffeine: ['#add-ingredient-caffeine', '#edit-ingredient-caffeine', '.nutrition-caffeine', '[name="ingredient-caffeine"]', '[name="caffeine"]'],
            water: ['#add-ingredient-water', '#edit-ingredient-water', '.nutrition-water', '[name="ingredient-water"]', '[name="water"]'],

            // Fats
            saturated: ['#add-ingredient-saturated', '#edit-ingredient-saturated', '.nutrition-saturated', '[name="ingredient-saturated"]', '[name="saturated"]'],
            monounsaturated: ['#add-ingredient-monounsaturated', '#edit-ingredient-monounsaturated', '.nutrition-monounsaturated', '[name="ingredient-monounsaturated"]', '[name="monounsaturated"]'],
            polyunsaturated: ['#add-ingredient-polyunsaturated', '#edit-ingredient-polyunsaturated', '.nutrition-polyunsaturated', '[name="ingredient-polyunsaturated"]', '[name="polyunsaturated"]'],
            omega3: ['#add-ingredient-omega3', '#edit-ingredient-omega3', '.nutrition-omega3', '[name="ingredient-omega3"]', '[name="omega3"]'],
            omega6: ['#add-ingredient-omega6', '#edit-ingredient-omega6', '.nutrition-omega6', '[name="ingredient-omega6"]', '[name="omega6"]'],
            transFat: ['#add-ingredient-trans-fat', '#edit-ingredient-trans-fat', '.nutrition-trans-fat', '[name="ingredient-trans-fat"]', '[name="trans_fat"]'],
            cholesterol: ['#add-ingredient-cholesterol', '#edit-ingredient-cholesterol', '.nutrition-cholesterol', '[name="ingredient-cholesterol"]', '[name="cholesterol"]'],

            // Amino Acids
            cystine: ['#add-ingredient-cystine', '#edit-ingredient-cystine', '.nutrition-cystine', '[name="ingredient-cystine"]', '[name="cystine"]'],
            histidine: ['#add-ingredient-histidine', '#edit-ingredient-histidine', '.nutrition-histidine', '[name="ingredient-histidine"]', '[name="histidine"]'],
            isoleucine: ['#add-ingredient-isoleucine', '#edit-ingredient-isoleucine', '.nutrition-isoleucine', '[name="ingredient-isoleucine"]', '[name="isoleucine"]'],
            leucine: ['#add-ingredient-leucine', '#edit-ingredient-leucine', '.nutrition-leucine', '[name="ingredient-leucine"]', '[name="leucine"]'],
            lysine: ['#add-ingredient-lysine', '#edit-ingredient-lysine', '.nutrition-lysine', '[name="ingredient-lysine"]', '[name="lysine"]'],
            methionine: ['#add-ingredient-methionine', '#edit-ingredient-methionine', '.nutrition-methionine', '[name="ingredient-methionine"]', '[name="methionine"]'],
            phenylalanine: ['#add-ingredient-phenylalanine', '#edit-ingredient-phenylalanine', '.nutrition-phenylalanine', '[name="ingredient-phenylalanine"]', '[name="phenylalanine"]'],
            threonine: ['#add-ingredient-threonine', '#edit-ingredient-threonine', '.nutrition-threonine', '[name="ingredient-threonine"]', '[name="threonine"]'],
            tryptophan: ['#add-ingredient-tryptophan', '#edit-ingredient-tryptophan', '.nutrition-tryptophan', '[name="ingredient-tryptophan"]', '[name="tryptophan"]'],
            tyrosine: ['#add-ingredient-tyrosine', '#edit-ingredient-tyrosine', '.nutrition-tyrosine', '[name="ingredient-tyrosine"]', '[name="tyrosine"]'],
            valine: ['#add-ingredient-valine', '#edit-ingredient-valine', '.nutrition-valine', '[name="ingredient-valine"]', '[name="valine"]'],

            // Vitamins
            vitaminA: ['#add-ingredient-vitamin-a', '#edit-ingredient-vitamin-a', '.nutrition-vitamin-a', '[name="ingredient-vitamin-a"]', '[name="vitamin_a"]'],
            vitaminC: ['#add-ingredient-vitamin-c', '#edit-ingredient-vitamin-c', '.nutrition-vitamin-c', '[name="ingredient-vitamin-c"]', '[name="vitamin_c"]'],
            vitaminD: ['#add-ingredient-vitamin-d', '#edit-ingredient-vitamin-d', '.nutrition-vitamin-d', '[name="ingredient-vitamin-d"]', '[name="vitamin_d"]'],
            vitaminE: ['#add-ingredient-vitamin-e', '#edit-ingredient-vitamin-e', '.nutrition-vitamin-e', '[name="ingredient-vitamin-e"]', '[name="vitamin_e"]'],
            vitaminK: ['#add-ingredient-vitamin-k', '#edit-ingredient-vitamin-k', '.nutrition-vitamin-k', '[name="ingredient-vitamin-k"]', '[name="vitamin_k"]'],

            // B vitamins - use the key names that match the parsed data
            b1: ['#add-ingredient-b1', '#edit-ingredient-b1', '.nutrition-b1', '[name="ingredient-b1"]', '[name="b1"]', '[name="thiamine"]', '[id*="b1"]', '[id*="thiamine"]'],
            b2: ['#add-ingredient-b2', '#edit-ingredient-b2', '.nutrition-b2', '[name="ingredient-b2"]', '[name="b2"]', '[name="riboflavin"]', '[id*="b2"]', '[id*="riboflavin"]'],
            b3: ['#add-ingredient-b3', '#edit-ingredient-b3', '.nutrition-b3', '[name="ingredient-b3"]', '[name="b3"]', '[name="niacin"]', '[id*="b3"]', '[id*="niacin"]'],
            b5: ['#add-ingredient-b5', '#edit-ingredient-b5', '.nutrition-b5', '[name="ingredient-b5"]', '[name="b5"]', '[name="pantothenic_acid"]', '[id*="b5"]', '[id*="pantothenic"]'],
            b6: ['#add-ingredient-b6', '#edit-ingredient-b6', '.nutrition-b6', '[name="ingredient-b6"]', '[name="b6"]', '[name="pyridoxine"]', '[id*="b6"]', '[id*="pyridoxine"]'],
            b12: ['#add-ingredient-b12', '#edit-ingredient-b12', '.nutrition-b12', '[name="ingredient-b12"]', '[name="b12"]', '[name="cobalamin"]', '[id*="b12"]', '[id*="cobalamin"]'],

            // Also map the alternative names to the same fields
            thiamine: ['#add-ingredient-b1', '#edit-ingredient-b1', '.nutrition-b1', '[name="ingredient-b1"]', '[name="b1"]', '[name="thiamine"]', '[id*="b1"]', '[id*="thiamine"]'],
            riboflavin: ['#add-ingredient-b2', '#edit-ingredient-b2', '.nutrition-b2', '[name="ingredient-b2"]', '[name="b2"]', '[name="riboflavin"]', '[id*="b2"]', '[id*="riboflavin"]'],
            niacin: ['#add-ingredient-b3', '#edit-ingredient-b3', '.nutrition-b3', '[name="ingredient-b3"]', '[name="b3"]', '[name="niacin"]', '[id*="b3"]', '[id*="niacin"]'],
            pantothenicAcid: ['#add-ingredient-b5', '#edit-ingredient-b5', '.nutrition-b5', '[name="ingredient-b5"]', '[name="b5"]', '[name="pantothenic_acid"]', '[id*="b5"]', '[id*="pantothenic"]'],
            pyridoxine: ['#add-ingredient-b6', '#edit-ingredient-b6', '.nutrition-b6', '[name="ingredient-b6"]', '[name="b6"]', '[name="pyridoxine"]', '[id*="b6"]', '[id*="pyridoxine"]'],
            cobalamin: ['#add-ingredient-b12', '#edit-ingredient-b12', '.nutrition-b12', '[name="ingredient-b12"]', '[name="b12"]', '[name="cobalamin"]', '[id*="b12"]', '[id*="cobalamin"]'],

            folate: ['#add-ingredient-folate', '#edit-ingredient-folate', '.nutrition-folate', '[name="ingredient-folate"]', '[name="folate"]'],

            // Minerals
            calcium: ['#add-ingredient-calcium', '#edit-ingredient-calcium', '.nutrition-calcium', '[name="ingredient-calcium"]', '[name="calcium"]'],
            copper: ['#add-ingredient-copper', '#edit-ingredient-copper', '.nutrition-copper', '[name="ingredient-copper"]', '[name="copper"]'],
            iron: ['#add-ingredient-iron', '#edit-ingredient-iron', '.nutrition-iron', '[name="ingredient-iron"]', '[name="iron"]'],
            magnesium: ['#add-ingredient-magnesium', '#edit-ingredient-magnesium', '.nutrition-magnesium', '[name="ingredient-magnesium"]', '[name="magnesium"]'],
            manganese: ['#add-ingredient-manganese', '#edit-ingredient-manganese', '.nutrition-manganese', '[name="ingredient-manganese"]', '[name="manganese"]'],
            phosphorus: ['#add-ingredient-phosphorus', '#edit-ingredient-phosphorus', '.nutrition-phosphorus', '[name="ingredient-phosphorus"]', '[name="phosphorus"]'],
            potassium: ['#add-ingredient-potassium', '#edit-ingredient-potassium', '.nutrition-potassium', '[name="ingredient-potassium"]', '[name="potassium"]'],
            selenium: ['#add-ingredient-selenium', '#edit-ingredient-selenium', '.nutrition-selenium', '[name="ingredient-selenium"]', '[name="selenium"]'],
            sodium: ['#add-ingredient-sodium', '#edit-ingredient-sodium', '.nutrition-sodium', '[name="ingredient-sodium"]', '[name="sodium"]'],
            zinc: ['#add-ingredient-zinc', '#edit-ingredient-zinc', '.nutrition-zinc', '[name="ingredient-zinc"]', '[name="zinc"]']
        };

        // First, make sure the detailed nutrition panel is visible
        const detailedPanel = container.querySelector('.detailed-nutrition-panel');
        if (detailedPanel) {
            detailedPanel.style.display = 'block';
            container.classList.add('cronometer-parsing');
            console.log('[Direct Cronometer Fix] Made detailed nutrition panel visible');
        }

        // Special handling for Fat and Protein fields
        // These are critical fields that need to be populated
        if (data.fat !== undefined) {
            // Try to find the fat field directly
            const fatFields = container.querySelectorAll('input');
            for (const field of fatFields) {
                if (field.id && field.id.includes('fat') ||
                    field.name && field.name.includes('fat') ||
                    field.className && field.className.includes('fat')) {
                    field.value = data.fat;
                    field.classList.add('cronometer-parsed');
                    console.log(`[Direct Cronometer Fix] Directly set fat field ${field.id || field.name || field.className} to ${data.fat}`);

                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    field.dispatchEvent(event);
                    updatedAnyField = true;
                }
            }
        }

        if (data.protein !== undefined) {
            // Try to find the protein field directly
            const proteinFields = container.querySelectorAll('input');
            for (const field of proteinFields) {
                if (field.id && field.id.includes('protein') ||
                    field.name && field.name.includes('protein') ||
                    field.className && field.className.includes('protein')) {
                    field.value = data.protein;
                    field.classList.add('cronometer-parsed');
                    console.log(`[Direct Cronometer Fix] Directly set protein field ${field.id || field.name || field.className} to ${data.protein}`);

                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    field.dispatchEvent(event);
                    updatedAnyField = true;
                }
            }
        }

        // Update fields based on mappings
        for (const [key, selectors] of Object.entries(fieldMappings)) {
            if (data[key] !== undefined) {
                let fieldUpdated = false;

                // Try to find the field using the selectors
                for (const selector of selectors) {
                    // Try both with and without container context
                    let field = container.querySelector(selector);

                    // If not found in container, try document-wide (for hidden fields)
                    if (!field) {
                        const allFields = document.querySelectorAll(selector);
                        if (allFields.length > 0) {
                            // Use the first field found
                            field = allFields[0];
                            console.log(`[Direct Cronometer Fix] Found field ${selector} outside container`);
                        }
                    }

                    if (field) {
                        field.value = data[key];
                        field.classList.add('cronometer-parsed');

                        // Trigger change event to ensure any listeners are notified
                        const event = new Event('change', { bubbles: true });
                        field.dispatchEvent(event);

                        console.log(`[Direct Cronometer Fix] Updated field ${selector} with value ${data[key]}`);
                        fieldUpdated = true;
                        updatedAnyField = true;

                        // Don't break here - update all matching fields
                    }
                }

                if (!fieldUpdated) {
                    console.warn(`[Direct Cronometer Fix] Could not find field for ${key}`);
                }
            }
        }

        // If we updated any fields, make sure the form knows about it
        if (updatedAnyField) {
            // Find the form
            const form = container.closest('form') || container;

            // Trigger form change event
            const formChangeEvent = new Event('change', { bubbles: true });
            form.dispatchEvent(formChangeEvent);

            // Add a class to the form to indicate it has parsed data
            form.classList.add('has-parsed-data');

            // Direct mapping for B vitamins - this is a fallback in case the regular mapping fails
            directMapBVitamins(container, data);
        }

        return updatedAnyField;
    }

    // Direct mapping function specifically for B vitamins
    function directMapBVitamins(container, data) {
        console.log('[Direct Cronometer Fix] Attempting direct B vitamin mapping');

        if (!container) {
            console.error('[Direct Cronometer Fix] Container is null or undefined');
            return;
        }

        // Try to find B vitamin fields by their IDs
        const bVitaminMappings = [
            { key: 'b1', value: data.b1 || data.thiamine || 0, selectors: ['#b1', '[id*="thiamine"]', '[id*="b1"]', '.nutrition-vitamin-b1', '#vitamin-b1'] },
            { key: 'b2', value: data.b2 || data.riboflavin || 0, selectors: ['#b2', '[id*="riboflavin"]', '[id*="b2"]', '.nutrition-vitamin-b2', '#vitamin-b2'] },
            { key: 'b3', value: data.b3 || data.niacin || 0, selectors: ['#b3', '[id*="niacin"]', '[id*="b3"]', '.nutrition-vitamin-b3', '#vitamin-b3'] },
            { key: 'b5', value: data.b5 || data.pantothenicAcid || 0, selectors: ['#b5', '[id*="pantothenic"]', '[id*="b5"]', '.nutrition-vitamin-b5', '#vitamin-b5'] },
            { key: 'b6', value: data.b6 || data.pyridoxine || 0, selectors: ['#b6', '[id*="pyridoxine"]', '[id*="b6"]', '.nutrition-vitamin-b6', '#vitamin-b6'] },
            { key: 'b12', value: data.b12 || data.cobalamin || 0, selectors: ['#b12', '[id*="cobalamin"]', '[id*="b12"]', '.nutrition-vitamin-b12', '#vitamin-b12'] }
        ];

        // First try to find the vitamins section
        let vitaminsSection = null;

        // Try to find the vitamins section by looking for a heading with "Vitamins" text
        const nutritionSections = container.querySelectorAll('.nutrition-section');
        for (const section of nutritionSections) {
            const heading = section.querySelector('h4');
            if (heading && heading.textContent.includes('Vitamins')) {
                vitaminsSection = section;
                break;
            }
        }

        // If not found, try other selectors
        if (!vitaminsSection) {
            vitaminsSection = container.querySelector('.vitamins') ||
                             container.querySelector('[id*="vitamins"]') ||
                             container.querySelector('.nutrition-section') ||
                             container;
        }

        if (vitaminsSection) {
            console.log('[Direct Cronometer Fix] Found vitamins section or container');

            // Find all input fields in the vitamins section
            const inputFields = vitaminsSection.querySelectorAll('input');
            console.log('[Direct Cronometer Fix] Found input fields in section:', inputFields.length);

            // Try to match B vitamin fields by their ID or name
            for (const input of inputFields) {
                const id = input.id || '';
                const name = input.name || '';
                const className = input.className || '';

                // Check if this is a B vitamin field
                for (const mapping of bVitaminMappings) {
                    if (mapping.value !== undefined &&
                        (id.includes(mapping.key) ||
                         id.includes('thiamine') ||
                         id.includes('riboflavin') ||
                         id.includes('niacin') ||
                         id.includes('pantothenic') ||
                         id.includes('pyridoxine') ||
                         id.includes('cobalamin') ||
                         name.includes(mapping.key) ||
                         name.includes('thiamine') ||
                         name.includes('riboflavin') ||
                         name.includes('niacin') ||
                         name.includes('pantothenic') ||
                         name.includes('pyridoxine') ||
                         name.includes('cobalamin') ||
                         className.includes('vitamin-b') ||
                         className.includes('b1') ||
                         className.includes('b2') ||
                         className.includes('b3') ||
                         className.includes('b5') ||
                         className.includes('b6') ||
                         className.includes('b12'))) {

                        input.value = mapping.value;
                        input.classList.add('cronometer-parsed');
                        console.log(`[Direct Cronometer Fix] Directly mapped ${mapping.key} to field ${id || name || className} with value ${mapping.value}`);

                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                    }
                }
            }
        } else {
            console.log('[Direct Cronometer Fix] Could not find vitamins section, trying direct selectors');

            // If we couldn't find the vitamins section, try direct selectors
            for (const mapping of bVitaminMappings) {
                for (const selector of mapping.selectors) {
                    const field = container.querySelector(selector);
                    if (field) {
                        field.value = mapping.value;
                        field.classList.add('cronometer-parsed');
                        console.log(`[Direct Cronometer Fix] Directly mapped ${mapping.key} to field ${selector} with value ${mapping.value}`);

                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        field.dispatchEvent(event);
                    }
                }
            }
        }

        // As a last resort, try to find any input with vitamin in the class name
        const vitaminInputs = container.querySelectorAll('input[class*="vitamin"]');
        if (vitaminInputs.length > 0) {
            console.log(`[Direct Cronometer Fix] Found ${vitaminInputs.length} vitamin inputs by class name`);

            for (const input of vitaminInputs) {
                const className = input.className || '';

                for (const mapping of bVitaminMappings) {
                    if (className.includes(mapping.key) || className.includes(`vitamin-${mapping.key}`)) {
                        input.value = mapping.value;
                        input.classList.add('cronometer-parsed');
                        console.log(`[Direct Cronometer Fix] Mapped ${mapping.key} to field by class ${className} with value ${mapping.value}`);

                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                    }
                }
            }
        }
    }
})();
