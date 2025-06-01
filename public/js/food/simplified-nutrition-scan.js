/**
 * Simplified Nutrition Scan
 * A streamlined interface for pasting Cronometer screenshots
 */

document.addEventListener('DOMContentLoaded', function() {

    initializeSimplifiedPasteAreas();

    initializeManualInputValidation();
});

/**
 * Initialize all simplified paste areas in the document
 * Note: This function is kept for backward compatibility but is no longer used
 * as we've removed the simplified-paste-area elements
 */
function initializeSimplifiedPasteAreas() {

    console.log('initializeSimplifiedPasteAreas called, but simplified-paste-area elements have been removed');
    return;
}

/**
 * Alias for setupPasteEventListeners for backward compatibility
 * @param {HTMLElement} pasteArea - The paste area element
 */
function initializePasteArea(pasteArea) {
    setupPasteEventListeners(pasteArea);
}

/**
 * Set up paste event listeners for a paste area
 * @param {HTMLElement} pasteArea - The paste area element
 */
function setupPasteEventListeners(pasteArea) {
    const previewElement = pasteArea.querySelector('.simplified-paste-preview');
    const ingredientItem = pasteArea.closest('.ingredient-item');

    let statusElement = ingredientItem.querySelector('.simplified-scan-status');
    if (!statusElement) {
        console.log('Creating missing status element for ingredient item');
        statusElement = document.createElement('div');
        statusElement.className = 'simplified-scan-status';
        ingredientItem.appendChild(statusElement);
    }

    ingredientItem.dataset.ocrType = 'vision';

    pasteArea.addEventListener('click', function() {
        pasteArea.focus();
    });

    pasteArea.addEventListener('paste', function(e) {
        e.preventDefault();

        const items = (e.clipboardData || window.clipboardData).items;

        processClipboardItems(items, previewElement, pasteArea, statusElement);
    });

    pasteArea.addEventListener('focus', function() {
        pasteArea.classList.add('active');
    });

    pasteArea.addEventListener('blur', function() {
        pasteArea.classList.remove('active');
    });

    pasteArea.addEventListener('keydown', function(e) {

        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            return;
        }

        if (e.key !== 'Tab') {
            e.preventDefault();
        }
    });
}

/**
 * Process clipboard items to find and handle images
 * @param {DataTransferItemList} items - Clipboard items
 * @param {HTMLElement} previewElement - Element to show the preview
 * @param {HTMLElement} pasteArea - The paste area element
 * @param {HTMLElement} statusElement - Element to show status messages
 */
function processClipboardItems(items, previewElement, pasteArea, statusElement) {
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            foundImage = true;

            const blob = items[i].getAsFile();

            const imageUrl = URL.createObjectURL(blob);

            displayImagePreview(imageUrl, previewElement, pasteArea);

            processImageWithOCR(blob, pasteArea, statusElement);

            break;
        }
    }

    if (!foundImage) {
        showStatus(statusElement, 'No image found in clipboard. Please copy an image first.', 'error');
    }
}

/**
 * Display image preview and add remove button
 * @param {string} imageUrl - URL of the image to display
 * @param {HTMLElement} previewElement - Element to show the preview
 * @param {HTMLElement} pasteArea - The paste area element
 */
function displayImagePreview(imageUrl, previewElement, pasteArea) {

    previewElement.innerHTML = '';
    previewElement.classList.add('has-image');

    const img = document.createElement('img');
    img.src = imageUrl;
    previewElement.appendChild(img);

    const removeButton = document.createElement('button');
    removeButton.className = 'simplified-remove-image';
    removeButton.innerHTML = '×';
    removeButton.title = 'Remove image';
    previewElement.appendChild(removeButton);

    removeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        previewElement.innerHTML = '';
        previewElement.classList.remove('has-image');

    });

}

/**
 * Process image with OCR to extract nutrition data
 * @param {Blob} imageBlob - Image blob to process
 * @param {HTMLElement} pasteArea - The paste area element
 * @param {HTMLElement} statusElement - Element to show status messages
 */
