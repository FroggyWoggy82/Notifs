/**
 * Direct Basic Info Styling
 * Directly applies the exact same styling to the Basic Information section as the other sections
 */

(function() {

    function directBasicInfoStyling() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.directBasicInfoStyled === 'true') return;
            
            console.log('Directly styling Basic Information section');

            const basicInfoSection = form.querySelector('.basic-information');
            if (!basicInfoSection) return;

            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';

            const header = basicInfoSection.querySelector('h4');
            if (header) {
                header.style.marginTop = '0';
                header.style.marginBottom = '5px';
                header.style.paddingBottom = '2px';
                header.style.borderBottom = 'none';
                header.style.color = '#e0e0e0';
                header.style.fontWeight = '500';
                header.style.fontSize = '0.85em';
            }

            form.dataset.directBasicInfoStyled = 'true';
            
            console.log('Basic Information section directly styled');
        });
    }

    function init() {
        console.log('Initializing Direct Basic Info Styling');

        directBasicInfoStyling();

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    setTimeout(directBasicInfoStyling, 50);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.body.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying direct Basic Info styling');

                setTimeout(directBasicInfoStyling, 100);

                setTimeout(directBasicInfoStyling, 300);
                setTimeout(directBasicInfoStyling, 500);
            }
        });

        setInterval(directBasicInfoStyling, 1000);
        
        console.log('Direct Basic Info Styling initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
