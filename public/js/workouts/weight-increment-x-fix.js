/**
 * Weight Increment X Button Fix
 * This script removes any X buttons from the Weight Increment label in the exercise options menu
 */

(function() {

    function removeXButtonsFromWeightIncrementLabel() {

        const weightIncrementLabels = document.querySelectorAll('.weight-increment-label');

        weightIncrementLabels.forEach(label => {

            const buttons = label.querySelectorAll('button');
            buttons.forEach(button => {
                button.remove();
            });

            const spans = label.querySelectorAll('span');
            spans.forEach(span => {
                span.remove();
            });

            const divs = label.querySelectorAll('div');
            divs.forEach(div => {
                div.remove();
            });

            label.textContent = 'Weight Increment:';

            label.classList.add('x-button-fixed');
        });
    }

    function setupObserver() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('weight-increment-label')) {

                                setTimeout(() => {
                                    if (node.querySelectorAll('button').length > 0) {
                                        node.textContent = 'Weight Increment:';
                                        node.classList.add('x-button-fixed');
                                    }
                                }, 0);
                            }

                            const labels = node.querySelectorAll('.weight-increment-label');
                            if (labels.length) {

                                setTimeout(() => {
                                    removeXButtonsFromWeightIncrementLabel();
                                }, 0);
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
    }

    function handleOptionsMenuToggle() {

        document.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {

                    removeXButtonsFromWeightIncrementLabel();
                }, 10);
            }

            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {

                setTimeout(() => {
                    removeXButtonsFromWeightIncrementLabel();
                }, 10);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {

        removeXButtonsFromWeightIncrementLabel();

        setupObserver();

        handleOptionsMenuToggle();
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {

        removeXButtonsFromWeightIncrementLabel();

        setupObserver();

        handleOptionsMenuToggle();
    }
})();
