/**
 * Specific Button Fix
 * Directly targets the Show Detailed Nutrition button by its position in the DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fix the specific button
    function fixSpecificButton() {
        // Find the first button in the page (which should be the Show Detailed Nutrition button)
        const firstButton = document.querySelector('.nutrition-controls button') || 
                           document.querySelector('button:first-of-type');
        
        if (firstButton) {
            // Set the button text
            firstButton.textContent = 'Show Detailed Nutrition';
            
            // Add classes and ID
            firstButton.classList.add('toggle-detailed-nutrition');
            firstButton.id = 'show-detailed-nutrition-btn';
            
            // Style the button directly
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
            
            // Remove any existing click handlers by cloning the button
            const newButton = firstButton.cloneNode(true);
            if (firstButton.parentNode) {
                firstButton.parentNode.replaceChild(newButton, firstButton);
            }
            
            // Add click event listener
            newButton.addEventListener('click', function() {
                // Find all sections except General
                const sections = document.querySelectorAll('.carbohydrates, .lipids, .protein, .vitamins, .minerals');
                
                // Determine if we should show or hide based on current button text
                const shouldShow = this.textContent.trim() === 'Show Detailed Nutrition';
                
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
            
            console.log('Specific button fixed');
        } else {
            console.log('Specific button not found');
        }
    }
    
    // Try to fix the button immediately
    setTimeout(fixSpecificButton, 100);
    
    // Try again after a short delay
    setTimeout(fixSpecificButton, 500);
    
    // And one more time after a longer delay
    setTimeout(fixSpecificButton, 1000);
});
