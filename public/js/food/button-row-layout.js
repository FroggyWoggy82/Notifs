/**
 * Button Row Layout
 * Ensures the Show Detailed Nutrition button is in the same row as Add Ingredient and Remove
 */
(function() {

    function fixButtonRowLayout() {

        const ingredientForms = document.querySelectorAll('.ingredient-form');
        
        ingredientForms.forEach(form => {

            if (form.dataset.rowFixed === 'true') return;

            form.dataset.rowFixed = 'true';

            const addButton = form.querySelector('button:not(.toggle-detailed-nutrition):contains("Add"), button:not(.toggle-detailed-nutrition):contains("add")');
            const removeButton = form.querySelector('button:not(.toggle-detailed-nutrition):contains("Remove"), button:not(.toggle-detailed-nutrition):contains("remove")');
            const toggleButton = form.querySelector('.toggle-detailed-nutrition');

            if (!addButton || !removeButton || !toggleButton) return;

            let buttonsRow = form.querySelector('.buttons-row');
            if (!buttonsRow) {
                buttonsRow = document.createElement('div');
                buttonsRow.className = 'buttons-row';

                const insertAfter = form.querySelector('.cronometer-text-paste-container') || 
                                   form.querySelector('.ingredient-header');
                
                if (insertAfter && insertAfter.parentNode) {
                    insertAfter.parentNode.insertBefore(buttonsRow, insertAfter.nextSibling);
                } else {

                    form.appendChild(buttonsRow);
                }
            }

            if (toggleButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(toggleButton);
            }
            
            if (addButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(addButton);
            }
            
            if (removeButton.parentNode !== buttonsRow) {
                buttonsRow.appendChild(removeButton);
            }

            [toggleButton, addButton, removeButton].forEach(button => {
                button.style.flex = '1';
                button.style.height = '38px';
                button.style.margin = '5px';
                button.style.padding = '8px 15px';
                button.style.fontSize = '0.9em';
                button.style.borderRadius = '3px';
                button.style.cursor = 'pointer';
                button.style.textAlign = 'center';
                button.style.backgroundColor = '#ffffff';
                button.style.color = '#121212';
                button.style.border = 'none';
            });
        });
    }

    function init() {

        fixButtonRowLayout();

        const observer = new MutationObserver(function(mutations) {
            fixButtonRowLayout();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    Element.prototype.contains = function(text) {
        return this.textContent.includes(text);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(fixButtonRowLayout, 500);
    setTimeout(fixButtonRowLayout, 1000);
    setTimeout(fixButtonRowLayout, 2000);
})();
