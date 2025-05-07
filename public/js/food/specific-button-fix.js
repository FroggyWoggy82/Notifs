/**
 * Specific Button Fix
 * Directly targets the Show Detailed Nutrition button by its position in the DOM
 */
document.addEventListener('DOMContentLoaded', function() {

    function fixSpecificButton() {

        const firstButton = document.querySelector('.nutrition-controls button') || 
                           document.querySelector('button:first-of-type');
        
        if (firstButton) {

            firstButton.textContent = 'Show Detailed Nutrition';

            firstButton.classList.add('toggle-detailed-nutrition');
            firstButton.id = 'show-detailed-nutrition-btn';

            firstButton.style.backgroundColor = '#ffffff';
            firstButton.style.color = '#121212';
            firstButton.style.border = 'none';
            firstButton.style.borderRadius = '3px';
            firstButton.style.padding = '5px 10px';
            firstButton.style.fontSize = '0.8em';
            firstButton.style.cursor = 'pointer';
            firstButton.style.margin = '5px';
            firstButton.style.width = 'auto';
            firstButton.style.minWidth = '150px';
            firstButton.style.height = '28px';
            firstButton.style.display = 'inline-block';
            firstButton.style.textAlign = 'center';

            const newButton = firstButton.cloneNode(true);
            if (firstButton.parentNode) {
                firstButton.parentNode.replaceChild(newButton, firstButton);
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
            
            console.log('Specific button fixed');
        } else {
            console.log('Specific button not found');
        }
    }

    setTimeout(fixSpecificButton, 100);

    setTimeout(fixSpecificButton, 500);

    setTimeout(fixSpecificButton, 1000);
});
