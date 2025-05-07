/**
 * Basic Info Complete Replacement
 * Completely replaces the Basic Information section with a new one that has the exact same structure as the other sections
 */

(function() {

    function basicInfoCompleteReplacement() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.basicInfoCompleteReplaced === 'true') return;
            
            console.log('Completely replacing Basic Information section');

            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;

            const nameInput = form.querySelector('#edit-ingredient-name');
            const amountInput = form.querySelector('#edit-ingredient-amount');
            const packageAmountInput = form.querySelector('#edit-ingredient-package-amount');
            const priceInput = form.querySelector('#edit-ingredient-price');
            
            if (!nameInput || !amountInput) return;
            
            const nameValue = nameInput.value || '';
            const amountValue = amountInput.value || '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value || '' : '';
            const priceValue = priceInput ? priceInput.value || '' : '';

            const newBasicInfoSection = document.createElement('div');
            newBasicInfoSection.className = 'nutrition-section basic-information';

            newBasicInfoSection.innerHTML = `
                <h4>Basic Information</h4>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-name">Name:</label>
                        <input type="text" id="new-edit-ingredient-name" value="${nameValue}" required>
                    </div>
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-amount">Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required>
                    </div>
                    ${packageAmountInput ? `
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-package-amount">Package Amount (g):</label>
                        <input type="number" id="new-edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0">
                    </div>
                    ` : ''}
                    ${priceInput ? `
                    <div class="nutrition-item">
                        <label for="new-edit-ingredient-price">Package Price:</label>
                        <input type="number" id="new-edit-ingredient-price" value="${priceValue}" step="0.01" min="0">
                    </div>
                    ` : ''}
                </div>
            `;

            basicInfoSection.parentNode.replaceChild(newBasicInfoSection, basicInfoSection);

            const newNameInput = newBasicInfoSection.querySelector('#new-edit-ingredient-name');
            const newAmountInput = newBasicInfoSection.querySelector('#new-edit-ingredient-amount');
            const newPackageAmountInput = newBasicInfoSection.querySelector('#new-edit-ingredient-package-amount');
            const newPriceInput = newBasicInfoSection.querySelector('#new-edit-ingredient-price');
            
            if (newNameInput && nameInput) {
                newNameInput.addEventListener('input', function() {
                    nameInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    nameInput.dispatchEvent(event);
                });
                
                nameInput.addEventListener('input', function() {
                    newNameInput.value = this.value;
                });
            }
            
            if (newAmountInput && amountInput) {
                newAmountInput.addEventListener('input', function() {
                    amountInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    amountInput.dispatchEvent(event);
                });
                
                amountInput.addEventListener('input', function() {
                    newAmountInput.value = this.value;
                });
            }
            
            if (newPackageAmountInput && packageAmountInput) {
                newPackageAmountInput.addEventListener('input', function() {
                    packageAmountInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    packageAmountInput.dispatchEvent(event);
                });
                
                packageAmountInput.addEventListener('input', function() {
                    newPackageAmountInput.value = this.value;
                });
            }
            
            if (newPriceInput && priceInput) {
                newPriceInput.addEventListener('input', function() {
                    priceInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    priceInput.dispatchEvent(event);
                });
                
                priceInput.addEventListener('input', function() {
                    newPriceInput.value = this.value;
                });
            }

            if (nameInput) nameInput.style.display = 'none';
            if (amountInput) amountInput.style.display = 'none';
            if (packageAmountInput) packageAmountInput.style.display = 'none';
            if (priceInput) priceInput.style.display = 'none';

            form.dataset.basicInfoCompleteReplaced = 'true';
            
            console.log('Basic Information section completely replaced');
        });
    }

    function init() {
        console.log('Initializing Basic Info Complete Replacement');

        basicInfoCompleteReplacement();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(basicInfoCompleteReplacement, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying Basic Info complete replacement');

                setTimeout(basicInfoCompleteReplacement, 100);

                setTimeout(basicInfoCompleteReplacement, 300);
                setTimeout(basicInfoCompleteReplacement, 500);
            }
        });

        setInterval(basicInfoCompleteReplacement, 1000);
        
        console.log('Basic Info Complete Replacement initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
