// Direct fix for pagination dots issue
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Pagination Fix] Direct fix for pagination dots loaded');

    // Function to fix the pagination dots
    function fixPaginationDots() {
        // Get the pagination dots container
        const paginationDotsContainer = document.querySelector('.pagination-dots');
        if (!paginationDotsContainer) {
            console.log('[Pagination Fix] Pagination dots container not found');
            return;
        }

        // Remove the entire pagination dots container and create a new one
        const parent = paginationDotsContainer.parentNode;
        if (!parent) {
            console.log('[Pagination Fix] Could not find parent of pagination dots container');
            return;
        }

        // Create a new pagination dots container
        const newPaginationDotsContainer = document.createElement('div');
        newPaginationDotsContainer.className = 'pagination-dots';

        // Replace the old container with the new one
        parent.replaceChild(newPaginationDotsContainer, paginationDotsContainer);

        // Update our reference to the new container
        paginationDotsContainer = newPaginationDotsContainer;

        // Get the photo reel to count the actual number of photos
        const photoReel = document.getElementById('photo-reel');
        if (!photoReel) {
            console.log('[Pagination Fix] Photo reel not found');
            return;
        }

        // Count the actual images in the reel
        const images = photoReel.querySelectorAll('img');
        console.log(`[Pagination Fix] Found ${images.length} images in the photo reel`);

        // If no images, exit
        if (images.length === 0) {
            console.log('[Pagination Fix] No images found, exiting');
            return;
        }

        // Create the correct number of dots
        for (let i = 0; i < images.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.index = i.toString();

            // Add click event to navigate to the corresponding photo
            dot.addEventListener('click', function() {
                console.log(`[Pagination Fix] Dot ${i} clicked`);
                // Try to find and call the goToPhoto function
                if (typeof window.goToPhoto === 'function') {
                    window.goToPhoto(i);
                } else {
                    // Fallback: try to set currentPhotoIndex and call displayCurrentPhoto
                    if (typeof window.currentPhotoIndex !== 'undefined' &&
                        typeof window.displayCurrentPhoto === 'function') {
                        window.currentPhotoIndex = i;
                        window.displayCurrentPhoto();
                    } else {
                        console.error('[Pagination Fix] Could not navigate to photo, functions not found');
                    }
                }
            });

            paginationDotsContainer.appendChild(dot);
        }

        // Update the active dot based on the current photo index
        const currentPhotoIndex = window.currentPhotoIndex || 0;
        const dots = paginationDotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentPhotoIndex);
        });

        // Apply styling to the dots container
        paginationDotsContainer.style.display = 'flex';
        paginationDotsContainer.style.justifyContent = 'center';
        paginationDotsContainer.style.flexWrap = 'wrap';
        paginationDotsContainer.style.maxWidth = '100%';
        paginationDotsContainer.style.overflow = 'hidden';

        console.log(`[Pagination Fix] Created ${dots.length} pagination dots`);
    }

    // Function to observe changes to the photo reel
    function observePhotoReel() {
        const photoReel = document.getElementById('photo-reel');
        if (!photoReel) {
            console.log('[Pagination Fix] Photo reel not found for observation');
            return;
        }

        // Create a MutationObserver to watch for changes to the photo reel
        const observer = new MutationObserver(function(mutations) {
            console.log('[Pagination Fix] Photo reel changed, fixing pagination dots');
            fixPaginationDots();
        });

        // Start observing the photo reel for changes
        observer.observe(photoReel, {
            childList: true,  // Watch for changes to the child elements
            subtree: true     // Watch for changes to the entire subtree
        });

        console.log('[Pagination Fix] Now observing photo reel for changes');
    }

    // Run the fix immediately and set up observation
    setTimeout(function() {
        console.log('[Pagination Fix] Running initial fix');
        fixPaginationDots();
        observePhotoReel();

        // Also run the fix when the window is resized
        window.addEventListener('resize', function() {
            console.log('[Pagination Fix] Window resized, fixing pagination dots');
            fixPaginationDots();
        });

        // Also run the fix when a photo navigation button is clicked
        const prevBtn = document.getElementById('photo-prev-btn');
        const nextBtn = document.getElementById('photo-next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                setTimeout(fixPaginationDots, 100);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                setTimeout(fixPaginationDots, 100);
            });
        }
    }, 1000); // Wait 1 second for the page to load
});
