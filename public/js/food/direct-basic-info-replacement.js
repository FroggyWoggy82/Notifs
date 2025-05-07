/**
 * Direct Basic Info Replacement
 * Directly replaces the Basic Information section with a properly styled one
 */

(function() {
    console.log('[Direct Basic Info Replacement] Initializing...');

    function directBasicInfoReplacement() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');

        editForms.forEach(form => {

            if (form.dataset.directBasicInfoReplaced === 'true') return;

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const firstDiv = formElement.querySelector('div:first-of-type');
            if (!firstDiv) return;

            const nameInput = formElement.querySelector('#edit-ingredient-name');
            const amountInput = formElement.querySelector('#edit-ingredient-amount');
            const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
            const priceInput = formElement.querySelector('#edit-ingredient-price');

            const nameValue = nameInput ? nameInput.value : '';
            const amountValue = amountInput ? amountInput.value : '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value : '';
            const priceValue = priceInput ? priceInput.value : '';

            const newBasicInfoSection = document.createElement('div');
            newBasicInfoSection.className = 'nutrition-section';
            newBasicInfoSection.innerHTML = `
                <h4>Basic Information</h4>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <label for="edit-ingredient-name">Name:</label>
                        <input type="text" id="edit-ingredient-name" value="${nameValue}" required>
                    </div>
                    <div class="nutrition-item">
                        <label for="edit-ingredient-amount">Amount (g):</label>
                        <input type="number" id="edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required>
                    </div>
                    <div class="nutrition-item">
                        <label for="edit-ingredient-package-amount">Package Amount (g):</label>
                        <input type="number" id="edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0">
                    </div>
                    <div class="nutrition-item">
                        <label for="edit-ingredient-price">Package Price:</label>
                        <input type="number" id="edit-ingredient-price" value="${priceValue}" step="0.01" min="0" required>
                    </div>
                </div>
            `;

            newBasicInfoSection.style.backgroundColor = '#1e1e1e';
            newBasicInfoSection.style.borderRadius = '5px';
            newBasicInfoSection.style.padding = '15px';
            newBasicInfoSection.style.marginBottom = '15px';
            newBasicInfoSection.style.color = 'white';

            const header = newBasicInfoSection.querySelector('h4');
            if (header) {
                header.style.color = 'white';
                header.style.marginTop = '0';
                header.style.marginBottom = '10px';
                header.style.fontSize = '1.1em';
                header.style.fontWeight = 'bold';
            }

            const nutritionGrid = newBasicInfoSection.querySelector('.nutrition-grid');
            if (nutritionGrid) {
                nutritionGrid.style.display = 'grid';
                nutritionGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                nutritionGrid.style.gap = '10px';
            }

            const nutritionItems = newBasicInfoSection.querySelectorAll('.nutrition-item');
            nutritionItems.forEach(item => {
                item.style.marginBottom = '8px';
            });

            const labels = newBasicInfoSection.querySelectorAll('label');
            labels.forEach(label => {
                label.style.color = 'white';
                label.style.fontSize = '0.9em';
                label.style.display = 'block';
                label.style.marginBottom = '3px';
            });

            const inputs = newBasicInfoSection.querySelectorAll('input');
            inputs.forEach(input => {
                input.style.backgroundColor = '#333';
                input.style.color = 'white';
                input.style.border = '1px solid #444';
                input.style.borderRadius = '3px';
                input.style.padding = '5px';
                input.style.width = '100%';
            });

            formElement.replaceChild(newBasicInfoSection, firstDiv);

            form.dataset.directBasicInfoReplaced = 'true';

            console.log('[Direct Basic Info Replacement] Basic Information section replaced');
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Direct Basic Info Replacement] Edit button clicked');

                setTimeout(directBasicInfoReplacement, 100);

                setTimeout(directBasicInfoReplacement, 500);
                setTimeout(directBasicInfoReplacement, 1000);
            }
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            let needsReplacement = false;

            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsReplacement = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsReplacement = true;
                            }
                        }
                    });
                }
            });

            if (needsReplacement) {
                setTimeout(directBasicInfoReplacement, 50);
                setTimeout(directBasicInfoReplacement, 200);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        console.log('[Direct Basic Info Replacement] Initializing...');

        setTimeout(directBasicInfoReplacement, 100);
        setTimeout(directBasicInfoReplacement, 500);
        setTimeout(directBasicInfoReplacement, 1000);

        handleEditButtonClicks();

        observeDOMChanges();

        console.log('[Direct Basic Info Replacement] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
