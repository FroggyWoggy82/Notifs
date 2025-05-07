/**
 * Direct Nutrition Toggle
 * A simple, direct solution for the Show Detailed Nutrition button
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to set up the toggle button
    function setupToggleButton() {
        // Find the Show Detailed Nutrition button
        const toggleButton = document.querySelector('button.toggle-detailed-nutrition') || 
                            document.querySelector('button#show-detailed-nutrition-btn') ||
                            Array.from(document.querySelectorAll('button')).find(btn => 
                                btn.textContent.trim() === 'Show Detailed Nutrition');
        
        if (!toggleButton) {
            console.log('Toggle button not found, will try again later');
            return;
        }
        
        // Style the button
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
        
        // Remove any existing click handlers by cloning the button
        const newButton = toggleButton.cloneNode(true);
        if (toggleButton.parentNode) {
            toggleButton.parentNode.replaceChild(newButton, toggleButton);
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
        
        // Make sure the button text is correct
        newButton.textContent = 'Show Detailed Nutrition';
    }
    
    // Try to set up the button immediately
    setTimeout(setupToggleButton, 100);
    
    // Try again after a short delay to ensure the DOM is fully loaded
    setTimeout(setupToggleButton, 500);
    
    // And one more time after a longer delay
    setTimeout(setupToggleButton, 1000);
});
