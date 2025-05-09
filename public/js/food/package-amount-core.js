/**
 * Package Amount Core
 * 
 * This module provides core functionality for handling package amounts across the application.
 * It consolidates duplicate code from multiple files into a single, reusable module.
 * 
 * Features:
 * - Package amount validation
 * - Package amount formatting
 * - Package amount field initialization
 * - Package amount update handling
 */

window.PackageAmountCore = (function() {
    // ===== CONSTANTS =====
    
    /**
     * Selectors for package amount input fields
     */
    const PACKAGE_AMOUNT_SELECTORS = [
        '.ingredient-package-amount',
        '#edit-ingredient-package-amount',
        '#add-ingredient-package-amount',
        '[id*="package-amount"]'
    ];
    
    /**
     * Combined selector for all package amount input fields
     */
    const COMBINED_SELECTOR = PACKAGE_AMOUNT_SELECTORS.join(', ');
    
    // ===== VALIDATION FUNCTIONS =====
    
    /**
     * Fix validation constraints on package amount input fields
     * @param {HTMLElement} input - The input element to fix
     */
    function fixValidationConstraints(input) {
        // Remove step attribute to allow any decimal value
        input.removeAttribute('step');
        
        // Set a very small step value to allow virtually any decimal
        input.setAttribute('step', '0.000001');
        
        // Remove any min/max constraints
        input.removeAttribute('min');
        input.removeAttribute('max');
    }
    
    /**
     * Fix validation for all package amount input fields in a container
     * @param {HTMLElement} container - Container element (defaults to document)
     */
    function fixAllPackageAmountValidation(container = document) {
        const packageAmountInputs = container.querySelectorAll(COMBINED_SELECTOR);
        
        packageAmountInputs.forEach(input => {
            fixValidationConstraints(input);
            console.log(`[PackageAmountCore] Fixed validation for: ${input.id || 'unnamed input'}`);
        });
    }
    
    // ===== FORMATTING FUNCTIONS =====
    
    /**
     * Format a package amount value
     * @param {string|number} value - The value to format
     * @returns {number|null} - Formatted value or null if invalid
     */
    function formatPackageAmount(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        
        // Trim if it's a string
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        
        // Parse as float
        const parsedValue = parseFloat(trimmedValue);
        
        // Return null if parsing failed
        if (isNaN(parsedValue)) {
            return null;
        }
        
        return parsedValue;
    }
    
    /**
     * Update package amount input value with formatted value
     * @param {HTMLElement} input - The input element to update
     * @returns {number|null} - The formatted value or null if invalid
     */
    function updateInputValue(input) {
        if (!input) return null;
        
        const formattedValue = formatPackageAmount(input.value);
        
        if (formattedValue !== null) {
            input.value = formattedValue;
        }
        
        return formattedValue;
    }
    
    /**
     * Format all package amount inputs in a container
     * @param {HTMLElement} container - Container element (defaults to document)
     */
    function formatAllPackageAmounts(container = document) {
        const packageAmountInputs = container.querySelectorAll(COMBINED_SELECTOR);
        
        packageAmountInputs.forEach(input => {
            const formattedValue = updateInputValue(input);
            console.log(`[PackageAmountCore] Formatted package amount: ${formattedValue}`);
        });
    }
    
    // ===== EVENT HANDLING =====
    
    /**
     * Handle form submission to ensure package amounts are properly formatted
     * @param {Event} event - The submit event
     */
    function handleFormSubmission(event) {
        const form = event.target;
        const packageAmountInputs = form.querySelectorAll(COMBINED_SELECTOR);
        
        packageAmountInputs.forEach(input => {
            const formattedValue = updateInputValue(input);
            console.log(`[PackageAmountCore] Formatted package amount for submission: ${formattedValue}`);
        });
    }
    
    /**
     * Handle input event on package amount fields
     * @param {Event} event - The input event
     */
    function handlePackageAmountInput(event) {
        // Allow only numbers and decimal point
        const input = event.target;
        const value = input.value;
        
        // Replace any non-numeric characters except decimal point
        const sanitizedValue = value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = sanitizedValue.split('.');
        const newValue = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
        
        // Update the input value if it changed
        if (newValue !== value) {
            input.value = newValue;
        }
    }
    
    // ===== INITIALIZATION =====
    
    /**
     * Initialize package amount handling
     */
    function initialize() {
        console.log('[PackageAmountCore] Initializing...');
        
        // Fix validation for existing package amount inputs
        fixAllPackageAmountValidation();
        
        // Set up a MutationObserver to watch for new package amount fields
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself is a package amount input
                            if (node.matches && node.matches(COMBINED_SELECTOR)) {
                                fixValidationConstraints(node);
                                console.log(`[PackageAmountCore] Fixed validation for new input: ${node.id || 'unnamed input'}`);
                            }
                            
                            // Check for package amount inputs within the node
                            const inputs = node.querySelectorAll ? node.querySelectorAll(COMBINED_SELECTOR) : [];
                            if (inputs.length > 0) {
                                inputs.forEach(input => {
                                    fixValidationConstraints(input);
                                    console.log(`[PackageAmountCore] Fixed validation for new input: ${input.id || 'unnamed input'}`);
                                });
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Add form submission handlers
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.dataset.packageAmountInitialized) {
                form.dataset.packageAmountInitialized = 'true';
                form.addEventListener('submit', handleFormSubmission, true);
            }
        });
        
        // Add input event handlers to package amount fields
        document.addEventListener('input', function(event) {
            if (event.target.matches && event.target.matches(COMBINED_SELECTOR)) {
                handlePackageAmountInput(event);
            }
        });
        
        // Add click event listener for buttons that might add new package amount fields
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('add-ingredient-to-recipe-btn') || 
                event.target.classList.contains('edit-ingredient-btn')) {
                setTimeout(() => fixAllPackageAmountValidation(), 100);
            }
        });
        
        console.log('[PackageAmountCore] Initialized');
    }
    
    // Initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initialize);
    
    // ===== PUBLIC API =====
    
    return {
        // Constants
        PACKAGE_AMOUNT_SELECTORS,
        COMBINED_SELECTOR,
        
        // Validation
        fixValidationConstraints,
        fixAllPackageAmountValidation,
        
        // Formatting
        formatPackageAmount,
        updateInputValue,
        formatAllPackageAmounts,
        
        // Event handling
        handleFormSubmission,
        handlePackageAmountInput,
        
        // Initialization
        initialize
    };
})();
