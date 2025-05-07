// Script to ensure the calorie target text is white
document.addEventListener('DOMContentLoaded', function() {
    // Function to set the text color to white
    function setCalorieTextWhite() {
        const calorieTarget = document.getElementById('current-calorie-target');
        if (calorieTarget) {
            calorieTarget.style.color = '#ffffff';
            
            // Also apply to any child elements
            const children = calorieTarget.querySelectorAll('*');
            children.forEach(child => {
                child.style.color = '#ffffff';
            });
            
            // Add a span with inline style if needed
            if (calorieTarget.innerHTML.indexOf('<span style="color: #ffffff') === -1) {
                const text = calorieTarget.textContent;
                calorieTarget.innerHTML = `<span style="color: #ffffff !important;">${text}</span>`;
            }
        }
    }
    
    // Set the text color immediately
    setCalorieTextWhite();
    
    // Also set it after a short delay to ensure it applies after any other scripts
    setTimeout(setCalorieTextWhite, 100);
    setTimeout(setCalorieTextWhite, 500);
    setTimeout(setCalorieTextWhite, 1000);
});
