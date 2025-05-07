/**
 * Force Toggle Button
 * Forces the toggle button to be in the correct place and have the correct styling
 */
(function() {

    function forceToggleButton() {

        const ingredientForms = document.querySelectorAll('.ingredient-form');
        
        ingredientForms.forEach(form => {

            if (form.dataset.buttonForced === 'true') return;

            form.dataset.buttonForced = 'true';

            let buttonsContainer = form.querySelector('.buttons-container');
            if (!buttonsContainer) {
                buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'buttons-container';
                form.appendChild(buttonsContainer);
            }

            let toggleButton = buttonsContainer.querySelector('.toggle-detailed-nutrition');

            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'toggle-detailed-nutrition';
                toggleButton.textContent = 'Show Detailed Nutrition';

                toggleButton.style.backgroundColor = '#ffffff';
                toggleButton.style.color = '#121212';
                toggleButton.style.border = 'none';
                toggleButton.style.borderRadius = '3px';
                toggleButton.style.padding = '5px 10px';
                toggleButton.style.fontSize = '0.8em';
                toggleButton.style.cursor = 'pointer';
                toggleButton.style.margin = '5px';
                toggleButton.style.width = 'auto';
                toggleButton.style.minWidth = '150px';
                toggleButton.style.height = '28px';
                toggleButton.style.display = 'inline-block';
                toggleButton.style.textAlign = 'center';

                buttonsContainer.appendChild(toggleButton);
            }

            const ingredientItem = form.closest('.ingredient-item');
            if (!ingredientItem) return;
            
            let panel = ingredientItem.querySelector('.detailed-nutrition-panel');

            if (!panel) {
                panel = document.createElement('div');
                panel.className = 'detailed-nutrition-panel';
                panel.style.display = 'none';

                if (form.nextSibling) {
                    form.parentNode.insertBefore(panel, form.nextSibling);
                } else {
                    form.parentNode.appendChild(panel);
                }
            }

            panel.style.display = 'none';

            toggleButton.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
                
                return false;
            };
        });
    }

    function init() {

        forceToggleButton();

        const observer = new MutationObserver(function(mutations) {
            forceToggleButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(forceToggleButton, 500);
    setTimeout(forceToggleButton, 1000);
    setTimeout(forceToggleButton, 2000);
})();
