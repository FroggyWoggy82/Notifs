/**
 * Final Basic Info Fix
 * The most aggressive approach to fixing the Basic Information section
 */

(function() {

    function fixBasicInfoSection() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.finalBasicInfoFixed === 'true') return;
            
            console.log('Applying final fix to Basic Information section');

            const formElement = form.querySelector('form');
            if (!formElement) return;

            const divs = formElement.querySelectorAll('div');

            let basicInfoSection = null;

            for (const div of divs) {

                const header = div.querySelector('h4');
                if (header && header.textContent.includes('Basic Information')) {
                    basicInfoSection = div;
                    break;
                }

                const labels = div.querySelectorAll('label');
                for (const label of labels) {
                    if (label.textContent.includes('Name') || label.textContent.includes('Amount')) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;

                const inputs = div.querySelectorAll('input');
                for (const input of inputs) {
                    if (input.id && (input.id.includes('ingredient-name') || input.id.includes('ingredient-amount'))) {
                        basicInfoSection = div;
                        break;
                    }
                }
                
                if (basicInfoSection) break;
            }

            if (!basicInfoSection && divs.length > 0) {
                basicInfoSection = divs[0];
            }

            if (!basicInfoSection) {
                basicInfoSection = document.createElement('div');
                basicInfoSection.className = 'basic-information';
                formElement.insertBefore(basicInfoSection, formElement.firstChild);
            }

            basicInfoSection.classList.add('basic-information');

            basicInfoSection.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            basicInfoSection.style.borderRadius = '4px';
            basicInfoSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            basicInfoSection.style.padding = '8px';
            basicInfoSection.style.marginBottom = '8px';
            basicInfoSection.style.color = '#e0e0e0';
            basicInfoSection.style.display = 'block';
            basicInfoSection.style.visibility = 'visible';
            basicInfoSection.style.opacity = '1';

            let header = basicInfoSection.querySelector('h4');
            if (!header) {
                header = document.createElement('h4');
                header.textContent = 'Basic Information';
                basicInfoSection.insertBefore(header, basicInfoSection.firstChild);
            }

            header.style.marginTop = '0';
            header.style.marginBottom = '5px';
            header.style.paddingBottom = '2px';
            header.style.borderBottom = 'none';
            header.style.color = '#e0e0e0';
            header.style.fontWeight = '500';
            header.style.fontSize = '0.85em';

            const formGroups = basicInfoSection.querySelectorAll('.form-group');

            formGroups.forEach(formGroup => {
                formGroup.style.marginBottom = '5px';
                formGroup.style.display = 'inline-block';
                formGroup.style.marginRight = '10px';

                const label = formGroup.querySelector('label');
                if (label) {
                    label.style.fontSize = '0.7em';
                    label.style.marginBottom = '1px';
                    label.style.color = '#aaa';
                    label.style.display = 'block';
                    label.style.whiteSpace = 'nowrap';
                    label.style.overflow = 'hidden';
                    label.style.textOverflow = 'ellipsis';
                }

                const input = formGroup.querySelector('input');
                if (input) {
                    input.style.padding = '1px 2px';
                    input.style.height = '14px';
                    input.style.fontSize = '0.6em';
                    input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '3px';
                }
            });

            const inputs = basicInfoSection.querySelectorAll('input');

            inputs.forEach(input => {
                input.style.padding = '1px 2px';
                input.style.height = '14px';
                input.style.fontSize = '0.6em';
                input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.color = '#e0e0e0';
                input.style.borderRadius = '3px';
            });

            form.dataset.finalBasicInfoFixed = 'true';
            
            console.log('Final fix applied to Basic Information section');
        });
    }

    function init() {
        console.log('Initializing Final Basic Info Fix');

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
            if (event.target.tagName === 'BUTTON' && 
                event.target.textContent === 'Edit' && 
                event.target.closest('tr') && 
                event.target.closest('.ingredient-details')) {
                
                console.log('Edit button clicked, applying final Basic Info fix');

                setTimeout(fixBasicInfoSection, 100);

                setTimeout(fixBasicInfoSection, 300);
                setTimeout(fixBasicInfoSection, 500);
                setTimeout(fixBasicInfoSection, 1000);
            }
        });

        setInterval(fixBasicInfoSection, 1000);
        
        console.log('Final Basic Info Fix initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
