/**
 * Direct DOM Modification
 * Directly modifies the DOM structure of the Basic Information section to match the other sections
 */

(function() {
    // Function to directly modify the DOM structure
    function directDomModification() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.directDomModified === 'true') return;
            
            console.log('Directly modifying DOM structure of Basic Information section');
            
            // Find the Basic Information section
            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;
            
            // Add the nutrition-section class
            basicInfoSection.classList.add('nutrition-section');
            
            // Find the header
            let header = basicInfoSection.querySelector('h4');
            if (!header) {
                // Create a header if it doesn't exist
                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
            }
            
            // Find all the form groups
            const formGroups = basicInfoSection.querySelectorAll('.form-group');
            
            // Create a nutrition grid
            const nutritionGrid = document.createElement('div');
            nutritionGrid.className = 'nutrition-grid';
            
            // Move all form groups to the nutrition grid
            formGroups.forEach(formGroup => {
                const nutritionItem = document.createElement('div');
                nutritionItem.className = 'nutrition-item';
                
                // Move the label and input to the nutrition item
                const label = formGroup.querySelector('label');
                const input = formGroup.querySelector('input');
                
                if (label && input) {
                    nutritionItem.appendChild(label);
                    nutritionItem.appendChild(input);
                    nutritionGrid.appendChild(nutritionItem);
                }
            });
            
            // Replace the form groups with the nutrition grid
            formGroups.forEach(formGroup => {
                formGroup.remove();
            });
            
            // Add the nutrition grid to the Basic Information section
            basicInfoSection.appendChild(nutritionGrid);
            
            // Mark as processed
            form.dataset.directDomModified = 'true';
            
            console.log('DOM structure of Basic Information section directly modified');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Direct DOM Modification');
        
        // Initial modification
        directDomModification();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(directDomModification, 50);
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also handle edit button clicks directly
        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying direct DOM modification');
                
                // Wait for the form to be displayed
                setTimeout(directDomModification, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(directDomModification, 300);
                setTimeout(directDomModification, 500);
            }
        });
        
        // Run periodically to ensure the modification is applied
        setInterval(directDomModification, 1000);
        
        console.log('Direct DOM Modification initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
