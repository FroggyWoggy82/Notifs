/**
 * Weight Increment X Remover
 * This script specifically targets and removes the X button in the Weight Increment section
 */

(function() {

    removeWeightIncrementXButton();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeWeightIncrementXButton);
    } else {
        removeWeightIncrementXButton();
    }

    setInterval(removeWeightIncrementXButton, 500);
    
    function removeWeightIncrementXButton() {

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
})();
