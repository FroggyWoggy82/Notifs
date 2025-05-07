/**
 * Fix Vertical Alignment
 * Ensures the Show Detailed Nutrition button is vertically aligned with other buttons
 */
(function() {

    function fixVerticalAlignment() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {

            if (button.dataset.verticalFixed === 'true') return;

            button.dataset.verticalFixed = 'true';

            const parentRow = button.parentNode;
            if (!parentRow) return;
            
            const otherButtons = parentRow.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            if (otherButtons.length === 0) return;

            const otherButton = otherButtons[0];
            const otherStyle = window.getComputedStyle(otherButton);

            button.style.height = otherStyle.height;
            button.style.lineHeight = otherStyle.lineHeight;
            button.style.paddingTop = otherStyle.paddingTop;
            button.style.paddingBottom = otherStyle.paddingBottom;
            button.style.marginTop = otherStyle.marginTop;
            button.style.marginBottom = otherStyle.marginBottom;
            button.style.verticalAlign = 'middle';
            button.style.display = 'inline-block';
            button.style.boxSizing = 'border-box';

            parentRow.style.display = 'flex';
            parentRow.style.alignItems = 'center';
            parentRow.style.justifyContent = 'space-between';
            parentRow.style.width = '100%';
            parentRow.style.height = 'auto';
            parentRow.style.margin = '10px 0';
            parentRow.style.padding = '0';

            const allButtons = parentRow.querySelectorAll('button');
            allButtons.forEach(btn => {
                btn.style.flex = '1';
                btn.style.margin = '0 5px';
                btn.style.verticalAlign = 'middle';
                btn.style.display = 'inline-block';
                btn.style.boxSizing = 'border-box';
            });

            const firstButton = parentRow.firstElementChild;
            if (firstButton) {
                firstButton.style.marginLeft = '0';
            }

            const lastButton = parentRow.lastElementChild;
            if (lastButton) {
                lastButton.style.marginRight = '0';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixVerticalAlignment, 500);
        });
    } else {
        setTimeout(fixVerticalAlignment, 500);
    }

    setTimeout(fixVerticalAlignment, 1000);
    setTimeout(fixVerticalAlignment, 2000);

    const observer = new MutationObserver(function(mutations) {
        setTimeout(fixVerticalAlignment, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
