/**
 * Options Menu Structure Fix
 * This script ensures the options menu has the correct structure for proper label alignment
 */

(function() {

    function fixOptionsMenuStructure() {

        const optionsMenus = document.querySelectorAll('.exercise-options-menu');
        
        optionsMenus.forEach(menu => {

            if (menu.dataset.structureFixed === 'true') {
                return;
            }

            const weightUnitRow = menu.querySelector('.exercise-options-menu-row.unit-row');
            if (weightUnitRow) {

                const weightUnitLabel = weightUnitRow.querySelector('.weight-unit-label');
                const weightUnitSelect = weightUnitRow.querySelector('.exercise-unit-select');

                let weightUnitContainer = weightUnitRow.querySelector('.weight-unit-container');
                if (!weightUnitContainer) {
                    weightUnitContainer = document.createElement('div');
                    weightUnitContainer.className = 'weight-unit-container';
                    weightUnitContainer.style.display = 'flex';
                    weightUnitContainer.style.flexDirection = 'column';
                    weightUnitContainer.style.alignItems = 'flex-start';

                    if (weightUnitLabel && weightUnitSelect) {

                        const labelParent = weightUnitLabel.parentNode;

                        if (!labelParent.classList.contains('weight-unit-container')) {
                            weightUnitContainer.appendChild(weightUnitLabel);
                            weightUnitContainer.appendChild(weightUnitSelect);
                            weightUnitRow.appendChild(weightUnitContainer);
                        }
                    }
                }
            }

            const weightIncrementRow = menu.querySelector('.exercise-options-menu-row:not(.unit-row)');
            if (weightIncrementRow) {

                const weightIncrementLabel = weightIncrementRow.querySelector('.weight-increment-text');
                const weightIncrementInput = weightIncrementRow.querySelector('.weight-increment-input');

                let weightIncrementContainer = weightIncrementRow.querySelector('.weight-increment-container');
                if (!weightIncrementContainer) {
                    weightIncrementContainer = document.createElement('div');
                    weightIncrementContainer.className = 'weight-increment-container';
                    weightIncrementContainer.style.display = 'flex';
                    weightIncrementContainer.style.flexDirection = 'column';
                    weightIncrementContainer.style.alignItems = 'flex-start';

                    if (weightIncrementLabel && weightIncrementInput) {

                        const labelParent = weightIncrementLabel.parentNode;

                        if (!labelParent.classList.contains('weight-increment-container')) {
                            weightIncrementContainer.appendChild(weightIncrementLabel);
                            weightIncrementContainer.appendChild(weightIncrementInput);
                            weightIncrementRow.appendChild(weightIncrementContainer);
                        }
                    }
                }
            }

            menu.dataset.structureFixed = 'true';
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('exercise-options-menu')) {

                                fixOptionsMenuStructure();
                            }

                            const optionsMenus = node.querySelectorAll('.exercise-options-menu');
                            if (optionsMenus.length) {
                                fixOptionsMenuStructure();
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
                    fixOptionsMenuStructure();
                }, 50);
            }

            const visibleMenus = document.querySelectorAll('.exercise-options-menu.show');
            if (visibleMenus.length) {
                setTimeout(() => {
                    fixOptionsMenuStructure();
                }, 50);
            }
        });
    }

    function init() {
        console.log('[Options Menu Structure Fix] Initializing...');

        fixOptionsMenuStructure();

        handleOptionsMenuToggle();

        observeDOMChanges();
        
        console.log('[Options Menu Structure Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
