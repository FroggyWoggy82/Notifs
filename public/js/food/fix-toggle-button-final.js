/**
 * Fix Toggle Button Final
 * A direct solution to fix the Show Detailed Nutrition button
 */
document.addEventListener('DOMContentLoaded', function() {

    function fixToggleButton() {

        const toggleButton = document.querySelector('.toggle-detailed-nutrition');
        
        if (!toggleButton) {
            console.log('Toggle button not found, will try again later');
            return;
        }
        
        console.log('Found toggle button:', toggleButton);

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

        const newButton = toggleButton.cloneNode(true);
        if (toggleButton.parentNode) {
            toggleButton.parentNode.replaceChild(newButton, toggleButton);
        }

        newButton.addEventListener('click', function() {

            const panel = this.closest('.ingredient-item').querySelector('.detailed-nutrition-panel');
            
            if (panel) {

                if (panel.style.display === 'none') {
                    panel.style.display = 'block';
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    panel.style.display = 'none';
                    this.textContent = 'Show Detailed Nutrition';
                }
            }
        });
        
        console.log('Button fixed');
    }

    setTimeout(fixToggleButton, 100);

    setTimeout(fixToggleButton, 500);

    setTimeout(fixToggleButton, 1000);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                setTimeout(fixToggleButton, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
