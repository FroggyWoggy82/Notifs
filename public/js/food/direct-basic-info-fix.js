/**
 * Direct Basic Information Fix
 * Directly modifies the Basic Information section's HTML structure
 */

(function() {
    console.log('[Direct Basic Info Fix] Initializing...');

    function fixBasicInfoSection() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.directBasicInfoFixed === 'true') return;

            const basicInfoSection = form.querySelector('div:first-of-type:not(.edit-ingredient-form-header)');
            
            if (basicInfoSection) {
                console.log('[Direct Basic Info Fix] Found Basic Information section');

                basicInfoSection.classList.add('nutrition-section');
                basicInfoSection.classList.add('basic-information');

                let header = basicInfoSection.querySelector('h4');
                if (!header) {

                    header = document.createElement('h4');
                    header.textContent = 'Basic Information';
                    basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
                }

                const formGroups = basicInfoSection.querySelectorAll('.form-group');

                let nutritionGrid = basicInfoSection.querySelector('.nutrition-grid');
                if (!nutritionGrid) {
                    nutritionGrid = document.createElement('div');
                    nutritionGrid.className = 'nutrition-grid';

                    formGroups.forEach(group => {

                        group.classList.add('nutrition-item');

                        const clonedGroup = group.cloneNode(true);
                        nutritionGrid.appendChild(clonedGroup);

                        if (group.parentNode) {
                            group.parentNode.removeChild(group);
                        }
                    });

                    if (header.nextSibling) {
                        basicInfoSection.insertBefore(nutritionGrid, header.nextSibling);
                    } else {
                        basicInfoSection.appendChild(nutritionGrid);
                    }
                }

                form.dataset.directBasicInfoFixed = 'true';
            }
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Direct Basic Info Fix] Edit button clicked');

                setTimeout(fixBasicInfoSection, 100);

                setTimeout(fixBasicInfoSection, 500);
            }
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            let needsFixing = false;
            
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsFixing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsFixing = true;
                            }
                        }
                    });
                }
            });

            if (needsFixing) {
                setTimeout(fixBasicInfoSection, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        console.log('[Direct Basic Info Fix] Initializing...');

        setTimeout(fixBasicInfoSection, 100);

        handleEditButtonClicks();

        observeDOMChanges();
        
        console.log('[Direct Basic Info Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
