/**
 * Photo Upload Module - Ultra Simple Version
 * Handles photo uploads for the workout tracker using XMLHttpRequest
 */

// Function to handle photo uploads
function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log('[Photo Upload] Starting upload process');
        console.log(`[Photo Upload] Photo details: name=${photoFile.name}, size=${photoFile.size}, type=${photoFile.type}`);

        // Create a FormData object
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date); // Add a fallback field
        formData.append('photos', photoFile);

        // Create a basic XMLHttpRequest
        const xhr = new XMLHttpRequest();

        // Set up basic event handlers
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('[Photo Upload] Upload successful');
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    console.error('[Photo Upload] Error parsing response:', e);
                    resolve({ success: true, message: 'Upload successful' });
                }
            } else {
                console.error(`[Photo Upload] Upload failed with status: ${xhr.status}`);
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            console.error('[Photo Upload] Network error');
            reject(new Error('Network error. Please check your connection.'));
        };

        // Open and send the request
        xhr.open('POST', '/api/workouts/progress-photos', true);
        xhr.send(formData);
    });
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
