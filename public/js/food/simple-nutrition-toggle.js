/**
 * Simple Nutrition Toggle
 * A direct solution to toggle the detailed nutrition sections
 */
document.addEventListener('DOMContentLoaded', function() {

    function handleToggleClick(button) {

        const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');

        const shouldShow = button.textContent.includes('Show');

        if (shouldShow) {

            sections.forEach(section => {
                section.style.display = 'block';
            });

            button.textContent = 'Hide Detailed Nutrition';
        } else {

            sections.forEach(section => {
                section.style.display = 'none';
            });

            button.textContent = 'Show Detailed Nutrition';
        }
    }

    document.addEventListener('click', function(event) {

        if (event.target.tagName === 'BUTTON' &&
            (event.target.textContent.includes('Detailed Nutrition') ||
             event.target.id === 'show-detailed-nutrition-btn' ||
             event.target.classList.contains('toggle-detailed-nutrition') ||
             event.target.classList.contains('show-detailed-nutrition'))) {

            event.preventDefault();

            handleToggleClick(event.target);
        }
    });

    const toggleButton = document.querySelector('button:not([type="submit"]):not(.cancel)');
    if (toggleButton && toggleButton.textContent.includes('Detailed Nutrition')) {

        const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        if (toggleButton.textContent.includes('Hide')) {
            toggleButton.textContent = 'Show Detailed Nutrition';
        }
    }
});
