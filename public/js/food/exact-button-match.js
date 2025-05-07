/**
 * Exact Button Match
 * Makes the Show Detailed Nutrition button exactly match the size of Add Ingredient and Remove buttons
 */
(function() {

    function matchButtonSizes() {

        const forms = document.querySelectorAll('.ingredient-form');
        
        forms.forEach(form => {

            const addButton = form.querySelector('button[onclick*="addIngredient"], button:contains("Add Ingredient")');
            const removeButton = form.querySelector('button[onclick*="remove"], button:contains("Remove")');
            const toggleButton = form.querySelector('.toggle-detailed-nutrition');

            if (!addButton || !removeButton || !toggleButton) return;

            const addStyle = window.getComputedStyle(addButton);

            toggleButton.style.width = addStyle.width;
            toggleButton.style.height = addStyle.height;
            toggleButton.style.padding = addStyle.padding;
            toggleButton.style.margin = addStyle.margin;
            toggleButton.style.fontSize = addStyle.fontSize;
            toggleButton.style.lineHeight = addStyle.lineHeight;
            toggleButton.style.fontWeight = addStyle.fontWeight;
            toggleButton.style.borderRadius = addStyle.borderRadius;
            toggleButton.style.boxSizing = addStyle.boxSizing;

            if (addButton.parentNode && addButton.parentNode !== toggleButton.parentNode) {
                addButton.parentNode.insertBefore(toggleButton, addButton);
            }

            if (addButton.parentNode) {
                const container = addButton.parentNode;
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.width = '100%';

                [toggleButton, addButton, removeButton].forEach(button => {
                    button.style.flex = '1';
                    button.style.margin = '0 5px';
                });

                const firstButton = container.firstElementChild;
                if (firstButton) {
                    firstButton.style.marginLeft = '0';
                }

                const lastButton = container.lastElementChild;
                if (lastButton) {
                    lastButton.style.marginRight = '0';
                }
            }
        });
    }

    Element.prototype.contains = function(text) {
        return this.textContent.includes(text);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(matchButtonSizes, 500);
        });
    } else {
        setTimeout(matchButtonSizes, 500);
    }

    setTimeout(matchButtonSizes, 1000);
    setTimeout(matchButtonSizes, 2000);
    setTimeout(matchButtonSizes, 3000);

    const observer = new MutationObserver(function(mutations) {
        setTimeout(matchButtonSizes, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
