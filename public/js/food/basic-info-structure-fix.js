/**
 * Basic Information Structure Fix
 * Ensures the Basic Information section has the proper structure to match other sections
 */

(function() {
    console.log('[Basic Info Structure Fix] Initializing...');

    function fixBasicInfoStructure() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.basicInfoFixed === 'true') return;

            const basicInfoSection = form.querySelector('div:first-of-type:not(.edit-ingredient-form-header)');
            
            if (basicInfoSection) {

                if (!basicInfoSection.classList.contains('nutrition-section')) {
                    console.log('[Basic Info Structure Fix] Fixing Basic Information section structure');

                    basicInfoSection.classList.add('nutrition-section');

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
                            nutritionGrid.appendChild(group);
                        });

                        if (header.nextSibling) {
                            basicInfoSection.insertBefore(nutritionGrid, header.nextSibling);
                        } else {
                            basicInfoSection.appendChild(nutritionGrid);
                        }
                    }
                }

                form.dataset.basicInfoFixed = 'true';
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
                setTimeout(fixBasicInfoStructure, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Basic Info Structure Fix] Edit button clicked');

                setTimeout(fixBasicInfoStructure, 100);

                setTimeout(fixBasicInfoStructure, 500);
            }
        });
    }

    function init() {
        console.log('[Basic Info Structure Fix] Initializing...');

        setTimeout(fixBasicInfoStructure, 100);

        handleEditButtonClicks();

        observeDOMChanges();
        
        console.log('[Basic Info Structure Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
