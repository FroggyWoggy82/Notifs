/**
 * Fix Duplicate Buttons
 * Removes duplicate Show Detailed Nutrition buttons and fixes the remaining one
 */
document.addEventListener('DOMContentLoaded', function() {

    function fixDuplicateButtons() {

        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );

        if (buttons.length > 1) {
            console.log(`Found ${buttons.length} nutrition toggle buttons, removing duplicates`);

            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton) {

                const buttonRow = addIngredientButton.closest('.row, div');
                if (buttonRow) {

                    buttons.forEach(btn => {
                        if (!buttonRow.contains(btn)) {
                            if (btn.parentNode) {
                                btn.parentNode.removeChild(btn);
                            }
                        }
                    });
                } else {

                    for (let i = 1; i < buttons.length; i++) {
                        if (buttons[i].parentNode) {
                            buttons[i].parentNode.removeChild(buttons[i]);
                        }
                    }
                }
            } else {

                for (let i = 1; i < buttons.length; i++) {
                    if (buttons[i].parentNode) {
                        buttons[i].parentNode.removeChild(buttons[i]);
                    }
                }
            }
        }

        const remainingButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        if (remainingButton) {

            remainingButton.style.backgroundColor = '#ffffff';
            remainingButton.style.color = '#121212';
            remainingButton.style.border = 'none';
            remainingButton.style.borderRadius = '3px';
            remainingButton.style.padding = '5px 10px';
            remainingButton.style.fontSize = '0.8em';
            remainingButton.style.cursor = 'pointer';
            remainingButton.style.margin = '5px';
            remainingButton.style.width = 'auto';
            remainingButton.style.minWidth = '150px';
            remainingButton.style.height = '28px';
            remainingButton.style.display = 'inline-block';
            remainingButton.style.textAlign = 'center';

            const newButton = remainingButton.cloneNode(true);
            if (remainingButton.parentNode) {
                remainingButton.parentNode.replaceChild(newButton, remainingButton);
            }

            newButton.addEventListener('click', function() {

                const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');

                const shouldShow = this.textContent.includes('Show');
                
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
            
            console.log('Button fixed');
        } else {
            console.log('No nutrition toggle button found');
        }
    }

    setTimeout(fixDuplicateButtons, 100);

    setTimeout(fixDuplicateButtons, 500);

    setTimeout(fixDuplicateButtons, 1000);
});
