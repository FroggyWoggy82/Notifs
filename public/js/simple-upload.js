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
            console.log('[Simple Upload] File count:', formData.getAll('photos').length);
            
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