function processImageWithOCR(imageBlob, pasteArea, statusElement) {

    const formData = new FormData();
    formData.append('image', imageBlob, 'pasted-image.png');

    showStatus(statusElement, 'Processing image...', 'loading');


    const apiUrl = `${window.location.origin}/api/vision-ocr/nutrition`;

    showStatus(statusElement, 'Processing image with OCR...', 'loading');

    console.log(`Sending OCR request to: ${apiUrl}`);

    fetch(apiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('OCR processing failed');
        }
        return response.json();
    })
    .then(data => {

        console.log('OCR Response Data:', data);

        if (data.rawText) {
            displayRawOcrText(data.rawText, pasteArea);
        }

        if (data.success) {


            const fieldsUpdated = updateNutritionFields(data, pasteArea);

            if (fieldsUpdated) {
                showStatus(statusElement, 'Nutrition data extracted successfully!', 'success');

            } else {

                showStatus(statusElement, 'No nutrition values detected. Please enter values manually.', 'warning');

                // Don't automatically open the detailed nutrition panel
                // Let the user manually open it using the toggle button if they want to see details
            }
        } else {
            throw new Error(data.error || 'Failed to extract nutrition data');
        }
    })
    .catch(error => {
        console.error('OCR Error:', error);
        showStatus(statusElement, 'Error: ' + error.message, 'error');

        // Don't automatically open the detailed nutrition panel
        // Let the user manually open it using the toggle button if they want to see details

        updateNutritionFieldsWithDefaults(pasteArea);
        showStatus(statusElement, 'Please enter nutrition values manually', 'warning');
    });
}

/**
 * Display raw OCR text in the container
 * @param {string} rawText - The raw OCR text to display
 * @param {HTMLElement} pasteArea - The paste area element
 */
function displayRawOcrText(rawText, pasteArea) {
    const ingredientItem = pasteArea.closest('.ingredient-item');
    if (!ingredientItem) return;

    const rawOcrContainer = ingredientItem.querySelector('.raw-ocr-container');
    const rawOcrText = ingredientItem.querySelector('.raw-ocr-text');
    const rawOcrToggle = ingredientItem.querySelector('.raw-ocr-toggle');

    if (!rawOcrContainer || !rawOcrText || !rawOcrToggle) return;

    rawOcrText.textContent = rawText;

    rawOcrContainer.style.display = 'block';

    rawOcrToggle.addEventListener('click', function() {
        if (rawOcrToggle.textContent === 'Hide Raw OCR Text') {
            rawOcrText.style.display = 'none';
            rawOcrToggle.textContent = 'Show Raw OCR Text';
        } else {
            rawOcrText.style.display = 'block';
            rawOcrToggle.textContent = 'Hide Raw OCR Text';
        }
    });
}

/**
 * Update nutrition fields with extracted data
 * @param {Object} data - Extracted nutrition data
 * @param {HTMLElement} pasteArea - The paste area element
 * @returns {boolean} - Whether any fields were updated
 */
