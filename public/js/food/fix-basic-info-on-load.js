/**
 * Fix Basic Info On Load
 * Fixes the Basic Information section styling immediately on page load
 */

(function() {
    console.log('[Fix Basic Info On Load] Initializing...');

    function fixBasicInfoOnLoad() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const firstDiv = formElement.querySelector('div:first-of-type');
            if (!firstDiv) return;

            firstDiv.style.backgroundColor = '#1e1e1e';
            firstDiv.style.borderRadius = '5px';
            firstDiv.style.padding = '15px';
            firstDiv.style.marginBottom = '15px';
            firstDiv.style.color = 'white';

            firstDiv.classList.add('nutrition-section');

            let header = firstDiv.querySelector('h4');
            if (!header) {

                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                header.style.color = 'white';
                header.style.marginTop = '0';
                header.style.marginBottom = '10px';
                header.style.fontSize = '1.1em';
                header.style.fontWeight = 'bold';
                firstDiv.insertBefore(header, firstDiv.firstChild);
            }

            const formGroups = firstDiv.querySelectorAll('.form-group');
            formGroups.forEach(group => {

                group.style.marginBottom = '8px';

                const label = group.querySelector('label');
                if (label) {
                    label.style.color = 'white';
                    label.style.fontSize = '0.9em';
                    label.style.display = 'block';
                    label.style.marginBottom = '3px';
                }

                const input = group.querySelector('input');
                if (input) {
                    input.style.backgroundColor = '#333';
                    input.style.color = 'white';
                    input.style.border = '1px solid #444';
                    input.style.borderRadius = '3px';
                    input.style.padding = '5px';
                }
            });

            const formActions = form.querySelectorAll('.form-actions');

            if (formActions.length > 1) {

                for (let i = 0; i < formActions.length - 1; i++) {
                    formActions[i].style.display = 'none';
                }

                formActions[formActions.length - 1].style.display = 'flex';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fixBasicInfoOnLoad();

            setTimeout(fixBasicInfoOnLoad, 100);
            setTimeout(fixBasicInfoOnLoad, 500);
            setTimeout(fixBasicInfoOnLoad, 1000);
        });
    } else {
        fixBasicInfoOnLoad();

        setTimeout(fixBasicInfoOnLoad, 100);
        setTimeout(fixBasicInfoOnLoad, 500);
        setTimeout(fixBasicInfoOnLoad, 1000);
    }

    document.body.addEventListener('click', function(event) {

        if (event.target.classList.contains('edit-ingredient-btn')) {

            setTimeout(fixBasicInfoOnLoad, 100);
            setTimeout(fixBasicInfoOnLoad, 500);
            setTimeout(fixBasicInfoOnLoad, 1000);
        }
    });

    const observer = new MutationObserver(function(mutations) {
        fixBasicInfoOnLoad();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('[Fix Basic Info On Load] Initialized');
})();
