/**
 * Emergency Button Fix
 * Last resort fix for duplicate buttons
 */

(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('Emergency button fix initializing');

    // Add event listener for edit buttons
    document.body.addEventListener('click', function(event) {
      if (event.target.classList.contains('edit-ingredient-btn')) {
        console.log('Edit button clicked, applying emergency fix');
        setTimeout(fixButtons, 100);
        setTimeout(fixButtons, 500);
      }
    });

    // Run immediately and periodically
    fixButtons();
    setInterval(fixButtons, 1000);
  }

  function fixButtons() {
    // Find all edit forms
    const forms = document.querySelectorAll('.edit-ingredient-form');

    forms.forEach(form => {
      // Find all form-actions
      const allFormActions = Array.from(form.querySelectorAll('.form-actions'));

      // Keep only the last one if multiple exist
      if (allFormActions.length > 1) {
        console.log(`Found ${allFormActions.length} form-actions, removing extras`);

        // Keep only the last one
        for (let i = 0; i < allFormActions.length - 1; i++) {
          if (allFormActions[i].parentNode) {
            allFormActions[i].parentNode.removeChild(allFormActions[i]);
          }
        }
      }

      // Find any standalone buttons at the bottom
      const standaloneButtons = form.querySelectorAll(':scope > button');
      standaloneButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });

      // Make sure the cancel button works
      const cancelButtons = form.querySelectorAll('.cancel-edit-btn, button[type="button"]:not(.toggle-detailed-nutrition):not(#show-detailed-nutrition-btn)');

      cancelButtons.forEach(button => {
        // Check if this is actually a cancel button
        if (button.textContent.trim() === 'Cancel' || button.classList.contains('cancel-edit-btn')) {
          // Remove existing listeners to avoid duplicates
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }

          // Add new listener with event prevention
          newButton.addEventListener('click', function(event) {
            // Prevent default behavior and stop propagation
            event.preventDefault();
            event.stopPropagation();

            console.log('[Emergency Button Fix] Cancel button clicked, hiding form');

            // Hide the form
            form.style.display = 'none';

            // Also try other methods of hiding
            form.classList.remove('show-edit-form');
            form.classList.add('hide-edit-form');

            // Force the form to stay hidden
            form.setAttribute('data-force-hidden', 'true');

            // Use a timeout to ensure it stays hidden
            setTimeout(function() {
              form.style.display = 'none';
            }, 10);
          });
        }
      });
    });
  }
})();