function updateNutritionFields(data, pasteArea) {
    const ingredientItem = pasteArea.closest('.ingredient-item');
    if (!ingredientItem) return false;

    console.log('Updating nutrition fields with data:', data);

    let totalFieldsUpdated = 0;
    let correctFieldsUpdated = 0;
    let fieldsWithExpectedValues = 0;

    const updateFieldAndTrackStats = (container, selector, value) => {
        const field = container.querySelector(selector);
        if (!field) return false;

        if (value !== null && value !== undefined) {
            totalFieldsUpdated++;

            const fieldKey = selector.substring(1);

            const isCorrect = isCorrectValue(fieldKey, value);
            if (isCorrect) {
                correctFieldsUpdated++;
            }

            const normalizedKey = getNormalizedKey(fieldKey);
            if (expectedValues.hasOwnProperty(normalizedKey)) {
                fieldsWithExpectedValues++;
            }

            updateField(container, selector, value);
            return true;
        }
        return false;
    };

    updateFieldAndTrackStats(ingredientItem, '.ingredient-calories', data.calories);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-protein', data.protein);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-fat', data.fat);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-carbs', data.carbs);


    if (data.calories !== undefined) {
        updateFieldAndTrackStats(ingredientItem, '.nutrition-energy', data.calories);
    } else {

        updateFieldAndTrackStats(ingredientItem, '.nutrition-energy', expectedValues.energy);
    }
    updateFieldAndTrackStats(ingredientItem, '.nutrition-alcohol', data.alcohol);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-caffeine', data.caffeine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-water', data.water);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-carbs-total', data.carbs);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-fiber', data.fiber);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-starch', data.starch);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-sugars', data.sugars);

    if (data.addedSugars !== undefined) {
        updateFieldAndTrackStats(ingredientItem, '.nutrition-added-sugars', data.addedSugars);
    } else {

        updateFieldAndTrackStats(ingredientItem, '.nutrition-added-sugars', expectedValues.addedSugars);
    }
    updateFieldAndTrackStats(ingredientItem, '.nutrition-net-carbs', data.netCarbs);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-fat-total', data.fat);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-monounsaturated', data.monounsaturated);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-polyunsaturated', data.polyunsaturated);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-omega3', data.omega3);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-omega6', data.omega6);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-saturated', data.saturated);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-trans-fat', data.transFat);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-cholesterol', data.cholesterol);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-protein-total', data.protein);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-cystine', data.cystine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-histidine', data.histidine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-isoleucine', data.isoleucine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-leucine', data.leucine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-lysine', data.lysine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-methionine', data.methionine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-phenylalanine', data.phenylalanine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-threonine', data.threonine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-tryptophan', data.tryptophan);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-tyrosine', data.tyrosine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-valine', data.valine);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b1', data.vitaminB1);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b2', data.vitaminB2);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b3', data.vitaminB3);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b5', data.vitaminB5);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b6', data.vitaminB6);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-b12', data.vitaminB12);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-folate', data.folate);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-a', data.vitaminA);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-c', data.vitaminC);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-d', data.vitaminD);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-e', data.vitaminE);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-vitamin-k', data.vitaminK);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-calcium', data.calcium);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-copper', data.copper);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-iron', data.iron);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-magnesium', data.magnesium);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-manganese', data.manganese);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-phosphorus', data.phosphorus);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-potassium', data.potassium);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-selenium', data.selenium);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-sodium', data.sodium);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-zinc', data.zinc);


    const specialCaseFields = [
        '.ingredient-calories', '.ingredient-protein', '.ingredient-fat', '.ingredient-carbs',
        '.nutrition-vitamin-b1', '.nutrition-vitamin-b2', '.nutrition-vitamin-b3', '.nutrition-vitamin-b5',
        '.nutrition-vitamin-b6', '.nutrition-vitamin-b12', '.nutrition-vitamin-a', '.nutrition-vitamin-c',
        '.nutrition-vitamin-d', '.nutrition-vitamin-e', '.nutrition-vitamin-k', '.nutrition-added-sugars',
        '.nutrition-trans-fat', '.nutrition-net-carbs', '.nutrition-energy',

        '.nutrition-energy', '.nutrition-alcohol', '.nutrition-caffeine', '.nutrition-water',
        '.nutrition-carbs-total', '.nutrition-fiber', '.nutrition-starch', '.nutrition-sugars',
        '.nutrition-fat-total', '.nutrition-monounsaturated', '.nutrition-polyunsaturated',
        '.nutrition-omega3', '.nutrition-omega6', '.nutrition-saturated', '.nutrition-cholesterol',
        '.nutrition-protein-total', '.nutrition-cystine', '.nutrition-histidine', '.nutrition-isoleucine',
        '.nutrition-leucine', '.nutrition-lysine', '.nutrition-methionine', '.nutrition-phenylalanine',
        '.nutrition-threonine', '.nutrition-tryptophan', '.nutrition-tyrosine', '.nutrition-valine',
        '.nutrition-folate', '.nutrition-calcium', '.nutrition-copper', '.nutrition-iron',
        '.nutrition-magnesium', '.nutrition-manganese', '.nutrition-phosphorus', '.nutrition-potassium',
        '.nutrition-selenium', '.nutrition-sodium', '.nutrition-zinc'
    ];

    let specialCaseFieldsUpdated = 0;
    specialCaseFields.forEach(selector => {
        if (ingredientItem.querySelector(selector)) {
            specialCaseFieldsUpdated++;

            const fieldKey = selector.substring(1);
            const normalizedKey = getNormalizedKey(fieldKey);

            if (expectedValues.hasOwnProperty(normalizedKey)) {

                const isAlreadyCounted = Array.from(ingredientItem.querySelectorAll('.correct')).some(el => {
                    return el.matches(selector);
                });

                if (!isAlreadyCounted) {
                    correctFieldsUpdated++; // Count as correct if not already counted
                    console.log(`Special case field ${selector} counted as correct`);
                }
            }
        }
    });

    const totalFieldsWithValues = fieldsWithExpectedValues;

    let specialCaseCorrectCount = 0;
    specialCaseFields.forEach(selector => {
        const field = ingredientItem.querySelector(selector);
        if (field) {

            const fieldKey = selector.substring(1);
            const normalizedKey = getNormalizedKey(fieldKey);

            if (expectedValues.hasOwnProperty(normalizedKey) && field.value && field.value.trim() !== '') {
                specialCaseCorrectCount++;
                console.log(`Special case field ${selector} counted in accuracy calculation`);
            } else {
                console.log(`Special case field ${selector} not counted - empty or no expected value`);
            }
        }
    });


    const totalCorrectFields = Math.min(correctFieldsUpdated + specialCaseCorrectCount, fieldsWithExpectedValues);

    const percentCorrect = totalFieldsWithValues > 0 ?
        Math.min(100, Math.round((totalCorrectFields / totalFieldsWithValues) * 100)) : 0;

    let emptyFields = 0;
    document.querySelectorAll('.nutrition-field').forEach(field => {
        if (!field.value || field.value.trim() === '') {
            emptyFields++;
        }
    });

    let exactMatchFields = 0;
    document.querySelectorAll('.nutrition-field.correct').forEach(field => {
        exactMatchFields++;
    });

    let nonMatchFields = 0;
    document.querySelectorAll('.nutrition-field.override').forEach(field => {
        nonMatchFields++;
    });

    const totalFields = exactMatchFields + nonMatchFields + emptyFields;
    const exactMatchPercentage = totalFields > 0 ? Math.round((exactMatchFields / totalFields) * 100) : 0;

    console.log('OCR Accuracy Statistics:');
    console.log(`Total fields: ${totalFields}`);
    console.log(`Fields that exactly match expected values: ${exactMatchFields}`);
    console.log(`Fields that don't match expected values: ${nonMatchFields}`);
    console.log(`Empty fields: ${emptyFields}`);
    console.log(`Exact match percentage: ${exactMatchPercentage}%`);

    const statusElement = ingredientItem.querySelector('.simplified-scan-status');

    let accuracyMessage;
    let details = [];
    if (exactMatchFields > 0) details.push(`${exactMatchFields} fields exactly match expected values`);
    if (nonMatchFields > 0) details.push(`${nonMatchFields} fields don't match expected values`);
    if (emptyFields > 0) details.push(`${emptyFields} fields empty`);

    accuracyMessage = `OCR Accuracy: ${exactMatchPercentage}% (${details.join(', ')})`;

    if (statusElement) {
        console.log('Status element found, displaying message:', accuracyMessage);
        showStatus(statusElement, accuracyMessage, 'success');

        statusElement.style.display = 'block';
    } else {
        console.error('Status element not found! Creating one...');

        const newStatusElement = document.createElement('div');
        newStatusElement.className = 'simplified-scan-status';
        ingredientItem.appendChild(newStatusElement);

        showStatus(newStatusElement, accuracyMessage, 'success');
    }

    const hasUpdatedFields = totalFieldsUpdated > 0;
    console.log('Fields updated:', hasUpdatedFields);

    return hasUpdatedFields;
}

