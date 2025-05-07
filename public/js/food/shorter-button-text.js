/**
 * Shorter Button Text
 * Uses shorter text for the Show Detailed Nutrition button to ensure it fits
 */
(function() {

    function useShorterButtonText() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {

            if (button.dataset.shorterText === 'true') return;

            button.dataset.shorterText = 'true';

            button.textContent = 'Show Nutrition';

            button.addEventListener('click', function() {
                const panel = this.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
                if (!panel) return;
                
                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    this.textContent = 'Hide Nutrition';
                } else {
                    this.textContent = 'Show Nutrition';
                }
            });

            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.height = '38px';
            button.style.lineHeight = '1';
            button.style.padding = '0 15px';
            button.style.margin = '0';
            button.style.whiteSpace = 'nowrap';
            button.style.overflow = 'visible';
            button.style.textOverflow = 'clip';
            button.style.verticalAlign = 'middle';
            button.style.fontSize = '0.9em';
            button.style.fontWeight = 'normal';
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#121212';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            button.style.cursor = 'pointer';
            button.style.flex = '1';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(useShorterButtonText, 500);
        });
    } else {
        setTimeout(useShorterButtonText, 500);
    }

    setTimeout(useShorterButtonText, 1000);
    setTimeout(useShorterButtonText, 2000);

    const observer = new MutationObserver(function(mutations) {
        setTimeout(useShorterButtonText, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
