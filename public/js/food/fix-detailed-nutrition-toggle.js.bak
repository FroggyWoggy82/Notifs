/**
 * Fix for the Show Detailed Nutrition button
 * Makes sure it properly toggles all micronutrient sections
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the Show Detailed Nutrition button
    function fixDetailedNutritionToggle() {
        // Find all Show Detailed Nutrition buttons
        document.querySelectorAll('button.toggle-detailed-nutrition, button.show-detailed-nutrition').forEach(button => {
            // Skip if already processed
            if (button.dataset.toggleFixed === 'true') return;

            // Remove any existing click handlers by cloning the button
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            button = newButton;

            // Add the proper click event listener
            button.addEventListener('click', function(event) {
                // Prevent default behavior
                event.preventDefault();
                event.stopPropagation();

                // Find all nutrition sections (General, Carbohydrates, Lipids, Protein, Vitamins, Minerals)
                const nutritionSections = document.querySelectorAll('.nutrition-section, section.general, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

                // Find all detailed nutrition panels
                const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');

                // Determine if we should show or hide based on current button text
                const shouldShow = this.textContent.includes('Show');

                if (shouldShow) {
                    // Show all nutrition sections
                    nutritionSections.forEach(section => {
                        section.style.display = 'block';
                    });

                    // Show all detailed panels
                    detailedPanels.forEach(panel => {
                        panel.style.display = 'block';
                    });

                    // Update button text
                    this.textContent = 'Hide Detailed Nutrition';

                    // Trigger a custom event to notify that the panel is shown
                    const event = new CustomEvent('nutrition-panel-shown', {
                        bubbles: true
                    });
                    document.dispatchEvent(event);
                } else {
                    // Hide all nutrition sections except General
                    nutritionSections.forEach(section => {
                        // Keep General section visible
                        if (!section.classList.contains('general') && !section.querySelector('h4')?.textContent.includes('General')) {
                            section.style.display = 'none';
                        }
                    });

                    // Hide all detailed panels
                    detailedPanels.forEach(panel => {
                        panel.style.display = 'none';
                    });

                    // Update button text
                    this.textContent = 'Show Detailed Nutrition';
                }
            });

            // Mark as processed
            button.dataset.toggleFixed = 'true';
        });

        // Also handle the case where the button might be a different element
        document.querySelectorAll('.nutrition-summary button, button.show-detailed-nutrition').forEach(button => {
            // Skip if already processed
            if (button.dataset.toggleFixed === 'true') return;

            // Check if this is likely the toggle button
            if (button.textContent.includes('Detailed Nutrition') ||
                button.classList.contains('toggle-detailed-nutrition') ||
                button.classList.contains('show-detailed-nutrition')) {

                // Remove any existing click handlers by cloning the button
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                button = newButton;

                // Add the proper click event listener
                button.addEventListener('click', function(event) {
                    // Prevent default behavior
                    event.preventDefault();
                    event.stopPropagation();

                    // Find all nutrition sections
                    const nutritionSections = document.querySelectorAll('.nutrition-section, section.general, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

                    // Find all detailed nutrition panels
                    const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');

                    // Determine if we should show or hide based on current button text
                    const shouldShow = this.textContent.includes('Show');

                    if (shouldShow) {
                        // Show all nutrition sections
                        nutritionSections.forEach(section => {
                            section.style.display = 'block';
                        });

                        // Show all detailed panels
                        detailedPanels.forEach(panel => {
                            panel.style.display = 'block';
                        });

                        // Update button text
                        this.textContent = 'Hide Detailed Nutrition';
                    } else {
                        // Hide all nutrition sections except General
                        nutritionSections.forEach(section => {
                            // Keep General section visible
                            if (!section.classList.contains('general') && !section.querySelector('h4')?.textContent.includes('General')) {
                                section.style.display = 'none';
                            }
                        });

                        // Hide all detailed panels
                        detailedPanels.forEach(panel => {
                            panel.style.display = 'none';
                        });

                        // Update button text
                        this.textContent = 'Show Detailed Nutrition';
                    }
                });

                // Mark as processed
                button.dataset.toggleFixed = 'true';
            }
        });
    }

    // Run the function initially
    setTimeout(fixDetailedNutritionToggle, 300);

    // Set up a mutation observer to watch for new buttons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixDetailedNutritionToggle, 100);
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle dynamic button creation through event delegation
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn-inline')) {
            // Wait for the form to be displayed
            setTimeout(fixDetailedNutritionToggle, 200);
            // Try again after a bit longer to ensure it's applied
            setTimeout(fixDetailedNutritionToggle, 500);
            setTimeout(fixDetailedNutritionToggle, 1000);
        }
    });

    // Run periodically to ensure all buttons are fixed
    setInterval(fixDetailedNutritionToggle, 2000);

    // Direct fix for the main Show Detailed Nutrition button
    // We'll use event delegation to handle all clicks on the page
    document.body.addEventListener('click', function(event) {
        // Check if the clicked element is the Show Detailed Nutrition button
        if (event.target.textContent.includes('Detailed Nutrition') ||
            event.target.id === 'show-detailed-nutrition-btn' ||
            event.target.classList.contains('toggle-detailed-nutrition') ||
            event.target.classList.contains('show-detailed-nutrition')) {

            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();

            // Find all sections
            const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

            // Determine if we should show or hide based on current button text
            const shouldShow = event.target.textContent.includes('Show');

            if (shouldShow) {
                // Show all sections
                sections.forEach(section => {
                    section.style.display = 'block';
                    section.classList.add('show');
                });

                // Update button text
                event.target.textContent = 'Hide Detailed Nutrition';
            } else {
                // Hide all sections
                sections.forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('show');
                });

                // Update button text
                event.target.textContent = 'Show Detailed Nutrition';
            }
        }
    });
});