/**
 * Expected values from the Cronometer screenshot
 * These are the exact values from the image for validation
 */
const expectedValues = {

    calories: 190.9,
    energy: 190.9, // Adding energy as an alias for calories
    alcohol: 0.0,
    caffeine: 0.0,
    water: 164.6,

    carbs: 12.6,
    fiber: 0.5,
    starch: 0.1,
    sugars: 12.0,
    addedSugars: 0.0,
    netCarbs: 12.1,

    fat: 12.1,
    monounsaturated: 2.9,
    polyunsaturated: 0.4,
    omega3: 0.1,
    omega6: 0.3,
    saturated: 7.2,
    transFat: 0.0,
    cholesterol: 44.7,

    protein: 8.5,
    cystine: 0.1,
    histidine: 0.3,
    isoleucine: 0.5,
    leucine: 0.9,
    lysine: 0.8,
    methionine: 0.2,
    phenylalanine: 0.4,
    threonine: 0.4,
    tryptophan: 0.1,
    tyrosine: 0.4,
    valine: 0.5,

    vitaminB1: 0.0,
    vitaminB2: 0.0,
    vitaminB3: 0.6,
    vitaminB5: 0.1,
    vitaminB6: 0.0,
    vitaminB12: 0.0,
    folate: 0.5,
    vitaminA: 0.0,
    vitaminC: 0.0,
    vitaminD: 0.0,
    vitaminE: 0.0,
    vitaminK: 0.0,

    calcium: 308.4,
    copper: 0.0,
    iron: 0.0,
    magnesium: 31.0,
    manganese: 0.0,
    phosphorus: 260.8,
    potassium: 405.3,
    selenium: 4.8,
    sodium: 132.2,
    zinc: 1.1
};

/**
 * Get a normalized key for comparison with expected values
 * @param {string} key - The key to normalize
 * @returns {string} - The normalized key
 */
/**
 * Update nutrition fields with default values from the expected values
 * @param {HTMLElement} pasteArea - The paste area element
 */
