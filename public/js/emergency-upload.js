// Emergency Upload Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('EMERGENCY UPLOAD HANDLER LOADED');
    
    // Wait for DOM to be fully loaded
    setTimeout(function() {
        const emergencyButton = document.getElementById('emergency-upload-btn');
        const fileInput = document.getElementById('mobile-photo-upload');
        const dateInput = document.getElementById('modal-photo-date');
        const statusElement = document.getElementById('upload-status');
        
        if (emergencyButton && fileInput && dateInput) {
            console.log('EMERGENCY: Found all required elements');
            
            // Add click handler to emergency button
            emergencyButton.addEventListener('click', function() {
                console.log('EMERGENCY: Button clicked');
                
                // Validate inputs
                if (!dateInput.value) {
                    alert('Please select a date');
                    return;
                }
                
                if (!fileInput.files || fileInput.files.length === 0) {
                    alert('Please select a photo');
                    return;
                }
                
                const file = fileInput.files[0];
                console.log('EMERGENCY: Uploading file', file.name, file.type, file.size);
                
                // Update status
                if (statusElement) {
                    statusElement.textContent = 'Uploading...';
                    statusElement.style.color = '#ff5722';
                }
                
                // Disable button during upload
                emergencyButton.disabled = true;
                emergencyButton.textContent = 'UPLOADING...';
                
                // Create FormData
                const formData = new FormData();
                formData.append('photo-date', dateInput.value);
                formData.append('photos', file);
                
                // Perform upload
                fetch('/api/workouts/progress-photos', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Emergency-Upload': 'true'
                    }
                })
                .then(response => {
                    console.log('EMERGENCY: Response received', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('EMERGENCY: Upload successful', data);
                    
                    // Update status
                    if (statusElement) {
                        statusElement.textContent = 'Upload successful!';
                        statusElement.style.color = '#4CAF50';
                    }
                    
                    // Update button
                    emergencyButton.textContent = 'UPLOAD SUCCESSFUL!';
                    emergencyButton.style.backgroundColor = '#4CAF50';
                    
                    // Reload page after delay
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500);
                })
                .catch(error => {
                    console.error('EMERGENCY: Upload failed', error);
                    
                    // Update status
                    if (statusElement) {
                        statusElement.textContent = 'Upload failed: ' + error.message;
                        statusElement.style.color = '#f44336';
                    }
                    
                    // Update button
                    emergencyButton.textContent = 'UPLOAD FAILED - TRY AGAIN';
                    emergencyButton.style.backgroundColor = '#f44336';
                    emergencyButton.disabled = false;
                });
            });
            
            console.log('EMERGENCY: Upload handler attached');
        } else {
            console.error('EMERGENCY: Could not find required elements', {
                emergencyButton: !!emergencyButton,
                fileInput: !!fileInput,
                dateInput: !!dateInput
            });
        }
    }, 1000);
});
