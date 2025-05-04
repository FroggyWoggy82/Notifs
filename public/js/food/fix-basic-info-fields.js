/**
 * Fix Basic Info Fields
 * A simple approach to ensure the Basic Information section is visible and has fields
 * Specifically targets the edit form that appears when clicking the Edit button for an existing ingredient
 */

(function() {
    // Function to create a Basic Information section with fields
    function createBasicInfoSection(formElement) {
        console.log('Creating Basic Information section');

        // Create the Basic Information section
        const basicInfoSection = document.createElement('div');
        basicInfoSection.className = 'nutrition-section basic-information';
        basicInfoSection.style.marginBottom = '8px';
        basicInfoSection.style.padding = '8px';
        basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
        basicInfoSection.style.borderRadius = '4px';
        basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        basicInfoSection.style.color = '#e0e0e0';

        const header = document.createElement('h4');
        header.textContent = 'Basic Information';
        header.style.color = '#e0e0e0';
        header.style.marginTop = '0';
        header.style.marginBottom = '6px';
        header.style.fontSize = '0.85em';
        header.style.fontWeight = '500';
        header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        header.style.paddingBottom = '3px';

        basicInfoSection.appendChild(header);

        // Create a grid for the inputs
        const grid = document.createElement('div');
        grid.className = 'nutrition-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(70px, 1fr))';
        grid.style.gap = '3px';
        basicInfoSection.appendChild(grid);

        // Create the name field
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group nutrition-item';
        nameGroup.style.marginBottom = '2px';

        const nameLabel = document.createElement('label');
        nameLabel.setAttribute('for', 'edit-ingredient-name');
        nameLabel.textContent = 'Name:';
        nameLabel.style.color = '#aaa';
        nameLabel.style.fontSize = '0.7em';
        nameLabel.style.display = 'block';
        nameLabel.style.marginBottom = '1px';
        nameLabel.style.fontWeight = 'normal';
        nameLabel.style.whiteSpace = 'nowrap';
        nameLabel.style.overflow = 'hidden';
        nameLabel.style.textOverflow = 'ellipsis';

        const nameInput = document.createElement('input');
        nameInput.setAttribute('type', 'text');
        nameInput.setAttribute('id', 'edit-ingredient-name');
        nameInput.setAttribute('name', 'name');
        nameInput.setAttribute('required', 'required');
        nameInput.style.width = '100px';
        nameInput.style.height = '14px';
        nameInput.style.padding = '1px 3px';
        nameInput.style.fontSize = '0.75em';
        nameInput.style.marginBottom = '0';
        nameInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        nameInput.style.color = '#e0e0e0';
        nameInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        nameInput.style.borderRadius = '4px';

        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);
        grid.appendChild(nameGroup);

        // Create the amount field
        const amountGroup = document.createElement('div');
        amountGroup.className = 'form-group nutrition-item';
        amountGroup.style.marginBottom = '2px';

        const amountLabel = document.createElement('label');
        amountLabel.setAttribute('for', 'edit-ingredient-amount');
        amountLabel.textContent = 'Amount (g):';
        amountLabel.style.color = '#aaa';
        amountLabel.style.fontSize = '0.7em';
        amountLabel.style.display = 'block';
        amountLabel.style.marginBottom = '1px';
        amountLabel.style.fontWeight = 'normal';
        amountLabel.style.whiteSpace = 'nowrap';
        amountLabel.style.overflow = 'hidden';
        amountLabel.style.textOverflow = 'ellipsis';

        const amountInput = document.createElement('input');
        amountInput.setAttribute('type', 'number');
        amountInput.setAttribute('id', 'edit-ingredient-amount');
        amountInput.setAttribute('name', 'amount');
        amountInput.setAttribute('step', '0.1');
        amountInput.setAttribute('min', '0.1');
        amountInput.setAttribute('required', 'required');
        amountInput.style.width = '50px';
        amountInput.style.height = '14px';
        amountInput.style.padding = '1px 3px';
        amountInput.style.fontSize = '0.75em';
        amountInput.style.marginBottom = '0';
        amountInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        amountInput.style.color = '#e0e0e0';
        amountInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        amountInput.style.borderRadius = '4px';

        amountGroup.appendChild(amountLabel);
        amountGroup.appendChild(amountInput);
        grid.appendChild(amountGroup);

        // Create the package amount field
        const packageAmountGroup = document.createElement('div');
        packageAmountGroup.className = 'form-group nutrition-item';
        packageAmountGroup.style.marginBottom = '2px';

        const packageAmountLabel = document.createElement('label');
        packageAmountLabel.setAttribute('for', 'edit-ingredient-package-amount');
        packageAmountLabel.textContent = 'Package Amount (g):';
        packageAmountLabel.style.color = '#aaa';
        packageAmountLabel.style.fontSize = '0.7em';
        packageAmountLabel.style.display = 'block';
        packageAmountLabel.style.marginBottom = '1px';
        packageAmountLabel.style.fontWeight = 'normal';
        packageAmountLabel.style.whiteSpace = 'nowrap';
        packageAmountLabel.style.overflow = 'hidden';
        packageAmountLabel.style.textOverflow = 'ellipsis';

        const packageAmountInput = document.createElement('input');
        packageAmountInput.setAttribute('type', 'number');
        packageAmountInput.setAttribute('id', 'edit-ingredient-package-amount');
        packageAmountInput.setAttribute('name', 'packageAmount');
        packageAmountInput.setAttribute('step', '0.1');
        packageAmountInput.setAttribute('min', '0');
        packageAmountInput.style.width = '50px';
        packageAmountInput.style.height = '14px';
        packageAmountInput.style.padding = '1px 3px';
        packageAmountInput.style.fontSize = '0.75em';
        packageAmountInput.style.marginBottom = '0';
        packageAmountInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        packageAmountInput.style.color = '#e0e0e0';
        packageAmountInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        packageAmountInput.style.borderRadius = '4px';

        packageAmountGroup.appendChild(packageAmountLabel);
        packageAmountGroup.appendChild(packageAmountInput);
        grid.appendChild(packageAmountGroup);

        // Create the price field
        const priceGroup = document.createElement('div');
        priceGroup.className = 'form-group nutrition-item';
        priceGroup.style.marginBottom = '2px';

        const priceLabel = document.createElement('label');
        priceLabel.setAttribute('for', 'edit-ingredient-price');
        priceLabel.textContent = 'Package Price:';
        priceLabel.style.color = '#aaa';
        priceLabel.style.fontSize = '0.7em';
        priceLabel.style.display = 'block';
        priceLabel.style.marginBottom = '1px';
        priceLabel.style.fontWeight = 'normal';
        priceLabel.style.whiteSpace = 'nowrap';
        priceLabel.style.overflow = 'hidden';
        priceLabel.style.textOverflow = 'ellipsis';

        const priceInput = document.createElement('input');
        priceInput.setAttribute('type', 'number');
        priceInput.setAttribute('id', 'edit-ingredient-price');
        priceInput.setAttribute('name', 'price');
        priceInput.setAttribute('step', '0.01');
        priceInput.setAttribute('min', '0');
        priceInput.style.width = '50px';
        priceInput.style.height = '14px';
        priceInput.style.padding = '1px 3px';
        priceInput.style.fontSize = '0.75em';
        priceInput.style.marginBottom = '0';
        priceInput.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        priceInput.style.color = '#e0e0e0';
        priceInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        priceInput.style.borderRadius = '4px';

        priceGroup.appendChild(priceLabel);
        priceGroup.appendChild(priceInput);
        grid.appendChild(priceGroup);

        // Insert at the beginning of the form
        if (formElement.firstChild) {
            formElement.insertBefore(basicInfoSection, formElement.firstChild);
        } else {
            formElement.appendChild(basicInfoSection);
        }

        return basicInfoSection;
    }

    // Function to handle edit button clicks
    function handleEditButtonClick(event) {
        console.log('Edit button clicked, fixing Basic Information section');

        // Get the row and container
        const row = event.target.closest('tr');
        if (!row) return;

        const container = row.closest('.ingredient-details');
        if (!container) return;

        const editForm = container.querySelector('.edit-ingredient-form');
        if (!editForm) return;

        // Make sure the form is visible
        editForm.style.display = 'block';

        // Get the form element
        const formElement = editForm.querySelector('form');
        if (!formElement) return;

        // Check if we already processed this form
        if (formElement.dataset.basicInfoFixed === 'true') return;

        // Remove any existing Basic Information sections
        const existingHeaders = formElement.querySelectorAll('h4');
        existingHeaders.forEach(header => {
            if (header.textContent.trim() === 'Basic Information') {
                const section = header.closest('.nutrition-section, div');
                if (section) {
                    section.parentNode.removeChild(section);
                }
            }
        });

        // Create a new Basic Information section
        const basicInfoSection = createBasicInfoSection(formElement);

        // Mark as processed
        formElement.dataset.basicInfoFixed = 'true';

        // Get the ingredient ID and recipe ID
        const ingredientId = row.dataset.ingredientId;
        const recipeId = row.dataset.recipeId;

        // Fetch the ingredient data
        fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(ingredient => {
                // Fill in the fields
                const nameInput = formElement.querySelector('#edit-ingredient-name');
                const amountInput = formElement.querySelector('#edit-ingredient-amount');
                const packageAmountInput = formElement.querySelector('#edit-ingredient-package-amount');
                const priceInput = formElement.querySelector('#edit-ingredient-price');

                if (nameInput) nameInput.value = ingredient.name || '';
                if (amountInput) amountInput.value = ingredient.amount || '';
                if (packageAmountInput) packageAmountInput.value = ingredient.package_amount || '';
                if (priceInput) priceInput.value = ingredient.price || '';

                console.log('Filled in Basic Information fields with ingredient data');
            })
            .catch(error => {
                console.error('Error fetching ingredient details:', error);
            });
    }

    // Function to initialize
    function init() {
        console.log('Initializing Fix Basic Info Fields');

        // Handle edit button clicks
        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' &&
                event.target.textContent === 'Edit' &&
                event.target.closest('tr') &&
                event.target.closest('.ingredient-details')) {

                // Wait for the form to be displayed
                setTimeout(() => handleEditButtonClick(event), 100);
                // Try again after a bit longer to ensure it's applied
                setTimeout(() => handleEditButtonClick(event), 300);
                setTimeout(() => handleEditButtonClick(event), 500);
            }
        });

        console.log('Fix Basic Info Fields initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
