const { chromium } = require('playwright');

(async () => {
    console.log('Testing Save Recipe button click...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to food page
    console.log('Navigating to food page...');
    await page.goto('http://localhost:3000/food');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Fill out basic form data
    console.log('Filling recipe name...');
    await page.fill('#recipeName', 'Test Recipe');
    
    console.log('Filling ingredient details...');
    await page.fill('.ingredient-name', 'Test Ingredient');
    await page.fill('.ingredient-amount', '100');
    await page.fill('.ingredient-price', '2.50');
    
    // Set hidden nutrition fields
    await page.evaluate(() => {
        const caloriesField = document.querySelector('.ingredient-calories');
        const proteinField = document.querySelector('.ingredient-protein');
        const carbsField = document.querySelector('.ingredient-carbs');
        const fatField = document.querySelector('.ingredient-fat');
        
        if (caloriesField) caloriesField.value = '200';
        if (proteinField) proteinField.value = '10';
        if (carbsField) carbsField.value = '30';
        if (fatField) fatField.value = '5';
    });
    
    // Add event listeners to debug what happens when button is clicked
    await page.evaluate(() => {
        const form = document.getElementById('create-recipe-form');
        const button = form.querySelector('button[type="submit"]');
        
        console.log('BUTTON DEBUG: Button found:', !!button);
        console.log('BUTTON DEBUG: Button text:', button?.textContent);
        console.log('BUTTON DEBUG: Button type:', button?.type);
        console.log('BUTTON DEBUG: Button disabled:', button?.disabled);
        
        // Add click listener to button
        if (button) {
            button.addEventListener('click', (e) => {
                console.log('BUTTON DEBUG: Button clicked!');
                console.log('BUTTON DEBUG: Event default prevented:', e.defaultPrevented);
                console.log('BUTTON DEBUG: Event type:', e.type);
            });
        }
        
        // Add submit listener to form
        if (form) {
            form.addEventListener('submit', (e) => {
                console.log('FORM DEBUG: Form submit event triggered!');
                console.log('FORM DEBUG: Event default prevented:', e.defaultPrevented);
            });
        }
        
        // Check if there are any other click listeners
        const allButtons = document.querySelectorAll('button');
        console.log('BUTTON DEBUG: Total buttons on page:', allButtons.length);

        // Check if the button is actually clickable (not covered by something)
        if (button) {
            const rect = button.getBoundingClientRect();
            const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
            console.log('BUTTON DEBUG: Button position:', rect);
            console.log('BUTTON DEBUG: Element at button center:', elementAtPoint?.tagName, elementAtPoint?.className);
            console.log('BUTTON DEBUG: Is element at center the button?', elementAtPoint === button);

            // Check computed styles
            const computedStyle = window.getComputedStyle(button);
            console.log('BUTTON DEBUG: Button z-index:', computedStyle.zIndex);
            console.log('BUTTON DEBUG: Button pointer-events:', computedStyle.pointerEvents);
            console.log('BUTTON DEBUG: Button position style:', computedStyle.position);

            // Find what's covering the button by checking all elements at that point
            console.log('BUTTON DEBUG: Investigating what is covering the button...');
            let currentElement = elementAtPoint;
            let depth = 0;
            while (currentElement && depth < 10) {
                console.log(`BUTTON DEBUG: Layer ${depth}:`, currentElement.tagName, currentElement.className, currentElement.id);
                currentElement = currentElement.parentElement;
                depth++;
            }

            // Try to find any overlapping elements
            const allElements = document.querySelectorAll('*');
            const overlappingElements = [];
            allElements.forEach(el => {
                const elRect = el.getBoundingClientRect();
                if (elRect.left < rect.right && elRect.right > rect.left &&
                    elRect.top < rect.bottom && elRect.bottom > rect.top) {
                    const elStyle = window.getComputedStyle(el);
                    if (elStyle.position === 'fixed' || elStyle.position === 'absolute' ||
                        parseInt(elStyle.zIndex) > 0) {
                        overlappingElements.push({
                            tag: el.tagName,
                            class: el.className,
                            id: el.id,
                            zIndex: elStyle.zIndex,
                            position: elStyle.position
                        });
                    }
                }
            });
            console.log('BUTTON DEBUG: Overlapping positioned elements:', overlappingElements);
        }
    });
    
    // Wait a moment for event listeners to be set up
    await page.waitForTimeout(1000);
    
    // Find and click the Save Recipe button
    console.log('Looking for Save Recipe button...');
    const saveButton = page.locator('#create-recipe-form button[type="submit"]');
    const buttonCount = await saveButton.count();
    console.log(`Found ${buttonCount} Save Recipe buttons`);
    
    if (buttonCount > 0) {
        console.log('Clicking Save Recipe button...');
        await saveButton.click();

        // Wait to see what happens and check for form submission
        await page.waitForTimeout(2000);

        // Check if form submission was triggered by looking for console logs
        console.log('Checking if form submission was triggered...');
        
        // Check if form was submitted by looking for any changes
        const recipeNameAfter = await page.inputValue('#recipeName');
        console.log(`Recipe name after click: "${recipeNameAfter}"`);
    } else {
        console.log('No Save Recipe button found!');
    }
    
    console.log('Test completed. Press any key to close browser...');
    await page.waitForTimeout(10000);
    
    await browser.close();
})();
