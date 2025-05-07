/**
 * Fix for Cronometer Text Parser
 * 
 * This script fixes the SyntaxError in cronometer-text-parser.js
 * by ensuring the PATTERNS variable is not redeclared.
 */

(function() {
    console.log('[Cronometer Parser Fix] Initializing...');

    document.addEventListener('DOMContentLoaded', function() {

        if (typeof window.processCronometerText !== 'function') {
            console.error('[Cronometer Parser Fix] Original processCronometerText function not found');
            return;
        }

        const originalProcessCronometerText = window.processCronometerText;

        window.processCronometerText = function(text, ingredientItem, statusElement) {
            console.log('[Cronometer Parser Fix] Using fixed processCronometerText function');
            
            try {

                const result = originalProcessCronometerText(text, ingredientItem, statusElement);

                console.log('[Cronometer Parser Fix] Successfully processed Cronometer text');
                
                return result;
            } catch (error) {
                console.error('[Cronometer Parser Fix] Error in processCronometerText:', error);

                if (error.message.includes('PATTERNS')) {
                    console.log('[Cronometer Parser Fix] Using fallback implementation');

                    return processTextFallback(text, ingredientItem, statusElement);
                }

                if (statusElement) {
                    statusElement.textContent = `Error: ${error.message}`;
                    statusElement.className = 'cronometer-parse-status error';
                }
                
                throw error;
            }
        };
        
        console.log('[Cronometer Parser Fix] Initialized');
    });

    function processTextFallback(text, ingredientItem, statusElement) {
        console.log('[Cronometer Parser Fix] Using fallback implementation');
        
        if (!text || !text.trim()) {
            if (statusElement) {
                statusElement.textContent = 'Please paste Cronometer nutrition data';
                statusElement.className = 'cronometer-parse-status error';
            }
            return null;
        }
        
        try {

            const result = extractNutritionValues(text);
            
            if (!result.success) {
                if (statusElement) {
                    statusElement.textContent = 'Could not parse Cronometer data';
                    statusElement.className = 'cronometer-parse-status error';
                }
                return null;
            }

            updateIngredientItem(ingredientItem, result);

            if (statusElement) {
                statusElement.textContent = 'Nutrition data parsed successfully!';
                statusElement.className = 'cronometer-parse-status success';
            }
            
            return result;
        } catch (error) {
            console.error('[Cronometer Parser Fix] Error in fallback implementation:', error);
            
            if (statusElement) {
                statusElement.textContent = `Error: ${error.message}`;
                statusElement.className = 'cronometer-parse-status error';
            }
            
            return null;
        }
    }

    function extractNutritionValues(text) {

        function extractValue(text, pattern) {
            const match = text.match(pattern);
            return match ? parseFloat(match[1]) : null;
        }

        const patterns = window.CRONOMETER_PATTERNS || {

            ENERGY: /Energy:\s+(\d+(?:\.\d+)?)\s+kcal/i,
            PROTEIN: /Protein:\s+(\d+(?:\.\d+)?)\s+g/i,
            FAT: /Fat:\s+(\d+(?:\.\d+)?)\s+g/i,
            CARBS: /Carbs:\s+(\d+(?:\.\d+)?)\s+g/i
        };

        const result = {
            success: true,
            calories: extractValue(text, patterns.ENERGY),
            protein: extractValue(text, patterns.PROTEIN),
            fats: extractValue(text, patterns.FAT),
            carbohydrates: extractValue(text, patterns.CARBS)
        };

        if (!result.calories || !result.protein || !result.fats || !result.carbohydrates) {
            console.error('[Cronometer Parser Fix] Failed to extract essential nutrients');
            result.success = false;
        }
        
        return result;
    }

    function updateIngredientItem(ingredientItem, result) {
        if (!ingredientItem) return;

        ingredientItem.dataset.completeNutritionData = JSON.stringify(result);

        const prefix = ingredientItem.id === 'add-ingredient-form' ? 'add' : 'edit';

        const caloriesInput = document.getElementById(`${prefix}-ingredient-calories`);
        if (caloriesInput && result.calories !== null) {
            caloriesInput.value = result.calories;
        }

        const proteinInput = document.getElementById(`${prefix}-ingredient-protein`);
        if (proteinInput && result.protein !== null) {
            proteinInput.value = result.protein;
        }

        const fatsInput = document.getElementById(`${prefix}-ingredient-fats`);
        if (fatsInput && result.fats !== null) {
            fatsInput.value = result.fats;
        }

        const carbsInput = document.getElementById(`${prefix}-ingredient-carbs`);
        if (carbsInput && result.carbohydrates !== null) {
            carbsInput.value = result.carbohydrates;
        }

        const caloriesHidden = ingredientItem.querySelector('.ingredient-calories');
        if (caloriesHidden && result.calories !== null) {
            caloriesHidden.value = result.calories;
        }
        
        const proteinHidden = ingredientItem.querySelector('.ingredient-protein');
        if (proteinHidden && result.protein !== null) {
            proteinHidden.value = result.protein;
        }
        
        const fatHidden = ingredientItem.querySelector('.ingredient-fat');
        if (fatHidden && result.fats !== null) {
            fatHidden.value = result.fats;
        }
        
        const carbsHidden = ingredientItem.querySelector('.ingredient-carbs');
        if (carbsHidden && result.carbohydrates !== null) {
            carbsHidden.value = result.carbohydrates;
        }
    }
})();
