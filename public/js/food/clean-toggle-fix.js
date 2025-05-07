/**
 * Clean Toggle Fix
 * A minimal solution to fix the Show Detailed Nutrition button
 */
(function() {

    document.addEventListener('DOMContentLoaded', function() {

        const topButton = document.querySelector('body > button.toggle-detailed-nutrition, body > button#show-detailed-nutrition-btn');
        if (topButton) {
            topButton.parentNode.removeChild(topButton);
        }

        const toggleButton = document.querySelector('.buttons-row .toggle-detailed-nutrition');
        if (!toggleButton) return;

        toggleButton.style.backgroundColor = '#ffffff';
        toggleButton.style.color = '#121212';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.fontSize = '0.8em';
        toggleButton.style.cursor = 'pointer';

        const newButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newButton, toggleButton);

        newButton.addEventListener('click', function() {

            const panel = this.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
            if (!panel) return;

            if (panel.style.display === 'none' || !panel.style.display) {
                panel.style.display = 'block';
                this.textContent = 'Hide Detailed Nutrition';
            } else {
                panel.style.display = 'none';
                this.textContent = 'Show Detailed Nutrition';
            }
        });

        newButton.textContent = 'Show Detailed Nutrition';
        const panel = newButton.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    });
})();
