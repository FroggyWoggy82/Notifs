/**
 * Exact Position Match
 * Makes the Show Detailed Nutrition button match the exact position of other buttons
 */
(function() {

    function matchButtonPositions() {

        const toggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        
        toggleButtons.forEach(button => {

            if (button.dataset.positionMatched === 'true') return;

            const parentRow = button.parentNode;
            if (!parentRow) return;
            
            const otherButtons = parentRow.querySelectorAll('button:not(.toggle-detailed-nutrition)');
            if (otherButtons.length === 0) return;

            const otherButton = otherButtons[0];
            const otherRect = otherButton.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            const verticalOffset = otherRect.top - buttonRect.top;

            if (Math.abs(verticalOffset) > 0) {
                button.style.position = 'relative';
                button.style.top = verticalOffset + 'px';
            }

            button.dataset.positionMatched = 'true';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {

            setTimeout(matchButtonPositions, 500);
        });
    } else {

        setTimeout(matchButtonPositions, 500);
    }

    setTimeout(matchButtonPositions, 1000);
    setTimeout(matchButtonPositions, 2000);

    const observer = new MutationObserver(function(mutations) {

        setTimeout(matchButtonPositions, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', function() {

        document.querySelectorAll('.toggle-detailed-nutrition').forEach(button => {
            button.dataset.positionMatched = 'false';
        });

        setTimeout(matchButtonPositions, 100);
    });
})();
