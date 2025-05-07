/**
 * Remove Top Button
 * Specifically removes the button at the top of the page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to remove the top button
    function removeTopButton() {
        // Find the button at the top of the page
        const topButton = document.querySelector('body > button:first-of-type');
        
        if (topButton && topButton.textContent.includes('Detailed Nutrition')) {
            console.log('Removing top button');
            topButton.parentNode.removeChild(topButton);
        }
    }
    
    // Try to remove the button immediately
    setTimeout(removeTopButton, 100);
    
    // Try again after a short delay
    setTimeout(removeTopButton, 500);
    
    // And one more time after a longer delay
    setTimeout(removeTopButton, 1000);
});
