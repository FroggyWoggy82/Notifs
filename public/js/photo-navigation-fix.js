// Direct fix for photo navigation issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Navigation Fix] Direct fix for photo navigation loaded');
    
    // Wait for the page to load
    setTimeout(function() {
        // Check if we're on the workouts page
        if (!window.location.pathname.includes('workouts.html')) {
            return;
        }
        
        console.log('[Navigation Fix] Running photo navigation fix');
        
        // Function to fix photo navigation
        function fixPhotoNavigation() {
            // Get the photo reel and viewport
            const photoReel = document.getElementById('photo-reel');
            const photoViewport = document.querySelector('.photo-viewport');
            
            if (!photoReel || !photoViewport) {
                console.log('[Navigation Fix] Photo reel or viewport not found');
                return;
            }
            
            // Get all images in the photo reel
            const images = photoReel.querySelectorAll('img');
            console.log(`[Navigation Fix] Found ${images.length} images in the photo reel`);
            
            // If no images, exit
            if (images.length === 0) {
                console.log('[Navigation Fix] No images found, exiting');
                return;
            }
            
            // Make sure all images are properly sized
            images.forEach((img, index) => {
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
            });
            
            // Make sure the photo reel is properly sized
            photoReel.style.display = 'flex';
            photoReel.style.width = `${images.length * 100}%`;
            photoReel.style.transition = 'transform 0.3s ease';
            
            // Make sure the viewport is properly sized
            photoViewport.style.overflow = 'hidden';
            photoViewport.style.width = '100%';
            photoViewport.style.position = 'relative';
            
            // Override the goToPhoto function to ensure it works correctly
            window.goToPhoto = function(index) {
                console.log(`[Navigation Fix] Going to photo index: ${index}`);
                
                // Make sure the index is valid
                if (index < 0) index = 0;
                if (index >= images.length) index = images.length - 1;
                
                // Update the current photo index
                window.currentPhotoIndex = index;
                
                // Update the transform of the photo reel
                const offset = -100 * index;
                photoReel.style.transform = `translateX(${offset}%)`;
                
                // Update the active dot
                const dots = document.querySelectorAll('.pagination-dots .dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
                
                // Update the date display
                const dateDisplayEl = document.getElementById('current-photo-date-display');
                if (dateDisplayEl && window.progressPhotosData && window.progressPhotosData[index]) {
                    const photo = window.progressPhotosData[index];
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
                const prevBtn = document.getElementById('photo-prev-btn');
                const nextBtn = document.getElementById('photo-next-btn');
                
                if (prevBtn) prevBtn.disabled = index === 0;
                if (nextBtn) nextBtn.disabled = index === images.length - 1;
                
                // Enable the delete button
                const deleteBtn = document.getElementById('delete-photo-btn');
                if (deleteBtn) deleteBtn.disabled = false;
            };
            
            // Override the navigation button click handlers
            const prevBtn = document.getElementById('photo-prev-btn');
            const nextBtn = document.getElementById('photo-next-btn');
            
            if (prevBtn) {
                prevBtn.onclick = function() {
                    if (window.currentPhotoIndex > 0) {
                        window.goToPhoto(window.currentPhotoIndex - 1);
                    }
                };
            }
            
            if (nextBtn) {
                nextBtn.onclick = function() {
                    if (window.currentPhotoIndex < images.length - 1) {
                        window.goToPhoto(window.currentPhotoIndex + 1);
                    }
                };
            }
            
            // Make sure the current photo is displayed
            const currentIndex = window.currentPhotoIndex || 0;
            window.goToPhoto(currentIndex);
            
            console.log('[Navigation Fix] Finished fixing photo navigation');
        }
        
        // Run the fix immediately
        fixPhotoNavigation();
        
        // Also run the fix when the window is resized
        window.addEventListener('resize', fixPhotoNavigation);
        
        // Run the fix periodically to ensure it's applied
        setInterval(fixPhotoNavigation, 2000);
    }, 2000); // Wait 2 seconds for the page to load
});
