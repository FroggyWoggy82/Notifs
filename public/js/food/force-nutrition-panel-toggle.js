/**
 * Force Nutrition Panel Toggle
 * Simple, non-looping solution to fix the nutrition panel toggle
 */
(function() {
    'use strict';

    let initialized = false;

    function handleNutritionToggle(e) {
        if (!e.target.classList.contains('toggle-detailed-nutrition') &&
            !e.target.textContent?.includes('Detailed Nutrition')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('[Force Nutrition Panel Toggle] 🚀 BUTTON CLICKED!');
        console.log('[Force Nutrition Panel Toggle] Button text:', e.target.textContent);

        // Find the nutrition panel in the same ingredient item
        const ingredientItem = e.target.closest('.ingredient-item');
        console.log('[Force Nutrition Panel Toggle] Ingredient item found:', !!ingredientItem);

        if (!ingredientItem) {
            console.error('[Force Nutrition Panel Toggle] Could not find ingredient item');
            return;
        }

        // Look for all possible nutrition panel selectors
        const panel1 = ingredientItem.querySelector('.nutrition-panel');
        const panel2 = ingredientItem.querySelector('.detailed-nutrition-panel');
        const panel3 = ingredientItem.querySelector('.detailed-nutrition-container');

        console.log('[Force Nutrition Panel Toggle] Panel search results:', {
            '.nutrition-panel': !!panel1,
            '.detailed-nutrition-panel': !!panel2,
            '.detailed-nutrition-container': !!panel3
        });

        const panel = panel1 || panel2 || panel3;

        if (!panel) {
            console.error('[Force Nutrition Panel Toggle] Could not find nutrition panel');
            console.log('[Force Nutrition Panel Toggle] Available elements in ingredient item:',
                Array.from(ingredientItem.querySelectorAll('*')).map(el => el.className).filter(c => c));
            return;
        }

        console.log('[Force Nutrition Panel Toggle] Found panel:', panel);
        console.log('[Force Nutrition Panel Toggle] Panel style.display:', panel.style.display);

        // Check computed style to see what CSS is actually applying
        const computedStyle = window.getComputedStyle(panel);
        console.log('[Force Nutrition Panel Toggle] Panel computed display:', computedStyle.display);
        console.log('[Force Nutrition Panel Toggle] Panel computed visibility:', computedStyle.visibility);

        // Use computed style to determine if hidden
        const isHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';

        if (isHidden) {
            // Force show with !important by setting CSS property directly
            panel.style.setProperty('display', 'block', 'important');
            panel.style.setProperty('visibility', 'visible', 'important');
            e.target.textContent = e.target.textContent.replace('Show', 'Hide');

            // Check if nutrition fields need to be populated
            const contentDiv = panel.querySelector('.nutrition-panel-content');
            const hasNutritionFields = panel.querySelector('.nutrition-section') || panel.querySelector('.nutrition-grid');

            console.log('[Force Nutrition Panel Toggle] Content div found:', !!contentDiv);
            console.log('[Force Nutrition Panel Toggle] Has nutrition fields:', hasNutritionFields);
            console.log('[Force Nutrition Panel Toggle] Panel innerHTML length:', panel.innerHTML.length);

            if (!hasNutritionFields) {
                console.log('[Force Nutrition Panel Toggle] Creating nutrition fields directly...');
                createNutritionFields(panel);
            }

            // Trigger nutrition display redesign
            if (window.nutritionDisplayRedesign) {
                console.log('[Force Nutrition Panel Toggle] Triggering nutritionDisplayRedesign...');
                window.nutritionDisplayRedesign();
            }

            // Dispatch custom event to trigger other population scripts
            const event = new CustomEvent('nutrition-panel-shown', {
                bubbles: true,
                detail: { panel: panel }
            });
            panel.dispatchEvent(event);

            console.log('[Force Nutrition Panel Toggle] ✅ Panel shown with !important');
        } else {
            // Force hide with !important
            panel.style.setProperty('display', 'none', 'important');
            e.target.textContent = e.target.textContent.replace('Hide', 'Show');
            console.log('[Force Nutrition Panel Toggle] ❌ Panel hidden with !important');
        }
    }

    function createNutritionFields(panel) {
        console.log('[Force Nutrition Panel Toggle] Creating nutrition fields...');

        // Find or create content container
        let contentDiv = panel.querySelector('.nutrition-panel-content');
        if (!contentDiv) {
            contentDiv = panel;
        }

        // Clear existing content
        const existingContent = contentDiv.querySelector('.nutrition-section');
        if (existingContent) {
            console.log('[Force Nutrition Panel Toggle] Nutrition fields already exist');
            return;
        }

        // Create comprehensive nutrition sections matching the desired layout
        const nutritionHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- Left Column -->
                <div>
                    <!-- General Section -->
                    <div class="nutrition-section">
                        <h4>General</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-calories">Energy</label>
                                <input type="number" id="edit-ingredient-calories" step="0.1" required>
                                <span class="unit">kcal</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-alcohol">Alcohol</label>
                                <input type="number" id="edit-ingredient-alcohol" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-caffeine">Caffeine</label>
                                <input type="number" id="edit-ingredient-caffeine" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-water">Water</label>
                                <input type="number" id="edit-ingredient-water" step="0.1">
                                <span class="unit">g</span>
                            </div>
                        </div>
                    </div>

                    <!-- Carbohydrates Section -->
                    <div class="nutrition-section">
                        <h4>Carbohydrates</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-carbohydrates">Carbs</label>
                                <input type="number" id="edit-ingredient-carbohydrates" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-fiber">Fiber</label>
                                <input type="number" id="edit-ingredient-fiber" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-starch">Starch</label>
                                <input type="number" id="edit-ingredient-starch" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-sugars">Sugars</label>
                                <input type="number" id="edit-ingredient-sugars" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-added-sugars">Added Sugars</label>
                                <input type="number" id="edit-ingredient-added-sugars" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-net-carbs">Net Carbs</label>
                                <input type="number" id="edit-ingredient-net-carbs" step="0.1">
                                <span class="unit">g</span>
                            </div>
                        </div>
                    </div>

                    <!-- Lipids Section -->
                    <div class="nutrition-section">
                        <h4>Lipids</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-fats">Fat</label>
                                <input type="number" id="edit-ingredient-fats" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-monounsaturated">Monounsaturated</label>
                                <input type="number" id="edit-ingredient-monounsaturated" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-polyunsaturated">Polyunsaturated</label>
                                <input type="number" id="edit-ingredient-polyunsaturated" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-omega3">Omega 3</label>
                                <input type="number" id="edit-ingredient-omega3" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-omega6">Omega 6</label>
                                <input type="number" id="edit-ingredient-omega6" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-saturated">Saturated</label>
                                <input type="number" id="edit-ingredient-saturated" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-trans">Trans Fats</label>
                                <input type="number" id="edit-ingredient-trans" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-cholesterol">Cholesterol</label>
                                <input type="number" id="edit-ingredient-cholesterol" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                        </div>
                    </div>

                    <!-- Protein Section -->
                    <div class="nutrition-section">
                        <h4>Protein</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-protein">Protein</label>
                                <input type="number" id="edit-ingredient-protein" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-cystine">Cystine</label>
                                <input type="number" id="edit-ingredient-cystine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-histidine">Histidine</label>
                                <input type="number" id="edit-ingredient-histidine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-isoleucine">Isoleucine</label>
                                <input type="number" id="edit-ingredient-isoleucine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-leucine">Leucine</label>
                                <input type="number" id="edit-ingredient-leucine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-lysine">Lysine</label>
                                <input type="number" id="edit-ingredient-lysine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-methionine">Methionine</label>
                                <input type="number" id="edit-ingredient-methionine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-phenylalanine">Phenylalanine</label>
                                <input type="number" id="edit-ingredient-phenylalanine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-threonine">Threonine</label>
                                <input type="number" id="edit-ingredient-threonine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-tryptophan">Tryptophan</label>
                                <input type="number" id="edit-ingredient-tryptophan" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-tyrosine">Tyrosine</label>
                                <input type="number" id="edit-ingredient-tyrosine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-valine">Valine</label>
                                <input type="number" id="edit-ingredient-valine" step="0.1">
                                <span class="unit">g</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div>
                    <!-- Vitamins Section -->
                    <div class="nutrition-section">
                        <h4>Vitamins</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b1">B1 (Thiamine)</label>
                                <input type="number" id="edit-ingredient-vitamin-b1" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b2">B2 (Riboflavin)</label>
                                <input type="number" id="edit-ingredient-vitamin-b2" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b3">B3 (Niacin)</label>
                                <input type="number" id="edit-ingredient-vitamin-b3" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b5">B5 (Pantothenic Acid)</label>
                                <input type="number" id="edit-ingredient-vitamin-b5" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b6">B6 (Pyridoxine)</label>
                                <input type="number" id="edit-ingredient-vitamin-b6" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-b12">B12 (Cobalamin)</label>
                                <input type="number" id="edit-ingredient-vitamin-b12" step="0.1">
                                <span class="unit">μg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-folate">Folate</label>
                                <input type="number" id="edit-ingredient-folate" step="0.1">
                                <span class="unit">μg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-a">Vitamin A</label>
                                <input type="number" id="edit-ingredient-vitamin-a" step="0.1">
                                <span class="unit">μg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-c">Vitamin C</label>
                                <input type="number" id="edit-ingredient-vitamin-c" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-d">Vitamin D</label>
                                <input type="number" id="edit-ingredient-vitamin-d" step="0.1">
                                <span class="unit">IU</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-e">Vitamin E</label>
                                <input type="number" id="edit-ingredient-vitamin-e" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-vitamin-k">Vitamin K</label>
                                <input type="number" id="edit-ingredient-vitamin-k" step="0.1">
                                <span class="unit">μg</span>
                            </div>
                        </div>
                    </div>

                    <!-- Minerals Section -->
                    <div class="nutrition-section">
                        <h4>Minerals</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <label for="edit-ingredient-calcium">Calcium</label>
                                <input type="number" id="edit-ingredient-calcium" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-copper">Copper</label>
                                <input type="number" id="edit-ingredient-copper" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-iron">Iron</label>
                                <input type="number" id="edit-ingredient-iron" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-magnesium">Magnesium</label>
                                <input type="number" id="edit-ingredient-magnesium" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-manganese">Manganese</label>
                                <input type="number" id="edit-ingredient-manganese" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-phosphorus">Phosphorus</label>
                                <input type="number" id="edit-ingredient-phosphorus" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-potassium">Potassium</label>
                                <input type="number" id="edit-ingredient-potassium" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-selenium">Selenium</label>
                                <input type="number" id="edit-ingredient-selenium" step="0.1">
                                <span class="unit">μg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-sodium">Sodium</label>
                                <input type="number" id="edit-ingredient-sodium" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                            <div class="nutrition-item">
                                <label for="edit-ingredient-zinc">Zinc</label>
                                <input type="number" id="edit-ingredient-zinc" step="0.1">
                                <span class="unit">mg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert the HTML
        if (contentDiv.querySelector('.nutrition-panel-header')) {
            // Insert after header
            const header = contentDiv.querySelector('.nutrition-panel-header');
            header.insertAdjacentHTML('afterend', nutritionHTML);
        } else {
            // Insert at beginning
            contentDiv.insertAdjacentHTML('afterbegin', nutritionHTML);
        }

        console.log('[Force Nutrition Panel Toggle] ✅ Nutrition fields created successfully');
    }

    function initialize() {
        if (initialized) return;
        initialized = true;

        console.log('[Force Nutrition Panel Toggle] Initializing once...');

        // Single global event listener
        document.addEventListener('click', handleNutritionToggle, { capture: true, passive: false });

        console.log('[Force Nutrition Panel Toggle] Global handler attached');
    }

    // Initialize when DOM is ready, with delays to run after other scripts
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 100);
            setTimeout(initialize, 500);
            setTimeout(initialize, 1500); // Run after other scripts
        });
    } else {
        setTimeout(initialize, 100);
        setTimeout(initialize, 500);
        setTimeout(initialize, 1500); // Run after other scripts
    }

})();
