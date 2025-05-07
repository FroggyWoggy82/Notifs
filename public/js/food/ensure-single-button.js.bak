/**
 * Ensure Single Button
 * Makes sure there's only one Show Detailed Nutrition button positioned correctly
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure there's only one button
    function ensureSingleButton() {
        // Find all buttons with "Detailed Nutrition" text
        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        // If we have more than one button, keep only the one next to Add Ingredient
        if (buttons.length > 1) {
            console.log(`Found ${buttons.length} nutrition toggle buttons, keeping only one`);
            
            // Find the Add Ingredient button
            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton && addIngredientButton.parentNode) {
                // Keep only the button that's a sibling of Add Ingredient
                const parent = addIngredientButton.parentNode.parentNode;
                let buttonToKeep = null;
                
                for (const btn of buttons) {
                    if (parent.contains(btn)) {
                        buttonToKeep = btn;
                        break;
                    }
                }
                
                // If we found a button to keep, remove all others
                if (buttonToKeep) {
                    buttons.forEach(btn => {
                        if (btn !== buttonToKeep && btn.parentNode) {
                            btn.parentNode.removeChild(btn);
                        }
                    });
                } else {
                    // If we didn't find a button next to Add Ingredient, just keep the first one
                    for (let i = 1; i < buttons.length; i++) {
                        if (buttons[i].parentNode) {
                            buttons[i].parentNode.removeChild(buttons[i]);
                        }
                    }
                }
            } else {
                // If we can't find the Add Ingredient button, just keep the first one
                for (let i = 1; i < buttons.length; i++) {
                    if (buttons[i].parentNode) {
                        buttons[i].parentNode.removeChild(buttons[i]);
                    }
                }
            }
        } else if (buttons.length === 0) {
            // If we don't have any buttons, create one
            console.log('No nutrition toggle button found, creating one');
            
            // Find the Add Ingredient button
            const addIngredientButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Add Ingredient'
            );
            
            if (addIngredientButton && addIngredientButton.parentNode) {
                // Create a new button
                const newButton = document.createElement('button');
                newButton.textContent = 'Show Detailed Nutrition';
                
                // Style the button
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
                
                // Insert the button before the Add Ingredient button
                addIngredientButton.parentNode.insertBefore(newButton, addIngredientButton);
            }
        }
        
        // Now find the remaining button and make sure it works
        const remainingButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Detailed Nutrition')
        );
        
        if (remainingButton) {
            // Make sure the button has a click handler
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
        }
    }
    
    // Try to fix the button immediately
    setTimeout(ensureSingleButton, 100);
    
    // Try again after a short delay
    setTimeout(ensureSingleButton, 500);
    
    // And one more time after a longer delay
    setTimeout(ensureSingleButton, 1000);
});
