/**
 * Direct Nutrition Toggle
 * A simple, direct solution for the Show Detailed Nutrition button
 */
document.addEventListener('DOMContentLoaded', function() {

    function setupToggleButton() {

        const toggleButton = document.querySelector('button.toggle-detailed-nutrition') || 
                            document.querySelector('button#show-detailed-nutrition-btn') ||
                            Array.from(document.querySelectorAll('button')).find(btn => 
                                btn.textContent.trim() === 'Show Detailed Nutrition');
        
        if (!toggleButton) {
            console.log('Toggle button not found, will try again later');
            return;
        }

        toggleButton.style.backgroundColor = '#ffffff';
        toggleButton.style.color = '#121212';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.fontSize = '0.8em';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.margin = '5px';
        toggleButton.style.width = 'auto';
        toggleButton.style.minWidth = '150px';
        toggleButton.style.height = '28px';
        toggleButton.style.display = 'inline-block';
        toggleButton.style.textAlign = 'center';

        const newButton = toggleButton.cloneNode(true);
        if (toggleButton.parentNode) {
            toggleButton.parentNode.replaceChild(newButton, toggleButton);
        }

        newButton.addEventListener('click', function() {

            const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');

            const shouldShow = this.textContent.trim() === 'Show Detailed Nutrition';
            
            if (shouldShow) {

                sections.forEach(section => {
                    section.style.display = 'block';
                });

                this.textContent = 'Hide Detailed Nutrition';
            } else {

                sections.forEach(section => {
                    section.style.display = 'none';
                });

                this.textContent = 'Show Detailed Nutrition';
            }
        });

        const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        newButton.textContent = 'Show Detailed Nutrition';
    }

    setTimeout(setupToggleButton, 100);

    setTimeout(setupToggleButton, 500);

    setTimeout(setupToggleButton, 1000);
});
