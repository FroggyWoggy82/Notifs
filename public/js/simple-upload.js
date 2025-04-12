// Simple Photo Upload Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Simple Upload] Handler loaded');

    // Get form elements
    const photoForm = document.getElementById('progress-photo-form');
    const statusElement = document.getElementById('upload-status');
    const photoModal = document.getElementById('photo-upload-modal');

    if (photoForm) {
        console.log('[Simple Upload] Found photo form, attaching submit handler');

        // Add submit handler to form
        photoForm.addEventListener('submit', function(event) {
            // Prevent default form submission
            event.preventDefault();
            console.log('[Simple Upload] Form submitted');

            // Get form data
            const formData = new FormData(photoForm);

            // Show uploading status
            if (statusElement) {
                statusElement.textContent = 'Uploading...';
                statusElement.style.color = '#03dac6';
            }

            // Disable submit button
            const submitButton = document.getElementById('submit-photo-btn');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Uploading...';
            }

            // Log form data for debugging
            console.log('[Simple Upload] Date:', formData.get('photo-date'));
            const photoFiles = formData.getAll('photos');
            console.log('[Simple Upload] File count:', photoFiles.length);

            // Enhanced file details logging
            if (photoFiles.length > 0) {
                const file = photoFiles[0];

                // Log detailed file information
                console.log('[Simple Upload] File details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size + ' bytes',
                    sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                    lastModified: new Date(file.lastModified).toISOString(),
                    extension: file.name.split('.').pop().toLowerCase()
                });

                // Check if file is too large
                const maxSizeMB = 10; // 10MB max
                if (file.size > maxSizeMB * 1024 * 1024) {
                    console.warn(`[Simple Upload] File is large (${(file.size / (1024 * 1024)).toFixed(2)} MB), may cause timeout`);

                    // Update status to warn user
                    if (statusElement) {
                        statusElement.textContent += ' (Large file, may take longer)';
                    }
                }

                // Check file extension and type
                const extension = file.name.split('.').pop().toLowerCase();
                const fileType = file.type.toLowerCase();

                // Check for special file types
                if (extension === 'jpeg') {
                    console.log('[Simple Upload] JPEG file detected - using special handling');
                    formData.append('fileType', 'jpeg');
                } else if (extension === 'heic' || fileType.includes('heic') || fileType.includes('heif')) {
                    console.log('[Simple Upload] HEIF/HEIC file detected - using special handling');
                    formData.append('fileType', 'heif');
                } else if (file.name.startsWith('lp_') || file.name.startsWith('LP_')) {
                    console.log('[Simple Upload] Live Photo detected - using special handling');
                    formData.append('fileType', 'livephoto');
                }

                // Check file size and add appropriate flags
                if (file.size > 1 * 1024 * 1024) { // 1MB
                    console.log('[Simple Upload] Large file detected - using special handling');
                    formData.append('isLargeFile', 'true');
                }

                // Add source camera info if available from filename
                if (file.name.includes('Front') || file.name.includes('front')) {
                    console.log('[Simple Upload] Front camera photo detected');
                    formData.append('cameraSource', 'front');
                } else if (file.name.includes('Main') || file.name.includes('main')) {
                    console.log('[Simple Upload] Main camera photo detected');
                    formData.append('cameraSource', 'main');
                }
            }

            // Set up timeout protection with dynamic timeout based on file size
            let timeoutDuration = 30000; // Default 30 second timeout

            // Extend timeout for larger files
            if (photoFiles.length > 0) {
                const file = photoFiles[0];
                const fileSizeMB = file.size / (1024 * 1024);

                // Add 10 seconds per MB, up to a maximum of 2 minutes
                if (fileSizeMB > 1) {
                    const additionalTime = Math.min(fileSizeMB * 10000, 90000);
                    timeoutDuration += additionalTime;
                    console.log(`[Simple Upload] Extended timeout to ${timeoutDuration/1000} seconds for ${fileSizeMB.toFixed(2)}MB file`);
                }
            }

            const uploadTimeout = setTimeout(function() {
                console.log(`[Simple Upload] Upload timed out after ${timeoutDuration/1000} seconds`);
                if (statusElement) {
                    statusElement.textContent = 'Upload timed out. Please try again with a smaller file.';
                    statusElement.style.color = 'red';
                }
                localStorage.removeItem('uploadInProgress');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Upload Photo';
                }
            }, timeoutDuration);

            // Upload the file
            fetch('/api/workouts/progress-photos', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('[Simple Upload] Response status:', response.status);
                return response.json();
            })
            .then(data => {
                // Clear timeout since upload completed successfully
                clearTimeout(uploadTimeout);

                console.log('[Simple Upload] Upload successful:', data);

                // Show success message
                if (statusElement) {
                    statusElement.textContent = 'Upload successful!';
                    statusElement.style.color = '#4CAF50';
                }

                // Reset form
                photoForm.reset();

                // Close modal after delay
                setTimeout(function() {
                    if (photoModal) {
                        photoModal.style.display = 'none';
                    }

                    // Reload page to show new photo
                    window.location.reload();
                }, 1500);
            })
            .catch(error => {
                // Clear timeout since we got a response (even if it's an error)
                clearTimeout(uploadTimeout);

                console.error('[Simple Upload] Upload failed:', error);

                // Show error message
                if (statusElement) {
                    statusElement.textContent = 'Upload failed: ' + error.message;
                    statusElement.style.color = '#f44336';
                }
            })
            .finally(() => {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Upload Photo';
                }
            });
        });
    } else {
        console.error('[Simple Upload] Photo form not found');
    }
});
