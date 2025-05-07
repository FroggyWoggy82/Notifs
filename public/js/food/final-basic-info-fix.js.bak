/**
 * Final Basic Info Fix
 * The most aggressive approach to fixing the Basic Information section
 */

(function() {
    // Function to fix the Basic Information section
    function fixBasicInfoSection() {
        // Find all edit forms
        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {
            // Skip if already processed
            if (form.dataset.finalBasicInfoFixed === 'true') return;
            
            console.log('Applying final fix to Basic Information section');
            
            // Find the form element
            const formElement = form.querySelector('form');
            if (!formElement) return;
            
            // Find all divs in the form
            const divs = formElement.querySelectorAll('div');
            
            // Find the Basic Information section
            let basicInfoSection = null;
            
            // Try to find the Basic Information section by various means
            for (const div of divs) {
                // Check if it has a header with "Basic Information"
                const header = div.querySelector('h4');
                if (header && header.textContent.includes('Basic Information')) {
                    basicInfoSection = div;
                    break;
                }
                
                // Check if it has labels for name or amount
                const labels = div.querySelectorAll('label');
                for (const label of labels) {
                    if (label.textContent.includes('Name') || label.textContent.includes('Amount')) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;
                
                // Check if it has inputs with IDs containing "ingredient-name" or "ingredient-amount"
                const inputs = div.querySelectorAll('input');
                for (const input of inputs) {
                    if (input.id && (input.id.includes('ingredient-name') || input.id.includes('ingredient-amount'))) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;
            }
            
            // If we still haven't found it, use the first div
            if (!basicInfoSection && divs.length > 0) {
                basicInfoSection = divs[0];
            }
            
            // If we still don't have a Basic Information section, create one
            if (!basicInfoSection) {
                basicInfoSection = document.createElement('div');
                basicInfoSection.className = 'basic-information';
                formElement.insertBefore(basicInfoSection, formElement.firstChild);
            }
            
            // Add the basic-information class
            basicInfoSection.classList.add('basic-information');
            
            // Style the Basic Information section
            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';
            basicInfoSection.style.display = 'block';
            basicInfoSection.style.visibility = 'visible';
            basicInfoSection.style.opacity = '1';
            
            // Check if it has a header
            let header = basicInfoSection.querySelector('h4');
            if (!header) {
                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
            }
            
            // Style the header
            header.style.marginTop = '0';
            header.style.marginBottom = '5px';
            header.style.paddingBottom = '2px';
            header.style.borderBottom = 'none';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';
            header.style.fontSize = '0.85em';
            
            // Find all form groups in the Basic Information section
            const formGroups = basicInfoSection.querySelectorAll('.form-group');
            
            // Style the form groups
            formGroups.forEach(formGroup => {
                formGroup.style.marginBottom = '5px';
                formGroup.style.display = 'inline-block';
                formGroup.style.marginRight = '10px';
                
                // Find the label
                const label = formGroup.querySelector('label');
                if (label) {
                    label.style.fontSize = '0.7em';
                    label.style.marginBottom = '1px';
                    label.style.color = '#aaa';
                    label.style.display = 'block';
                    label.style.whiteSpace = 'nowrap';
                    label.style.overflow = 'hidden';
                    label.style.textOverflow = 'ellipsis';
                }
                
                // Find the input
                const input = formGroup.querySelector('input');
                if (input) {
                    input.style.padding = '1px 2px';
                    input.style.height = '14px';
                    input.style.fontSize = '0.6em';
                    input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '3px';
                }
            });
            
            // Find all inputs in the Basic Information section
            const inputs = basicInfoSection.querySelectorAll('input');
            
            // Style the inputs
            inputs.forEach(input => {
                input.style.padding = '1px 2px';
                input.style.height = '14px';
                input.style.fontSize = '0.6em';
                input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.color = '#e0e0e0';
                input.style.borderRadius = '3px';
            });
            
            // Mark as processed
            form.dataset.finalBasicInfoFixed = 'true';
            
            console.log('Final fix applied to Basic Information section');
        });
    }
    
    // Function to initialize
    function init() {
        console.log('Initializing Final Basic Info Fix');
        
        // Initial fix
        fixBasicInfoSection();
        
        // Set up a mutation observer to watch for new forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixBasicInfoSection, 50);
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
                
                console.log('Edit button clicked, applying final Basic Info fix');
                
                // Wait for the form to be displayed
                setTimeout(fixBasicInfoSection, 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(fixBasicInfoSection, 300);
                setTimeout(fixBasicInfoSection, 500);
                setTimeout(fixBasicInfoSection, 1000);
            }
        });
        
        // Run periodically to ensure the fix is applied
        setInterval(fixBasicInfoSection, 1000);
        
        console.log('Final Basic Info Fix initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
