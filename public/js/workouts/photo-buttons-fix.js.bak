/**
 * Photo Carousel Button Fix
 * This script fixes the photo carousel navigation buttons by directly adding event listeners
 * after the page has fully loaded.
 */

(function() {
    // Wait for the page to fully load
    window.addEventListener('load', function() {
        console.log('[Photo Button Fix] Script loaded, waiting for DOM...');

        // Wait a bit to ensure all other scripts have run
        setTimeout(function() {
            console.log('[Photo Button Fix] Applying button fixes...');

            // Get direct references to the buttons
            const prevButton = document.getElementById('photo-prev-btn');
            const nextButton = document.getElementById('photo-next-btn');

            if (prevButton) {
                console.log('[Photo Button Fix] Found previous button, adding direct click handler');

                // Add direct click handler
                prevButton.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Photo Button Fix] Previous button clicked directly');

                    // Call the showPreviousPhoto function if it exists
                    if (typeof showPreviousPhoto === 'function') {
                        showPreviousPhoto();
                    } else {
                        console.error('[Photo Button Fix] showPreviousPhoto function not found');
                    }

                    return false;
                };

                // Make sure the button is visible and styled correctly
                prevButton.style.cursor = 'pointer';
                prevButton.style.backgroundColor = '#03dac6'; // Updated to match the teal color
                prevButton.style.color = 'black';
                prevButton.style.border = 'none';
                prevButton.style.borderRadius = '50%';
                prevButton.style.width = '50px';
                prevButton.style.height = '50px';
                prevButton.style.fontSize = '24px';
                prevButton.style.fontWeight = 'bold';
                prevButton.style.zIndex = '100';

                console.log('[Photo Button Fix] Previous button setup complete');
            } else {
                console.error('[Photo Button Fix] Previous button not found in DOM');
            }

            if (nextButton) {
                console.log('[Photo Button Fix] Found next button, adding direct click handler');

                // Add direct click handler
                nextButton.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[Photo Button Fix] Next button clicked directly');

                    // Call the showNextPhoto function if it exists
                    if (typeof showNextPhoto === 'function') {
                        showNextPhoto();
                    } else {
                        console.error('[Photo Button Fix] showNextPhoto function not found');
                    }

                    return false;
                };

                // Make sure the button is visible and styled correctly
                nextButton.style.cursor = 'pointer';
                nextButton.style.backgroundColor = '#03dac6'; // Updated to match the teal color
                nextButton.style.color = 'black';
                nextButton.style.border = 'none';
                nextButton.style.borderRadius = '50%';
                nextButton.style.width = '50px';
                nextButton.style.height = '50px';
                nextButton.style.fontSize = '24px';
                nextButton.style.fontWeight = 'bold';
                nextButton.style.zIndex = '100';

                console.log('[Photo Button Fix] Next button setup complete');
            } else {
                console.error('[Photo Button Fix] Next button not found in DOM');
            }

            console.log('[Photo Button Fix] Button fixes applied');
        }, 1000); // Wait 1 second to ensure all other scripts have run
    });
})();
