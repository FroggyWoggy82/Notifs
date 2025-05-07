/**
 * Direct DOM Modification
 * Directly modifies the DOM structure of the Basic Information section to match the other sections
 */

(function() {

    function directDomModification() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.directDomModified === 'true') return;
            
            console.log('Directly modifying DOM structure of Basic Information section');

            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;

            basicInfoSection.classList.add('nutrition-section');

            let header = basicInfoSection.querySelector('h4');
            if (!header) {

                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
            }

            const formGroups = basicInfoSection.querySelectorAll('.form-group');

            const nutritionGrid = document.createElement('div');
            nutritionGrid.className = 'nutrition-grid';

            formGroups.forEach(formGroup => {
                const nutritionItem = document.createElement('div');
                nutritionItem.className = 'nutrition-item';

                const label = formGroup.querySelector('label');
                const input = formGroup.querySelector('input');
                
                if (label && input) {
                    nutritionItem.appendChild(label);
                    nutritionItem.appendChild(input);
                    nutritionGrid.appendChild(nutritionItem);
                }
            });

            formGroups.forEach(formGroup => {
                formGroup.remove();
            });

            basicInfoSection.appendChild(nutritionGrid);

            form.dataset.directDomModified = 'true';
            
            console.log('DOM structure of Basic Information section directly modified');
        });
    }

    function init() {
        console.log('Initializing Direct DOM Modification');

        directDomModification();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(directDomModification, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying direct DOM modification');

                setTimeout(directDomModification, 100);

                setTimeout(directDomModification, 300);
                setTimeout(directDomModification, 500);
            }
        });

        setInterval(directDomModification, 1000);
        
        console.log('Direct DOM Modification initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
