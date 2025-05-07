/**
 * Simple Nutrition Toggle
 * A direct solution to toggle the detailed nutrition sections
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle the toggle button click
    function handleToggleClick(button) {
        // Find all sections except General
        const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');

        // Determine if we should show or hide based on current button text
        const shouldShow = button.textContent.includes('Show');

        if (shouldShow) {
            // Show all sections
            sections.forEach(section => {
                section.style.display = 'block';
            });

            // Update button text
            button.textContent = 'Hide Detailed Nutrition';
        } else {
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Update button text
            button.textContent = 'Show Detailed Nutrition';
        }
    }

    // Direct event listener for the Show Detailed Nutrition button
    document.addEventListener('click', function(event) {
        // Check if the clicked element is the Show Detailed Nutrition button
        if (event.target.tagName === 'BUTTON' &&
            (event.target.textContent.includes('Detailed Nutrition') ||
             event.target.id === 'show-detailed-nutrition-btn' ||
             event.target.classList.contains('toggle-detailed-nutrition') ||
             event.target.classList.contains('show-detailed-nutrition'))) {

            // Prevent default behavior
            event.preventDefault();

            // Handle the toggle
            handleToggleClick(event.target);
        }
    });

    // Find the Show Detailed Nutrition button and set up initial state
    const toggleButton = document.querySelector('button:not([type="submit"]):not(.cancel)');
    if (toggleButton && toggleButton.textContent.includes('Detailed Nutrition')) {
        // Make sure all sections except General are initially hidden
        const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Make sure the button text is correct
        if (toggleButton.textContent.includes('Hide')) {
            toggleButton.textContent = 'Show Detailed Nutrition';
        }
    }
});
