/**
 * Emergency Button Fix
 * Last resort fix for duplicate buttons
 */

(function() {

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('Emergency button fix initializing');

    document.body.addEventListener('click', function(event) {
      if (event.target.classList.contains('edit-ingredient-btn')) {
        console.log('Edit button clicked, applying emergency fix');
        setTimeout(fixButtons, 100);
        setTimeout(fixButtons, 500);
      }
    });

    fixButtons();
    setInterval(fixButtons, 1000);
  }

  function fixButtons() {

    const forms = document.querySelectorAll('.edit-ingredient-form');

    forms.forEach(form => {

      const allFormActions = Array.from(form.querySelectorAll('.form-actions'));

      if (allFormActions.length > 1) {
        console.log(`Found ${allFormActions.length} form-actions, removing extras`);

        for (let i = 0; i < allFormActions.length - 1; i++) {
          if (allFormActions[i].parentNode) {
            allFormActions[i].parentNode.removeChild(allFormActions[i]);
          }
        }
      }

      const standaloneButtons = form.querySelectorAll(':scope > button');
      standaloneButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });

      const cancelButtons = form.querySelectorAll('.cancel-edit-btn, button[type="button"]:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');

      cancelButtons.forEach(button => {

        if (button.textContent.trim() === 'Cancel' || button.classList.contains('cancel-edit-btn')) {

          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }

          newButton.addEventListener('click', function(event) {

            event.preventDefault();
            event.stopPropagation();

            console.log('[Emergency Button Fix] Cancel button clicked, hiding form');

            form.style.display = 'none';

            form.classList.remove('show-edit-form');
            form.classList.add('hide-edit-form');

            form.setAttribute('data-force-hidden', 'true');

            setTimeout(function() {
              form.style.display = 'none';
            }, 10);
          });
        }
      });
    });
  }
})();
