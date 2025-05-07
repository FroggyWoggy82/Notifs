/**
 * Direct Toggle Fix
 * A direct solution to fix the Show Detailed Nutrition button
 */
(function() {

    function fixToggleButtons() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');

        toggleButtons.forEach(button => {

            if (button.dataset.processed === 'true') return;

            button.dataset.processed = 'true';

            button.style.backgroundColor = '#ffffff';
            button.style.color = '#121212';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.padding = '5px 10px';
            button.style.fontSize = '0.8em';
            button.style.cursor = 'pointer';
            button.style.margin = '5px';
            button.style.width = 'auto';
            button.style.minWidth = '150px';
            button.style.height = '28px';
            button.style.display = 'inline-block';
            button.style.textAlign = 'center';

            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', function(event) {

                event.preventDefault();
                event.stopPropagation();

                const ingredientItem = this.closest('.ingredient-item');
                if (!ingredientItem) return;

                const panel = ingredientItem.querySelector('.detailed-nutrition-panel');
                if (!panel) return;

                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            });

            newButton.textContent = 'Show Detailed Nutrition';
            const panel = newButton.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }

    function initToggleFix() {

        fixToggleButtons();

        const observer = new MutationObserver(function(mutations) {
            fixToggleButtons();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggleFix);
    } else {
        initToggleFix();
    }

    setTimeout(fixToggleButtons, 500);
    setTimeout(fixToggleButtons, 1000);
    setTimeout(fixToggleButtons, 2000);
})();
