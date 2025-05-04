/**
 * Direct Basic Info Styling
 * Directly applies the exact same styling to the Basic Information section as the other sections
 */

(function() {
    // Function to directly style the Basic Information section
    function directBasicInfoStyling() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.directBasicInfoStyled === 'true') return;
            
            console.log('Directly styling Basic Information section');
            
            // Find the Basic Information section
            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;
            
            // Apply the exact same styling as the other sections
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';
            
            // Style the header
            const header = basicInfoSection.querySelector('h4');
            if (header) {
                header.style.marginTop = '0';
                header.style.marginBottom = '5px';
                header.style.paddingBottom = '2px';
                header.style.borderBottom = 'none';
                header.style.color = '#e0e0e0';
                header.style.fontWeight = '500';
                header.style.fontSize = '0.85em';
            }
            
            // Mark as processed
            form.dataset.directBasicInfoStyled = 'true';
            
            console.log('Basic Information section directly styled');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Direct Basic Info Styling');
        
        // Initial styling
        directBasicInfoStyling();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(directBasicInfoStyling, 50);
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
                
                console.log('Edit button clicked, applying direct Basic Info styling');
                
                // Wait for the form to be displayed
                setTimeout(directBasicInfoStyling, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(directBasicInfoStyling, 300);
                setTimeout(directBasicInfoStyling, 500);
            }
        });
        
        // Run periodically to ensure the styling is applied
        setInterval(directBasicInfoStyling, 1000);
        
        console.log('Direct Basic Info Styling initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
