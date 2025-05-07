/**
 * Replace Basic Information
 * Completely replaces the Basic Information section with a properly structured one
 */

(function() {
    console.log('[Replace Basic Info] Initializing...');

    function replaceBasicInfo() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.basicInfoReplaced === 'true') return;

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

            const newBasicInfo = document.createElement('div');
            newBasicInfo.className = 'nutrition-section';
            newBasicInfo.style.backgroundColor = '#1e1e1e';
            newBasicInfo.style.borderRadius = '5px';
            newBasicInfo.style.padding = '15px';
            newBasicInfo.style.marginBottom = '15px';
            newBasicInfo.style.color = 'white';

            const header = document.createElement('h4');
            header.textContent = 'Basic Information';
            header.style.color = 'white';
            header.style.marginTop = '0';
            header.style.marginBottom = '10px';
            header.style.fontSize = '1.1em';
            header.style.fontWeight = 'bold';
            newBasicInfo.appendChild(header);

            const nutritionGrid = document.createElement('div');
            nutritionGrid.className = 'nutrition-grid';
            nutritionGrid.style.display = 'grid';
            nutritionGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
            nutritionGrid.style.gap = '10px';

            const nameItem = document.createElement('div');
            nameItem.className = 'nutrition-item';
            nameItem.innerHTML = `
                <label for="edit-ingredient-name" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Name:</label>
                <input type="text" id="edit-ingredient-name" value="${nameValue}" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(nameItem);

            const amountItem = document.createElement('div');
            amountItem.className = 'nutrition-item';
            amountItem.innerHTML = `
                <label for="edit-ingredient-amount" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Amount (g):</label>
                <input type="number" id="edit-ingredient-amount" value="${amountValue}" step="0.1" min="0.1" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(amountItem);

            const packageAmountItem = document.createElement('div');
            packageAmountItem.className = 'nutrition-item';
            packageAmountItem.innerHTML = `
                <label for="edit-ingredient-package-amount" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Package Amount (g):</label>
                <input type="number" id="edit-ingredient-package-amount" value="${packageAmountValue}" step="0.1" min="0" style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(packageAmountItem);

            const priceItem = document.createElement('div');
            priceItem.className = 'nutrition-item';
            priceItem.innerHTML = `
                <label for="edit-ingredient-price" style="color: white; font-size: 0.9em; display: block; margin-bottom: 3px;">Package Price:</label>
                <input type="number" id="edit-ingredient-price" value="${priceValue}" step="0.01" min="0" required style="background-color: #333; color: white; border: 1px solid #444; border-radius: 3px; padding: 5px; width: 100%;">
            `;
            nutritionGrid.appendChild(priceItem);

            newBasicInfo.appendChild(nutritionGrid);

            formElement.replaceChild(newBasicInfo, firstDiv);

            form.dataset.basicInfoReplaced = 'true';
            
            console.log('[Replace Basic Info] Basic Information section replaced');
        });
    }

    function handleEditButtonClicks() {

        document.body.addEventListener('click', event => {

            if (event.target.classList.contains('edit-ingredient-btn')) {
                console.log('[Replace Basic Info] Edit button clicked');

                setTimeout(replaceBasicInfo, 100);

                setTimeout(replaceBasicInfo, 500);
            }
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            let needsReplacing = false;
            
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('edit-ingredient-form')) {
                                needsReplacing = true;
                            } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                                needsReplacing = true;
                            }
                        }
                    });
                }
            });

            if (needsReplacing) {
                setTimeout(replaceBasicInfo, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        console.log('[Replace Basic Info] Initializing...');

        setTimeout(replaceBasicInfo, 100);

        handleEditButtonClicks();

        observeDOMChanges();
        
        console.log('[Replace Basic Info] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
