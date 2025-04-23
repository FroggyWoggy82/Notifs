/**
 * Simplified Nutrition Scan
 * A streamlined interface for pasting Cronometer screenshots or direct text input
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all simplified paste areas
    initializeSimplifiedPasteAreas();

    // Initialize validation for manual input
    initializeManualInputValidation();
});

/**
 * Initialize all simplified paste areas in the document
 * Note: This function is kept for backward compatibility but is no longer used
 * as we've removed the simplified-paste-area elements
 */
function initializeSimplifiedPasteAreas() {
    // This function is now a no-op since we've removed the simplified-paste-area elements
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

    // Make sure the status element exists
    let statusElement = ingredientItem.querySelector('.simplified-scan-status');
    if (!statusElement) {
        console.log('Creating missing status element for ingredient item');
        statusElement = document.createElement('div');
        statusElement.className = 'simplified-scan-status';
        ingredientItem.appendChild(statusElement);
    }

    // Always use Google Cloud Vision
    ingredientItem.dataset.ocrType = 'vision';

    // Focus on click to make it easier to paste
    pasteArea.addEventListener('click', function() {
        pasteArea.focus();
    });

    // Handle paste events
    pasteArea.addEventListener('paste', function(e) {
        e.preventDefault();

        // Get clipboard items
        const items = (e.clipboardData || window.clipboardData).items;

        // Check if there's text in the clipboard
        let hasText = false;
        let clipboardText = '';

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('text') !== -1) {
                hasText = true;
                items[i].getAsString(function(text) {
                    clipboardText = text;
                    // If the text looks like nutrition data, process it directly
                    if (isNutritionText(text)) {
                        processNutritionText(text, pasteArea, statusElement);
                    } else {
                        // Otherwise, continue with image processing
                        processClipboardItems(items, previewElement, pasteArea, statusElement);
                    }
                });
                break;
            }
        }

        // If no text was found, process as image
        if (!hasText) {
            processClipboardItems(items, previewElement, pasteArea, statusElement);
        }
    });

    // Handle focus/blur for visual feedback
    pasteArea.addEventListener('focus', function() {
        pasteArea.classList.add('active');
    });

    pasteArea.addEventListener('blur', function() {
        pasteArea.classList.remove('active');
    });

    // Handle keyboard events
    pasteArea.addEventListener('keydown', function(e) {
        // Allow Ctrl+V for paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            return;
        }

        // Prevent other keyboard input
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

            // Get the image as a blob
            const blob = items[i].getAsFile();

            // Create an object URL for the blob
            const imageUrl = URL.createObjectURL(blob);

            // Display the image in the preview
            displayImagePreview(imageUrl, previewElement, pasteArea);

            // Process the image with OCR
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
    // Clear previous preview
    previewElement.innerHTML = '';
    previewElement.classList.add('has-image');

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    previewElement.appendChild(img);

    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'simplified-remove-image';
    removeButton.innerHTML = '×';
    removeButton.title = 'Remove image';
    previewElement.appendChild(removeButton);

    // Handle remove button click
    removeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        previewElement.innerHTML = '';
        previewElement.classList.remove('has-image');

        // No need to reset instructions as they've been removed
    });

    // Instructions element is no longer present, so we skip updating it
}

/**
 * Process image with OCR to extract nutrition data
 * @param {Blob} imageBlob - Image blob to process
 * @param {HTMLElement} pasteArea - The paste area element
 * @param {HTMLElement} statusElement - Element to show status messages
 */
