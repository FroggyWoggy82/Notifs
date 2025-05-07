/**
 * Toggle Nutrition Panel
 * Handles showing and hiding the detailed nutrition panel
 */
document.addEventListener('DOMContentLoaded', function() {

    function setupToggleButtons() {

        document.querySelectorAll('.toggle-detailed-nutrition').forEach(button => {

            if (button.dataset.toggleHandlerAdded === 'true') return;

            button.addEventListener('click', function() {

                const panel = this.closest('.nutrition-summary').nextElementSibling;
                if (panel && panel.classList.contains('detailed-nutrition-panel')) {

                    if (panel.style.display === 'none' || panel.style.display === '') {
                        panel.style.display = 'block';
                        this.textContent = 'Hide Detailed Nutrition';

                        const event = new CustomEvent('nutrition-panel-shown', {
                            bubbles: true,
                            detail: { panel: panel }
                        });
                        panel.dispatchEvent(event);

                        setTimeout(() => {
                            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    } else {
                        panel.style.display = 'none';
                        this.textContent = 'Show Detailed Nutrition';
                    }
                }
            });

            button.dataset.toggleHandlerAdded = 'true';
        });
    }

    setTimeout(setupToggleButtons, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(setupToggleButtons, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(setupToggleButtons, 200);

            setTimeout(setupToggleButtons, 500);
            setTimeout(setupToggleButtons, 1000);
        }
    });

    setInterval(setupToggleButtons, 2000);
});
