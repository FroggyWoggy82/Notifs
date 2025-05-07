/**
 * Remove Top X Button
 * This script specifically removes the X button in the top right corner of the Weight Increment section
 */

(function() {

    removeTopXButton();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeTopXButton);
    } else {
        removeTopXButton();
    }

    setInterval(removeTopXButton, 100);
    
    function removeTopXButton() {

        const containers = document.querySelectorAll('.weight-increment-container');
        
        containers.forEach(container => {

            const buttons = container.querySelectorAll('button');

            buttons.forEach(button => {
                button.remove();
            });

            const allElements = container.querySelectorAll('*');
            allElements.forEach(element => {
                if (element.textContent === '×' || element.textContent === 'X') {

                    if (element.tagName !== 'INPUT') {
                        element.remove();
                    }
                }
            });
        });
    }

    const observer = new MutationObserver(mutations => {
        removeTopXButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    document.addEventListener('click', event => {
        if (event.target.classList.contains('btn-exercise-options')) {

            setTimeout(removeTopXButton, 100);
            setTimeout(removeTopXButton, 300);
            setTimeout(removeTopXButton, 500);
        }
    });
})();
