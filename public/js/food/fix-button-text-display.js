/**
 * Fix Button Text Display
 * Ensures the text in the Show Detailed Nutrition button is fully displayed and properly aligned
 */
(function() {

    function fixButtonTextDisplay() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');

        toggleButtons.forEach(button => {

            if (button.dataset.textFixed === 'true') return;

            button.dataset.textFixed = 'true';

            const textWrapper = document.createElement('span');
            textWrapper.style.whiteSpace = 'nowrap';
            textWrapper.style.overflow = 'visible';
            textWrapper.style.display = 'inline-block';
            textWrapper.style.width = 'auto';
            textWrapper.style.textAlign = 'center';
            textWrapper.textContent = 'Show Detailed Nutrition';

            button.textContent = '';
            button.appendChild(textWrapper);

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

            let addButton = null;
            let removeButton = null;

            const siblingButtons = button.parentNode.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            siblingButtons.forEach(btn => {
                const text = btn.textContent.toLowerCase();
                if (text.includes('add')) {
                    addButton = btn;
                } else if (text.includes('remove')) {
                    removeButton = btn;
                }
            });

            if (addButton) {
                const addStyle = window.getComputedStyle(addButton);
                button.style.height = addStyle.height;
                button.style.lineHeight = addStyle.lineHeight;
                button.style.padding = addStyle.padding;
                button.style.fontSize = addStyle.fontSize;
            }

            if (button.parentNode) {
                button.parentNode.style.display = 'flex';
                button.parentNode.style.alignItems = 'center';
                button.parentNode.style.justifyContent = 'space-between';
                button.parentNode.style.width = '100%';
                button.parentNode.style.margin = '10px 0';
                button.parentNode.style.height = '38px';

                const allButtons = button.parentNode.querySelectorAll('button');
                allButtons.forEach(btn => {
                    btn.style.flex = '1';
                    btn.style.margin = '0 5px';
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                });

                const firstButton = button.parentNode.firstElementChild;
                if (firstButton) {
                    firstButton.style.marginLeft = '0';
                }

                const lastButton = button.parentNode.lastElementChild;
                if (lastButton) {
                    lastButton.style.marginRight = '0';
                }
            }

            button.addEventListener('click', function() {
                const panel = this.closest('.ingredient-item')?.querySelector('.detailed-nutrition-panel');
                if (!panel) return;

                if (panel.style.display === 'none' || !panel.style.display || panel.style.display === '') {
                    textWrapper.textContent = 'Hide Detailed Nutrition';
                } else {
                    textWrapper.textContent = 'Show Detailed Nutrition';
                }
            });
        });
    }



    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixButtonTextDisplay, 500);
        });
    } else {
        setTimeout(fixButtonTextDisplay, 500);
    }

    setTimeout(fixButtonTextDisplay, 1000);
    setTimeout(fixButtonTextDisplay, 2000);

    const observer = new MutationObserver(function(mutations) {
        setTimeout(fixButtonTextDisplay, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
