/**
 * Ensure Edit Nutrition Style
 * Makes sure the detailed nutrition panel in the edit ingredient form matches the style of the first image
 */

(function() {
    // Function to ensure the detailed nutrition panel style
    function ensureDetailedNutritionStyle() {
        // Find all detailed nutrition panels in edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.nutritionStyled === 'true') return;
            
            // Find the detailed nutrition panel
            const detailedPanel = form.querySelector('.detailed-nutrition-panel');
            if (!detailedPanel) return;
            
            console.log('Ensuring detailed nutrition panel style in edit ingredient form');
            
            // Apply the styling
            detailedPanel.style.display = 'block';
            detailedPanel.style.marginTop = '8px';
            detailedPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            detailedPanel.style.borderRadius = '4px';
            detailedPanel.style.padding = '8px';
            detailedPanel.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            detailedPanel.style.color = '#e0e0e0';
            
            // Style the nutrition sections
            const sections = detailedPanel.querySelectorAll('.nutrition-section');
            sections.forEach(section => {
                section.style.marginBottom = '15px';
                section.style.paddingBottom = '10px';
                
                // Style the section header
                const header = section.querySelector('h4');
                if (header) {
                    header.style.marginTop = '0';
                    header.style.marginBottom = '10px';
                    header.style.paddingBottom = '5px';
                    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                    header.style.color = '#e0e0e0';
                    header.style.fontWeight = '500';
                    header.style.fontSize = '0.85em';
                }
                
                // Style the nutrition grid
                const grid = section.querySelector('.nutrition-grid');
                if (grid) {
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
                    grid.style.gap = '6px';
                }
                
                // Style the nutrition items
                const items = section.querySelectorAll('.nutrition-item');
                items.forEach(item => {
                    item.style.marginBottom = '6px';
                    
                    // Style the label
                    const label = item.querySelector('label');
                    if (label) {
                        label.style.fontSize = '0.75em';
                        label.style.marginBottom = '2px';
                        label.style.color = '#aaa';
                        label.style.display = 'block';
                    }
                    
                    // Style the input
                    const input = item.querySelector('input');
                    if (input) {
                        input.style.width = '50px';
                        input.style.padding = '1px 3px';
                        input.style.height = '20px';
                        input.style.fontSize = '0.75em';
                        input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                        input.style.color = '#e0e0e0';
                        input.style.borderRadius = '4px';
                    }
                });
            });
            
            // Mark the form as processed
            form.dataset.nutritionStyled = 'true';
            
            console.log('Detailed nutrition panel style ensured in edit ingredient form');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing ensure edit nutrition style');
        
        // Initial styling
        ensureDetailedNutritionStyle();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(ensureDetailedNutritionStyle, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle dynamic form creation through event delegation
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn')) {
                // Wait for the form to be displayed
                setTimeout(ensureDetailedNutritionStyle, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(ensureDetailedNutritionStyle, 300);
                setTimeout(ensureDetailedNutritionStyle, 500);
            }
        });
        
        // Run periodically to ensure the style is applied
        setInterval(ensureDetailedNutritionStyle, 1000);
        
        console.log('Ensure edit nutrition style initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
