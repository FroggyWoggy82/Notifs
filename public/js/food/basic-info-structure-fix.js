/**
 * Basic Information Structure Fix
 * Ensures the Basic Information section has the proper structure to match other sections
 */

(function() {
    console.log('[Basic Info Structure Fix] Initializing...');

    // Function to fix the Basic Information section structure
    function fixBasicInfoStructure() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already fixed
            if (form.dataset.basicInfoFixed === 'true') return;
            
            // Find the Basic Information section
            const basicInfoSection = form.querySelector('div:first-of-type:not(.edit-ingredient-form-header)');
            
            if (basicInfoSection) {
                // Check if it already has the proper structure
                if (!basicInfoSection.classList.contains('nutrition-section')) {
                    console.log('[Basic Info Structure Fix] Fixing Basic Information section structure');
                    
                    // Add the nutrition-section class
                    basicInfoSection.classList.add('nutrition-section');
                    
                    // Check if it has a header
                    let header = basicInfoSection.querySelector('h4');
                    if (!header) {
                        // Create a header if it doesn't exist
                        header = document.createElement('h4');
                        header.textContent = 'Basic Information';
                        basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
                    }
                    
                    // Find all form groups
                    const formGroups = basicInfoSection.querySelectorAll('.form-group');
                    
                    // Check if they're wrapped in a nutrition-grid
                    let nutritionGrid = basicInfoSection.querySelector('.nutrition-grid');
                    if (!nutritionGrid) {
                        // Create a nutrition-grid if it doesn't exist
                        nutritionGrid = document.createElement('div');
                        nutritionGrid.className = 'nutrition-grid';
                        
                        // Move all form groups into the nutrition-grid
                        formGroups.forEach(group => {
                            // Convert form-group to nutrition-item
                            group.classList.add('nutrition-item');
                            nutritionGrid.appendChild(group);
                        });
                        
                        // Add the nutrition-grid after the header
                        if (header.nextSibling) {
                            basicInfoSection.insertBefore(nutritionGrid, header.nextSibling);
                        } else {
                            basicInfoSection.appendChild(nutritionGrid);
                        }
                    }
                }
                
                // Mark as fixed
                form.dataset.basicInfoFixed = 'true';
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
                setTimeout(fixBasicInfoStructure, 50);
            }
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Function to handle edit button clicks
    function handleEditButtonClicks() {
        // Use event delegation to handle edit button clicks
        document.body.addEventListener('click', event => {
            // Check if the click was on an edit button
            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Basic Info Structure Fix] Edit button clicked');
                
                // Wait a short time for the form to be displayed
                setTimeout(fixBasicInfoStructure, 100);
                
                // Check again after a longer delay to catch any late changes
                setTimeout(fixBasicInfoStructure, 500);
            }
        });
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[Basic Info Structure Fix] Initializing...');
        
        // Fix the Basic Information section structure
        setTimeout(fixBasicInfoStructure, 100);
        
        // Handle edit button clicks
        handleEditButtonClicks();
        
        // Observe DOM changes
        observeDOMChanges();
        
        console.log('[Basic Info Structure Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
