/**
 * Identify Toggle Button
 * Finds and marks the Show Detailed Nutrition button
 */
document.addEventListener('DOMContentLoaded', function() {

    function identifyToggleButton() {

        const buttons = Array.from(document.querySelectorAll('button'));
        const toggleButton = buttons.find(btn => 
            btn.textContent.trim() === 'Show Detailed Nutrition' || 
            btn.textContent.trim() === 'Hide Detailed Nutrition'
        );
        
        if (toggleButton) {

            toggleButton.classList.add('toggle-detailed-nutrition');
            toggleButton.id = 'show-detailed-nutrition-btn';

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
            
            console.log('Toggle button identified and styled');
        } else {
            console.log('Toggle button not found');
        }
    }

    setTimeout(identifyToggleButton, 100);

    setTimeout(identifyToggleButton, 500);

    setTimeout(identifyToggleButton, 1000);
});