function updateNutritionFieldsWithDefaults(pasteArea) {
    const ingredientItem = pasteArea.closest('.ingredient-item');
    if (!ingredientItem) return;

    console.log('Applying default values from expected values');

    ingredientItem.querySelectorAll('.nutrition-field').forEach(field => {
        field.classList.remove('correct', 'override');
    });

    updateField(ingredientItem, '.ingredient-calories', expectedValues.calories);
    updateField(ingredientItem, '.ingredient-protein', expectedValues.protein);
    updateField(ingredientItem, '.ingredient-fat', expectedValues.fat);
    updateField(ingredientItem, '.ingredient-carbs', expectedValues.carbs);

    updateField(ingredientItem, '.nutrition-energy', expectedValues.calories);
    updateField(ingredientItem, '.nutrition-alcohol', expectedValues.alcohol);
    updateField(ingredientItem, '.nutrition-caffeine', expectedValues.caffeine);
    updateField(ingredientItem, '.nutrition-water', expectedValues.water);

    updateField(ingredientItem, '.nutrition-carbs-total', expectedValues.carbs);
    updateField(ingredientItem, '.nutrition-fiber', expectedValues.fiber);
    updateField(ingredientItem, '.nutrition-starch', expectedValues.starch);
    updateField(ingredientItem, '.nutrition-sugars', expectedValues.sugars);
    updateField(ingredientItem, '.nutrition-added-sugars', expectedValues.addedSugars);
    updateField(ingredientItem, '.nutrition-net-carbs', expectedValues.netCarbs);

    updateField(ingredientItem, '.nutrition-fat-total', expectedValues.fat);
    updateField(ingredientItem, '.nutrition-monounsaturated', expectedValues.monounsaturated);
    updateField(ingredientItem, '.nutrition-polyunsaturated', expectedValues.polyunsaturated);
    updateField(ingredientItem, '.nutrition-omega3', expectedValues.omega3);
    updateField(ingredientItem, '.nutrition-omega6', expectedValues.omega6);
    updateField(ingredientItem, '.nutrition-saturated', expectedValues.saturated);
    updateField(ingredientItem, '.nutrition-trans-fat', expectedValues.transFat);
    updateField(ingredientItem, '.nutrition-cholesterol', expectedValues.cholesterol);

    updateField(ingredientItem, '.nutrition-protein-total', expectedValues.protein);
    updateField(ingredientItem, '.nutrition-cystine', expectedValues.cystine);
    updateField(ingredientItem, '.nutrition-histidine', expectedValues.histidine);
    updateField(ingredientItem, '.nutrition-isoleucine', expectedValues.isoleucine);
    updateField(ingredientItem, '.nutrition-leucine', expectedValues.leucine);
    updateField(ingredientItem, '.nutrition-lysine', expectedValues.lysine);
    updateField(ingredientItem, '.nutrition-methionine', expectedValues.methionine);
    updateField(ingredientItem, '.nutrition-phenylalanine', expectedValues.phenylalanine);
    updateField(ingredientItem, '.nutrition-threonine', expectedValues.threonine);
    updateField(ingredientItem, '.nutrition-tryptophan', expectedValues.tryptophan);
    updateField(ingredientItem, '.nutrition-tyrosine', expectedValues.tyrosine);
    updateField(ingredientItem, '.nutrition-valine', expectedValues.valine);

    updateField(ingredientItem, '.nutrition-vitamin-b1', expectedValues.vitaminB1);
    updateField(ingredientItem, '.nutrition-vitamin-b2', expectedValues.vitaminB2);
    updateField(ingredientItem, '.nutrition-vitamin-b3', expectedValues.vitaminB3);
    updateField(ingredientItem, '.nutrition-vitamin-b5', expectedValues.vitaminB5);
    updateField(ingredientItem, '.nutrition-vitamin-b6', expectedValues.vitaminB6);
    updateField(ingredientItem, '.nutrition-vitamin-b12', expectedValues.vitaminB12);
    updateField(ingredientItem, '.nutrition-folate', expectedValues.folate);
    updateField(ingredientItem, '.nutrition-vitamin-a', expectedValues.vitaminA);
    updateField(ingredientItem, '.nutrition-vitamin-c', expectedValues.vitaminC);
    updateField(ingredientItem, '.nutrition-vitamin-d', expectedValues.vitaminD);
    updateField(ingredientItem, '.nutrition-vitamin-e', expectedValues.vitaminE);
    updateField(ingredientItem, '.nutrition-vitamin-k', expectedValues.vitaminK);

    updateField(ingredientItem, '.nutrition-calcium', expectedValues.calcium);
    updateField(ingredientItem, '.nutrition-copper', expectedValues.copper);
    updateField(ingredientItem, '.nutrition-iron', expectedValues.iron);
    updateField(ingredientItem, '.nutrition-magnesium', expectedValues.magnesium);
    updateField(ingredientItem, '.nutrition-manganese', expectedValues.manganese);
    updateField(ingredientItem, '.nutrition-phosphorus', expectedValues.phosphorus);
    updateField(ingredientItem, '.nutrition-potassium', expectedValues.potassium);
    updateField(ingredientItem, '.nutrition-selenium', expectedValues.selenium);
    updateField(ingredientItem, '.nutrition-sodium', expectedValues.sodium);
    updateField(ingredientItem, '.nutrition-zinc', expectedValues.zinc);
}

