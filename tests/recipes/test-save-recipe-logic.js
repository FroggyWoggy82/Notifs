/**
 * Test script to verify the Save Recipe button logic
 */

// Mock DOM elements
const mockForm = {
    addEventListener: function(event, handler) {
        console.log(`✓ Event listener added for '${event}'`);
        this._handler = handler;
    },
    querySelector: function(selector) {
        if (selector === 'button[type="submit"]') {
            return mockButton;
        }
        return null;
    },
    reset: function() {
        console.log('✓ Form reset called');
    },
    parentNode: {
        replaceChild: function(newNode, oldNode) {
            console.log('✓ Form replaced with new form');
            return newNode;
        }
    },
    cloneNode: function(deep) {
        console.log('✓ Form cloned');
        return mockForm;
    }
};

const mockButton = {
    disabled: false,
    textContent: 'Save Recipe',
    set disabled(value) {
        this._disabled = value;
        console.log(`✓ Button disabled set to: ${value}`);
    },
    get disabled() {
        return this._disabled;
    },
    set textContent(value) {
        this._textContent = value;
        console.log(`✓ Button text set to: ${value}`);
    },
    get textContent() {
        return this._textContent;
    }
};

const mockRecipeNameInput = {
    value: 'Test Recipe',
    trim: function() { return this.value; }
};

const mockIngredientItem = {
    querySelector: function(selector) {
        const mockInputs = {
            '.ingredient-name': { value: 'Test Ingredient' },
            '.ingredient-amount': { value: '100' },
            '.ingredient-package-amount': { value: '500' },
            '.grocery-store-input': { value: 'Test Store' },
            '.ingredient-price': { value: '2.99' },
            '.ingredient-calories': { value: '150' },
            '.ingredient-protein': { value: '5' },
            '.ingredient-fat': { value: '2' },
            '.ingredient-carbs': { value: '30' }
        };
        return mockInputs[selector] || null;
    },
    dataset: {}
};

const mockStatusElement = {
    textContent: '',
    className: '',
    set textContent(value) {
        this._textContent = value;
        console.log(`✓ Status text set to: ${value}`);
    },
    get textContent() {
        return this._textContent;
    },
    set className(value) {
        this._className = value;
        console.log(`✓ Status class set to: ${value}`);
    },
    get className() {
        return this._className;
    }
};

const mockIngredientsList = {
    innerHTML: '',
    set innerHTML(value) {
        this._innerHTML = value;
        console.log(`✓ Ingredients list innerHTML set to: ${value}`);
    },
    get innerHTML() {
        return this._innerHTML;
    }
};

// Mock global objects
global.document = {
    getElementById: function(id) {
        const elements = {
            'create-recipe-form': mockForm,
            'recipeName': mockRecipeNameInput,
            'create-recipe-status': mockStatusElement,
            'ingredients-list': mockIngredientsList
        };
        return elements[id] || null;
    },
    querySelectorAll: function(selector) {
        if (selector === '.ingredient-item') {
            return [mockIngredientItem];
        }
        return [];
    },
    readyState: 'complete',
    addEventListener: function(event, handler) {
        console.log(`✓ Document event listener added for '${event}'`);
    }
};

global.fetch = async function(url, options) {
    console.log(`✓ Fetch called: ${url}`);
    console.log(`✓ Request body:`, JSON.parse(options.body));
    
    // Simulate successful response
    return {
        ok: true,
        json: async () => ({
            id: 1,
            name: 'Test Recipe',
            message: 'Recipe saved successfully!'
        })
    };
};

global.addIngredientRow = function() {
    console.log('✓ addIngredientRow called');
};

global.loadRecipes = function() {
    console.log('✓ loadRecipes called');
};

global.setTimeout = function(fn, delay) {
    console.log(`✓ setTimeout called with delay: ${delay}ms`);
    fn(); // Execute immediately for testing
};

global.console = console;

// Test the handler
console.log('=== Testing Save Recipe Handler ===\n');

try {
    // Load the handler code
    const fs = require('fs');
    const handlerCode = fs.readFileSync('public/js/food/simple-save-recipe-handler.js', 'utf8');
    
    // Remove the IIFE wrapper and execute
    const codeToExecute = handlerCode.replace(/^\(function\(\) \{/, '').replace(/\}\)\(\);$/, '');
    eval(codeToExecute);
    
    console.log('\n=== Simulating Form Submission ===\n');
    
    // Simulate form submission
    const mockEvent = {
        preventDefault: function() {
            console.log('✓ preventDefault called');
        },
        target: mockForm
    };
    
    // Call the form handler if it exists
    if (mockForm._handler) {
        mockForm._handler(mockEvent);
    } else {
        console.log('❌ No form handler found');
    }
    
    console.log('\n=== Test Completed Successfully ===');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
}
