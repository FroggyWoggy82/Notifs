/**
 * Fix for the Show Detailed Nutrition button
 * Makes sure it properly toggles all micronutrient sections
 */
document.addEventListener('DOMContentLoaded', function() {

    function fixDetailedNutritionToggle() {

        document.querySelectorAll('button.toggle-detailed-nutrition, button.show-detailed-nutrition').forEach(button => {

            if (button.dataset.toggleFixed === 'true') return;

            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            button = newButton;

            button.addEventListener('click', function(event) {

                event.preventDefault();
                event.stopPropagation();

                const nutritionSections = document.querySelectorAll('.nutrition-section, section.general, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

                const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');

                const shouldShow = this.textContent.includes('Show');

                if (shouldShow) {

                    nutritionSections.forEach(section => {
                        section.style.display = 'block';
                    });

                    detailedPanels.forEach(panel => {
                        panel.style.display = 'block';
                    });

                    this.textContent = 'Hide Detailed Nutrition';

                    const event = new CustomEvent('nutrition-panel-shown', {
                        bubbles: true
                    });
                    document.dispatchEvent(event);
                } else {

                    nutritionSections.forEach(section => {

                        if (!section.classList.contains('general') && !section.querySelector('h4')?.textContent.includes('General')) {
                            section.style.display = 'none';
                        }
                    });

                    detailedPanels.forEach(panel => {
                        panel.style.display = 'none';
                    });

                    this.textContent = 'Show Detailed Nutrition';
                }
            });

            button.dataset.toggleFixed = 'true';
        });

        document.querySelectorAll('.nutrition-summary button, button.show-detailed-nutrition').forEach(button => {

            if (button.dataset.toggleFixed === 'true') return;

            if (button.textContent.includes('Detailed Nutrition') ||
                button.classList.contains('toggle-detailed-nutrition') ||
                button.classList.contains('show-detailed-nutrition')) {

                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                button = newButton;

                button.addEventListener('click', function(event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const nutritionSections = document.querySelectorAll('.nutrition-section, section.general, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

                    const detailedPanels = document.querySelectorAll('.detailed-nutrition-panel');

                    const shouldShow = this.textContent.includes('Show');

                    if (shouldShow) {

                        nutritionSections.forEach(section => {
                            section.style.display = 'block';
                        });

                        detailedPanels.forEach(panel => {
                            panel.style.display = 'block';
                        });

                        this.textContent = 'Hide Detailed Nutrition';
                    } else {

                        nutritionSections.forEach(section => {

                            if (!section.classList.contains('general') && !section.querySelector('h4')?.textContent.includes('General')) {
                                section.style.display = 'none';
                            }
                        });

                        detailedPanels.forEach(panel => {
                            panel.style.display = 'none';
                        });

                        this.textContent = 'Show Detailed Nutrition';
                    }
                });

                button.dataset.toggleFixed = 'true';
            }
        });
    }

    setTimeout(fixDetailedNutritionToggle, 300);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixDetailedNutritionToggle, 100);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn') ||
            event.target.classList.contains('add-ingredient-btn-inline')) {

            setTimeout(fixDetailedNutritionToggle, 200);

            setTimeout(fixDetailedNutritionToggle, 500);
            setTimeout(fixDetailedNutritionToggle, 1000);
        }
    });

    setInterval(fixDetailedNutritionToggle, 2000);


    document.body.addEventListener('click', function(event) {

        if (event.target.textContent.includes('Detailed Nutrition') ||
            event.target.id === 'show-detailed-nutrition-btn' ||
            event.target.classList.contains('toggle-detailed-nutrition') ||
            event.target.classList.contains('show-detailed-nutrition')) {

            event.preventDefault();
            event.stopPropagation();

            const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals, section.carbohydrates, section.lipids, section.protein, section.vitamins, section.minerals');

            const shouldShow = event.target.textContent.includes('Show');

            if (shouldShow) {

                sections.forEach(section => {
                    section.style.display = 'block';
                    section.classList.add('show');
                });

                event.target.textContent = 'Hide Detailed Nutrition';
            } else {

                sections.forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('show');
                });

                event.target.textContent = 'Show Detailed Nutrition';
            }
        }
    });
});