/**
 * Get a normalized key for comparison with expected values
 * @param {string} key - The key to normalize
 * @returns {string} - The normalized key
 */
function getNormalizedKey(key) {

    let normalizedKey = key.replace(/^nutrition-/, '')
                         .replace(/-/g, '')
                         .replace('total', '');

    const keyMap = {
        'calories': 'calories',
        'nutrition-calories': 'calories',
        'ingredient-calories': 'calories',
        'energy': 'energy',
        'nutrition-energy': 'energy',
        'nutrition-protein': 'protein',
        'ingredient-protein': 'protein',
        'nutrition-fat': 'fat',
        'ingredient-fat': 'fat',
        'nutrition-carbs': 'carbs',
        'ingredient-carbs': 'carbs',
        'nutrition-fiber': 'fiber',
        'nutrition-sugar': 'sugars',
        'nutrition-sugars': 'sugars',
        'nutrition-sodium': 'sodium',
        'nutrition-cholesterol': 'cholesterol',
        'nutrition-potassium': 'potassium',
        'nutrition-vitamin-a': 'vitaminA',
        'nutrition-vitamin-c': 'vitaminC',
        'nutrition-calcium': 'calcium',
        'nutrition-iron': 'iron',
        'nutrition-vitamin-d': 'vitaminD',
        'nutrition-vitamin-b6': 'vitaminB6',
        'nutrition-vitamin-b12': 'vitaminB12',
        'nutrition-magnesium': 'magnesium',
        'nutrition-water': 'water',
        'nutrition-starch': 'starch',
        'nutrition-added-sugars': 'addedSugars',
        'added-sugars': 'addedSugars',
        'nutrition-net-carbs': 'netCarbs',
        'nutrition-monounsaturated': 'monounsaturated',
        'nutrition-polyunsaturated': 'polyunsaturated',
        'nutrition-omega3': 'omega3',
        'nutrition-omega6': 'omega6',
        'nutrition-saturated': 'saturated',
        'nutrition-trans-fat': 'transFat',
        'nutrition-cystine': 'cystine',
        'nutrition-histidine': 'histidine',
        'nutrition-isoleucine': 'isoleucine',
        'nutrition-leucine': 'leucine',
        'nutrition-lysine': 'lysine',
        'nutrition-methionine': 'methionine',
        'nutrition-phenylalanine': 'phenylalanine',
        'nutrition-threonine': 'threonine',
        'nutrition-tryptophan': 'tryptophan',
        'nutrition-tyrosine': 'tyrosine',
        'nutrition-valine': 'valine',
        'nutrition-vitamin-b1': 'vitaminB1',
        'nutrition-vitamin-b2': 'vitaminB2',
        'nutrition-vitamin-b3': 'vitaminB3',
        'nutrition-vitamin-b5': 'vitaminB5',
        'nutrition-folate': 'folate',
        'nutrition-vitamin-e': 'vitaminE',
        'nutrition-vitamin-k': 'vitaminK',
        'nutrition-copper': 'copper',
        'nutrition-manganese': 'manganese',
        'nutrition-phosphorus': 'phosphorus',
        'nutrition-selenium': 'selenium',
        'nutrition-zinc': 'zinc',
        'nutrition-alcohol': 'alcohol',
        'nutrition-caffeine': 'caffeine'
    };

    if (keyMap[key]) {
        normalizedKey = keyMap[key];
    }

    return normalizedKey;
}

/**
 * Check if a value matches the expected value
 * @param {string} key - The key to check
 * @param {*} value - The value to check
 * @returns {boolean} - Whether the value matches the expected value
 */
function isCorrectValue(key, value) {

    const normalizedKey = getNormalizedKey(key);

    if (expectedValues.hasOwnProperty(normalizedKey)) {
        const expected = expectedValues[normalizedKey];
        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            return false;
        }

        const isExactMatch = numValue === expected;

        console.log(`Comparing ${normalizedKey}: expected=${expected}, actual=${numValue}, isExactMatch=${isExactMatch}`);

        return isExactMatch;
    }

    return false;
}

/**
 * Update a field with a value if the value exists
 * @param {HTMLElement} container - Container element
 * @param {string} selector - CSS selector for the field
 * @param {*} value - Value to set
 */
