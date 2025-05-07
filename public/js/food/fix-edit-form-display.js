/**
 * Fix Edit Form Display
 * Ensures the edit form is only displayed when the edit button is clicked
 */

(function() {
    console.log('[Fix Edit Form Display] Initializing...');

    function hideEditForms() {
        console.log('[Fix Edit Form Display] Hiding edit forms...');

        const editForms = document.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
        editForms.forEach(form => {

            form.style.display = 'none';

            form.setAttribute('data-edit-form-fixed', 'true');

            const headers = form.querySelectorAll('h4');
            headers.forEach(header => {
                if (header.textContent.includes('Edit Ingredient')) {
                    header.style.display = 'none';
                }
            });
        });

        const allHeaders = document.querySelectorAll('h4');
        allHeaders.forEach(header => {
            if (header.textContent.includes('Edit Ingredient')) {
                const parentForm = header.closest('.edit-ingredient-form');
                if (parentForm && !parentForm.classList.contains('show-edit-form')) {
                    parentForm.style.display = 'none';
                }
            }
        });

        const visibleForms = document.querySelectorAll('.edit-ingredient-form.show-edit-form');
        if (visibleForms.length > 0) {
            console.log(`[Fix Edit Form Display] Found ${visibleForms.length} forms with show-edit-form class`);
        }

        console.log('[Fix Edit Form Display] Edit forms hidden');
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            let needsHiding = false;

            mutations.forEach(mutation => {

                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'style' &&
                    mutation.target.classList &&
                    mutation.target.classList.contains('edit-ingredient-form')) {


                    if (!window._editButtonClicked && !mutation.target.classList.contains('show-edit-form')) {
                        mutation.target.style.display = 'none';
                        needsHiding = true;
                    }
                }

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('edit-ingredient-form')) {

                                if (!window._editButtonClicked && !node.classList.contains('show-edit-form')) {
                                    node.style.display = 'none';
                                    needsHiding = true;
                                }

                                node.setAttribute('data-edit-form-fixed', 'true');
                            }

                            const editForms = node.querySelectorAll('.edit-ingredient-form');
                            if (editForms.length > 0) {
                                editForms.forEach(form => {

                                    if (!window._editButtonClicked && !form.classList.contains('show-edit-form')) {
                                        form.style.display = 'none';
                                        needsHiding = true;
                                    }

                                    form.setAttribute('data-edit-form-fixed', 'true');
                                });
                            }

                            if (node.classList && node.classList.contains('ingredient-details')) {


                                setTimeout(() => {
                                    const editForms = node.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
                                    editForms.forEach(form => {
                                        form.style.display = 'none';
                                    });
                                }, 50);
                                needsHiding = true;
                            }
                        }
                    });
                }
            });

            if (needsHiding) {
                console.log('[Fix Edit Form Display] Hid edit forms after DOM changes');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    function fixEditButtonBehavior() {

        window._editButtonClicked = false;

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('view-ingredients-btn')) {
                console.log('[Fix Edit Form Display] View button clicked');
                window._editButtonClicked = false;

                const recipeItem = event.target.closest('.recipe-card');
                if (recipeItem) {

                    setTimeout(() => {
                        const editForm = recipeItem.querySelector('.edit-ingredient-form');
                        if (editForm) {

                            editForm.style.display = 'none';
                            console.log('[Fix Edit Form Display] Hid edit form after view button click');
                        }
                    }, 100); // Delay to ensure the DOM has updated
                }
            }

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Fix Edit Form Display] Edit button clicked');
                window._editButtonClicked = true;

                const row = event.target.closest('tr');
                if (row) {
                    const container = row.closest('.ingredient-details');
                    if (container) {

                        const editForm = container.querySelector('.edit-ingredient-form');
                        if (editForm) {


                            editForm.removeAttribute('style');

                            editForm.style.display = 'block';

                            editForm.classList.add('show-edit-form');

                            console.log('[Fix Edit Form Display] Made edit form visible from click handler:', editForm);
                        }
                    }
                }

                setTimeout(() => {
                    window._editButtonClicked = false;
                }, 2000);
            }

            if (event.target.classList.contains('cancel-edit-btn')) {
                console.log('[Fix Edit Form Display] Cancel button clicked');

                const editForm = event.target.closest('.edit-ingredient-form');
                if (editForm) {

                    editForm.style.display = 'none';
                    editForm.classList.remove('show-edit-form');
                    editForm.classList.add('hide-edit-form');

                    editForm.setAttribute('data-force-hidden', 'true');

                    setTimeout(function() {
                        editForm.style.display = 'none';
                    }, 10);
                }
            }
        }, true); // Use capture phase to ensure this runs before other handlers
    }

    function addCssRules() {
        const style = document.createElement('style');
        style.textContent = `
            
            .edit-ingredient-form:not(.show-edit-form) {
                display: none;
            }

            
            .edit-ingredient-form.show-edit-form {
                display: block !important;
            }

            
            .edit-ingredient-form.show-edit-form * {
                display: inherit;
            }

            
            .edit-ingredient-form.show-edit-form input,
            .edit-ingredient-form.show-edit-form button,
            .edit-ingredient-form.show-edit-form select,
            .edit-ingredient-form.show-edit-form textarea,
            .edit-ingredient-form.show-edit-form label {
                display: inline-block;
            }

            .edit-ingredient-form.show-edit-form h4 {
                display: block;
            }

            
            .edit-ingredient-form[data-force-hidden="true"],
            .edit-ingredient-form.hide-edit-form {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        console.log('[Fix Edit Form Display] Added CSS rules');
    }

    function patchEditIngredientClick() {

        if (window.handleEditIngredientClick) {
            console.log('[Fix Edit Form Display] Patching handleEditIngredientClick function');

            const originalFunction = window.handleEditIngredientClick;

            window.handleEditIngredientClick = function(event) {
                console.log('[Fix Edit Form Display] Patched handleEditIngredientClick called');

                window._editButtonClicked = true;

                const result = originalFunction.apply(this, arguments);

                const row = event.target.closest('tr');
                const container = row.closest('.ingredient-details');
                const editForm = container.querySelector('.edit-ingredient-form');

                if (editForm) {

                    editForm.removeAttribute('style');

                    editForm.style.display = 'block';

                    editForm.classList.add('show-edit-form');

                    console.log('[Fix Edit Form Display] Made edit form visible:', editForm);

                    const headers = editForm.querySelectorAll('h4');
                    headers.forEach(header => {
                        header.style.display = 'block';
                    });
                }

                setTimeout(() => {
                    window._editButtonClicked = false;
                }, 2000);

                return result;
            };

            console.log('[Fix Edit Form Display] handleEditIngredientClick function patched');
        }
    }

    function patchFetchAndDisplayIngredients() {

        if (window.fetchAndDisplayIngredients) {
            console.log('[Fix Edit Form Display] Patching fetchAndDisplayIngredients function');

            const originalFunction = window.fetchAndDisplayIngredients;

            window.fetchAndDisplayIngredients = async function(recipeId, detailsDiv, viewButton) {
                console.log('[Fix Edit Form Display] Patched fetchAndDisplayIngredients called');

                window._editButtonClicked = false;

                const result = await originalFunction.apply(this, arguments);

                setTimeout(() => {
                    const editForms = detailsDiv.querySelectorAll('.edit-ingredient-form:not(.show-edit-form)');
                    editForms.forEach(form => {
                        form.style.display = 'none';
                    });
                    console.log('[Fix Edit Form Display] Hid edit forms after fetchAndDisplayIngredients');
                }, 100);

                return result;
            };

            console.log('[Fix Edit Form Display] fetchAndDisplayIngredients function patched');
        }
    }

    function init() {
        console.log('[Fix Edit Form Display] Initializing...');

        addCssRules();

        setTimeout(hideEditForms, 100); // Delay to ensure the DOM is fully loaded

        fixEditButtonBehavior();

        setTimeout(patchEditIngredientClick, 200);

        setTimeout(patchFetchAndDisplayIngredients, 200);

        observeDOMChanges();



        console.log('[Fix Edit Form Display] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
