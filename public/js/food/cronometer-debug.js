/**
 * Cronometer Debug
 * 
 * This script adds a debug button to the Cronometer parser to help diagnose issues
 * with micronutrient data not being saved to the database.
 */

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        initCronometerDebug();
    });

    /**
     * Initialize the Cronometer debug
     */
    function initCronometerDebug() {
        console.log('[Cronometer Debug] Initializing...');

        addDebugButtonsToCronometerParsers();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const cronometerParsers = node.querySelectorAll('.cronometer-text-paste-container');
                            if (cronometerParsers.length > 0) {

                                cronometerParsers.forEach(function(parser) {
                                    addDebugButtonToCronometerParser(parser);
                                });
                            }

                            if (node.querySelector('.cronometer-text-paste-container')) {

                                const parsers = node.querySelectorAll('.cronometer-text-paste-container');
                                parsers.forEach(function(parser) {
                                    addDebugButtonToCronometerParser(parser);
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        console.log('[Cronometer Debug] Initialized');
    }

    /**
     * Add debug buttons to all Cronometer parsers
     */
    function addDebugButtonsToCronometerParsers() {
        console.log('[Cronometer Debug] Adding debug buttons to Cronometer parsers');

        const cronometerParsers = document.querySelectorAll('.cronometer-text-paste-container');

        cronometerParsers.forEach(function(parser) {
            addDebugButtonToCronometerParser(parser);
        });
    }

    /**
     * Add a debug button to a Cronometer parser
     * @param {HTMLElement} parser - The Cronometer parser element
     */
    function addDebugButtonToCronometerParser(parser) {

        if (parser.querySelector('.cronometer-debug-button')) {
            return;
        }

        console.log('[Cronometer Debug] Adding debug button to Cronometer parser:', parser);

        const debugButton = document.createElement('button');
        debugButton.type = 'button';
        debugButton.className = 'cronometer-debug-button';
        debugButton.textContent = 'Debug Nutrition Data';
        debugButton.style.backgroundColor = '#333';
        debugButton.style.color = '#fff';
        debugButton.style.border = '1px solid #555';
        debugButton.style.padding = '5px 10px';
        debugButton.style.marginTop = '5px';
        debugButton.style.cursor = 'pointer';
        debugButton.style.fontSize = '12px';

        debugButton.addEventListener('click', function() {
            debugCronometerParser(parser);
        });

        parser.appendChild(debugButton);
    }

    /**
     * Debug a Cronometer parser
     * @param {HTMLElement} parser - The Cronometer parser element
     */
    function debugCronometerParser(parser) {
        console.log('[Cronometer Debug] Debugging Cronometer parser:', parser);

        const ingredientItem = parser.closest('.ingredient-item');
        if (!ingredientItem) {
            console.warn('[Cronometer Debug] No ingredient item found');
            alert('No ingredient item found');
            return;
        }

        const completeNutritionData = ingredientItem.dataset.completeNutritionData;
        if (!completeNutritionData) {
            console.warn('[Cronometer Debug] No complete nutrition data found');
            alert('No complete nutrition data found. Please parse Cronometer data first.');
            return;
        }

        const nutritionData = JSON.parse(completeNutritionData);

        const dbFormatData = ingredientItem.dataset.dbFormatNutritionData
            ? JSON.parse(ingredientItem.dataset.dbFormatNutritionData)
            : window.NutritionFieldMapper
                ? window.NutritionFieldMapper.toDbFormat(nutritionData)
                : {};

        const debugPanel = document.createElement('div');
        debugPanel.className = 'cronometer-debug-panel';
        debugPanel.style.backgroundColor = '#222';
        debugPanel.style.color = '#fff';
        debugPanel.style.padding = '10px';
        debugPanel.style.marginTop = '10px';
        debugPanel.style.border = '1px solid #444';
        debugPanel.style.maxHeight = '300px';
        debugPanel.style.overflowY = 'auto';
        debugPanel.style.fontSize = '12px';
        debugPanel.style.fontFamily = 'monospace';

        debugPanel.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #00ff00;">Cronometer Debug Information</h4>
            <p><strong>Complete Nutrition Data:</strong></p>
            <pre style="margin: 0 0 10px 0; white-space: pre-wrap;">${JSON.stringify(nutritionData, null, 2)}</pre>
            <p><strong>Database Format Data:</strong></p>
            <pre style="margin: 0 0 10px 0; white-space: pre-wrap;">${JSON.stringify(dbFormatData, null, 2)}</pre>
            <p><strong>Hidden Fields:</strong></p>
            <ul style="margin: 0 0 10px 0; padding-left: 20px;">
                ${getHiddenFieldsHTML(ingredientItem)}
            </ul>
            <p><strong>Detailed Nutrition Fields:</strong></p>
            <ul style="margin: 0 0 10px 0; padding-left: 20px;">
                ${getDetailedNutritionFieldsHTML(ingredientItem)}
            </ul>
        `;

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = 'Close';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = '#fff';
        closeButton.style.border = '1px solid #555';
        closeButton.style.padding = '5px 10px';
        closeButton.style.marginTop = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '12px';

        closeButton.addEventListener('click', function() {
            debugPanel.remove();
        });

        debugPanel.appendChild(closeButton);

        parser.appendChild(debugPanel);
    }

    /**
     * Get HTML for hidden fields
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @returns {string} - HTML string
     */
    function getHiddenFieldsHTML(ingredientItem) {

        const hiddenFields = ingredientItem.querySelectorAll('input[type="hidden"]');

        let html = '';
        hiddenFields.forEach(function(field) {
            html += `<li><strong>${field.className}:</strong> ${field.value}</li>`;
        });

        return html || '<li>No hidden fields found</li>';
    }

    /**
     * Get HTML for detailed nutrition fields
     * @param {HTMLElement} ingredientItem - The ingredient item element
     * @returns {string} - HTML string
     */
    function getDetailedNutritionFieldsHTML(ingredientItem) {

        const detailedNutritionPanel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (!detailedNutritionPanel) {
            return '<li>No detailed nutrition panel found</li>';
        }

        const inputFields = detailedNutritionPanel.querySelectorAll('input');

        let html = '';
        inputFields.forEach(function(field) {
            html += `<li><strong>${field.id || field.className}:</strong> ${field.value}</li>`;
        });

        return html || '<li>No detailed nutrition fields found</li>';
    }
})();
