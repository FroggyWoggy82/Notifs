/**
 * Remove Top Button
 * Specifically removes the button at the top of the page
 */
document.addEventListener('DOMContentLoaded', function() {

    function removeTopButton() {

        const topButton = document.querySelector('body > button:first-of-type');
        
        if (topButton && topButton.textContent.includes('Detailed Nutrition')) {
            console.log('Removing top button');
            topButton.parentNode.removeChild(topButton);
        }
    }

    setTimeout(removeTopButton, 100);

    setTimeout(removeTopButton, 500);

    setTimeout(removeTopButton, 1000);
});
