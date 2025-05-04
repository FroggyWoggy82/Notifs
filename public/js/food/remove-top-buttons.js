/**
 * Remove Top Buttons
 * Removes any duplicate Save Changes and Cancel buttons at the top of the edit form
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to remove top buttons
    function removeTopButtons() {
        console.log('Removing top buttons...');

        // Find all edit-ingredient-form-top-buttons containers
        const topButtonsContainers = document.querySelectorAll('.edit-ingredient-form-top-buttons');

        // Remove them
        topButtonsContainers.forEach(container => {
            console.log('Removing top buttons container:', container);
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        // Also find any buttons that are direct children of the edit form (not in form-actions)
        document.querySelectorAll('.edit-ingredient-form').forEach(form => {
            console.log('Checking form for direct button children:', form);

            // Find all buttons that are direct children of the form
            const directButtons = Array.from(form.children).filter(child =>
                child.tagName === 'BUTTON' &&
                !child.classList.contains('toggle-detailed-nutrition') &&
                child.id !== 'show-detailed-nutrition-btn'
            );

            console.log('Found direct button children:', directButtons.length);

            // Remove them
            directButtons.forEach(button => {
                console.log('Removing direct button child:', button);
                button.parentNode.removeChild(button);
            });

            // Also check for any buttons at the top of the form that might be in a div
            const topDivs = Array.from(form.children).filter(child =>
                child.tagName === 'DIV' &&
                child !== form.querySelector('form') &&
                !child.classList.contains('detailed-nutrition-panel')
            );

            console.log('Found potential top divs:', topDivs.length);

            // Check each div for buttons
            topDivs.forEach(div => {
                const buttons = div.querySelectorAll('button');
                if (buttons.length > 0) {
                    console.log('Found buttons in top div:', buttons.length);
                    // Remove the entire div if it contains buttons
                    div.parentNode.removeChild(div);
                }
            });
        });
    }

    // Run the function initially
    setTimeout(removeTopButtons, 300);

    // Set up a mutation observer to watch for new forms
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(removeTopButtons, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic form creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn')) {
            // Wait for the form to be displayed
            setTimeout(removeTopButtons, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(removeTopButtons, 500);
            setTimeout(removeTopButtons, 1000);
        }
    });

    // Run periodically to ensure no top buttons exist
    setInterval(removeTopButtons, 2000);

    // Add a more aggressive approach - directly target and remove any buttons with specific text
    function removeButtonsByText() {
        // Find all buttons in the document
        const allButtons = document.querySelectorAll('button');

        // Filter for Save Changes and Cancel buttons that are not in the form-actions
        allButtons.forEach(button => {
            const text = button.textContent.trim();
            if ((text === 'Save Changes' || text === 'Cancel') &&
                !button.closest('.form-actions') &&
                button.closest('.edit-ingredient-form')) {

                console.log('Found button by text outside form-actions:', button);

                // Remove the button
                if (button.parentNode) {
                    button.parentNode.removeChild(button);
                }
            }
        });
    }

    // Run this function too
    setTimeout(removeButtonsByText, 500);
    setInterval(removeButtonsByText, 1000);
});
