/**
 * Unified Basic Info Fix
 * A single, clean solution for fixing the Basic Information section in the edit ingredient form
 */

(function() {

    function fixBasicInfoSection() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.unifiedBasicInfoFixed === 'true') return;
            
            console.log('Applying unified fix to Basic Information section');

            const formElement = form.querySelector('form');
            if (!formElement) return;

            let basicInfoSection = formElement.querySelector('.basic-information');
            if (!basicInfoSection) {

                basicInfoSection = formElement.querySelector('div:first-of-type');
            }
            
            if (!basicInfoSection) return;

            const nameInput = formElement.querySelector('#edit-ingredient-name');
            const amountInput = formElement.querySelector('#edit-ingredient-amount');
            const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
            const priceInput = formElement.querySelector('#edit-ingredient-price');
            
            if (!nameInput || !amountInput) return;
            
            const nameValue = nameInput.value || '';
            const amountValue = amountInput.value || '';
            const packageAmountValue = packageAmountInput ? packageAmountInput.value || '' : '';
            const priceValue = priceInput ? priceInput.value || '' : '';

            const newBasicInfoSection = document.createElement('div');
            newBasicInfoSection.className = 'nutrition-section basic-information';
            newBasicInfoSection.style.marginBottom = '8px';
            newBasicInfoSection.style.padding = '8px';
            newBasicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            newBasicInfoSection.style.borderRadius = '4px';
            newBasicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            newBasicInfoSection.style.color = '#e0e0e0';

            newBasicInfoSection.innerHTML = `
                <h4 style="margin-top: 0; margin-bottom: 6px; font-size: 0.85em; font-weight: 500; color: #e0e0e0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 3px;">Basic Information</h4>
                <div class="nutrition-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 3px;">
                    <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                        <label for="unified-edit-ingredient-name" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Name:</label>
                        <input type="text" id="unified-edit-ingredient-name" name="name" value="${nameValue}" required style="width: 100px; height: 14px; padding: 1px 3px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px;">
                    </div>
                    <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                        <label for="unified-edit-ingredient-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Amount (g):</label>
                        <input type="number" id="unified-edit-ingredient-amount" name="amount" value="${amountValue}" step="0.1" min="0.1" required style="width: 50px; height: 14px; padding: 1px 3px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px;">
                    </div>
                    ${packageAmountInput ? `
                    <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                        <label for="unified-edit-ingredient-package-amount" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Amount (g):</label>
                        <input type="number" id="unified-edit-ingredient-package-amount" name="packageAmount" value="${packageAmountValue}" step="0.1" min="0" style="width: 50px; height: 14px; padding: 1px 3px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px;">
                    </div>
                    ` : ''}
                    ${priceInput ? `
                    <div class="nutrition-item" style="margin-bottom: 2px; display: flex; flex-direction: column;">
                        <label for="unified-edit-ingredient-price" style="font-size: 0.7em; margin-bottom: 1px; color: #aaa; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Package Price:</label>
                        <input type="number" id="unified-edit-ingredient-price" name="price" value="${priceValue}" step="0.01" min="0" style="width: 50px; height: 14px; padding: 1px 3px; font-size: 0.75em; background-color: rgba(30, 30, 30, 0.7); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px;">
                    </div>
                    ` : ''}
                </div>
            `;

            basicInfoSection.parentNode.replaceChild(newBasicInfoSection, basicInfoSection);

            const unifiedNameInput = newBasicInfoSection.querySelector('#unified-edit-ingredient-name');
            const unifiedAmountInput = newBasicInfoSection.querySelector('#unified-edit-ingredient-amount');
            const unifiedPackageAmountInput = newBasicInfoSection.querySelector('#unified-edit-ingredient-package-amount');
            const unifiedPriceInput = newBasicInfoSection.querySelector('#unified-edit-ingredient-price');

            if (unifiedNameInput && nameInput) {
                unifiedNameInput.addEventListener('input', function() {
                    nameInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    nameInput.dispatchEvent(event);
                });

                nameInput.style.display = 'none';
            }

            if (unifiedAmountInput && amountInput) {
                unifiedAmountInput.addEventListener('input', function() {
                    amountInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    amountInput.dispatchEvent(event);
                });

                amountInput.style.display = 'none';
            }

            if (unifiedPackageAmountInput && packageAmountInput) {
                unifiedPackageAmountInput.addEventListener('input', function() {
                    packageAmountInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    packageAmountInput.dispatchEvent(event);
                });

                packageAmountInput.style.display = 'none';
            }

            if (unifiedPriceInput && priceInput) {
                unifiedPriceInput.addEventListener('input', function() {
                    priceInput.value = this.value;

                    const event = new Event('change', { bubbles: true });
                    priceInput.dispatchEvent(event);
                });

                priceInput.style.display = 'none';
            }

            form.dataset.unifiedBasicInfoFixed = 'true';
            
            console.log('Basic Information section fixed with unified approach');
        });
    }

    function init() {
        console.log('Initializing Unified Basic Info Fix');

        fixBasicInfoSection();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(fixBasicInfoSection, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('edit-ingredient-btn') || 
                event.target.classList.contains('edit-btn') ||
                (event.target.tagName === 'BUTTON' && event.target.textContent === 'Edit')) {
                console.log('Edit button clicked, applying unified Basic Info fix');

                setTimeout(fixBasicInfoSection, 100);

                setTimeout(fixBasicInfoSection, 300);
                setTimeout(fixBasicInfoSection, 500);
                setTimeout(fixBasicInfoSection, 1000);
            }
        });

        setInterval(fixBasicInfoSection, 1000);
        
        console.log('Unified Basic Info Fix initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
