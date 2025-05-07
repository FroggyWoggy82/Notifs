/**
 * Ensure Toggle Works
 * Makes sure the toggle button works by directly modifying the HTML structure
 */
(function() {

    function ensureToggleWorks() {

        const ingredientItems = document.querySelectorAll('.ingredient-item');
        
        ingredientItems.forEach(item => {

            if (item.dataset.toggleProcessed === 'true') return;

            item.dataset.toggleProcessed = 'true';

            let buttonsRow = item.querySelector('.buttons-row');

            if (!buttonsRow) {
                buttonsRow = document.createElement('div');
                buttonsRow.className = 'buttons-row';

                const insertAfter = item.querySelector('.cronometer-text-paste-container') || 
                                   item.querySelector('.ingredient-form') ||
                                   item.querySelector('.ingredient-header');
                
                if (insertAfter && insertAfter.parentNode) {
                    insertAfter.parentNode.insertBefore(buttonsRow, insertAfter.nextSibling);
                } else {

                    item.insertBefore(buttonsRow, item.firstChild);
                }
            }

            let toggleButton = buttonsRow.querySelector('.toggle-detailed-nutrition');

            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'toggle-detailed-nutrition';
                toggleButton.textContent = 'Show Detailed Nutrition';

                buttonsRow.appendChild(toggleButton);
            }

            let panel = item.querySelector('.detailed-nutrition-panel');

            if (!panel) {
                panel = document.createElement('div');
                panel.className = 'detailed-nutrition-panel';
                panel.style.display = 'none';

                if (buttonsRow.nextSibling) {
                    buttonsRow.parentNode.insertBefore(panel, buttonsRow.nextSibling);
                } else {
                    buttonsRow.parentNode.appendChild(panel);
                }
            }

            panel.style.display = 'none';

            const newToggleButton = toggleButton.cloneNode(true);
            toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);

            newToggleButton.addEventListener('click', function() {
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            });
        });
    }

    function init() {

        ensureToggleWorks();

        const observer = new MutationObserver(function(mutations) {
            ensureToggleWorks();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setTimeout(ensureToggleWorks, 500);
    setTimeout(ensureToggleWorks, 1000);
    setTimeout(ensureToggleWorks, 2000);
})();
