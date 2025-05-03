/**
 * Fix Duplicate Buttons
 * Removes duplicate Show Detailed Nutrition buttons and fixes the remaining one
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the duplicate buttons
    function fixDuplicateButtons() {
        // Find all Show Detailed Nutrition buttons
        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        // If we have more than one button, remove all but the first one
        if (buttons.length > 1) {
            console.log(`Found ${buttons.length} nutrition toggle buttons, removing duplicates`);
            
            // Keep only the button next to Add Ingredient
            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton) {
                // Find the button in the same row as Add Ingredient
                const buttonRow = addIngredientButton.closest('.row, div');
                if (buttonRow) {
                    // Keep only the button in this row, remove others
                    buttons.forEach(btn => {
                        if (!buttonRow.contains(btn)) {
                            if (btn.parentNode) {
                                btn.parentNode.removeChild(btn);
                            }
                        }
                    });
                } else {
                    // If we can't find the row, just keep the first button
                    for (let i = 1; i < buttons.length; i++) {
                        if (buttons[i].parentNode) {
                            buttons[i].parentNode.removeChild(buttons[i]);
                        }
                    }
                }
            } else {
                // If we can't find the Add Ingredient button, just keep the first button
                for (let i = 1; i < buttons.length; i++) {
                    if (buttons[i].parentNode) {
                        buttons[i].parentNode.removeChild(buttons[i]);
                    }
                }
            }
        }
        
        // Now find the remaining button and fix it
        const remainingButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        if (remainingButton) {
            // Style the button
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
            
            // Remove any existing click handlers by cloning the button
            const newButton = remainingButton.cloneNode(true);
            if (remainingButton.parentNode) {
                remainingButton.parentNode.replaceChild(newButton, remainingButton);
            }
            
            // Add click event listener
            newButton.addEventListener('click', function() {
                // Find all sections except General
                const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
                
                // Determine if we should show or hide based on current button text
                const shouldShow = this.textContent.includes('Show');
                
                if (shouldShow) {
                    // Show all sections
                    sections.forEach(section => {
                        section.style.display = 'block';
                    });
                    
                    // Update button text
                    this.textContent = 'Hide Detailed Nutrition';
                } else {
                    // Hide all sections
                    sections.forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    // Update button text
                    this.textContent = 'Show Detailed Nutrition';
                }
            });
            
            // Initially hide all sections except General
            const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Make sure the button text is correct
            newButton.textContent = 'Show Detailed Nutrition';
            
            console.log('Button fixed');
        } else {
            console.log('No nutrition toggle button found');
        }
    }
    
    // Try to fix the buttons immediately
    setTimeout(fixDuplicateButtons, 100);
    
    // Try again after a short delay
    setTimeout(fixDuplicateButtons, 500);
    
    // And one more time after a longer delay
    setTimeout(fixDuplicateButtons, 1000);
});
