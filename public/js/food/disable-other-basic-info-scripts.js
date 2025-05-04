/**
 * Disable Other Basic Info Scripts
 * This script disables other scripts that try to modify the Basic Information section
 * when our integrated approach in show-nutrition-panel.js is active
 */

(function() {
    // Function to disable other Basic Info scripts
    function disableOtherBasicInfoScripts() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.otherScriptsDisabled === 'true') return;
            
            console.log('Disabling other Basic Info scripts for this form');
            
            // Mark the form as processed by all the other scripts
            // This will prevent them from modifying our Basic Information section
            form.dataset.basicInfoReplaced = 'true';
            form.dataset.editButtonBasicInfoFixed = 'true';
            form.dataset.basicInfoFixed = 'true';
            form.dataset.basicInfoCompleteReplaced = 'true';
            form.dataset.fieldsFixed = 'true';
            form.dataset.restructured = 'true';
            
            // Mark as processed by this script
            form.dataset.otherScriptsDisabled = 'true';
            
            console.log('Other Basic Info scripts disabled for this form');
        });
    }
    
    // Run when the page loads
    setTimeout(disableOtherBasicInfoScripts, 300);
    
    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(disableOtherBasicInfoScripts, 150);
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also handle edit button clicks directly
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') || 
            (event.target.tagName === 'BUTTON' && 
             event.target.textContent === 'Edit' && 
             event.target.closest('tr') && 
             event.target.closest('.ingredient-details'))) {
            
            console.log('Edit button clicked, disabling other Basic Info scripts');
            
            // Wait for the form to be displayed
            setTimeout(disableOtherBasicInfoScripts, 150);
            // Try again after a bit longer to ensure it's applied
            setTimeout(disableOtherBasicInfoScripts, 350);
            setTimeout(disableOtherBasicInfoScripts, 550);
        }
    });
})();
