/**
 * Ensure Single Button
 * Makes sure there's only one Show Detailed Nutrition button positioned correctly
 */
document.addEventListener('DOMContentLoaded', function() {

    function ensureSingleButton() {

        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );

        if (buttons.length > 1) {
            console.log(`Found ${buttons.length} nutrition toggle buttons, keeping only one`);

            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton && addIngredientButton.parentNode) {

                const parent = addIngredientButton.parentNode.parentNode;
                let buttonToKeep = null;
                
                for (const btn of buttons) {
                    if (parent.contains(btn)) {
                        buttonToKeep = btn;
                        break;
                    }
                }

                if (buttonToKeep) {
                    buttons.forEach(btn => {
                        if (btn !== buttonToKeep && btn.parentNode) {
                            btn.parentNode.removeChild(btn);
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
        } else if (buttons.length === 0) {

            console.log('No nutrition toggle button found, creating one');

            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton && addIngredientButton.parentNode) {

                const newButton = document.createElement('button');
                newButton.textContent = 'Show Detailed Nutrition';

                newButton.style.backgroundColor = '#ffffff';
                newButton.style.color = '#121212';
                newButton.style.border = 'none';
                newButton.style.borderRadius = '3px';
                newButton.style.padding = '5px 10px';
                newButton.style.fontSize = '0.8em';
                newButton.style.cursor = 'pointer';
                newButton.style.margin = '5px';
                newButton.style.width = 'auto';
                newButton.style.minWidth = '150px';
                newButton.style.height = '28px';
                newButton.style.display = 'inline-block';
                newButton.style.textAlign = 'center';

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

                addIngredientButton.parentNode.insertBefore(newButton, addIngredientButton);
            }
        }

        const remainingButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        if (remainingButton) {

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
        }
    }

    setTimeout(ensureSingleButton, 100);

    setTimeout(ensureSingleButton, 500);

    setTimeout(ensureSingleButton, 1000);
});
