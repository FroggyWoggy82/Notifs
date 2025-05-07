/**
 * Label Size Fix
 * This script ensures the Weight Unit and Weight Increment labels have the same size
 */

(function() {

    function fixLabelSizes() {

        const weightUnitLabels = document.querySelectorAll('.weight-unit-label');
        const weightIncrementLabels = document.querySelectorAll('.weight-increment-text');

        weightUnitLabels.forEach(label => {
            label.style.fontSize = '16px';
            label.style.lineHeight = '1.4';
            label.style.fontWeight = 'normal';
            label.style.color = '#ffffff';
            label.style.textAlign = 'left';
            label.style.marginLeft = '0';
            label.style.marginRight = 'auto';
            label.style.marginBottom = '3px';
        });

        weightIncrementLabels.forEach(label => {
            label.style.fontSize = '16px';
            label.style.lineHeight = '1.4';
            label.style.fontWeight = 'normal';
            label.style.color = '#ffffff';
            label.style.textAlign = 'left';
            label.style.marginLeft = '0';
            label.style.marginRight = 'auto';
            label.style.marginBottom = '3px';
        });

        const labelContainers = document.querySelectorAll('.exercise-options-menu-label');
        labelContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between';
            container.style.alignItems = 'flex-start';
            container.style.width = '100%';
            container.style.marginBottom = '5px';
        });

        const weightIncrementContainers = document.querySelectorAll('.weight-increment-container');
        weightIncrementContainers.forEach(container => {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-start';
            container.style.marginLeft = 'auto';
            container.style.marginRight = '0';
        });

        const exerciseOptionsMenuRows = document.querySelectorAll('.exercise-options-menu-row');
        exerciseOptionsMenuRows.forEach(row => {
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.marginBottom = '8px';
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('exercise-options-menu')) {

                                fixLabelSizes();
                            }

                            const optionsMenus = node.querySelectorAll('.exercise-options-menu');
                            if (optionsMenus.length) {
                                fixLabelSizes();
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
                    fixLabelSizes();
                }, 50);
            }

            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixLabelSizes();
                }, 50);
            }
        });
    }

    function init() {
        console.log('[Label Size Fix] Initializing...');

        fixLabelSizes();

        handleOptionsMenuToggle();

        observeDOMChanges();

        console.log('[Label Size Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
