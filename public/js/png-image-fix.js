// Fix for PNG images not displaying correctly
document.addEventListener('DOMContentLoaded', function() {
    console.log('[PNG Fix] PNG image fix loaded');

    // Wait for the page to load
    setTimeout(function() {
        // Check if we're on the workouts page
        if (!window.location.pathname.includes('workouts.html')) {
            return;
        }

        console.log('[PNG Fix] Running PNG image fix');

        // Function to fix PNG images
        function fixPngImages() {
            // Get all images in the photo reel
            const photoReel = document.querySelector('.photo-reel');
            if (!photoReel) {
                console.log('[PNG Fix] Photo reel not found');
                return;
            }

            const images = photoReel.querySelectorAll('img');
            console.log(`[PNG Fix] Found ${images.length} images in the photo reel`);

            // If no images, exit
            if (images.length === 0) {
                console.log('[PNG Fix] No images found, exiting');
                return;
            }

            // Get the progress photos data from the global variable
            const progressPhotosData = window.progressPhotosData;
            if (!progressPhotosData || !Array.isArray(progressPhotosData)) {
                console.log('[PNG Fix] Progress photos data not found or not an array');
                return;
            }

            console.log(`[PNG Fix] Progress photos data has ${progressPhotosData.length} items`);

            // Fix each image
            images.forEach((img, index) => {
                if (index >= progressPhotosData.length) return;

                const photo = progressPhotosData[index];
                if (!photo) return;

                // Check if this is photo ID 17 (April 11, 2025)
                if (photo.photo_id === 17 || (photo.date_taken && photo.date_taken.includes('2025-04-11'))) {
                    console.log(`[PNG Fix] Found photo ID ${photo.photo_id} with date ${photo.date_taken}`);

                    // Direct URL for photo ID 17
                    const isProduction = window.location.hostname.includes('railway.app');
                    const serverProtocol = isProduction ? 'https' : 'http';
                    const serverHost = isProduction ? 'notifs-production.up.railway.app' : '127.0.0.1:3000';

                    // Try multiple possible URLs for this image
                    const possibleUrls = [
                        // Try with the exact file name from the database
                        photo.file_path ? `${serverProtocol}://${serverHost}/${photo.file_path.replace(/^\/?/, '')}` : null,
                        // Try with different extensions
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247-929083164.jpg`,
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247-929083164.png`,
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247-929083164`,
                        // Try with different file names
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247.jpg`,
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247.png`,
                        // Try with a known working image as fallback
                        `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1743533104709-675883910.jpg`
                    ].filter(Boolean); // Remove null values

                    // Function to try the next URL
                    let urlIndex = 0;
                    function tryNextUrl() {
                        if (urlIndex < possibleUrls.length) {
                            const url = possibleUrls[urlIndex];
                            console.log(`[PNG Fix] Trying URL for photo ID 17: ${url}`);
                            img.src = url;
                            urlIndex++;
                        } else {
                            console.log('[PNG Fix] All URLs failed for photo ID 17');
                            // If all URLs fail, use our SVG placeholder
                            img.src = '/images/photo-placeholder.svg';
                            img.alt = 'Image unavailable';
                            img.style.display = 'block';
                            img.style.maxWidth = '100%';
                            img.style.maxHeight = '100%';
                        }
                    }

                    // Set up error handler to try the next URL
                    img.onerror = tryNextUrl;

                    // Start with the first URL
                    tryNextUrl();
                }

                // For all PNG images, add a special error handler
                if (img.src.toLowerCase().endsWith('.png') || photo.file_path.toLowerCase().endsWith('.png')) {
                    console.log(`[PNG Fix] Found PNG image: ${img.src}`);

                    // Try to load the image with a JPG extension instead
                    img.onerror = function() {
                        console.log(`[PNG Fix] PNG image failed to load: ${this.src}`);

                        // Try with JPG extension
                        const jpgUrl = this.src.replace(/\.png$/i, '.jpg');
                        console.log(`[PNG Fix] Trying with JPG extension: ${jpgUrl}`);
                        this.src = jpgUrl;

                        // If that fails, try with no extension
                        this.onerror = function() {
                            console.log(`[PNG Fix] JPG also failed to load: ${this.src}`);
                            const noExtUrl = this.src.replace(/\.(png|jpg|jpeg)$/i, '');
                            console.log(`[PNG Fix] Trying with no extension: ${noExtUrl}`);
                            this.src = noExtUrl;

                            // Final fallback
                            this.onerror = function() {
                                console.log(`[PNG Fix] All attempts failed for: ${this.src}`);
                                // Use our SVG placeholder
                                this.src = '/images/photo-placeholder.svg';
                                this.alt = 'Image unavailable';
                                this.style.display = 'block';
                                this.style.maxWidth = '100%';
                                this.style.maxHeight = '100%';
                            };
                        };
                    };
                }
            });

            console.log('[PNG Fix] Finished fixing PNG images');
        }

        // Run the fix immediately
        fixPngImages();

        // Also run the fix when the current photo changes
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                setTimeout(fixPngImages, 100);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                setTimeout(fixPngImages, 100);
            });
        }

        // Also run the fix when dots are clicked
        const paginationDots = document.querySelectorAll('.pagination-dots .dot');
        paginationDots.forEach(dot => {
            dot.addEventListener('click', function() {
                setTimeout(fixPngImages, 100);
            });
        });

        // Run the fix periodically to ensure it's applied
        setInterval(fixPngImages, 2000);
    }, 1500); // Wait 1.5 seconds for the page to load
});
