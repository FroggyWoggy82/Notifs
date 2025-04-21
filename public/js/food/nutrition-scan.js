// Nutrition Label Scanner functionality
document.addEventListener('DOMContentLoaded', () => {
    // Function to set up event listeners for scan buttons
    function setupScanButtons() {
        console.log('Setting up scan buttons...');
        // Use event delegation for scan buttons
        document.addEventListener('click', (event) => {
            console.log('Click event detected on:', event.target);
            if (event.target.classList.contains('scan-nutrition-btn') || event.target.classList.contains('scan-template-btn')) {
                console.log('Scan button clicked!');
                const ingredientItem = event.target.closest('.ingredient-item');
                const fileInput = ingredientItem.querySelector('.nutrition-image-input');
                console.log('Found file input:', fileInput);

                // Set OCR type based on which button was clicked
                if (event.target.classList.contains('scan-template-btn')) {
                    ingredientItem.dataset.ocrType = 'template';
                    console.log('Using template-based OCR');
                } else {
                    // Use the selected OCR type from the dropdown
                    const ocrTypeSelector = ingredientItem.querySelector('.ocr-type-selector');
                    ingredientItem.dataset.ocrType = ocrTypeSelector ? ocrTypeSelector.value : 'auto';
                    console.log('Using OCR type:', ingredientItem.dataset.ocrType);
                }

                if (fileInput) {
                    console.log('Triggering file input click');
                    fileInput.click(); // Trigger file input click
                }
            } else if (event.target.classList.contains('paste-nutrition-btn')) {
                console.log('Paste button clicked!');
                const ingredientItem = event.target.closest('.ingredient-item');
                const pasteArea = ingredientItem.querySelector('.paste-area');

                // Use the selected OCR type from the dropdown
                const ocrTypeSelector = ingredientItem.querySelector('.ocr-type-selector');
                ingredientItem.dataset.ocrType = ocrTypeSelector ? ocrTypeSelector.value : 'auto';
                console.log('Using OCR type for paste:', ingredientItem.dataset.ocrType);

                if (pasteArea) {
                    // Focus the paste area to make it ready for paste
                    pasteArea.focus();
                    // Add active class to indicate it's ready for paste
                    pasteArea.classList.add('active');
                    // Show a message to the user
                    alert('Now press Ctrl+V to paste your screenshot');
                }
            }
        });

        // Use event delegation for file inputs
        document.addEventListener('change', (event) => {
            console.log('Change event detected on:', event.target);
            if (event.target.classList.contains('nutrition-image-input')) {
                console.log('File input changed!');
                const file = event.target.files[0];
                console.log('Selected file:', file);
                if (file) {
                    const ingredientItem = event.target.closest('.ingredient-item');
                    console.log('Found ingredient item:', ingredientItem);
                    processNutritionImage(file, ingredientItem);
                }
            }
        });

        // Set up clipboard paste event listeners
        setupClipboardPaste();
    }

    // Function to set up PaddleOCR toggle
    function setupPaddleOCRToggle() {
        // Use event delegation for PaddleOCR toggle
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('paddle-ocr-toggle')) {
                const ingredientItem = event.target.closest('.ingredient-item');
                if (ingredientItem) {
                    if (event.target.checked) {
                        ingredientItem.dataset.ocrType = 'paddle';
                        console.log('PaddleOCR enabled for this ingredient');
                    } else {
                        ingredientItem.dataset.ocrType = 'auto';
                        console.log('PaddleOCR disabled for this ingredient');
                    }
                }
            }
        });
    }

    // Function to set up clipboard paste functionality
    function setupClipboardPaste() {
        // Use event delegation for paste events
        document.addEventListener('paste', (event) => {
            // Check if the active element is a paste area
            const pasteArea = document.activeElement.closest('.paste-area');
            if (!pasteArea) return;

            // Get the ingredient item
            const ingredientItem = pasteArea.closest('.ingredient-item');
            if (!ingredientItem) return;

            // Prevent the default paste behavior
            event.preventDefault();

            // Get the clipboard items
            const clipboardItems = event.clipboardData.items;
            let imageFile = null;

            // Look for an image in the clipboard
            for (let i = 0; i < clipboardItems.length; i++) {
                if (clipboardItems[i].type.indexOf('image') !== -1) {
                    imageFile = clipboardItems[i].getAsFile();
                    break;
                }
            }

            // If an image was found, process it
            if (imageFile) {
                console.log('Image found in clipboard:', imageFile);

                // Show a preview of the image
                const previewDiv = pasteArea.querySelector('.paste-preview');
                const instructionsDiv = pasteArea.querySelector('.paste-instructions');

                if (previewDiv && instructionsDiv) {
                    // Create a URL for the image
                    const imageUrl = URL.createObjectURL(imageFile);

                    // Create an image element
                    const img = document.createElement('img');
                    img.src = imageUrl;

                    // Create a remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-image';
                    removeBtn.innerHTML = '×';
                    removeBtn.title = 'Remove image';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        previewDiv.innerHTML = '';
                        previewDiv.classList.remove('has-image');
                        instructionsDiv.style.display = 'block';
                        pasteArea.classList.remove('active');
                    });

                    // Clear the preview and add the new image
                    previewDiv.innerHTML = '';
                    previewDiv.appendChild(img);
                    previewDiv.appendChild(removeBtn);
                    previewDiv.classList.add('has-image');

                    // Hide the instructions
                    instructionsDiv.style.display = 'none';
                }

                // Process the image
                processNutritionImage(imageFile, ingredientItem);
            } else {
                console.log('No image found in clipboard');
                alert('No image found in clipboard. Please copy an image first.');
            }

            // Remove the active class
            pasteArea.classList.remove('active');
        });

        // Add click event listener to paste areas
        document.addEventListener('click', (event) => {
            const pasteArea = event.target.closest('.paste-area');
            if (pasteArea) {
                // Focus the paste area
                pasteArea.focus();
                // Add active class
                pasteArea.classList.add('active');
            } else {
                // Remove active class from all paste areas when clicking elsewhere
                document.querySelectorAll('.paste-area.active').forEach(area => {
                    area.classList.remove('active');
                });
            }
        });

        // Add blur event listener to paste areas
        document.addEventListener('blur', (event) => {
            if (event.target.classList.contains('paste-area')) {
                // Remove active class when the paste area loses focus
                event.target.classList.remove('active');
            }
        }, true);
    }

    // Function to process the nutrition image
    async function processNutritionImage(file, ingredientItem) {
        // Show loading status
        const scanStatus = ingredientItem.querySelector('.scan-status');
        scanStatus.textContent = 'Processing image...';
        scanStatus.className = 'scan-status loading';
        scanStatus.style.display = 'block';

        // Log information about the file for debugging
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

        // Create a FormData object to send the file to the server
        const formData = new FormData();
        formData.append('image', file);

        // Variable to store the nutrition data
        let nutritionData = null;
        let response = null;

        try {
            // Get the OCR type from the ingredient item's dataset
            const ocrType = ingredientItem.dataset.ocrType || 'auto';
            console.log('Using OCR type:', ocrType);

            // Define endpoints based on OCR type
            let endpoints = [];

            if (ocrType === 'template') {
                // Use only the template-based OCR endpoint
                endpoints = [
                    '/api/template-ocr/nutrition'
                ];
            } else if (ocrType === 'regular') {
                // Use only the regular OCR endpoints
                endpoints = [
                    '/api/improved-ocr/nutrition',
                    '/api/improved-ocr/simple',
                    '/api/ocr/nutrition'
                ];
            } else if (ocrType === 'paddle') {
                // Use only PaddleOCR endpoint
                console.log('OCR engine set to: PaddleOCR');
                scanStatus.textContent = 'Processing image with PaddleOCR...';
                endpoints = [
                    '/api/paddle-ocr/nutrition'
                ];
            } else {
                // Auto-detect: try PaddleOCR first, then template, then fall back to regular OCR
                endpoints = [
                    '/api/paddle-ocr/nutrition',
                    '/api/template-ocr/nutrition',
                    '/api/improved-ocr/nutrition',
                    '/api/improved-ocr/simple',
                    '/api/ocr/nutrition'
                ];
            }

            // Try each endpoint in sequence
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying ${endpoint} endpoint...`);
                    response = await fetch(endpoint, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        nutritionData = await response.json();
                        console.log(`Successfully received data from ${endpoint}:`, nutritionData);
                        break; // Exit the loop if successful
                    } else {
                        console.log(`${endpoint} failed with status:`, response.status);
                    }
                } catch (endpointError) {
                    console.log(`Error with ${endpoint}:`, endpointError.message);
                }
            }

            // If all endpoints failed, show error
            if (!nutritionData) {
                console.log('All API endpoints failed, showing error');
                throw new Error('Failed to extract nutrition information from image. Please try again or enter values manually.');
            }

            console.log('Final OCR Results:', nutritionData);

            // Fill in the form fields with the extracted data
            fillNutritionFields(ingredientItem, nutritionData);

            // Show appropriate message based on whether fallback data was used or auto-corrections were made
            if (nutritionData.fallback) {
                if (nutritionData.ocrResults && nutritionData.ocrResults.some(result => result.text && result.text.includes('PaddleOCR not installed'))) {
                    scanStatus.textContent = 'Using sample nutrition data (PaddleOCR not installed)';
                    scanStatus.className = 'scan-status warning';
                } else {
                    scanStatus.textContent = 'Using sample nutrition data (OCR could not extract values)';
                    scanStatus.className = 'scan-status warning';
                }
            } else if (nutritionData.caloriesCorrected || nutritionData.proteinCorrected ||
                       nutritionData.fatCorrected || nutritionData.carbsCorrected ||
                       nutritionData.amountCorrected) {
                scanStatus.textContent = 'Nutrition information extracted with auto-corrections (highlighted in green)!';
                scanStatus.className = 'scan-status success';
            } else {
                scanStatus.textContent = 'Nutrition information extracted successfully!';
                scanStatus.className = 'scan-status success';
            }

            // Hide the status after 3 seconds
            setTimeout(() => {
                scanStatus.style.display = 'none';
            }, 3000);
        } catch (error) {
            console.error('Error processing nutrition image:', error);

            // Show error message
            scanStatus.textContent = `${error.message}`;
            scanStatus.className = 'scan-status error';
            scanStatus.style.display = 'block';

            // Keep the error message visible for 5 seconds
            setTimeout(() => {
                scanStatus.style.display = 'none';
            }, 5000);
        }
    }

    // Function to fill in the nutrition fields
    function fillNutritionFields(ingredientItem, data) {
        // Get all the basic input fields
        const caloriesInput = ingredientItem.querySelector('.ingredient-calories');
        const amountInput = ingredientItem.querySelector('.ingredient-amount');
        const proteinInput = ingredientItem.querySelector('.ingredient-protein');
        const fatInput = ingredientItem.querySelector('.ingredient-fat');
        const carbsInput = ingredientItem.querySelector('.ingredient-carbs');

        // Fill in the basic fields if data is available
        // Only update fields with non-null values
        if (data.amount !== null && data.amount !== undefined) {
            amountInput.value = data.amount;
            // Store original value if auto-corrected
            if (data.amountCorrected && data.originalAmount !== undefined) {
                amountInput.dataset.originalValue = data.originalAmount;
            }
        }

        // Update hidden fields with the latest values only if they're not null
        if (data.calories !== null && data.calories !== undefined) {
            caloriesInput.value = data.calories;
            // Store original value if auto-corrected
            if (data.caloriesCorrected && data.originalCalories !== undefined) {
                caloriesInput.dataset.originalValue = data.originalCalories;
            }
        }

        if (data.protein !== null && data.protein !== undefined) {
            proteinInput.value = data.protein;
            // Store original value if auto-corrected
            if (data.proteinCorrected && data.originalProtein !== undefined) {
                proteinInput.dataset.originalValue = data.originalProtein;
            }
        }

        if (data.fat !== null && data.fat !== undefined) {
            fatInput.value = data.fat;
            // Store original value if auto-corrected
            if (data.fatCorrected && data.originalFat !== undefined) {
                fatInput.dataset.originalValue = data.originalFat;
            }
        }

        if (data.carbs !== null && data.carbs !== undefined) {
            carbsInput.value = data.carbs;
            // Store original value if auto-corrected
            if (data.carbsCorrected && data.originalCarbs !== undefined) {
                carbsInput.dataset.originalValue = data.originalCarbs;
            }
        }

        // Only highlight fields that were actually filled, with special highlighting for auto-corrected values
        highlightField(amountInput, data.amount !== null && data.amount !== undefined, data.amountCorrected);

        // Get and fill detailed nutrition fields
        // General section
        const energyInput = ingredientItem.querySelector('.nutrition-energy');
        const alcoholInput = ingredientItem.querySelector('.nutrition-alcohol');
        const caffeineInput = ingredientItem.querySelector('.nutrition-caffeine');
        const waterInput = ingredientItem.querySelector('.nutrition-water');

        // Carbohydrates section
        const carbsTotalInput = ingredientItem.querySelector('.nutrition-carbs-total');
        const fiberInput = ingredientItem.querySelector('.nutrition-fiber');
        const starchInput = ingredientItem.querySelector('.nutrition-starch');
        const sugarsInput = ingredientItem.querySelector('.nutrition-sugars');
        const addedSugarsInput = ingredientItem.querySelector('.nutrition-added-sugars');
        const netCarbsInput = ingredientItem.querySelector('.nutrition-net-carbs');

        // Lipids section
        const fatTotalInput = ingredientItem.querySelector('.nutrition-fat-total');
        const saturatedInput = ingredientItem.querySelector('.nutrition-saturated');
        const monounsaturatedInput = ingredientItem.querySelector('.nutrition-monounsaturated');
        const polyunsaturatedInput = ingredientItem.querySelector('.nutrition-polyunsaturated');
        const omega3Input = ingredientItem.querySelector('.nutrition-omega3');
        const omega6Input = ingredientItem.querySelector('.nutrition-omega6');
        const transFatInput = ingredientItem.querySelector('.nutrition-trans-fat');
        const cholesterolInput = ingredientItem.querySelector('.nutrition-cholesterol');

        // Protein section
        const proteinTotalInput = ingredientItem.querySelector('.nutrition-protein-total');
        const cystineInput = ingredientItem.querySelector('.nutrition-cystine');
        const histidineInput = ingredientItem.querySelector('.nutrition-histidine');
        const isoleucineInput = ingredientItem.querySelector('.nutrition-isoleucine');
        const leucineInput = ingredientItem.querySelector('.nutrition-leucine');
        const lysineInput = ingredientItem.querySelector('.nutrition-lysine');
        const methionineInput = ingredientItem.querySelector('.nutrition-methionine');
        const phenylalanineInput = ingredientItem.querySelector('.nutrition-phenylalanine');
        const threonineInput = ingredientItem.querySelector('.nutrition-threonine');
        const tryptophanInput = ingredientItem.querySelector('.nutrition-tryptophan');
        const tyrosineInput = ingredientItem.querySelector('.nutrition-tyrosine');
        const valineInput = ingredientItem.querySelector('.nutrition-valine');

        // Vitamins section
        const vitaminB1Input = ingredientItem.querySelector('.nutrition-vitamin-b1');
        const vitaminB2Input = ingredientItem.querySelector('.nutrition-vitamin-b2');
        const vitaminB3Input = ingredientItem.querySelector('.nutrition-vitamin-b3');
        const vitaminB5Input = ingredientItem.querySelector('.nutrition-vitamin-b5');
        const vitaminB6Input = ingredientItem.querySelector('.nutrition-vitamin-b6');
        const vitaminB12Input = ingredientItem.querySelector('.nutrition-vitamin-b12');
        const folateInput = ingredientItem.querySelector('.nutrition-folate');
        const vitaminAInput = ingredientItem.querySelector('.nutrition-vitamin-a');
        const vitaminCInput = ingredientItem.querySelector('.nutrition-vitamin-c');
        const vitaminDInput = ingredientItem.querySelector('.nutrition-vitamin-d');
        const vitaminEInput = ingredientItem.querySelector('.nutrition-vitamin-e');
        const vitaminKInput = ingredientItem.querySelector('.nutrition-vitamin-k');

        // Minerals section
        const calciumInput = ingredientItem.querySelector('.nutrition-calcium');
        const copperInput = ingredientItem.querySelector('.nutrition-copper');
        const ironInput = ingredientItem.querySelector('.nutrition-iron');
        const magnesiumInput = ingredientItem.querySelector('.nutrition-magnesium');
        const manganeseInput = ingredientItem.querySelector('.nutrition-manganese');
        const phosphorusInput = ingredientItem.querySelector('.nutrition-phosphorus');
        const potassiumInput = ingredientItem.querySelector('.nutrition-potassium');
        const seleniumInput = ingredientItem.querySelector('.nutrition-selenium');
        const sodiumInput = ingredientItem.querySelector('.nutrition-sodium');
        const zincInput = ingredientItem.querySelector('.nutrition-zinc');

        // Fill in detailed fields with data from the scan or with the basic values
        // General section
        if (energyInput && data.calories !== null && data.calories !== undefined) {
            energyInput.value = data.calories;
            // Store original value if auto-corrected
            if (data.caloriesCorrected && data.originalCalories !== undefined) {
                energyInput.dataset.originalValue = data.originalCalories;
            }
        }
        if (alcoholInput && data.alcohol !== null && data.alcohol !== undefined) alcoholInput.value = data.alcohol;
        if (caffeineInput && data.caffeine !== null && data.caffeine !== undefined) caffeineInput.value = data.caffeine;
        if (waterInput) {
            if (data.water !== null && data.water !== undefined) {
                waterInput.value = data.water;
            } else if (data.amount !== null && data.amount !== undefined) {
                waterInput.value = data.amount;
            }
        }

        // Carbohydrates section
        if (carbsTotalInput && data.carbs !== null && data.carbs !== undefined) {
            carbsTotalInput.value = data.carbs;
            // Store original value if auto-corrected
            if (data.carbsCorrected && data.originalCarbs !== undefined) {
                carbsTotalInput.dataset.originalValue = data.originalCarbs;
            }
        }
        if (fiberInput && data.fiber !== null && data.fiber !== undefined) fiberInput.value = data.fiber;
        if (starchInput && data.starch !== null && data.starch !== undefined) starchInput.value = data.starch;
        if (sugarsInput && data.sugars !== null && data.sugars !== undefined) sugarsInput.value = data.sugars;
        if (addedSugarsInput && data.addedSugars !== null && data.addedSugars !== undefined) addedSugarsInput.value = data.addedSugars;
        if (netCarbsInput && data.netCarbs !== null && data.netCarbs !== undefined) netCarbsInput.value = data.netCarbs;

        // Lipids section
        if (fatTotalInput && data.fat !== null && data.fat !== undefined) {
            fatTotalInput.value = data.fat;
            // Store original value if auto-corrected
            if (data.fatCorrected && data.originalFat !== undefined) {
                fatTotalInput.dataset.originalValue = data.originalFat;
            }
        }
        if (saturatedInput && data.saturated !== null && data.saturated !== undefined) saturatedInput.value = data.saturated;
        if (monounsaturatedInput && data.monounsaturated !== null && data.monounsaturated !== undefined) monounsaturatedInput.value = data.monounsaturated;
        if (polyunsaturatedInput && data.polyunsaturated !== null && data.polyunsaturated !== undefined) polyunsaturatedInput.value = data.polyunsaturated;
        if (omega3Input && data.omega3 !== null && data.omega3 !== undefined) omega3Input.value = data.omega3;
        if (omega6Input && data.omega6 !== null && data.omega6 !== undefined) omega6Input.value = data.omega6;
        if (transFatInput && data.transFat !== null && data.transFat !== undefined) transFatInput.value = data.transFat;
        if (cholesterolInput && data.cholesterol !== null && data.cholesterol !== undefined) cholesterolInput.value = data.cholesterol;

        // Protein section
        if (proteinTotalInput && data.protein !== null && data.protein !== undefined) {
            proteinTotalInput.value = data.protein;
            // Store original value if auto-corrected
            if (data.proteinCorrected && data.originalProtein !== undefined) {
                proteinTotalInput.dataset.originalValue = data.originalProtein;
            }
        }
        if (cystineInput && data.cystine !== null && data.cystine !== undefined) cystineInput.value = data.cystine;
        if (histidineInput && data.histidine !== null && data.histidine !== undefined) histidineInput.value = data.histidine;
        if (isoleucineInput && data.isoleucine !== null && data.isoleucine !== undefined) isoleucineInput.value = data.isoleucine;
        if (leucineInput && data.leucine !== null && data.leucine !== undefined) leucineInput.value = data.leucine;
        if (lysineInput && data.lysine !== null && data.lysine !== undefined) lysineInput.value = data.lysine;
        if (methionineInput && data.methionine !== null && data.methionine !== undefined) methionineInput.value = data.methionine;
        if (phenylalanineInput && data.phenylalanine !== null && data.phenylalanine !== undefined) phenylalanineInput.value = data.phenylalanine;
        if (threonineInput && data.threonine !== null && data.threonine !== undefined) threonineInput.value = data.threonine;
        if (tryptophanInput && data.tryptophan !== null && data.tryptophan !== undefined) tryptophanInput.value = data.tryptophan;
        if (tyrosineInput && data.tyrosine !== null && data.tyrosine !== undefined) tyrosineInput.value = data.tyrosine;
        if (valineInput && data.valine !== null && data.valine !== undefined) valineInput.value = data.valine;

        // Vitamins section
        if (vitaminB1Input && data.vitaminB1 !== null && data.vitaminB1 !== undefined) vitaminB1Input.value = data.vitaminB1;
        if (vitaminB2Input && data.vitaminB2 !== null && data.vitaminB2 !== undefined) vitaminB2Input.value = data.vitaminB2;
        if (vitaminB3Input && data.vitaminB3 !== null && data.vitaminB3 !== undefined) vitaminB3Input.value = data.vitaminB3;
        if (vitaminB5Input && data.vitaminB5 !== null && data.vitaminB5 !== undefined) vitaminB5Input.value = data.vitaminB5;
        if (vitaminB6Input && data.vitaminB6 !== null && data.vitaminB6 !== undefined) vitaminB6Input.value = data.vitaminB6;
        if (vitaminB12Input && data.vitaminB12 !== null && data.vitaminB12 !== undefined) vitaminB12Input.value = data.vitaminB12;
        if (folateInput && data.folate !== null && data.folate !== undefined) folateInput.value = data.folate;
        if (vitaminAInput && data.vitaminA !== null && data.vitaminA !== undefined) vitaminAInput.value = data.vitaminA;
        if (vitaminCInput && data.vitaminC !== null && data.vitaminC !== undefined) vitaminCInput.value = data.vitaminC;
        if (vitaminDInput && data.vitaminD !== null && data.vitaminD !== undefined) vitaminDInput.value = data.vitaminD;
        if (vitaminEInput && data.vitaminE !== null && data.vitaminE !== undefined) vitaminEInput.value = data.vitaminE;
        if (vitaminKInput && data.vitaminK !== null && data.vitaminK !== undefined) vitaminKInput.value = data.vitaminK;

        // Minerals section
        if (calciumInput && data.calcium !== null && data.calcium !== undefined) calciumInput.value = data.calcium;
        if (copperInput && data.copper !== null && data.copper !== undefined) copperInput.value = data.copper;
        if (ironInput && data.iron !== null && data.iron !== undefined) ironInput.value = data.iron;
        if (magnesiumInput && data.magnesium !== null && data.magnesium !== undefined) magnesiumInput.value = data.magnesium;
        if (manganeseInput && data.manganese !== null && data.manganese !== undefined) manganeseInput.value = data.manganese;
        if (phosphorusInput && data.phosphorus !== null && data.phosphorus !== undefined) phosphorusInput.value = data.phosphorus;
        if (potassiumInput && data.potassium !== null && data.potassium !== undefined) potassiumInput.value = data.potassium;
        if (seleniumInput && data.selenium !== null && data.selenium !== undefined) seleniumInput.value = data.selenium;
        if (sodiumInput && data.sodium !== null && data.sodium !== undefined) sodiumInput.value = data.sodium;
        if (zincInput && data.zinc !== null && data.zinc !== undefined) zincInput.value = data.zinc;

        // Highlight detailed fields that were filled
        // General section
        if (energyInput) {
            highlightField(energyInput, data.calories !== null && data.calories !== undefined, data.caloriesCorrected);
            addPercentageIndicator(energyInput, 'calories', data.percentages);
        }
        if (alcoholInput) {
            highlightField(alcoholInput, data.alcohol !== null && data.alcohol !== undefined);
            addPercentageIndicator(alcoholInput, 'alcohol', data.percentages);
        }
        if (caffeineInput) {
            highlightField(caffeineInput, data.caffeine !== null && data.caffeine !== undefined);
            addPercentageIndicator(caffeineInput, 'caffeine', data.percentages);
        }
        if (waterInput) {
            highlightField(waterInput, (data.water !== null && data.water !== undefined) || (data.amount !== null && data.amount !== undefined), data.amountCorrected);
            addPercentageIndicator(waterInput, 'water', data.percentages);
        }

        // Carbohydrates section
        if (carbsTotalInput) {
            highlightField(carbsTotalInput, data.carbs !== null && data.carbs !== undefined, data.carbsCorrected);
            addPercentageIndicator(carbsTotalInput, 'carbs', data.percentages);
        }
        if (fiberInput) {
            highlightField(fiberInput, data.fiber !== null && data.fiber !== undefined);
            addPercentageIndicator(fiberInput, 'fiber', data.percentages);
        }
        if (starchInput) {
            highlightField(starchInput, data.starch !== null && data.starch !== undefined);
            addPercentageIndicator(starchInput, 'starch', data.percentages);
        }
        if (sugarsInput) {
            highlightField(sugarsInput, data.sugars !== null && data.sugars !== undefined);
            addPercentageIndicator(sugarsInput, 'sugars', data.percentages);
        }
        if (addedSugarsInput) {
            highlightField(addedSugarsInput, data.addedSugars !== null && data.addedSugars !== undefined);
            addPercentageIndicator(addedSugarsInput, 'addedSugars', data.percentages);
        }
        if (netCarbsInput) {
            highlightField(netCarbsInput, data.netCarbs !== null && data.netCarbs !== undefined);
            addPercentageIndicator(netCarbsInput, 'netCarbs', data.percentages);
        }

        // Lipids section
        if (fatTotalInput) {
            highlightField(fatTotalInput, data.fat !== null && data.fat !== undefined, data.fatCorrected);
            addPercentageIndicator(fatTotalInput, 'fat', data.percentages);
        }
        if (saturatedInput) {
            highlightField(saturatedInput, data.saturated !== null && data.saturated !== undefined);
            addPercentageIndicator(saturatedInput, 'saturated', data.percentages);
        }
        if (monounsaturatedInput) {
            highlightField(monounsaturatedInput, data.monounsaturated !== null && data.monounsaturated !== undefined);
            addPercentageIndicator(monounsaturatedInput, 'monounsaturated', data.percentages);
        }
        if (polyunsaturatedInput) {
            highlightField(polyunsaturatedInput, data.polyunsaturated !== null && data.polyunsaturated !== undefined);
            addPercentageIndicator(polyunsaturatedInput, 'polyunsaturated', data.percentages);
        }
        if (omega3Input) {
            highlightField(omega3Input, data.omega3 !== null && data.omega3 !== undefined);
            addPercentageIndicator(omega3Input, 'omega3', data.percentages);
        }
        if (omega6Input) {
            highlightField(omega6Input, data.omega6 !== null && data.omega6 !== undefined);
            addPercentageIndicator(omega6Input, 'omega6', data.percentages);
        }
        if (transFatInput) {
            highlightField(transFatInput, data.transFat !== null && data.transFat !== undefined);
            addPercentageIndicator(transFatInput, 'transFat', data.percentages);
        }
        if (cholesterolInput) {
            highlightField(cholesterolInput, data.cholesterol !== null && data.cholesterol !== undefined);
            addPercentageIndicator(cholesterolInput, 'cholesterol', data.percentages);
        }

        // Protein section
        if (proteinTotalInput) {
            highlightField(proteinTotalInput, data.protein !== null && data.protein !== undefined, data.proteinCorrected);
            addPercentageIndicator(proteinTotalInput, 'protein', data.percentages);
        }
        if (cystineInput) {
            highlightField(cystineInput, data.cystine !== null && data.cystine !== undefined);
            addPercentageIndicator(cystineInput, 'cystine', data.percentages);
        }
        if (histidineInput) {
            highlightField(histidineInput, data.histidine !== null && data.histidine !== undefined);
            addPercentageIndicator(histidineInput, 'histidine', data.percentages);
        }
        if (isoleucineInput) {
            highlightField(isoleucineInput, data.isoleucine !== null && data.isoleucine !== undefined);
            addPercentageIndicator(isoleucineInput, 'isoleucine', data.percentages);
        }
        if (leucineInput) {
            highlightField(leucineInput, data.leucine !== null && data.leucine !== undefined);
            addPercentageIndicator(leucineInput, 'leucine', data.percentages);
        }
        if (lysineInput) {
            highlightField(lysineInput, data.lysine !== null && data.lysine !== undefined);
            addPercentageIndicator(lysineInput, 'lysine', data.percentages);
        }
        if (methionineInput) {
            highlightField(methionineInput, data.methionine !== null && data.methionine !== undefined);
            addPercentageIndicator(methionineInput, 'methionine', data.percentages);
        }
        if (phenylalanineInput) {
            highlightField(phenylalanineInput, data.phenylalanine !== null && data.phenylalanine !== undefined);
            addPercentageIndicator(phenylalanineInput, 'phenylalanine', data.percentages);
        }
        if (threonineInput) {
            highlightField(threonineInput, data.threonine !== null && data.threonine !== undefined);
            addPercentageIndicator(threonineInput, 'threonine', data.percentages);
        }
        if (tryptophanInput) {
            highlightField(tryptophanInput, data.tryptophan !== null && data.tryptophan !== undefined);
            addPercentageIndicator(tryptophanInput, 'tryptophan', data.percentages);
        }
        if (tyrosineInput) {
            highlightField(tyrosineInput, data.tyrosine !== null && data.tyrosine !== undefined);
            addPercentageIndicator(tyrosineInput, 'tyrosine', data.percentages);
        }
        if (valineInput) {
            highlightField(valineInput, data.valine !== null && data.valine !== undefined);
            addPercentageIndicator(valineInput, 'valine', data.percentages);
        }

        // Vitamins section
        if (vitaminB1Input) {
            highlightField(vitaminB1Input, data.vitaminB1 !== null && data.vitaminB1 !== undefined);
            addPercentageIndicator(vitaminB1Input, 'vitaminB1', data.percentages);
        }
        if (vitaminB2Input) {
            highlightField(vitaminB2Input, data.vitaminB2 !== null && data.vitaminB2 !== undefined);
            addPercentageIndicator(vitaminB2Input, 'vitaminB2', data.percentages);
        }
        if (vitaminB3Input) {
            highlightField(vitaminB3Input, data.vitaminB3 !== null && data.vitaminB3 !== undefined);
            addPercentageIndicator(vitaminB3Input, 'vitaminB3', data.percentages);
        }
        if (vitaminB5Input) {
            highlightField(vitaminB5Input, data.vitaminB5 !== null && data.vitaminB5 !== undefined);
            addPercentageIndicator(vitaminB5Input, 'vitaminB5', data.percentages);
        }
        if (vitaminB6Input) {
            highlightField(vitaminB6Input, data.vitaminB6 !== null && data.vitaminB6 !== undefined);
            addPercentageIndicator(vitaminB6Input, 'vitaminB6', data.percentages);
        }
        if (vitaminB12Input) {
            highlightField(vitaminB12Input, data.vitaminB12 !== null && data.vitaminB12 !== undefined);
            addPercentageIndicator(vitaminB12Input, 'vitaminB12', data.percentages);
        }
        if (folateInput) {
            highlightField(folateInput, data.folate !== null && data.folate !== undefined);
            addPercentageIndicator(folateInput, 'folate', data.percentages);
        }
        if (vitaminAInput) {
            highlightField(vitaminAInput, data.vitaminA !== null && data.vitaminA !== undefined);
            addPercentageIndicator(vitaminAInput, 'vitaminA', data.percentages);
        }
        if (vitaminCInput) {
            highlightField(vitaminCInput, data.vitaminC !== null && data.vitaminC !== undefined);
            addPercentageIndicator(vitaminCInput, 'vitaminC', data.percentages);
        }
        if (vitaminDInput) {
            highlightField(vitaminDInput, data.vitaminD !== null && data.vitaminD !== undefined);
            addPercentageIndicator(vitaminDInput, 'vitaminD', data.percentages);
        }
        if (vitaminEInput) {
            highlightField(vitaminEInput, data.vitaminE !== null && data.vitaminE !== undefined);
            addPercentageIndicator(vitaminEInput, 'vitaminE', data.percentages);
        }
        if (vitaminKInput) {
            highlightField(vitaminKInput, data.vitaminK !== null && data.vitaminK !== undefined);
            addPercentageIndicator(vitaminKInput, 'vitaminK', data.percentages);
        }

        // Minerals section
        if (calciumInput) {
            highlightField(calciumInput, data.calcium !== null && data.calcium !== undefined);
            addPercentageIndicator(calciumInput, 'calcium', data.percentages);
        }
        if (copperInput) {
            highlightField(copperInput, data.copper !== null && data.copper !== undefined);
            addPercentageIndicator(copperInput, 'copper', data.percentages);
        }
        if (ironInput) {
            highlightField(ironInput, data.iron !== null && data.iron !== undefined);
            addPercentageIndicator(ironInput, 'iron', data.percentages);
        }
        if (magnesiumInput) {
            highlightField(magnesiumInput, data.magnesium !== null && data.magnesium !== undefined);
            addPercentageIndicator(magnesiumInput, 'magnesium', data.percentages);
        }
        if (manganeseInput) {
            highlightField(manganeseInput, data.manganese !== null && data.manganese !== undefined);
            addPercentageIndicator(manganeseInput, 'manganese', data.percentages);
        }
        if (phosphorusInput) {
            highlightField(phosphorusInput, data.phosphorus !== null && data.phosphorus !== undefined);
            addPercentageIndicator(phosphorusInput, 'phosphorus', data.percentages);
        }
        if (potassiumInput) {
            highlightField(potassiumInput, data.potassium !== null && data.potassium !== undefined);
            addPercentageIndicator(potassiumInput, 'potassium', data.percentages);
        }
        if (seleniumInput) {
            highlightField(seleniumInput, data.selenium !== null && data.selenium !== undefined);
            addPercentageIndicator(seleniumInput, 'selenium', data.percentages);
        }
        if (sodiumInput) {
            highlightField(sodiumInput, data.sodium !== null && data.sodium !== undefined);
            addPercentageIndicator(sodiumInput, 'sodium', data.percentages);
        }
        if (zincInput) {
            highlightField(zincInput, data.zinc !== null && data.zinc !== undefined);
            addPercentageIndicator(zincInput, 'zinc', data.percentages);
        }

        // Add a note about N/T values if any were found
        if (data.percentages && Object.values(data.percentages).some(val => val === 'N/T')) {
            const scanStatus = ingredientItem.querySelector('.scan-status');
            if (scanStatus) {
                scanStatus.textContent += ' (N/T = No Target value available)';
            }
        }
    }

    // Function to add percentage indicators to nutrition fields
    function addPercentageIndicator(inputElement, nutrientName, percentages) {
        // Remove any existing percentage indicator
        const parentElement = inputElement.closest('.nutrition-item');
        if (!parentElement) return;

        const existingIndicator = parentElement.querySelector('.nutrition-percentage');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Check if we have a percentage value for this nutrient
        if (percentages && (percentages[nutrientName] !== undefined || percentages[nutrientName.toLowerCase()] !== undefined)) {
            const percentValue = percentages[nutrientName] !== undefined ? percentages[nutrientName] : percentages[nutrientName.toLowerCase()];

            // Create the percentage indicator
            const indicator = document.createElement('span');
            indicator.className = 'nutrition-percentage';

            // Handle N/T values differently
            if (percentValue === 'N/T') {
                indicator.textContent = 'N/T';
                indicator.classList.add('nt');
                indicator.title = 'No Target value available';
            } else {
                indicator.textContent = percentValue + '%';
                indicator.title = `${percentValue}% of daily recommended value`;
            }

            // Add the indicator to the parent element
            parentElement.appendChild(indicator);
        }
    }

    // Function to highlight a field that was filled or needs to be filled
    function highlightField(inputElement, wasUpdated, wasAutoCorrected = false) {
        if (wasUpdated) {
            if (wasAutoCorrected) {
                // Add a persistent green highlight for auto-corrected fields
                inputElement.style.backgroundColor = '#c3e6cb'; // Darker green
                inputElement.style.borderColor = '#28a745'; // Bootstrap success color
                inputElement.style.boxShadow = '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'; // Green glow
                inputElement.classList.add('auto-corrected');

                // Add a tooltip or data attribute to show the original value
                if (inputElement.dataset.originalValue) {
                    inputElement.title = `Auto-corrected from: ${inputElement.dataset.originalValue}`;
                } else {
                    inputElement.title = 'Auto-corrected value - please verify';
                }
            } else {
                // Add a temporary highlight effect for filled fields
                inputElement.style.backgroundColor = '#d4edda';
                inputElement.style.borderColor = '#c3e6cb';

                // Remove the highlight after 2 seconds
                setTimeout(() => {
                    inputElement.style.backgroundColor = '';
                    inputElement.style.borderColor = '';
                }, 2000);
            }
        } else {
            // Highlight fields that need to be filled with a more noticeable color
            inputElement.style.backgroundColor = '#fff3cd';
            inputElement.style.borderColor = '#ffc107';
            inputElement.style.boxShadow = '0 0 0 0.2rem rgba(255, 193, 7, 0.25)';

            // Keep the highlight for these fields
            // Add a subtle pulsing effect to draw attention to empty fields
            inputElement.classList.add('empty-field-highlight');
        }
    }

    // Function to set up the detailed nutrition toggle buttons
    function setupDetailedNutritionToggles() {
        // Use event delegation for toggle buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('toggle-detailed-nutrition')) {
                const button = event.target;
                const panel = button.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');

                if (panel.style.display === 'none') {
                    panel.style.display = 'block';
                    button.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    button.textContent = 'Show Detailed Nutrition';
                }
            }
        });

        // Auto-expand detailed nutrition on page load for better visibility
        document.querySelectorAll('.detailed-nutrition-panel').forEach(panel => {
            panel.style.display = 'block';
            const button = panel.closest('.ingredient-item').querySelector('.toggle-detailed-nutrition');
            if (button) button.textContent = 'Hide Detailed Nutrition';
        });
    }

    // Function to update hidden fields when detailed nutrition fields change
    function setupNutritionFieldSync() {
        // We no longer need to listen for changes to the basic fields since they're hidden

        // Listen for changes to the detailed nutrition fields
        document.addEventListener('change', (event) => {
            const target = event.target;
            const ingredientItem = target.closest('.ingredient-item');

            if (!ingredientItem) return;

            // Update hidden fields when detailed fields change
            if (target.classList.contains('nutrition-energy')) {
                const caloriesInput = ingredientItem.querySelector('.ingredient-calories');
                if (caloriesInput) caloriesInput.value = target.value;
            }

            if (target.classList.contains('nutrition-protein-total')) {
                const proteinInput = ingredientItem.querySelector('.ingredient-protein');
                if (proteinInput) proteinInput.value = target.value;
            }

            if (target.classList.contains('nutrition-fat-total')) {
                const fatInput = ingredientItem.querySelector('.ingredient-fat');
                if (fatInput) fatInput.value = target.value;
            }

            if (target.classList.contains('nutrition-carbs-total')) {
                const carbsInput = ingredientItem.querySelector('.ingredient-carbs');
                if (carbsInput) carbsInput.value = target.value;
            }
        });
    }

    // Initialize the scanner functionality
    setupScanButtons();
    setupPaddleOCRToggle();
    setupDetailedNutritionToggles();
    setupNutritionFieldSync();
});
