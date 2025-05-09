/**
 * Recipe Title Pencil Fix
 * Ensures the pencil icon for editing recipe names is visible and properly positioned
 */

(function() {
    // Function to ensure pencil icons are visible
    function ensurePencilIconsVisible() {
        console.log('Ensuring pencil icons are visible...');
        
        // Find all edit recipe name icons
        const editIcons = document.querySelectorAll('.edit-recipe-name-icon');
        
        // Make sure they're visible
        editIcons.forEach(icon => {
            icon.style.display = 'block';
            icon.style.visibility = 'visible';
            icon.style.opacity = '0.7';
            icon.style.position = 'absolute';
            icon.style.right = '0';
            icon.style.top = '50%';
            icon.style.transform = 'translateY(-50%)';
            icon.style.zIndex = '10';
            
            console.log('Fixed pencil icon:', icon);
        });
    }
    
    // Run when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, waiting for recipes to load...');
        
        // Initial check
        setTimeout(ensurePencilIconsVisible, 500);
        
        // Check again after recipes might have loaded
        setTimeout(ensurePencilIconsVisible, 1500);
        setTimeout(ensurePencilIconsVisible, 3000);
    });
    
    // Also run when recipes are rendered
    document.addEventListener('recipesRendered', ensurePencilIconsVisible);
    
    // Create a MutationObserver to watch for changes to the recipe list
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Check if any recipe cards were added
                const hasRecipeCards = Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && 
                           (node.classList?.contains('recipe-card') || 
                            node.querySelector?.('.recipe-card'));
                });
                
                if (hasRecipeCards) {
                    console.log('Recipe cards added, ensuring pencil icons are visible...');
                    ensurePencilIconsVisible();
                }
            }
        });
    });
    
    // Start observing the recipe list container
    document.addEventListener('DOMContentLoaded', function() {
        const recipeListContainer = document.getElementById('recipe-list');
        if (recipeListContainer) {
            observer.observe(recipeListContainer, { childList: true, subtree: true });
            console.log('Observing recipe list container for changes...');
        }
    });
})();
