/**
 * Global Toggle Handler
 * Uses event delegation to handle toggle button clicks globally
 */
(function() {

    document.addEventListener('click', function(event) {

        let toggleButton = null;
        
        if (event.target.classList.contains('toggle-detailed-nutrition')) {
            toggleButton = event.target;
        } else if (event.target.closest('.toggle-detailed-nutrition')) {
            toggleButton = event.target.closest('.toggle-detailed-nutrition');
        }

        if (!toggleButton) return;

        event.preventDefault();
        event.stopPropagation();

        const ingredientItem = toggleButton.closest('.ingredient-item');
        if (!ingredientItem) return;

        const panel = ingredientItem.querySelector('.detailed-nutrition-panel');
        if (!panel) return;

        if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
            panel.style.display = 'block';
            toggleButton.textContent = 'Hide Detailed Nutrition';
        } else {
            panel.style.display = 'none';
            toggleButton.textContent = 'Show Detailed Nutrition';
        }
    }, true); // Use capture phase to ensure this handler runs first

    function initPanels() {
        const panels = document.querySelectorAll('.detailed-nutrition-panel');
        panels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        const buttons = document.querySelectorAll('.toggle-detailed-nutrition');
        buttons.forEach(button => {
            button.textContent = 'Show Detailed Nutrition';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanels);
    } else {
        initPanels();
    }

    setTimeout(initPanels, 500);
    setTimeout(initPanels, 1000);
})();
