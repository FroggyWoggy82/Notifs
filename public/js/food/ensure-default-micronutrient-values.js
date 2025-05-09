/**
 * Ensure Default Micronutrient Values
 * Makes sure B vitamin fields and trans fat field always have at least '0' as default value
 */

(function() {
    function ensureDefaultMicronutrientValues() {
        // Fields that should always have at least a zero value
        const criticalFields = [
            { name: 'Trans Fat', id: 'edit-ingredient-trans-fat' },
            { name: 'B1 (Thiamine)', id: 'edit-ingredient-vitamin-b1' },
            { name: 'B2 (Riboflavin)', id: 'edit-ingredient-vitamin-b2' },
            { name: 'B3 (Niacin)', id: 'edit-ingredient-vitamin-b3' },
            { name: 'B5 (Pantothenic Acid)', id: 'edit-ingredient-vitamin-b5' }
        ];

        // Function to set default values for critical fields
        function setDefaultValues() {
            const editForms = document.querySelectorAll('.edit-ingredient-form');
            
            editForms.forEach(form => {
                if (form.style.display === 'block' || form.style.display === '') {
                    criticalFields.forEach(field => {
                        const input = form.querySelector(`#${field.id}`);
                        if (input && (input.value === '' || input.value === null || input.value === undefined)) {
                            input.value = '0';
                            console.log(`Set default zero value for ${field.name} field (ID: ${field.id})`);
                        }
                    });
                }
            });
        }

        // Set up event listener for edit button clicks
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                (event.target.tagName === 'BUTTON' && 
                 event.target.textContent === 'Edit' && 
                 event.target.closest('tr'))) {
                
                // Wait for the form to be populated
                setTimeout(setDefaultValues, 300);
                setTimeout(setDefaultValues, 600);
                setTimeout(setDefaultValues, 1000);
            }
        });

        // Set up a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Check if any edit forms were added
                    mutation.addedNodes.forEach(function(node) {
                        if (node.classList && node.classList.contains('edit-ingredient-form')) {
                            setTimeout(setDefaultValues, 100);
                        } else if (node.querySelectorAll) {
                            const forms = node.querySelectorAll('.edit-ingredient-form');
                            if (forms.length > 0) {
                                setTimeout(setDefaultValues, 100);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Run once on page load
        setTimeout(setDefaultValues, 500);

        // Run periodically to catch any missed forms
        setInterval(setDefaultValues, 2000);
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureDefaultMicronutrientValues);
    } else {
        ensureDefaultMicronutrientValues();
    }
})();
