/**
 * Recipe Title Pencil Fix
 * Ensures the pencil icon for editing recipe names is visible and properly positioned
 */

(function() {
    // Function to ensure pencil icons are visible and positioned correctly
    function ensurePencilIconsVisible() {
        console.log('Ensuring pencil icons are visible and positioned correctly...');

        // Find all edit recipe name icons
        const editIcons = document.querySelectorAll('.edit-recipe-name-icon');

        // Make sure they're visible and positioned at the end of the title
        editIcons.forEach(icon => {
            // Remove any conflicting inline styles
            icon.style.position = '';
            icon.style.right = '';
            icon.style.top = '';
            icon.style.transform = '';

            // Apply the correct styles for end-of-title positioning
            icon.style.display = 'inline-block';
            icon.style.visibility = 'visible';
            icon.style.opacity = '0.7';
            icon.style.marginLeft = '0';
            icon.style.flexShrink = '0';
            icon.style.alignSelf = 'flex-start';
            icon.style.marginTop = '2px';
            icon.style.zIndex = '10';

            console.log('Fixed pencil icon positioning:', icon);
        });

        // Also fix the title containers and titles
        const titleContainers = document.querySelectorAll('.recipe-title-container');
        titleContainers.forEach(container => {
            container.style.display = 'inline-flex';
            container.style.alignItems = 'flex-start';
            container.style.gap = '6px';
            container.style.maxWidth = '75%';
            container.style.overflow = 'visible';
            container.style.width = 'auto';
        });

        const titles = document.querySelectorAll('.recipe-card-title');
        titles.forEach(title => {
            title.style.whiteSpace = 'normal';
            title.style.overflow = 'visible';
            title.style.textOverflow = 'unset';
            title.style.wordWrap = 'break-word';
            title.style.lineHeight = '1.2';
            title.style.flex = '0 1 auto';
            title.style.paddingRight = '0';
            title.style.display = 'inline';

            console.log('Fixed title truncation for:', title.textContent);
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