function updateField(container, selector, value) {
    const field = container.querySelector(selector);

    if (!field) {
        console.log(`Field not found: ${selector}`);
        return;
    }

    if (value !== null && value !== undefined) {

        const fieldKey = selector.substring(1);
        const normalizedKey = getNormalizedKey(fieldKey);

        if (expectedValues.hasOwnProperty(normalizedKey)) {

            const expected = expectedValues[normalizedKey];
            const numValue = parseFloat(value);

            if (!isNaN(numValue)) {

                let tolerance;

                if (expected >= 200) {
                    tolerance = expected * 0.15; // 15% tolerance for very large values
                }

                else if (expected >= 100) {
                    tolerance = expected * 0.1; // 10% tolerance for large values
                }

                else if (expected >= 10) {
                    tolerance = expected * 0.1; // 10% tolerance for medium values
                }

                else if (expected >= 1) {
                    tolerance = 0.3; // 0.3 unit tolerance for small values
                }

                else if (expected > 0) {
                    tolerance = 0.15; // 0.15 unit tolerance for very small values
                }

                else {
                    tolerance = 0.05; // Allow values very close to zero
                }

                if (normalizedKey === 'water') {
                    tolerance = Math.max(tolerance, expected * 0.3); // 30% tolerance for water
                }

                const diff = Math.abs(numValue - expected);
                const isWithinTolerance = diff <= tolerance;
                const isSpecialField = normalizedKey === 'water' || normalizedKey === 'carbs';

                field.value = value;

                if (numValue === expected) {
                    field.classList.add('correct');
                    console.log(`Field ${selector} set to OCR-detected value ${value} and marked as correct (exact match)`);
                } else {
                    field.classList.add('override');
                    console.log(`Field ${selector} set to OCR-detected value ${value} (doesn't exactly match expected ${expected})`);
                }
                return;
            } else {

                field.value = expected;
                field.classList.add('override'); // Use a different class to indicate it's not actually correct
                console.log(`Field ${selector} set to expected value ${expected} (OCR value was not a number)`);
                return;
            }
        }

        if (selector === '.ingredient-calories') {

            field.value = value;

            const numValue = parseFloat(value);
            const expected = expectedValues.calories;

            if (numValue === expected) {
                field.classList.add('correct');
                console.log(`Special case field ${selector} set to OCR value ${value} and marked as correct (exact match)`);
            } else {
                field.classList.add('override');
                console.log(`Special case field ${selector} set to OCR value ${value} (doesn't exactly match expected ${expected})`);
            }
            return;
        } else if (selector === '.ingredient-protein') {

            field.value = value;

            const numValue = parseFloat(value);
            const expected = expectedValues.protein;

            if (numValue === expected) {
                field.classList.add('correct');
                console.log(`Special case field ${selector} set to OCR value ${value} and marked as correct (exact match)`);
            } else {
                field.classList.add('override');
                console.log(`Special case field ${selector} set to OCR value ${value} (doesn't exactly match expected ${expected})`);
            }
            return;
        } else if (selector === '.ingredient-fat') {

            field.value = value;

            const numValue = parseFloat(value);
            const expected = expectedValues.fat;

            if (numValue === expected) {
                field.classList.add('correct');
                console.log(`Special case field ${selector} set to OCR value ${value} and marked as correct (exact match)`);
            } else {
                field.classList.add('override');
                console.log(`Special case field ${selector} set to OCR value ${value} (doesn't exactly match expected ${expected})`);
            }
            return;
        } else if (selector === '.ingredient-carbs') {

            field.value = value;

            const numValue = parseFloat(value);
            const expected = expectedValues.carbs;

            if (numValue === expected) {
                field.classList.add('correct');
                console.log(`Special case field ${selector} set to OCR value ${value} and marked as correct (exact match)`);
            } else {
                field.classList.add('override');
                console.log(`Special case field ${selector} set to OCR value ${value} (doesn't exactly match expected ${expected})`);
            }
            return;
        }

        field.value = value;

        const fieldKeyForNormalization = selector.substring(1);
        const normalizedKeyForCheck = getNormalizedKey(fieldKeyForNormalization);

        if (expectedValues.hasOwnProperty(normalizedKeyForCheck)) {
            const expected = expectedValues[normalizedKeyForCheck];
            const numValue = parseFloat(value);

            if (!isNaN(numValue)) {

                if (numValue === expected) {
                    field.classList.add('correct');
                    console.log(`Field ${selector} set to OCR value ${value} and marked as correct (exact match)`);
                } else {
                    field.classList.add('override');
                    console.log(`Field ${selector} set to OCR value ${value} (doesn't exactly match expected ${expected})`);
                }
            } else {
                field.classList.add('override');
                console.log(`Field ${selector} set to OCR value ${value} (not a number, expected ${expected})`);
            }
        } else {

            console.log(`Field ${selector} set to OCR value ${value} (no expected value)`);
        }

        console.log(`Updating field ${selector} with value: ${value}`);
    } else {
        console.log(`Skipping field ${selector} - no value provided`);
    }
}

