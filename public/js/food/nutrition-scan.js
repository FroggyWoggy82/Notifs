// Nutrition Label Scanner functionality
document.addEventListener('DOMContentLoaded', () => {
    // Function to set up event listeners for scan buttons
    function setupScanButtons() {
        // Use event delegation for scan buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('scan-nutrition-btn')) {
                const ingredientItem = event.target.closest('.ingredient-item');
                const fileInput = ingredientItem.querySelector('.nutrition-image-input');

                if (fileInput) {
                    fileInput.click(); // Trigger file input click
                }
            }
        });

        // Use event delegation for file inputs
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('nutrition-image-input')) {
                const file = event.target.files[0];
                if (file) {
                    const ingredientItem = event.target.closest('.ingredient-item');
                    processNutritionImage(file, ingredientItem);
                }
            }
        });
    }

    // Function to process the nutrition image
    async function processNutritionImage(file, ingredientItem) {
        // Show loading status
        const scanStatus = ingredientItem.querySelector('.scan-status');
        scanStatus.textContent = 'Processing image...';
        scanStatus.className = 'scan-status loading';
        scanStatus.style.display = 'block';

        // Create form data for the file upload
        const formData = new FormData();
        formData.append('image', file);

        try {
            console.log('Attempting to process nutrition image...');

            // Try multiple endpoints in case one fails
            let response;
            let nutritionData = null;

            try {
                // Try our energy-specific OCR endpoint first
                console.log('Trying /api/energy-ocr/nutrition endpoint...');
                response = await fetch('/api/energy-ocr/nutrition', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    nutritionData = await response.json();
                    console.log('Successfully received data from energy-ocr endpoint:', nutritionData);
                } else {
                    console.log('energy-ocr endpoint failed with status:', response.status);
                }
            } catch (firstError) {
                console.log('Error with energy-ocr endpoint:', firstError.message);
            }

            // If the first endpoint failed, try the energy simple endpoint
            if (!nutritionData) {
                try {
                    console.log('Trying /api/energy-ocr/simple endpoint...');
                    response = await fetch('/api/energy-ocr/simple', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        nutritionData = await response.json();
                        console.log('Successfully received data from energy-ocr simple endpoint:', nutritionData);
                    } else {
                        console.log('energy-ocr simple endpoint failed with status:', response.status);
                    }
                } catch (secondError) {
                    console.log('Error with energy-ocr simple endpoint:', secondError.message);
                }
            }

            // If both failed, try the original OCR endpoint
            if (!nutritionData) {
                try {
                    console.log('Trying /api/ocr/nutrition endpoint...');
                    response = await fetch('/api/ocr/nutrition', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        nutritionData = await response.json();
                        console.log('Successfully received data from ocr endpoint:', nutritionData);
                    } else {
                        console.log('ocr endpoint failed with status:', response.status);
                    }
                } catch (thirdError) {
                    console.log('Error with ocr endpoint:', thirdError.message);
                }
            }

            // If all endpoints failed, show error
            if (!nutritionData) {
                console.log('All API endpoints failed, showing error');
                throw new Error('Failed to extract nutrition information from image');
            }

            console.log('Final OCR Results:', nutritionData);

            // Fill in the form fields with the extracted data
            fillNutritionFields(ingredientItem, nutritionData);
            scanStatus.textContent = 'Nutrition information extracted successfully!';
            scanStatus.className = 'scan-status success';

            // Hide the status after 3 seconds
            setTimeout(() => {
                scanStatus.style.display = 'none';
            }, 3000);
        } catch (error) {
            console.error('Error processing nutrition image:', error);

            // Show error message
            scanStatus.textContent = `Error: ${error.message}`;
            scanStatus.className = 'scan-status error';

            // Keep the error message visible
        }
    }

    // Function to fill in the nutrition fields
    function fillNutritionFields(ingredientItem, data) {
        // Get all the input fields
        const caloriesInput = ingredientItem.querySelector('.ingredient-calories');
        const amountInput = ingredientItem.querySelector('.ingredient-amount');
        const proteinInput = ingredientItem.querySelector('.ingredient-protein');
        const fatInput = ingredientItem.querySelector('.ingredient-fat');
        const carbsInput = ingredientItem.querySelector('.ingredient-carbs');

        // Fill in the fields if data is available
        if (data.calories !== null) caloriesInput.value = data.calories;
        if (data.amount !== null) amountInput.value = data.amount;
        if (data.protein !== null) proteinInput.value = data.protein;
        if (data.fat !== null) fatInput.value = data.fat;
        if (data.carbs !== null) carbsInput.value = data.carbs;

        // Highlight fields that were filled
        highlightField(caloriesInput, data.calories !== null);
        highlightField(amountInput, data.amount !== null);
        highlightField(proteinInput, data.protein !== null);
        highlightField(fatInput, data.fat !== null);
        highlightField(carbsInput, data.carbs !== null);
    }

    // Function to highlight a field that was filled
    function highlightField(inputElement, wasUpdated) {
        if (wasUpdated) {
            // Add a temporary highlight effect
            inputElement.style.backgroundColor = '#d4edda';
            inputElement.style.borderColor = '#c3e6cb';

            // Remove the highlight after 2 seconds
            setTimeout(() => {
                inputElement.style.backgroundColor = '';
                inputElement.style.borderColor = '';
            }, 2000);
        }
    }

    // Initialize the scanner functionality
    setupScanButtons();
});
