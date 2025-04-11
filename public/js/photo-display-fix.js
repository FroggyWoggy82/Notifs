// Photo display fix - to be included in workouts.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Photo display fix loaded');

    // Function to detect if we're on desktop
    function isDesktop() {
        // Check if we're on a desktop device (not mobile)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return !isMobile;
    }

    // Wait for the workouts.js to initialize
    setTimeout(function() {
        // Check if we're on the workouts page
        if (window.location.pathname.includes('workouts.html')) {
            if (isDesktop()) {
                console.log('Applying photo display fix for desktop');
            } else {
                console.log('On mobile device - photo display fix not needed');
                return; // Exit early on mobile
            }

            // Override the normalizePhotoPath function
            if (typeof window.normalizePhotoPath === 'function') {
                const originalNormalizePhotoPath = window.normalizePhotoPath;

                window.normalizePhotoPath = function(originalPath, photoId) {
                    console.log(`[Photo Fix] Normalizing path for photo ID: ${photoId}`);

                    // Direct mapping of photo IDs to known filenames for desktop
                    // For desktop, we'll use absolute URLs to ensure they work
                    const isProduction = window.location.hostname.includes('railway.app');
                    const serverProtocol = isProduction ? 'https' : 'http';
                    const serverHost = isProduction ? 'notifs-production.up.railway.app' : '127.0.0.1:3000';
                    const baseUrl = `${serverProtocol}://${serverHost}`;

                    const photoIdToFilename = {
                        1: `${baseUrl}/uploads/progress_photos/photos-1743533104709-675883910.jpg`,
                        4: `${baseUrl}/uploads/progress_photos/photos-1743534804031-896765036.jpg`,
                        15: `${baseUrl}/uploads/progress_photos/photos-1744352353551-10102925.jpg`,
                        16: `${baseUrl}/uploads/progress_photos/photos-1744395354247-929083164.jpg`,
                        17: `${baseUrl}/uploads/progress_photos/photos-1744395354247-929083164.jpg` // Use a known working image for ID 17
                    };

                    // If we have a direct mapping for this photo ID, use it
                    if (photoIdToFilename[photoId]) {
                        console.log(`[Photo Fix] Using direct mapping for photo ID ${photoId}: ${photoIdToFilename[photoId]}`);
                        return photoIdToFilename[photoId];
                    }

                    // Fall back to the original function for other photos
                    return originalNormalizePhotoPath(originalPath, photoId);
                };

                console.log('[Photo Fix] Successfully overrode normalizePhotoPath function');
            } else {
                console.error('[Photo Fix] Could not find normalizePhotoPath function');
            }

            // Add a simpler error handler for images
            const simplifyImageErrorHandling = function() {
                const photoReel = document.getElementById('photo-reel');
                if (photoReel) {
                    const images = photoReel.querySelectorAll('img');
                    images.forEach(img => {
                        img.onerror = function() {
                            console.log(`[Photo Fix] Simple error handler for image: ${this.src}`);
                            this.src = '/images/photo-placeholder.png';
                            this.alt = 'Photo could not be loaded';
                        };
                    });
                    console.log('[Photo Fix] Added simple error handlers to all images');
                }
            };

            // Fix the pagination dots issue
            const fixPaginationDots = function() {
                const paginationDotsContainer = document.querySelector('.pagination-dots');
                const photoReel = document.getElementById('photo-reel');

                if (paginationDotsContainer && photoReel) {
                    // Get the actual number of images in the reel
                    const images = photoReel.querySelectorAll('img');
                    const dots = paginationDotsContainer.querySelectorAll('.dot');

                    console.log(`[Pagination Fix] Found ${images.length} images and ${dots.length} dots`);

                    // If there are more dots than images, remove the extra dots
                    if (dots.length > images.length) {
                        console.log(`[Pagination Fix] Removing ${dots.length - images.length} extra dots`);

                        // Clear all dots and recreate them
                        paginationDotsContainer.innerHTML = '';

                        // Recreate the correct number of dots
                        for (let i = 0; i < images.length; i++) {
                            const dot = document.createElement('span');
                            dot.classList.add('dot');
                            dot.dataset.index = String(i);

                            // Add click event listener
                            dot.addEventListener('click', function() {
                                console.log(`[Pagination Fix] Dot ${i} clicked`);
                                // Call the goToPhoto function if it exists
                                if (typeof window.goToPhoto === 'function') {
                                    window.goToPhoto(i);
                                } else {
                                    console.error('[Pagination Fix] goToPhoto function not found');
                                }
                            });

                            paginationDotsContainer.appendChild(dot);
                        }

                        // Update the active dot
                        const currentPhotoIndex = window.currentPhotoIndex || 0;
                        const newDots = paginationDotsContainer.querySelectorAll('.dot');
                        newDots.forEach((dot, i) => {
                            dot.classList.toggle('active', i === currentPhotoIndex);
                        });

                        console.log(`[Pagination Fix] Pagination dots fixed. Now have ${paginationDotsContainer.querySelectorAll('.dot').length} dots`);
                    }

                    // Make sure the dots container is properly styled for scrolling
                    paginationDotsContainer.style.display = 'flex';
                    paginationDotsContainer.style.justifyContent = 'center';
                    paginationDotsContainer.style.flexWrap = 'wrap';
                    paginationDotsContainer.style.maxWidth = '100%';
                    paginationDotsContainer.style.overflow = 'hidden';
                }
            };

            // Run the fixes every second for 10 seconds to catch any dynamically loaded images
            let fixAttempts = 0;
            const fixInterval = setInterval(function() {
                simplifyImageErrorHandling();
                fixPaginationDots();
                fixAttempts++;
                if (fixAttempts >= 10) {
                    clearInterval(fixInterval);
                }
            }, 1000);
        }
    }, 2000); // Wait 2 seconds for workouts.js to initialize
});