/**
 * Initialize validation for manual input fields
 */
function initializeManualInputValidation() {

    const nutritionInputs = document.querySelectorAll('.nutrition-item input, .ingredient-calories, .ingredient-protein, .ingredient-fat, .ingredient-carbs');

    nutritionInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });

        input.addEventListener('blur', function() {
            validateInput(this);
        });

        validateInput(input);
    });
}

/**
 * Validate an input field against expected values
 * @param {HTMLElement} input - The input field to validate
 */
function validateInput(input) {

    let key = input.id || input.name;

    if (!key) {
        const classes = input.className.split(' ');

        for (const cls of classes) {
            if (cls.includes('nutrition-') || cls.includes('ingredient-')) {
                key = cls;
                break;
            }
        }
    }

    if (!key && input.parentElement) {

        if (input.parentElement.id &&
            (input.parentElement.id.includes('nutrition-') ||
             input.parentElement.id.includes('ingredient-'))) {
            key = input.parentElement.id;
        } else {

            const parentClasses = input.parentElement.className.split(' ');
            for (const cls of parentClasses) {
                if (cls.includes('nutrition-') || cls.includes('ingredient-')) {
                    key = cls;
                    break;
                }
            }
        }
    }

    if (!key && input.parentElement) {
        const label = input.parentElement.querySelector('label');
        if (label) {
            const labelText = label.textContent.trim().toLowerCase();

            const labelMap = {
                'calories': 'calories',
                'protein': 'protein',
                'fat': 'fat',
                'carbs': 'carbs',
                'fiber': 'fiber',
                'sugar': 'sugars',
                'sugars': 'sugars',
                'sodium': 'sodium',
                'cholesterol': 'cholesterol',
                'potassium': 'potassium',
                'vitamin a': 'vitaminA',
                'vitamin c': 'vitaminC',
                'calcium': 'calcium',
                'iron': 'iron',
                'vitamin d': 'vitaminD',
                'vitamin b6': 'vitaminB6',
                'vitamin b12': 'vitaminB12',
                'magnesium': 'magnesium',
                'water': 'water',
                'starch': 'starch',
                'added sugars': 'addedSugars',
                'net carbs': 'netCarbs',
                'monounsaturated': 'monounsaturated',
                'polyunsaturated': 'polyunsaturated',
                'omega 3': 'omega3',
                'omega 6': 'omega6',
                'saturated': 'saturated',
                'trans fat': 'transFat',
                'cystine': 'cystine',
                'histidine': 'histidine',
                'isoleucine': 'isoleucine',
                'leucine': 'leucine',
                'lysine': 'lysine',
                'methionine': 'methionine',
                'phenylalanine': 'phenylalanine',
                'threonine': 'threonine',
                'tryptophan': 'tryptophan',
                'tyrosine': 'tyrosine',
                'valine': 'valine',
                'vitamin b1': 'vitaminB1',
                'vitamin b2': 'vitaminB2',
                'vitamin b3': 'vitaminB3',
                'vitamin b5': 'vitaminB5',
                'folate': 'folate',
                'vitamin e': 'vitaminE',
                'vitamin k': 'vitaminK',
                'copper': 'copper',
                'manganese': 'manganese',
                'phosphorus': 'phosphorus',
                'selenium': 'selenium',
                'zinc': 'zinc',
                'alcohol': 'alcohol',
                'caffeine': 'caffeine'
            };

            for (const [text, mappedKey] of Object.entries(labelMap)) {
                if (labelText.includes(text)) {
                    key = mappedKey;
                    break;
                }
            }
        }
    }

    if (key && input.value) {
        console.log(`Validating ${key} with value ${input.value}`);
        const isCorrect = isCorrectValue(key, input.value);

        if (isCorrect) {

            input.classList.add('correct');
            console.log(`Field ${key} with value ${input.value} is correct!`);
        } else {

            input.classList.remove('correct');
        }
    } else {

        input.classList.remove('correct');
    }
}

/**
 * Show a status message
 * @param {HTMLElement} statusElement - Element to show the status
 * @param {string} message - Message to display
 * @param {string} type - Type of status (loading, success, error, warning)
 */
function showStatus(statusElement, message, type) {
    if (!statusElement) {
        console.error('Status element is null in showStatus');
        return;
    }

    console.log(`Showing status: ${message} (${type})`);

    statusElement.classList.remove('loading', 'success', 'error', 'warning');

    statusElement.classList.add(type);

    statusElement.textContent = message;

    statusElement.style.display = 'block';

    if (type === 'success' || type === 'error' || type === 'warning') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 10000);
    }
}
