/**
 * Remove Duplicate Buttons
 * Ensures there are no duplicate toggle buttons
 */
(function() {

    function removeDuplicateButtons() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition, #show-detailed-nutrition-btn');

        const seenButtons = new Map();
        
        toggleButtons.forEach(button => {

            if (button.parentNode === document.body) {
                button.parentNode.removeChild(button);
                return;
            }

            const ingredientItem = button.closest('.ingredient-item');

            if (!ingredientItem) {
                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
                return;
            }

            if (seenButtons.has(ingredientItem)) {
                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
                return;
            }

            seenButtons.set(ingredientItem, button);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {

        setTimeout(removeDuplicateButtons, 100);

        const observer = new MutationObserver(function(mutations) {
            removeDuplicateButtons();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
