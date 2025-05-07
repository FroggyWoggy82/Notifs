/**
 * Disable Other Basic Info Scripts
 * This script disables other scripts that try to modify the Basic Information section
 * when our integrated approach in show-nutrition-panel.js is active
 */

(function() {

    function disableOtherBasicInfoScripts() {

        const editForms = document.querySelectorAll('.edit-ingredient-form');
        
        editForms.forEach(form => {

            if (form.dataset.otherScriptsDisabled === 'true') return;
            
            console.log('Disabling other Basic Info scripts for this form');


            form.dataset.basicInfoReplaced = 'true';
            form.dataset.editButtonBasicInfoFixed = 'true';
            form.dataset.basicInfoFixed = 'true';
            form.dataset.basicInfoCompleteReplaced = 'true';
            form.dataset.fieldsFixed = 'true';
            form.dataset.restructured = 'true';

            form.dataset.otherScriptsDisabled = 'true';
            
            console.log('Other Basic Info scripts disabled for this form');
        });
    }

    setTimeout(disableOtherBasicInfoScripts, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(disableOtherBasicInfoScripts, 150);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') || 
            (event.target.tagName === 'BUTTON' && 
             event.target.textContent === 'Edit' && 
             event.target.closest('tr') && 
             event.target.closest('.ingredient-details'))) {
            
            console.log('Edit button clicked, disabling other Basic Info scripts');

            setTimeout(disableOtherBasicInfoScripts, 150);

            setTimeout(disableOtherBasicInfoScripts, 350);
            setTimeout(disableOtherBasicInfoScripts, 550);
        }
    });
})();
