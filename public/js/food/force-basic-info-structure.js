/**
 * Force Basic Information Structure
 * Completely replaces the Basic Information section with a properly structured one
 */

(function() {
    console.log('[Force Basic Info Structure] Initializing...');

    function forceBasicInfoStructure() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.forceBasicInfoFixed === 'true') return;

            console.log('[Force Basic Info Structure] Current form structure:', form.innerHTML);

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const basicInfoSection = formElement.querySelector('div:first-of-type');
            
            if (basicInfoSection) {
                console.log('[Force Basic Info Structure] Found Basic Information section');

                const nameInput = formElement.querySelector('#edit-ingredient-name');
                const amountInput = formElement.querySelector('#edit-ingredient-amount');
                const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
                const priceInput = formElement.querySelector('#edit-ingredient-price');
                
                const nameValue = nameInput ? nameInput.value : '';
                const amountValue = amountInput ? amountInput.value : '';
                const packageAmountValue = packageAmountInput ? packageAmountInput.value : '';
                const priceValue = priceInput ? priceInput.value : '';

                const newBasicInfoSection = document.createElement('div');
                newBasicInfoSection.className = 'nutrition-section basic-information';
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

                formElement.replaceChild(newBasicInfoSection, basicInfoSection);

                form.dataset.forceBasicInfoFixed = 'true';
                
                console.log('[Force Basic Info Structure] Basic Information section replaced');
            }
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Force Basic Info Structure] Edit button clicked');

                setTimeout(forceBasicInfoStructure, 100);

                setTimeout(forceBasicInfoStructure, 500);
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
                setTimeout(forceBasicInfoStructure, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        console.log('[Force Basic Info Structure] Initializing...');

        setTimeout(forceBasicInfoStructure, 100);

        handleEditButtonClicks();

        observeDOMChanges();
        
        console.log('[Force Basic Info Structure] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
