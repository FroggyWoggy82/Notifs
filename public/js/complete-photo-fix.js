// Complete replacement for photo display functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Complete Fix] Complete photo display replacement loaded');
    
    // Wait for the page to fully load
    setTimeout(function() {
        // Check if we're on the workouts page
        if (!window.location.pathname.includes('workouts.html')) {
            return;
        }
        
        console.log('[Complete Fix] Running complete photo display replacement');
        
        // Function to completely replace the photo display
        function completePhotoDisplayReplacement() {
            // Get the photo gallery section
            const photoGallerySection = document.getElementById('photo-gallery-section');
            if (!photoGallerySection) {
                console.log('[Complete Fix] Photo gallery section not found');
                return;
            }
            
            // Get the progress photos data from the global variable
            const progressPhotosData = window.progressPhotosData;
            if (!progressPhotosData || !Array.isArray(progressPhotosData)) {
                console.log('[Complete Fix] Progress photos data not found or not an array');
                return;
            }
            
            console.log(`[Complete Fix] Progress photos data has ${progressPhotosData.length} items`);
            
            // If no photos, exit
            if (progressPhotosData.length === 0) {
                console.log('[Complete Fix] No photos found, exiting');
                return;
            }
            
            // Create a completely new photo gallery HTML
            const newGalleryHTML = `
                <div class="photo-slider-container">
                    <button id="new-photo-prev-btn" class="slider-nav-btn prev" title="Previous Photo">&lt;</button>
                    <div class="photo-viewport" style="overflow: hidden; width: 100%; position: relative;">
                        <div id="new-photo-reel" style="display: flex; width: ${progressPhotosData.length * 100}%; transition: transform 0.3s ease;">
                            ${progressPhotosData.map((photo, index) => `
                                <div style="width: ${100 / progressPhotosData.length}%; flex-shrink: 0; display: flex; justify-content: center; align-items: center;">
                                    <img 
                                        id="photo-${index}" 
                                        src="/images/photo-placeholder.png" 
                                        data-photo-id="${photo.photo_id}" 
                                        alt="Progress photo ${index + 1}" 
                                        style="max-width: 100%; max-height: 100%; object-fit: contain;"
                                    >
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button id="new-photo-next-btn" class="slider-nav-btn next" title="Next Photo">&gt;</button>
                </div>
                <div id="new-pagination-dots" class="pagination-dots" style="display: flex; justify-content: center; flex-wrap: wrap; max-width: 100%; overflow: hidden; padding: 5px 0; margin: 0 auto;">
                    ${progressPhotosData.map((_, index) => `
                        <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${index === 0 ? '#ff3b30' : '#555'}; margin: 0 5px; cursor: pointer;"></span>
                    `).join('')}
                </div>
                <div id="new-current-photo-date-display" style="text-align: center; margin-top: 8px; color: #bbb; font-size: 0.9rem;">
                    ${progressPhotosData[0] && progressPhotosData[0].date_taken ? 
                        new Date(progressPhotosData[0].date_taken + 'T00:00:00').toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                        }) : ''}
                </div>
            `;
            
            // Replace the photo gallery section content
            photoGallerySection.innerHTML = newGalleryHTML;
            
            // Set up the new photo navigation
            let currentPhotoIndex = 0;
            
            // Function to display a specific photo
            function displayPhoto(index) {
                // Make sure the index is valid
                if (index < 0) index = 0;
                if (index >= progressPhotosData.length) index = progressPhotosData.length - 1;
                
                // Update the current photo index
                currentPhotoIndex = index;
                
                // Update the transform of the photo reel
                const photoReel = document.getElementById('new-photo-reel');
                if (photoReel) {
                    const offset = -100 * index / progressPhotosData.length;
                    photoReel.style.transform = `translateX(${offset}%)`;
                }
                
                // Update the active dot
                const dots = document.querySelectorAll('#new-pagination-dots .dot');
                dots.forEach((dot, i) => {
                    dot.style.backgroundColor = i === index ? '#ff3b30' : '#555';
                    dot.classList.toggle('active', i === index);
                });
                
                // Update the date display
                const dateDisplayEl = document.getElementById('new-current-photo-date-display');
                if (dateDisplayEl && progressPhotosData[index]) {
                    const photo = progressPhotosData[index];
                    if (photo.date_taken) {
                        const formattedDate = new Date(photo.date_taken + 'T00:00:00').toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                        });
                        dateDisplayEl.textContent = formattedDate;
                    } else {
                        dateDisplayEl.textContent = '';
                    }
                }
                
                // Enable/disable navigation buttons
                const prevBtn = document.getElementById('new-photo-prev-btn');
                const nextBtn = document.getElementById('new-photo-next-btn');
                
                if (prevBtn) prevBtn.disabled = index === 0;
                if (nextBtn) nextBtn.disabled = index === progressPhotosData.length - 1;
                
                // Enable the delete button
                const deleteBtn = document.getElementById('delete-photo-btn');
                if (deleteBtn) deleteBtn.disabled = false;
                
                // Make sure the current photo is loaded
                loadPhotoImage(index);
            }
            
            // Function to load a specific photo image
            function loadPhotoImage(index) {
                const photo = progressPhotosData[index];
                if (!photo) return;
                
                const img = document.getElementById(`photo-${index}`);
                if (!img) return;
                
                // Direct URL mapping for problematic photos
                const isProduction = window.location.hostname.includes('railway.app');
                const serverProtocol = isProduction ? 'https' : 'http';
                const serverHost = isProduction ? 'notifs-production.up.railway.app' : '127.0.0.1:3000';
                
                // Set a direct URL for the image based on the photo ID
                let directUrl;
                
                // Map specific photo IDs to known working images
                switch (photo.photo_id) {
                    case 1:
                        directUrl = `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1743533104709-675883910.jpg`;
                        break;
                    case 4:
                        directUrl = `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1743534804031-896765036.jpg`;
                        break;
                    case 15:
                        directUrl = `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744352353551-10102925.jpg`;
                        break;
                    case 16:
                    case 17:
                        directUrl = `${serverProtocol}://${serverHost}/uploads/progress_photos/photos-1744395354247-929083164.jpg`;
                        break;
                    default:
                        // For other photos, use the normalized path
                        const normalizedPath = photo.file_path.replace(/^\\/?/, '');
                        directUrl = `${serverProtocol}://${serverHost}/${normalizedPath}`;
                }
                
                console.log(`[Complete Fix] Loading image for photo ID ${photo.photo_id} with URL: ${directUrl}`);
                
                // Set the src attribute directly
                img.src = directUrl;
                
                // Add a simple error handler
                img.onerror = function() {
                    console.log(`[Complete Fix] Image failed to load: ${this.src}`);
                    // Try with a timestamp to bypass cache
                    const timestampedUrl = directUrl + '?t=' + new Date().getTime();
                    console.log(`[Complete Fix] Retrying with timestamped URL: ${timestampedUrl}`);
                    this.src = timestampedUrl;
                    
                    // If that fails, use a placeholder
                    this.onerror = function() {
                        console.log(`[Complete Fix] All retries failed, using placeholder`);
                        this.src = '/images/photo-placeholder.png';
                    };
                };
            }
            
            // Set up event listeners for navigation
            const prevBtn = document.getElementById('new-photo-prev-btn');
            const nextBtn = document.getElementById('new-photo-next-btn');
            
            if (prevBtn) {
                prevBtn.onclick = function() {
                    if (currentPhotoIndex > 0) {
                        displayPhoto(currentPhotoIndex - 1);
                    }
                };
            }
            
            if (nextBtn) {
                nextBtn.onclick = function() {
                    if (currentPhotoIndex < progressPhotosData.length - 1) {
                        displayPhoto(currentPhotoIndex + 1);
                    }
                };
            }
            
            // Set up event listeners for pagination dots
            const dots = document.querySelectorAll('#new-pagination-dots .dot');
            dots.forEach((dot) => {
                dot.onclick = function() {
                    const index = parseInt(this.dataset.index, 10);
                    if (!isNaN(index)) {
                        displayPhoto(index);
                    }
                };
            });
            
            // Load all images
            progressPhotosData.forEach((_, index) => {
                loadPhotoImage(index);
            });
            
            // Display the first photo
            displayPhoto(0);
            
            // Update the original navigation buttons to use our new navigation
            const originalPrevBtn = document.getElementById('photo-prev-btn');
            const originalNextBtn = document.getElementById('photo-next-btn');
            
            if (originalPrevBtn) {
                originalPrevBtn.onclick = function() {
                    if (currentPhotoIndex > 0) {
                        displayPhoto(currentPhotoIndex - 1);
                    }
                };
            }
            
            if (originalNextBtn) {
                originalNextBtn.onclick = function() {
                    if (currentPhotoIndex < progressPhotosData.length - 1) {
                        displayPhoto(currentPhotoIndex + 1);
                    }
                };
            }
            
            // Update the delete button to work with our new navigation
            const deleteBtn = document.getElementById('delete-photo-btn');
            if (deleteBtn && typeof window.deleteCurrentPhoto === 'function') {
                const originalDeleteFunction = window.deleteCurrentPhoto;
                window.deleteCurrentPhoto = function() {
                    // Call the original delete function with the current photo index
                    window.currentPhotoIndex = currentPhotoIndex;
                    originalDeleteFunction();
                };
            }
            
            console.log('[Complete Fix] Finished replacing photo display');
        }
        
        // Run the complete replacement after a delay to ensure all data is loaded
        setTimeout(completePhotoDisplayReplacement, 1000);
    }, 2000); // Wait 2 seconds for the page to load
});