function processImageWithOCR(imageBlob, pasteArea, statusElement) {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('image', imageBlob, 'pasted-image.png');

    // Show loading status
    showStatus(statusElement, 'Processing image...', 'loading');

    // Always use Google Cloud Vision
    // Use the current origin to ensure we're using the same port
    const apiUrl = `${window.location.origin}/api/vision-ocr/nutrition`;

    // Show which OCR engine we're using
    showStatus(statusElement, 'Processing image with Google Cloud Vision...', 'loading');

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
        // Log the response data for debugging
        console.log('OCR Response Data:', data);

        // Store the OCR data globally for use in highlighting
        window.ocrData = data;

        // Display raw OCR text if available
        if (data.rawText) {
            displayRawOcrText(data.rawText, pasteArea);
        }

        if (data.success) {
            // Update the nutrition fields with the extracted data
            // updateNutritionFields returns true if any fields were updated
            const fieldsUpdated = updateNutritionFields(data, pasteArea);

            if (fieldsUpdated) {
                // Count how many values match the expected values
                let matchCount = 0;
                let totalValues = 0;
                if (data.matches) {
                    matchCount = Object.values(data.matches).filter(match => match === true).length;
                    totalValues = Object.keys(data.matches).length;
                }

                // Calculate percentage of correct values
                const percentage = totalValues > 0 ? Math.round((matchCount / totalValues) * 100) : 0;

                showStatus(statusElement, `Nutrition data extracted successfully! ${matchCount}/${totalValues} values match expected values (${percentage}% accuracy).`, 'success');

                // Instructions element is no longer present, so we skip updating it
            } else {
                // No values were extracted, but OCR was successful
                showStatus(statusElement, 'No nutrition values detected. Please enter values manually.', 'warning');

                // Instructions element is no longer present, so we skip updating it

                // Show the detailed nutrition panel to allow manual entry
                const detailedPanel = pasteArea.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
                if (detailedPanel) {
                    detailedPanel.style.display = 'block';

                    // Also click the toggle button to update its text
                    const toggleButton = pasteArea.closest('.ingredient-item').querySelector('.toggle-detailed-nutrition');
                    if (toggleButton && toggleButton.textContent === 'Show Detailed Nutrition') {
                        toggleButton.textContent = 'Hide Detailed Nutrition';
                    }
                }
            }
        } else {
            throw new Error(data.error || 'Failed to extract nutrition data');
        }
    })
    .catch(error => {
        console.error('OCR Error:', error);
        showStatus(statusElement, 'Error: ' + error.message, 'error');

        // Instructions element is no longer present, so we skip updating it

        // Show the detailed nutrition panel to allow manual entry
        const detailedPanel = pasteArea.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
        if (detailedPanel) {
            detailedPanel.style.display = 'block';

            // Also click the toggle button to update its text
            const toggleButton = pasteArea.closest('.ingredient-item').querySelector('.toggle-detailed-nutrition');
            if (toggleButton && toggleButton.textContent === 'Show Detailed Nutrition') {
                toggleButton.textContent = 'Hide Detailed Nutrition';
            }
        }

        // No longer applying default values
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

    // Find the raw OCR container and text element
    const rawOcrContainer = ingredientItem.querySelector('.raw-ocr-container');
    const rawOcrText = ingredientItem.querySelector('.raw-ocr-text');
    const rawOcrToggle = ingredientItem.querySelector('.raw-ocr-toggle');

    if (!rawOcrContainer || !rawOcrText || !rawOcrToggle) return;

    // Set the raw OCR text
    rawOcrText.textContent = rawText;

    // Show the container
    rawOcrContainer.style.display = 'block';

    // Set up toggle button
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
 * Check if text appears to be nutrition data
 * @param {string} text - The text to check
 * @returns {boolean} - Whether the text appears to be nutrition data
 */
function isNutritionText(text) {
    // Check for common nutrition terms and patterns
    const nutritionTerms = [
        'calories', 'protein', 'fat', 'carbs', 'carbohydrates',
        'fiber', 'sugar', 'sodium', 'cholesterol', 'calcium',
        'vitamin', 'mineral', 'energy', 'kcal', 'nutrition'
    ];

    // Count how many nutrition terms are found in the text
    let termCount = 0;
    for (const term of nutritionTerms) {
        if (text.toLowerCase().includes(term)) {
            termCount++;
        }
    }

    // Check for number patterns (like "10.5g" or "150 kcal")
    const numberPattern = /\d+(\.\d+)?\s*(g|mg|kcal|cal|%)/gi;
    const numberMatches = text.match(numberPattern) || [];

    // If we have at least 3 nutrition terms and some number patterns, it's likely nutrition data
    return termCount >= 3 && numberMatches.length >= 3;
}

/**
 * Process nutrition text to extract values
 * @param {string} text - The nutrition text to process
 * @param {HTMLElement} pasteArea - The paste area element
 * @param {HTMLElement} statusElement - Element to show status messages
 */
function processNutritionText(text, pasteArea, statusElement) {
    // Show loading status
    showStatus(statusElement, 'Processing nutrition text...', 'loading');

    // Create a data object to hold the extracted values
    const data = {
        success: true,
        rawText: text
    };

    // Display the raw text
    displayRawOcrText(text, pasteArea);

    // Extract nutrition values using regex patterns
    // Calories
    const caloriesMatch = text.match(/calories[:\s]*(\d+(\.\d+)?)/i) ||
                         text.match(/energy[:\s]*(\d+(\.\d+)?)[\s]*kcal/i);
    if (caloriesMatch) {
        data.calories = parseFloat(caloriesMatch[1]);
    }

    // Protein
    const proteinMatch = text.match(/protein[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (proteinMatch) {
        data.protein = parseFloat(proteinMatch[1]);
    }

    // Fat
    const fatMatch = text.match(/fat[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                    text.match(/total fat[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (fatMatch) {
        data.fat = parseFloat(fatMatch[1]);
    }

    // Carbs
    const carbsMatch = text.match(/carbs[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                      text.match(/carbohydrates[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                      text.match(/total carbohydrate[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (carbsMatch) {
        data.carbs = parseFloat(carbsMatch[1]);
    }

    // Water
    const waterMatch = text.match(/water[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (waterMatch) {
        data.water = parseFloat(waterMatch[1]);
    }

    // Fiber
    const fiberMatch = text.match(/fiber[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                      text.match(/dietary fiber[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (fiberMatch) {
        data.fiber = parseFloat(fiberMatch[1]);
    }

    // Sugars
    const sugarsMatch = text.match(/sugars[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                       text.match(/sugar[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (sugarsMatch) {
        data.sugars = parseFloat(sugarsMatch[1]);
    }

    // Added Sugars
    const addedSugarsMatch = text.match(/added sugars[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (addedSugarsMatch) {
        data.addedSugars = parseFloat(addedSugarsMatch[1]);
    }

    // Saturated Fat
    const saturatedMatch = text.match(/saturated[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                          text.match(/saturated fat[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (saturatedMatch) {
        data.saturated = parseFloat(saturatedMatch[1]);
    }

    // Monounsaturated Fat
    const monoMatch = text.match(/monounsaturated[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                     text.match(/mono[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (monoMatch) {
        data.monounsaturated = parseFloat(monoMatch[1]);
    }

    // Polyunsaturated Fat
    const polyMatch = text.match(/polyunsaturated[:\s]*(\d+(\.\d+)?)[\s]*g/i) ||
                     text.match(/poly[:\s]*(\d+(\.\d+)?)[\s]*g/i);
    if (polyMatch) {
        data.polyunsaturated = parseFloat(polyMatch[1]);
    }

    // Cholesterol
    const cholesterolMatch = text.match(/cholesterol[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (cholesterolMatch) {
        data.cholesterol = parseFloat(cholesterolMatch[1]);
    }

    // Sodium
    const sodiumMatch = text.match(/sodium[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (sodiumMatch) {
        data.sodium = parseFloat(sodiumMatch[1]);
    }

    // Calcium
    const calciumMatch = text.match(/calcium[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (calciumMatch) {
        data.calcium = parseFloat(calciumMatch[1]);
    }

    // Iron
    const ironMatch = text.match(/iron[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (ironMatch) {
        data.iron = parseFloat(ironMatch[1]);
    }

    // Potassium
    const potassiumMatch = text.match(/potassium[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (potassiumMatch) {
        data.potassium = parseFloat(potassiumMatch[1]);
    }

    // Vitamin A
    const vitaminAMatch = text.match(/vitamin a[:\s]*(\d+(\.\d+)?)[\s]*μg/i) ||
                         text.match(/vitamin a[:\s]*(\d+(\.\d+)?)[\s]*mcg/i);
    if (vitaminAMatch) {
        data.vitaminA = parseFloat(vitaminAMatch[1]);
    }

    // Vitamin C
    const vitaminCMatch = text.match(/vitamin c[:\s]*(\d+(\.\d+)?)[\s]*mg/i);
    if (vitaminCMatch) {
        data.vitaminC = parseFloat(vitaminCMatch[1]);
    }

    // Vitamin D
    const vitaminDMatch = text.match(/vitamin d[:\s]*(\d+(\.\d+)?)[\s]*IU/i) ||
                         text.match(/vitamin d[:\s]*(\d+(\.\d+)?)[\s]*μg/i) ||
                         text.match(/vitamin d[:\s]*(\d+(\.\d+)?)[\s]*mcg/i);
    if (vitaminDMatch) {
        data.vitaminD = parseFloat(vitaminDMatch[1]);
    }

    // Count how many values were extracted
    const extractedValues = Object.keys(data).filter(key =>
        key !== 'success' && key !== 'rawText' && data[key] !== null && data[key] !== undefined
    ).length;

    if (extractedValues > 0) {
        // Update the nutrition fields with the extracted data
        const fieldsUpdated = updateNutritionFields(data, pasteArea);

        if (fieldsUpdated) {
            showStatus(statusElement, `Nutrition data extracted successfully! (${extractedValues} values found)`, 'success');

            // Update instructions
            const instructionsElement = pasteArea.querySelector('.simplified-paste-instructions');
            if (instructionsElement) {
                instructionsElement.textContent = 'Nutrition data extracted!';

                // Add small text with instructions
                const smallText = document.createElement('small');
                smallText.textContent = 'You can paste new data to update the values';
                instructionsElement.appendChild(smallText);
            }
        } else {
            showStatus(statusElement, 'Failed to update nutrition fields with extracted data.', 'warning');
        }
    } else {
        showStatus(statusElement, 'No nutrition values could be extracted from the text. Please enter values manually.', 'warning');

        // Show the detailed nutrition panel to allow manual entry
        const detailedPanel = pasteArea.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
        if (detailedPanel) {
            detailedPanel.style.display = 'block';

            // Also update the toggle button text
            const toggleButton = pasteArea.closest('.ingredient-item').querySelector('.toggle-detailed-nutrition');
            if (toggleButton && toggleButton.textContent === 'Show Detailed Nutrition') {
                toggleButton.textContent = 'Hide Detailed Nutrition';
            }
        }
    }
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

    // Log the data we're working with
    console.log('Updating nutrition fields with data:', data);

    // Track fields updated
    let totalFieldsUpdated = 0;

    // Function to update a field and track statistics
    const updateFieldAndTrackStats = (container, selector, value) => {
        const field = container.querySelector(selector);
        if (!field) return false;

        if (value !== null && value !== undefined) {
            totalFieldsUpdated++;
            // Update the field
            updateField(container, selector, value);
            return true;
        }
        return false;
    };

    // Update basic nutrition fields
    updateFieldAndTrackStats(ingredientItem, '.ingredient-calories', data.calories);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-protein', data.protein);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-fat', data.fat);
    updateFieldAndTrackStats(ingredientItem, '.ingredient-carbs', data.carbs);

    // Update detailed nutrition fields
    // Make sure energy is properly handled
    if (data.calories !== undefined) {
        updateFieldAndTrackStats(ingredientItem, '.nutrition-energy', data.calories);
    }
    updateFieldAndTrackStats(ingredientItem, '.nutrition-alcohol', data.alcohol);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-caffeine', data.caffeine);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-water', data.water);

    updateFieldAndTrackStats(ingredientItem, '.nutrition-carbs-total', data.carbs);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-fiber', data.fiber);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-starch', data.starch);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-sugars', data.sugars);
    updateFieldAndTrackStats(ingredientItem, '.nutrition-added-sugars', data.addedSugars);
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

    // Count empty fields
    let emptyFields = 0;
    ingredientItem.querySelectorAll('.nutrition-field').forEach(field => {
        if (!field.value || field.value.trim() === '') {
            emptyFields++;
        }
    });

    // Display statistics in the UI
    const statusElement = ingredientItem.querySelector('.simplified-scan-status');

    // Create the message
    let message = `Nutrition data extracted: ${totalFieldsUpdated} fields populated`;
    if (emptyFields > 0) {
        message += `, ${emptyFields} fields empty`;
    }

    if (statusElement) {
        console.log('Status element found, displaying message:', message);
        showStatus(statusElement, message, 'success');

        // Make sure the status element is visible
        statusElement.style.display = 'block';
    } else {
        console.error('Status element not found! Creating one...');

        // Create a status element if it doesn't exist
        const newStatusElement = document.createElement('div');
        newStatusElement.className = 'simplified-scan-status';
        ingredientItem.appendChild(newStatusElement);

        showStatus(newStatusElement, message, 'success');
    }

    // Check if any fields were actually updated
    const hasUpdatedFields = totalFieldsUpdated > 0;
    console.log('Fields updated:', hasUpdatedFields);

    return hasUpdatedFields;
}

/**
 * Empty object for expected values - we don't use hardcoded values anymore
 */
const expectedValues = {};

/**
 * Get a normalized key for comparison with expected values
 * @param {string} key - The key to normalize
 * @returns {string} - The normalized key
 */
/**
 * Empty function for updateNutritionFieldsWithDefaults - we don't use default values anymore
 * @param {HTMLElement} pasteArea - The paste area element
 */
function updateNutritionFieldsWithDefaults(pasteArea) {
    // This function is intentionally left empty as we don't want to use default values
    console.log('Default values are disabled - using only extracted values');
}

/**
 * Get a normalized key for comparison with expected values
 * @param {string} key - The key to normalize
 * @returns {string} - The normalized key
 */
function getNormalizedKey(key) {
    // Debug the input key
    console.log(`Normalizing key: ${key}`);

    // Convert the key to match the expected values object keys
    let normalizedKey = key.replace(/^nutrition-/, '')
                         .replace(/^.nutrition-/, '')
                         .replace(/^ingredient-/, '')
                         .replace(/-/g, '')
                         .replace('total', '');

    // Special case for energy/calories
    if (normalizedKey === 'energy') {
        normalizedKey = 'calories';
    }

    // Special cases for vitamin B fields
    if (normalizedKey.match(/^b\d+/i)) {
        normalizedKey = 'vitamin' + normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1);
    }

    // Map specific field names to their corresponding keys in expectedValues
    const keyMap = {
        // Basic nutrition
        'calories': 'calories',
        'nutrition-calories': 'calories',
        'ingredient-calories': 'calories',
        'energy': 'calories',
        'nutrition-energy': 'calories',

        // Protein
        'protein': 'protein',
        'nutrition-protein': 'protein',
        'ingredient-protein': 'protein',
        'protein-total': 'protein',
        'nutrition-protein-total': 'protein',

        // Fat
        'fat': 'fat',
        'nutrition-fat': 'fat',
        'ingredient-fat': 'fat',
        'fat-total': 'fat',
        'nutrition-fat-total': 'fat',

        // Carbs
        'carbs': 'carbs',
        'nutrition-carbs': 'carbs',
        'ingredient-carbs': 'carbs',
        'carbs-total': 'carbs',
        'nutrition-carbs-total': 'carbs',

        // Other macros
        'fiber': 'fiber',
        'nutrition-fiber': 'fiber',
        'sugar': 'sugars',
        'sugars': 'sugars',
        'nutrition-sugar': 'sugars',
        'nutrition-sugars': 'sugars',
        'sodium': 'sodium',
        'nutrition-sodium': 'sodium',
        'cholesterol': 'cholesterol',
        'nutrition-cholesterol': 'cholesterol',
        'potassium': 'potassium',
        'nutrition-potassium': 'potassium',

        // Vitamins
        'vitamin-a': 'vitaminA',
        'nutrition-vitamin-a': 'vitaminA',
        'vitamin-c': 'vitaminC',
        'nutrition-vitamin-c': 'vitaminC',
        'vitamin-d': 'vitaminD',
        'nutrition-vitamin-d': 'vitaminD',
        'vitamin-e': 'vitaminE',
        'nutrition-vitamin-e': 'vitaminE',
        'vitamin-k': 'vitaminK',
        'nutrition-vitamin-k': 'vitaminK',

        // B Vitamins
        'b1': 'vitaminB1',
        'vitamin-b1': 'vitaminB1',
        'nutrition-vitamin-b1': 'vitaminB1',
        'b2': 'vitaminB2',
        'vitamin-b2': 'vitaminB2',
        'nutrition-vitamin-b2': 'vitaminB2',
        'b3': 'vitaminB3',
        'vitamin-b3': 'vitaminB3',
        'nutrition-vitamin-b3': 'vitaminB3',
        'b5': 'vitaminB5',
        'vitamin-b5': 'vitaminB5',
        'nutrition-vitamin-b5': 'vitaminB5',
        'b6': 'vitaminB6',
        'vitamin-b6': 'vitaminB6',
        'nutrition-vitamin-b6': 'vitaminB6',
        'b12': 'vitaminB12',
        'vitamin-b12': 'vitaminB12',
        'nutrition-vitamin-b12': 'vitaminB12',

        // Minerals
        'calcium': 'calcium',
        'nutrition-calcium': 'calcium',
        'iron': 'iron',
        'nutrition-iron': 'iron',
        'magnesium': 'magnesium',
        'nutrition-magnesium': 'magnesium',
        'copper': 'copper',
        'nutrition-copper': 'copper',
        'manganese': 'manganese',
        'nutrition-manganese': 'manganese',
        'phosphorus': 'phosphorus',
        'nutrition-phosphorus': 'phosphorus',
        'selenium': 'selenium',
        'nutrition-selenium': 'selenium',
        'zinc': 'zinc',
        'nutrition-zinc': 'zinc',

        // Other nutrients
        'water': 'water',
        'nutrition-water': 'water',
        'starch': 'starch',
        'nutrition-starch': 'starch',
        'added-sugars': 'addedSugars',
        'nutrition-added-sugars': 'addedSugars',
        'net-carbs': 'netCarbs',
        'nutrition-net-carbs': 'netCarbs',
        'monounsaturated': 'monounsaturated',
        'nutrition-monounsaturated': 'monounsaturated',
        'polyunsaturated': 'polyunsaturated',
        'nutrition-polyunsaturated': 'polyunsaturated',
        'omega3': 'omega3',
        'omega-3': 'omega3',
        'nutrition-omega3': 'omega3',
        'nutrition-omega-3': 'omega3',
        'omega6': 'omega6',
        'omega-6': 'omega6',
        'nutrition-omega6': 'omega6',
        'nutrition-omega-6': 'omega6',
        'saturated': 'saturated',
        'nutrition-saturated': 'saturated',
        'trans-fat': 'transFat',
        'nutrition-trans-fat': 'transFat',

        // Amino acids
        'cystine': 'cystine',
        'nutrition-cystine': 'cystine',
        'histidine': 'histidine',
        'nutrition-histidine': 'histidine',
        'isoleucine': 'isoleucine',
        'nutrition-isoleucine': 'isoleucine',
        'leucine': 'leucine',
        'nutrition-leucine': 'leucine',
        'lysine': 'lysine',
        'nutrition-lysine': 'lysine',
        'methionine': 'methionine',
        'nutrition-methionine': 'methionine',
        'phenylalanine': 'phenylalanine',
        'nutrition-phenylalanine': 'phenylalanine',
        'threonine': 'threonine',
        'nutrition-threonine': 'threonine',
        'tryptophan': 'tryptophan',
        'nutrition-tryptophan': 'tryptophan',
        'tyrosine': 'tyrosine',
        'nutrition-tyrosine': 'tyrosine',
        'valine': 'valine',
        'nutrition-valine': 'valine',

        // Other
        'folate': 'folate',
        'nutrition-folate': 'folate',
        'alcohol': 'alcohol',
        'nutrition-alcohol': 'alcohol',
        'caffeine': 'caffeine',
        'nutrition-caffeine': 'caffeine'
    };

    // Use the mapped key if available
    if (keyMap[key]) {
        normalizedKey = keyMap[key];
        console.log(`Key ${key} mapped directly to ${normalizedKey}`);
    } else {
        // Try to find a partial match in the keyMap
        for (const [mapKey, mapValue] of Object.entries(keyMap)) {
            if (key.includes(mapKey)) {
                normalizedKey = mapValue;
                console.log(`Key ${key} partially matched with ${mapKey}, mapped to ${normalizedKey}`);
                break;
            }
        }
    }

    console.log(`Final normalized key for ${key}: ${normalizedKey}`);
    return normalizedKey;
}

/**
 * Check if a value matches the expected value from the OCR data
 * @param {string} key - The key to check
 * @param {*} value - The value to check
 * @returns {boolean} - Whether the value matches the expected value
 */
function isCorrectValue(key, value) {
    // Normalize the key
    const normalizedKey = getNormalizedKey(key);

    // Check if we have OCR data with matches
    if (window.ocrData && window.ocrData.matches && window.ocrData.matches[normalizedKey] !== undefined) {
        // Return whether this value matches the expected value
        return window.ocrData.matches[normalizedKey];
    }

    // If we don't have OCR data or this key isn't in the matches, return false
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

    // Debug logging
    if (!field) {
        console.log(`Field not found: ${selector}`);
        return;
    }

    if (value !== null && value !== undefined) {
        // Always use the detected value
        field.value = value;
        console.log(`Field ${selector} set to detected value ${value}`);

        // Get the normalized key for this field
        const normalizedKey = getNormalizedKey(selector);
        console.log(`Field ${selector} normalized to key: ${normalizedKey}`);

        // Check if this field has a matching value in the data
        if (window.ocrData && window.ocrData.matches) {
            console.log(`Checking match for ${normalizedKey}: ${window.ocrData.matches[normalizedKey]}`);

            if (window.ocrData.matches[normalizedKey]) {
                // Add the matching-value class to highlight it
                field.classList.add('matching-value');
                field.classList.add('correct');
                console.log(`Field ${selector} (${normalizedKey}) matches expected value (${value}), highlighting green`);
            } else {
                // Remove the matching-value class if it doesn't match
                field.classList.remove('matching-value');
                field.classList.remove('correct');
                console.log(`Field ${selector} (${normalizedKey}) does NOT match expected value (${value})`);
            }
        } else {
            console.log(`No matches data available for ${normalizedKey}`);
            field.classList.remove('matching-value');
            field.classList.remove('correct');
        }
    } else {
        console.log(`Skipping field ${selector} - no value provided`);
        // Remove the matching-value class if there's no value
        field.classList.remove('matching-value');
    }
}

/**
 * Initialize validation for manual input fields
 */
function initializeManualInputValidation() {
    // Find all nutrition input fields
    const nutritionInputs = document.querySelectorAll('.nutrition-item input, .ingredient-calories, .ingredient-protein, .ingredient-fat, .ingredient-carbs');

    // Add input event listeners to each field
    nutritionInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });

        // Also validate on blur for good measure
        input.addEventListener('blur', function() {
            validateInput(this);
        });

        // Initial validation in case fields are pre-filled
        validateInput(input);
    });
}

/**
 * Validate an input field against expected values
 * @param {HTMLElement} input - The input field to validate
 */
function validateInput(input) {
    // Get the field's ID, name, or class to determine which value to check against
    let key = input.id || input.name;

    // If no key found from ID or name, try getting from class
    if (!key) {
        const classes = input.className.split(' ');
        // Find a class that might be a nutrition field
        for (const cls of classes) {
            if (cls.includes('nutrition-') || cls.includes('ingredient-')) {
                key = cls;
                break;
            }
        }
    }

    // If still no key found, try getting from the parent element
    if (!key && input.parentElement) {
        // Try to get the ID from the parent
        if (input.parentElement.id &&
            (input.parentElement.id.includes('nutrition-') ||
             input.parentElement.id.includes('ingredient-'))) {
            key = input.parentElement.id;
        } else {
            // Try to get a class from the parent
            const parentClasses = input.parentElement.className.split(' ');
            for (const cls of parentClasses) {
                if (cls.includes('nutrition-') || cls.includes('ingredient-')) {
                    key = cls;
                    break;
                }
            }
        }
    }

    // If still no key found, try to infer from the label text
    if (!key && input.parentElement) {
        const label = input.parentElement.querySelector('label');
        if (label) {
            const labelText = label.textContent.trim().toLowerCase();
            // Map common label texts to keys
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

            // Check if the label text matches any of our known labels
            for (const [text, mappedKey] of Object.entries(labelMap)) {
                if (labelText.includes(text)) {
                    key = mappedKey;
                    break;
                }
            }
        }
    }

    // If we have a key and a value to check
    if (key && input.value) {
        console.log(`Validating ${key} with value ${input.value}`);
        const isCorrect = isCorrectValue(key, input.value);

        if (isCorrect) {
            // Add the correct class to highlight it green
            input.classList.add('correct');
            console.log(`Field ${key} with value ${input.value} is correct!`);
        } else {
            // Remove the correct class if it's not correct
            input.classList.remove('correct');
        }
    } else {
        // Remove the correct class if there's no value
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

    // Clear previous status classes
    statusElement.classList.remove('loading', 'success', 'error', 'warning');

    // Add new status class
    statusElement.classList.add(type);

    // Set message
    statusElement.textContent = message;

    // Make sure the element is visible
    statusElement.style.display = 'block';

    // Auto-hide success, error, and warning messages after 10 seconds (increased from 5)
    if (type === 'success' || type === 'error' || type === 'warning') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 10000);
    }
}
