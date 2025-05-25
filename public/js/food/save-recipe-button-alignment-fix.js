/**
 * Save Recipe Button Alignment Fix
 * Ensures the new button layout works correctly with existing functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Save Recipe Button Alignment Fix] Initializing...');

    // Function to ensure the inline Parse Nutrition Data button works correctly
    function setupInlineParseButton() {
        // Find all inline parse buttons
        const inlineParseButtons = document.querySelectorAll('.cronometer-parse-button-inline');
        
        inlineParseButtons.forEach(button => {
            // Skip if already processed
            if (button.dataset.inlineHandlerAdded === 'true') return;
            
            // Mark as processed
            button.dataset.inlineHandlerAdded = 'true';
            
            console.log('[Save Recipe Button Alignment Fix] Setting up inline parse button');
            
            // The onclick handler is already set in the HTML, but we can add additional functionality here if needed
            button.addEventListener('click', function(event) {
                // Ensure the button has the correct styling during processing
                const originalText = this.textContent;
                this.textContent = 'Processing...';
                this.disabled = true;
                
                // Re-enable after a short delay (the actual processing is handled by the onclick)
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            });
        });
    }

    // Function to ensure the Save Recipe button has proper styling
    function setupSaveRecipeButton() {
        const saveRecipeBtn = document.querySelector('.save-recipe-btn');
        
        if (saveRecipeBtn) {
            console.log('[Save Recipe Button Alignment Fix] Setting up save recipe button');
            
            // Add any additional event listeners if needed
            saveRecipeBtn.addEventListener('click', function(event) {
                // Add visual feedback during form submission
                const originalText = this.textContent;
                this.textContent = 'Saving...';
                this.disabled = true;
                
                // The form submission will handle the actual saving
                // Re-enable after a delay in case of errors
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 5000);
            });
        }
    }

    // Function to ensure all buttons in the buttons-row have consistent behavior
    function setupButtonRowButtons() {
        const buttonsRows = document.querySelectorAll('.buttons-row');
        
        buttonsRows.forEach(row => {
            const buttons = row.querySelectorAll('button');
            
            buttons.forEach(button => {
                // Add consistent hover effects and feedback
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-1px)';
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        });
    }

    // Initialize all button setups
    setupInlineParseButton();
    setupSaveRecipeButton();
    setupButtonRowButtons();

    // Re-run setup when new ingredient items are added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('ingredient-item')) {
                            // New ingredient item added, set up its buttons
                            setTimeout(() => {
                                setupInlineParseButton();
                                setupButtonRowButtons();
                            }, 100);
                        }
                    }
                });
            }
        });
    });

    // Start observing the ingredients list for changes
    const ingredientsList = document.getElementById('ingredients-list');
    if (ingredientsList) {
        observer.observe(ingredientsList, {
            childList: true,
            subtree: true
        });
    }

    console.log('[Save Recipe Button Alignment Fix] Initialization complete');
});
