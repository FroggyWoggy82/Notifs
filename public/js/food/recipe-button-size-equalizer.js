/**
 * Recipe Button Size Equalizer
 * Forces all recipe card action buttons to be exactly the same size
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Recipe Button Size Equalizer] Initializing...');
    
    function equalizeButtonSizes() {
        // Find all recipe card action containers
        const actionContainers = document.querySelectorAll('.recipe-card-actions');
        
        actionContainers.forEach(container => {
            // Get all buttons in this container
            const buttons = container.querySelectorAll('button');
            
            if (buttons.length > 0) {
                // Force all buttons to have the same exact styling
                buttons.forEach(button => {
                    // Remove any existing inline styles that might interfere
                    button.style.cssText = '';
                    
                    // Apply consistent styling
                    button.style.setProperty('width', '60px', 'important');
                    button.style.setProperty('height', '24px', 'important');
                    button.style.setProperty('padding', '3px 8px', 'important');
                    button.style.setProperty('font-size', '0.75rem', 'important');
                    button.style.setProperty('border-radius', '4px', 'important');
                    button.style.setProperty('box-sizing', 'border-box', 'important');
                    button.style.setProperty('min-width', '50px', 'important');
                    button.style.setProperty('max-width', '70px', 'important');
                    button.style.setProperty('line-height', '1.1', 'important');
                    button.style.setProperty('text-align', 'center', 'important');
                    button.style.setProperty('display', 'inline-flex', 'important');
                    button.style.setProperty('align-items', 'center', 'important');
                    button.style.setProperty('justify-content', 'center', 'important');
                    button.style.setProperty('margin', '0', 'important');
                    button.style.setProperty('border-width', '1px', 'important');
                    button.style.setProperty('border-style', 'solid', 'important');
                });
                
                console.log(`[Recipe Button Size Equalizer] Equalized ${buttons.length} buttons in container`);
            }
        });
    }
    
    // Run immediately
    equalizeButtonSizes();
    
    // Run again after a short delay to catch any dynamically loaded content
    setTimeout(equalizeButtonSizes, 500);
    
    // Set up a MutationObserver to watch for new recipe cards being added
    const observer = new MutationObserver(function(mutations) {
        let shouldEqualize = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a recipe card or contains recipe cards
                        if (node.classList && node.classList.contains('recipe-card')) {
                            shouldEqualize = true;
                        } else if (node.querySelector && node.querySelector('.recipe-card')) {
                            shouldEqualize = true;
                        }
                    }
                });
            }
        });
        
        if (shouldEqualize) {
            console.log('[Recipe Button Size Equalizer] New recipe cards detected, equalizing buttons...');
            setTimeout(equalizeButtonSizes, 100);
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('[Recipe Button Size Equalizer] Initialized successfully');
});
