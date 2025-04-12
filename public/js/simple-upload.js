// Simple Photo Upload Handler with Timeout Protection
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Simple Upload] Handler loaded - Version 2.0');

    // Clear any previous upload state from localStorage
    localStorage.removeItem('uploadInProgress');
    console.log('[Simple Upload] Cleared previous upload state');

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

            // Check if upload is already in progress
            if (localStorage.getItem('uploadInProgress') === 'true') {
                console.log('[Simple Upload] Upload already in progress, aborting');
                if (statusElement) {
                    statusElement.textContent = 'Upload already in progress. Please wait or refresh the page.';
                    statusElement.style.color = 'orange';
                }
                return;
            }

            // Mark upload as in progress
            localStorage.setItem('uploadInProgress', 'true');
            console.log('[Simple Upload] Set upload in progress flag');

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
            const photoDate = formData.get('photo-date');
            const photoFiles = formData.getAll('photos');
            console.log('[Simple Upload] Date:', photoDate);
            console.log('[Simple Upload] File count:', photoFiles.length);

            if (photoFiles.length > 0) {
                const file = photoFiles[0];
                console.log('[Simple Upload] File details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size + ' bytes',
                    lastModified: new Date(file.lastModified).toISOString()
                });
            }

            // Set up timeout protection
            const uploadTimeout = setTimeout(function() {
                console.log('[Simple Upload] Upload timed out after 30 seconds');
                if (statusElement) {
                    statusElement.textContent = 'Upload timed out. Please try again with a smaller file.';
                    statusElement.style.color = 'red';
                }
                localStorage.removeItem('uploadInProgress');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Upload Photo';
                }
            }, 30000); // 30 second timeout

            // Create an AbortController for the fetch request
            const controller = new AbortController();

            // Upload the file with cache-busting headers
            console.log('[Simple Upload] Starting fetch request');
            fetch('/api/workouts/progress-photos', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache, no-store',
                    'Pragma': 'no-cache',
                    'X-Upload-Time': Date.now().toString() // Add timestamp to prevent caching
                }
            })
            .then(response => {
                console.log('[Simple Upload] Response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }

                return response.json();
            })
            .then(data => {
                // Clear timeout since we got a response
                clearTimeout(uploadTimeout);

                console.log('[Simple Upload] Upload successful:', data);

                // Show success message
                if (statusElement) {
                    statusElement.textContent = 'Upload successful!';
                    statusElement.style.color = '#4CAF50';
                }

                // Reset form
                photoForm.reset();

                // Clear upload in progress flag
                localStorage.removeItem('uploadInProgress');

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

                // Clear upload in progress flag
                localStorage.removeItem('uploadInProgress');
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

    // Add reset button functionality
    const resetButton = document.getElementById('reset-upload-btn');
    if (resetButton) {
        console.log('[Simple Upload] Found reset button, attaching click handler');

        resetButton.addEventListener('click', function() {
            console.log('[Simple Upload] Reset button clicked');

            // Clear upload in progress flag
            localStorage.removeItem('uploadInProgress');

            // Update status
            const statusElement = document.getElementById('upload-status');
            if (statusElement) {
                statusElement.textContent = 'Upload reset. You can try again now.';
                statusElement.style.color = '#9e9e9e';
            }

            // Re-enable submit button
            const submitButton = document.getElementById('submit-photo-btn');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Upload Photo';
            }

            console.log('[Simple Upload] Upload state reset');
        });
    } else {
        console.error('[Simple Upload] Reset button not found');
    }
});
