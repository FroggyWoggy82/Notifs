/**
 * Direct Basic Information Fix
 * Directly modifies the Basic Information section's HTML structure
 */

(function() {
    console.log('[Direct Basic Info Fix] Initializing...');

    // Function to fix the Basic Information section
    function fixBasicInfoSection() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already fixed
            if (form.dataset.directBasicInfoFixed === 'true') return;
            
            // Find the Basic Information section (first div that's not the header)
            const basicInfoSection = form.querySelector('div:first-of-type:not(.edit-ingredient-form-header)');
            
            if (basicInfoSection) {
                console.log('[Direct Basic Info Fix] Found Basic Information section');
                
                // Add a class to the section
                basicInfoSection.classList.add('nutrition-section');
                basicInfoSection.classList.add('basic-information');
                
                // Check if it has a header
                let header = basicInfoSection.querySelector('h4');
                if (!header) {
                    // Create a header
                    header = document.createElement('h4');
                    header.textContent = 'Basic Information';
                    basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
                }
                
                // Find all form groups
                const formGroups = basicInfoSection.querySelectorAll('.form-group');
                
                // Create a nutrition-grid if it doesn't exist
                let nutritionGrid = basicInfoSection.querySelector('.nutrition-grid');
                if (!nutritionGrid) {
                    nutritionGrid = document.createElement('div');
                    nutritionGrid.className = 'nutrition-grid';
                    
                    // Move all form groups into the nutrition-grid
                    formGroups.forEach(group => {
                        // Add the nutrition-item class
                        group.classList.add('nutrition-item');
                        
                        // Clone the group to avoid issues with moving nodes
                        const clonedGroup = group.cloneNode(true);
                        nutritionGrid.appendChild(clonedGroup);
                        
                        // Remove the original group
                        if (group.parentNode) {
                            group.parentNode.removeChild(group);
                        }
                    });
                    
                    // Add the nutrition-grid after the header
                    if (header.nextSibling) {
                        basicInfoSection.insertBefore(nutritionGrid, header.nextSibling);
                    } else {
                        basicInfoSection.appendChild(nutritionGrid);
                    }
                }
                
                // Mark as fixed
                form.dataset.directBasicInfoFixed = 'true';
            }
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Direct Basic Info Fix] Edit button clicked');
                
                // Wait a short time for the form to be displayed
                setTimeout(fixBasicInfoSection, 100);
                
                // Check again after a longer delay to catch any late changes
                setTimeout(fixBasicInfoSection, 500);
            }
        });
    }

    // Function to observe DOM changes
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            let needsFixing = false;
            
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for edit forms in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is an edit form or contains one
                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsFixing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsFixing = true;
                            }
                        }
                    });
                }
            });
            
            // If we found an edit form, fix the Basic Information section
            if (needsFixing) {
                setTimeout(fixBasicInfoSection, 50);
            }
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Direct Basic Info Fix] Initializing...');
        
        // Fix the Basic Information section
        setTimeout(fixBasicInfoSection, 100);
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Observe DOM changes
        observeDOMChanges();
        
        console.log('[Direct Basic Info Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
