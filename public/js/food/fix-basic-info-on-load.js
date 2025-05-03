/**
 * Fix Basic Info On Load
 * Fixes the Basic Information section styling immediately on page load
 */

(function() {
    console.log('[Fix Basic Info On Load] Initializing...');

    // Function to fix the Basic Information section
    function fixBasicInfoOnLoad() {
        // Find all edit ingredient forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find the first div in the form (Basic Information section)
            const firstDiv = formElement.querySelector('div:first-of-type');
            if (!firstDiv) return;
            
            // Apply direct styles to the Basic Information section
            firstDiv.style.backgroundColor = '#1e1e1e';
            firstDiv.style.borderRadius = '5px';
            firstDiv.style.padding = '15px';
            firstDiv.style.marginBottom = '15px';
            firstDiv.style.color = 'white';
            
            // Add the nutrition-section class
            firstDiv.classList.add('nutrition-section');
            
            // Check if it has a header
            let header = firstDiv.querySelector('h4');
            if (!header) {
                // Create a header
                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                header.style.color = 'white';
                header.style.marginTop = '0';
                header.style.marginBottom = '10px';
                header.style.fontSize = '1.1em';
                header.style.fontWeight = 'bold';
                firstDiv.insertBefore(header, firstDiv.firstChild);
            }
            
            // Find all form groups
            const formGroups = firstDiv.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                // Style the form group
                group.style.marginBottom = '8px';
                
                // Style the label
                const label = group.querySelector('label');
                if (label) {
                    label.style.color = 'white';
                    label.style.fontSize = '0.9em';
                    label.style.display = 'block';
                    label.style.marginBottom = '3px';
                }
                
                // Style the input
                const input = group.querySelector('input');
                if (input) {
                    input.style.backgroundColor = '#333';
                    input.style.color = 'white';
                    input.style.border = '1px solid #444';
                    input.style.borderRadius = '3px';
                    input.style.padding = '5px';
                }
            });
            
            // Find all form actions
            const formActions = form.querySelectorAll('.form-actions');
            
            // If there's more than one, keep only the last one
            if (formActions.length > 1) {
                // Keep only the last one
                for (let i = 0; i < formActions.length - 1; i++) {
                    formActions[i].style.display = 'none';
                }
                
                // Make sure the last one is visible
                formActions[formActions.length - 1].style.display = 'flex';
            }
        });
    }

    // Run the fix immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fixBasicInfoOnLoad();
            
            // Run again after a short delay to catch any late changes
            setTimeout(fixBasicInfoOnLoad, 100);
            setTimeout(fixBasicInfoOnLoad, 500);
            setTimeout(fixBasicInfoOnLoad, 1000);
        });
    } else {
        fixBasicInfoOnLoad();
        
        // Run again after a short delay to catch any late changes
        setTimeout(fixBasicInfoOnLoad, 100);
        setTimeout(fixBasicInfoOnLoad, 500);
        setTimeout(fixBasicInfoOnLoad, 1000);
    }
    
    // Handle edit button clicks
    document.body.addEventListener('click', function(event) {
        // Check if the click was on an edit button
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait a short time for the form to be displayed
            setTimeout(fixBasicInfoOnLoad, 100);
            setTimeout(fixBasicInfoOnLoad, 500);
            setTimeout(fixBasicInfoOnLoad, 1000);
        }
    });
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        fixBasicInfoOnLoad();
    });
    
    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('[Fix Basic Info On Load] Initialized');
})();
