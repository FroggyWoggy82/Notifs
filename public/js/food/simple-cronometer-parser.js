/**
 * Simple Cronometer Parser
 * Adds Cronometer data parsing functionality to existing edit forms
 */

console.log('[Simple Cronometer Parser] Loading...');

(function() {
    'use strict';

    // Simple Cronometer data parser
    function parseCronometerData(text) {
        console.log('[Simple Cronometer Parser] Parsing data length:', text.length);
        console.log('[Simple Cronometer Parser] First 200 chars:', text.substring(0, 200));

        if (!text || text.trim().length === 0) {
            console.log('[Simple Cronometer Parser] No data to parse');
            return;
        }

        const lines = text.split('\n');
        const data = {};
        let foundCount = 0;

        console.log('[Simple Cronometer Parser] Processing', lines.length, 'lines');

        // Parse each line for nutrition data - handle multiple formats
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            console.log('[Simple Cronometer Parser] Processing line', i + ':', line);

            let nutrient = null;
            let value = null;

            // Method 1: Tab-separated format (Energy	152.8	kcal)
            let parts = line.split('\t');
            if (parts.length >= 2) {
                nutrient = parts[0].trim();
                value = parts[1].trim();
                console.log('[Simple Cronometer Parser] Tab format - nutrient:', nutrient, 'value:', value);
            }

            // Method 2: Space-separated format (Energy 152.8 kcal)
            if (!nutrient) {
                const spaceMatch = line.match(/^(.+?)\s+([0-9.-]+)\s*(.*)$/);
                if (spaceMatch) {
                    nutrient = spaceMatch[1].trim();
                    value = spaceMatch[2].trim();
                    console.log('[Simple Cronometer Parser] Space format - nutrient:', nutrient, 'value:', value);
                }
            }

            // Method 3: Multi-line format (nutrient on one line, value on next line)
            if (!nutrient && i < lines.length - 1) {
                const currentLine = line;
                const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';

                // Check if current line looks like a nutrient name and next line is a number
                const isNutrientName = /^[A-Za-z\s\.\(\)]+$/.test(currentLine) && currentLine.length > 2;
                const isNumericValue = /^[0-9.-]+$/.test(nextLine);

                if (isNutrientName && isNumericValue) {
                    nutrient = currentLine;
                    value = nextLine;
                    i++; // Skip the next line since we consumed it
                    console.log('[Simple Cronometer Parser] Multi-line format - nutrient:', nutrient, 'value:', value);
                }
            }

            if (nutrient && value) {
                console.log('[Simple Cronometer Parser] Found nutrient:', nutrient, 'value:', value);

                // Skip empty values or dashes
                if (!value || value === '-') {
                    console.log('[Simple Cronometer Parser] Skipping empty/dash value for:', nutrient);
                    continue;
                }

                // Extract numeric value
                const numericMatch = value.match(/([0-9]+\.?[0-9]*)/);
                const numericValue = numericMatch ? parseFloat(numericMatch[1]) : 0;

                // Map nutrients to field IDs - expanded mapping
                const fieldMapping = {
                    'Energy': 'edit-ingredient-energy',
                    'Protein': 'edit-ingredient-protein',
                    'Fat': 'edit-ingredient-fats',
                    'Carbs': 'edit-ingredient-carbs',
                    'Fiber': 'edit-ingredient-fiber',
                    'Calcium': 'edit-ingredient-calcium',
                    'Iron': 'edit-ingredient-iron',
                    'Vit.A': 'edit-ingredient-vitamin-a',
                    'Vitamin A': 'edit-ingredient-vitamin-a',
                    'Vit.C': 'edit-ingredient-vitamin-c',
                    'Vitamin C': 'edit-ingredient-vitamin-c',
                    'Vit.D': 'edit-ingredient-vitamin-d',
                    'Vitamin D': 'edit-ingredient-vitamin-d',
                    'B12 (Cobalamin)': 'edit-ingredient-vitamin-b12',
                    'Folate': 'edit-ingredient-folate',
                    'Potassium': 'edit-ingredient-potassium',
                    'Sodium': 'edit-ingredient-sodium',
                    'Magnesium': 'edit-ingredient-magnesium',
                    'Zinc': 'edit-ingredient-zinc'
                };

                const fieldId = fieldMapping[nutrient];
                if (fieldId) {
                    data[fieldId] = numericValue;
                    foundCount++;
                    console.log('[Simple Cronometer Parser] ✓ Mapped', nutrient, 'to', fieldId, '=', numericValue);
                } else {
                    console.log('[Simple Cronometer Parser] ✗ No mapping for:', nutrient);
                }
            }
        }

        console.log('[Simple Cronometer Parser] Found', foundCount, 'mappable nutrients');

        // Update form fields
        let updatedCount = 0;
        for (const [fieldId, value] of Object.entries(data)) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
                updatedCount++;
                console.log('[Simple Cronometer Parser] Updated', fieldId, '=', value);
            } else {
                console.log('[Simple Cronometer Parser] Field not found:', fieldId);
            }
        }

        console.log('[Simple Cronometer Parser] Updated', updatedCount, 'fields');
        
        if (updatedCount > 0) {
            // Show success message
            const statusElements = document.querySelectorAll('.status, .edit-ingredient-status');
            statusElements.forEach(el => {
                el.textContent = `Cronometer data parsed successfully! Updated ${updatedCount} fields.`;
                el.className = 'status success';
                el.style.color = '#4CAF50';
                el.style.marginTop = '10px';
            });
        }
    }

    // Add event listeners to Cronometer textareas
    function attachCronometerListeners() {
        const textareas = document.querySelectorAll('#edit-popup-cronometer-data, textarea[placeholder*="Cronometer"], textarea[placeholder*="cronometer"]');

        textareas.forEach(textarea => {
            if (textarea.dataset.cronometerListenerAttached) return;

            console.log('[Simple Cronometer Parser] Attaching listener to textarea:', textarea.id);

            // Make the textarea larger to accommodate Cronometer data
            textarea.style.minHeight = '200px';
            textarea.style.height = '200px';
            textarea.rows = 10;

            textarea.addEventListener('input', function() {
                const text = this.value.trim();
                if (text) {
                    parseCronometerData(text);
                }
            });

            textarea.addEventListener('paste', function() {
                setTimeout(() => {
                    const text = this.value.trim();
                    if (text) {
                        parseCronometerData(text);
                    }
                }, 100);
            });

            textarea.dataset.cronometerListenerAttached = 'true';
        });
    }

    // Initialize when DOM is ready
    function init() {
        console.log('[Simple Cronometer Parser] Initializing...');
        
        // Attach listeners to existing textareas
        attachCronometerListeners();
        
        // Watch for new textareas being added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    attachCronometerListeners();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('[Simple Cronometer Parser] Initialized successfully');
    }

    // Expose function globally
    window.parseCronometerData = parseCronometerData;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

console.log('[Simple Cronometer Parser] Script loaded successfully');
