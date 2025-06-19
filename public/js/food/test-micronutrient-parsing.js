/**
 * Test Micronutrient Parsing
 * 
 * This script tests the micronutrient parsing functionality by creating a test modal
 * with micronutrient fields and testing the Cronometer data parsing.
 */

(function() {
    console.log('[Test Micronutrient Parsing] Initializing test...');

    // Create a test button to trigger the test
    function createTestButton() {
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Micronutrient Parsing';
        testButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        testButton.addEventListener('click', runTest);
        document.body.appendChild(testButton);
        console.log('[Test Micronutrient Parsing] Test button created');
    }

    // Create test modal with micronutrient fields
    function createTestModal() {
        const modal = document.createElement('div');
        modal.id = 'test-micronutrient-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50px;
            width: 600px;
            height: 500px;
            background: #2a2a2a;
            border: 1px solid #555;
            border-radius: 8px;
            padding: 20px;
            z-index: 10001;
            overflow-y: auto;
            color: white;
        `;

        // Create header
        const header = document.createElement('h3');
        header.textContent = 'Test Micronutrient Parsing';
        header.style.marginBottom = '20px';
        modal.appendChild(header);

        // Create Cronometer data input
        const cronometerSection = document.createElement('div');
        cronometerSection.innerHTML = `
            <h4>Cronometer Data (Optional)</h4>
            <textarea id="test-cronometer-data" placeholder="Paste Cronometer data here..." style="width: 100%; height: 100px; background: #333; color: white; border: 1px solid #555; padding: 10px; margin-bottom: 10px;"></textarea>
            <button id="test-parse-button" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">Parse Nutrition Data</button>
        `;
        modal.appendChild(cronometerSection);

        // Create micronutrient fields
        const micronutrientSection = document.createElement('div');
        micronutrientSection.innerHTML = `
            <h4>Micronutrients</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div>
                    <label>Vitamin A (μg):</label>
                    <input type="number" id="test-vitamin-a" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Vitamin C (mg):</label>
                    <input type="number" id="test-vitamin-c" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Iron (mg):</label>
                    <input type="number" id="test-iron" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Calcium (mg):</label>
                    <input type="number" id="test-calcium" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Magnesium (mg):</label>
                    <input type="number" id="test-magnesium" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Potassium (mg):</label>
                    <input type="number" id="test-potassium" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Sodium (mg):</label>
                    <input type="number" id="test-sodium" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
                <div>
                    <label>Fiber (g):</label>
                    <input type="number" id="test-fiber" style="width: 100%; background: #333; color: white; border: 1px solid #555; padding: 5px;">
                </div>
            </div>
        `;
        modal.appendChild(micronutrientSection);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
        `;
        closeButton.addEventListener('click', () => modal.remove());
        modal.appendChild(closeButton);

        // Add parse button functionality
        const parseButton = modal.querySelector('#test-parse-button');
        parseButton.addEventListener('click', () => {
            const cronometerData = modal.querySelector('#test-cronometer-data').value;
            testCronometerParsing(cronometerData, modal);
        });

        document.body.appendChild(modal);
        return modal;
    }

    // Test Cronometer parsing functionality
    function testCronometerParsing(cronometerData, modal) {
        console.log('[Test Micronutrient Parsing] Testing Cronometer parsing...');
        console.log('Cronometer data:', cronometerData);

        // Check if parsing functions exist
        if (typeof window.processCronometerText === 'function') {
            console.log('[Test] processCronometerText function found');
            
            // Create a mock status element
            const statusElement = document.createElement('div');
            statusElement.style.cssText = 'color: green; margin: 10px 0;';
            modal.appendChild(statusElement);
            
            try {
                window.processCronometerText(cronometerData, modal, statusElement);
                console.log('[Test] processCronometerText called successfully');
            } catch (error) {
                console.error('[Test] Error calling processCronometerText:', error);
                statusElement.textContent = 'Error: ' + error.message;
                statusElement.style.color = 'red';
            }
        } else {
            console.log('[Test] processCronometerText function not found');
            
            // Try to manually parse the data
            testManualParsing(cronometerData, modal);
        }
    }

    // Manual parsing test
    function testManualParsing(cronometerData, modal) {
        console.log('[Test] Attempting manual parsing...');
        
        // Simple regex patterns to extract micronutrient data
        const patterns = {
            'vitamin-a': /Vitamin A[:\s]*([0-9.]+)/i,
            'vitamin-c': /Vitamin C[:\s]*([0-9.]+)/i,
            'iron': /Iron[:\s]*([0-9.]+)/i,
            'calcium': /Calcium[:\s]*([0-9.]+)/i,
            'magnesium': /Magnesium[:\s]*([0-9.]+)/i,
            'potassium': /Potassium[:\s]*([0-9.]+)/i,
            'sodium': /Sodium[:\s]*([0-9.]+)/i,
            'fiber': /Fiber[:\s]*([0-9.]+)/i
        };

        let foundValues = {};
        
        for (const [nutrient, pattern] of Object.entries(patterns)) {
            const match = cronometerData.match(pattern);
            if (match) {
                foundValues[nutrient] = match[1];
                console.log(`[Test] Found ${nutrient}: ${match[1]}`);
                
                // Update the corresponding field
                const field = modal.querySelector(`#test-${nutrient}`);
                if (field) {
                    field.value = match[1];
                    field.style.backgroundColor = '#2d5a2d'; // Green background to show it was updated
                }
            }
        }

        // Show results
        const statusElement = modal.querySelector('.test-status') || document.createElement('div');
        statusElement.className = 'test-status';
        statusElement.style.cssText = 'color: green; margin: 10px 0; padding: 10px; background: #333; border-radius: 4px;';
        statusElement.innerHTML = `
            <strong>Parsing Results:</strong><br>
            Found ${Object.keys(foundValues).length} micronutrients:<br>
            ${Object.entries(foundValues).map(([key, value]) => `${key}: ${value}`).join('<br>')}
        `;
        
        if (!modal.querySelector('.test-status')) {
            modal.appendChild(statusElement);
        }
    }

    // Run the test
    function runTest() {
        console.log('[Test Micronutrient Parsing] Running test...');
        createTestModal();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createTestButton);
    } else {
        createTestButton();
    }

})();
