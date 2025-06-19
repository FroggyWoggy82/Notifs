/**
 * Debug script to inject into browser console to test Save Recipe button
 * Copy and paste this into the browser console on the food page
 */

console.log('🔍 Starting Save Recipe Button Debug...');

// Check if form exists
const form = document.getElementById('create-recipe-form');
console.log('Form exists:', !!form);

// Check if button exists
const button = document.querySelector('button[type="submit"]');
console.log('Save Recipe button exists:', !!button);
console.log('Button text:', button ? button.textContent : 'N/A');

// Check if ingredients exist
const ingredients = document.querySelectorAll('.ingredient-item');
console.log('Ingredient items found:', ingredients.length);

if (ingredients.length > 0) {
    const firstIngredient = ingredients[0];
    
    // Check all the input fields
    const nameInput = firstIngredient.querySelector('.ingredient-name');
    const amountInput = firstIngredient.querySelector('.ingredient-amount');
    const priceInput = firstIngredient.querySelector('.ingredient-price');
    const caloriesInput = firstIngredient.querySelector('.ingredient-calories');
    const proteinInput = firstIngredient.querySelector('.ingredient-protein');
    const fatInput = firstIngredient.querySelector('.ingredient-fat');
    const carbsInput = firstIngredient.querySelector('.ingredient-carbs');
    
    console.log('Input fields found:');
    console.log('- Name:', !!nameInput, nameInput?.value);
    console.log('- Amount:', !!amountInput, amountInput?.value);
    console.log('- Price:', !!priceInput, priceInput?.value);
    console.log('- Calories:', !!caloriesInput, caloriesInput?.value);
    console.log('- Protein:', !!proteinInput, proteinInput?.value);
    console.log('- Fat:', !!fatInput, fatInput?.value);
    console.log('- Carbs:', !!carbsInput, carbsInput?.value);
}

// Test if the simple-save-recipe-handler script loaded
console.log('Checking if simple-save-recipe-handler loaded...');

// Try to manually trigger the form submission
if (form && button) {
    console.log('🖱️ Manually triggering form submit event...');
    
    // Create and dispatch a submit event
    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    
    form.dispatchEvent(submitEvent);
    
    console.log('Submit event dispatched');
}

// Check if there are any event listeners on the form
if (form) {
    console.log('Form element:', form);
    
    // Try to get event listeners (Chrome DevTools specific)
    if (window.getEventListeners) {
        const listeners = getEventListeners(form);
        console.log('Form event listeners:', listeners);
    } else {
        console.log('getEventListeners not available (not in Chrome DevTools)');
    }
}

// Test direct button click
if (button) {
    console.log('🖱️ Testing direct button click...');
    
    button.addEventListener('click', function(e) {
        console.log('Button click detected!', e);
    });
    
    // Simulate click
    button.click();
}

console.log('🔍 Debug complete - check console for results');
