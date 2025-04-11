/**
 * Absolute Minimal Photo Upload Module
 */

function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log(`Photo upload starting: ${photoFile.name}, size: ${photoFile.size}, type: ${photoFile.type}`);

        // Create FormData - keep it simple
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date);
        formData.append('photos', photoFile);

        // Use XMLHttpRequest for better compatibility with mobile devices
        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('Upload successful with status:', xhr.status);
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    console.log('Response parsing error:', e);
                    // Even if parsing fails, consider it a success
                    resolve({ success: true });
                }
            } else {
                console.error('Upload failed with status:', xhr.status);
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            console.error('Network error during upload');
            reject(new Error('Network error during upload'));
        };

        // Open and send the request
        xhr.open('POST', '/api/workouts/progress-photos');
        xhr.send(formData);
    });
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
