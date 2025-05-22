/**
 * Photo Navigation Redesign
 * This script repositions the photo navigation buttons to be on either side of the date display
 * as shown in the design mockup.
 */

(function() {
    window.addEventListener('load', function() {
        console.log('[Photo Nav Redesign] Script loaded, waiting for DOM...');

        // Wait a bit to ensure all other scripts have run
        setTimeout(function() {
            console.log('[Photo Nav Redesign] Applying navigation redesign...');

            // Get the elements we need to work with
            const dateDisplay = document.getElementById('current-photo-date-display');
            const navButtonsContainer = document.querySelector('.photo-navigation-buttons');
            const prevButton = document.getElementById('photo-prev-btn');
            const nextButton = document.getElementById('photo-next-btn');

            // Make sure all elements exist
            if (!dateDisplay || !navButtonsContainer || !prevButton || !nextButton) {
                console.error('[Photo Nav Redesign] Required elements not found in DOM');
                return;
            }

            // Create a new container for the date and navigation buttons
            const dateNavContainer = document.createElement('div');
            dateNavContainer.className = 'date-nav-container';
            dateNavContainer.style.display = 'flex';
            dateNavContainer.style.alignItems = 'center';
            dateNavContainer.style.justifyContent = 'center';
            dateNavContainer.style.margin = '15px auto';
            dateNavContainer.style.width = '180px'; // Width for just the date
            dateNavContainer.style.position = 'relative';
            dateNavContainer.style.padding = '0'; // Remove padding

            // No red line - removed as per user request

            // Move the elements from their current locations
            navButtonsContainer.parentNode.insertBefore(dateNavContainer, navButtonsContainer);

            // Add the previous button to the container
            prevButton.style.position = 'absolute';
            prevButton.style.left = '-35px';
            prevButton.style.top = '0';
            prevButton.style.bottom = '0';
            prevButton.style.margin = 'auto 0';
            prevButton.style.height = '30px';
            prevButton.style.backgroundColor = '#333';
            prevButton.style.color = 'white';
            prevButton.style.border = '1px solid #555';
            prevButton.style.borderRadius = '50%';
            prevButton.style.width = '30px';
            prevButton.style.display = 'flex';
            prevButton.style.alignItems = 'center';
            prevButton.style.justifyContent = 'center';
            prevButton.style.fontSize = '16px';
            prevButton.style.cursor = 'pointer';
            prevButton.style.zIndex = '10';
            prevButton.style.padding = '0';
            prevButton.innerHTML = '&lt;';

            // Add the date display to the container
            dateDisplay.style.margin = '0 auto';
            dateDisplay.style.position = 'relative';
            dateDisplay.style.zIndex = '5';
            dateDisplay.style.width = '160px';
            dateDisplay.style.textAlign = 'center';
            dateDisplay.style.backgroundColor = 'transparent';
            dateDisplay.style.color = 'white';
            dateDisplay.style.fontWeight = '500';
            dateDisplay.style.fontSize = '1.1rem';
            dateDisplay.style.padding = '5px 0';

            // Add the next button to the container
            nextButton.style.position = 'absolute';
            nextButton.style.right = '-35px';
            nextButton.style.top = '0';
            nextButton.style.bottom = '0';
            nextButton.style.margin = 'auto 0';
            nextButton.style.height = '30px';
            nextButton.style.backgroundColor = '#333';
            nextButton.style.color = 'white';
            nextButton.style.border = '1px solid #555';
            nextButton.style.borderRadius = '50%';
            nextButton.style.width = '30px';
            nextButton.style.display = 'flex';
            nextButton.style.alignItems = 'center';
            nextButton.style.justifyContent = 'center';
            nextButton.style.fontSize = '16px';
            nextButton.style.cursor = 'pointer';
            nextButton.style.zIndex = '10';
            nextButton.style.padding = '0';
            nextButton.innerHTML = '&gt;';

            // Add all elements to the new container
            dateNavContainer.appendChild(prevButton);
            dateNavContainer.appendChild(dateDisplay);
            dateNavContainer.appendChild(nextButton);

            // Remove the original navigation buttons container since we've moved the buttons
            if (navButtonsContainer.parentNode) {
                navButtonsContainer.parentNode.removeChild(navButtonsContainer);
            }

            // Make sure the buttons still work by preserving their event handlers
            // (The original handlers should still be attached to the buttons)

            console.log('[Photo Nav Redesign] Navigation redesign applied successfully');
        }, 1500); // Wait 1.5 seconds to ensure all other scripts have run
    });
})();
