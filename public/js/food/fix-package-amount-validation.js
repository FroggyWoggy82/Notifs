/**
 * Fix Package Amount Validation
 *
 * This script removes the strict validation on package amount fields
 * to allow a wider range of values.
 */

(function() {
    console.log('[Package Amount Validation Fix] Initializing...');

    function fixPackageAmountValidation() {

        const packageAmountInputs = document.querySelectorAll('.ingredient-package-amount, #edit-ingredient-package-amount, #add-ingredient-package-amount, [id*="package-amount"]');

        packageAmountInputs.forEach(input => {

            input.removeAttribute('step');

            input.setAttribute('step', '0.01');

            input.removeAttribute('min');
            input.removeAttribute('max');

            console.log(`[Package Amount Validation Fix] Fixed validation for: ${input.id || 'unnamed input'}`);
        });
    }

    fixPackageAmountValidation();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node

                        if (node.classList &&
                            (node.classList.contains('ingredient-package-amount') ||
                             node.id === 'edit-ingredient-package-amount' ||
                             node.id === 'add-ingredient-package-amount' ||
                             (node.id && node.id.includes('package-amount')))) {

                            node.removeAttribute('step');

                            node.setAttribute('step', '0.01');

                            node.removeAttribute('min');
                            node.removeAttribute('max');

                            console.log(`[Package Amount Validation Fix] Fixed validation for new input: ${node.id || 'unnamed input'}`);
                        }

                        const inputs = node.querySelectorAll('.ingredient-package-amount, #edit-ingredient-package-amount, #add-ingredient-package-amount, [id*="package-amount"]');
                        if (inputs.length > 0) {
                            inputs.forEach(input => {

                                input.removeAttribute('step');

                                input.setAttribute('step', '0.01');

                                input.removeAttribute('min');
                                input.removeAttribute('max');

                                console.log(`[Package Amount Validation Fix] Fixed validation for new input: ${input.id || 'unnamed input'}`);
                            });
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', function(event) {

        if (event.target.classList.contains('add-ingredient-to-recipe-btn') ||
            event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(fixPackageAmountValidation, 100);
        }
    });

    console.log('[Package Amount Validation Fix] Initialized');
})();
