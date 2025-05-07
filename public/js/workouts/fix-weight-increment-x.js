/**
 * Fix Weight Increment X
 * This script specifically targets and fixes the Weight Increment X issue
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFixWeightIncrementX);
    } else {
        initFixWeightIncrementX();
    }

    function initFixWeightIncrementX() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const containers = node.querySelectorAll('.weight-increment-container');
                            if (containers.length > 0) {
                                containers.forEach(fixWeightIncrementContainer);
                            }

                            if (node.classList && node.classList.contains('weight-increment-container')) {
                                fixWeightIncrementContainer(node);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.querySelectorAll('.weight-increment-container').forEach(fixWeightIncrementContainer);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
                    visibleMenus.forEach(menu => {
                        const containers = menu.querySelectorAll('.weight-increment-container');
                        containers.forEach(fixWeightIncrementContainer);
                    });
                }, 100);
            }
        });
    }
    
    function fixWeightIncrementContainer(container) {

        const xElements = container.querySelectorAll('button, span, div');

        xElements.forEach(element => {
            if (element.textContent.includes('×') || element.textContent.includes('X')) {
                element.remove();
            }
        });

        const label = container.querySelector('.weight-increment-label, .weight-increment-text');
        if (label) {

            label.textContent = 'Weight Increment:';
        }
    }
})();
