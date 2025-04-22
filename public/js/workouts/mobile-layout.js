/**
 * Mobile Layout Adjustments for Workout Page
 * This script reorganizes the DOM structure for better mobile display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (window.innerWidth < 600) {
        // Function to reorganize set rows for mobile
        function reorganizeSetRowsForMobile() {
            // Get all set rows
            const setRows = document.querySelectorAll('#current-exercise-list .set-row');
            
            setRows.forEach(row => {
                // Skip if already processed
                if (row.querySelector('.input-container')) return;
                
                // Create input container
                const inputContainer = document.createElement('div');
                inputContainer.className = 'input-container';
                
                // Get the weight and reps inputs
                const weightInput = row.querySelector('.weight-input');
                const repsInput = row.querySelector('.reps-input');
                const completeToggle = row.querySelector('.set-complete-toggle');
                
                // Only proceed if we have the inputs
                if (weightInput && repsInput) {
                    // Remove the inputs from their current position
                    if (weightInput.parentNode) weightInput.parentNode.removeChild(weightInput);
                    if (repsInput.parentNode) repsInput.parentNode.removeChild(repsInput);
                    
                    // Add inputs to the container
                    inputContainer.appendChild(weightInput);
                    inputContainer.appendChild(repsInput);
                    
                    // Add complete toggle if it exists
                    if (completeToggle) {
                        if (completeToggle.parentNode) completeToggle.parentNode.removeChild(completeToggle);
                        inputContainer.appendChild(completeToggle);
                    }
                    
                    // Add the container to the row
                    row.appendChild(inputContainer);
                }
            });
        }
        
        // Initial reorganization
        reorganizeSetRowsForMobile();
        
        // Set up a MutationObserver to watch for new set rows
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            const observer = new MutationObserver(function(mutations) {
                reorganizeSetRowsForMobile();
            });
            
            observer.observe(exerciseList, { 
                childList: true, 
                subtree: true 
            });
        }
    }
});
