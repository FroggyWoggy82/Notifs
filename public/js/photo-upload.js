/**
 * Photo Upload Module - Ultra Simple Version with Detailed Logging
 * Handles photo uploads for the workout tracker using XMLHttpRequest
 */

// Function to handle photo uploads
function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log('==========================================');
        console.log('[Photo Upload] Starting upload process');
        console.log(`[Photo Upload] Photo details: name=${photoFile.name}, size=${photoFile.size}, type=${photoFile.type}`);
        console.log(`[Photo Upload] Date: ${date}`);
        console.log('==========================================');

        // Create a FormData object
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date); // Add a fallback field
        formData.append('photos', photoFile);

        console.log('[Photo Upload] FormData created with fields:');
        console.log('- photo-date:', date);
        console.log('- date:', date);
        console.log('- photos:', photoFile.name);

        // Create a basic XMLHttpRequest
        const xhr = new XMLHttpRequest();

        // Add more detailed event handlers
        xhr.onloadstart = function() {
            console.log('[Photo Upload] Upload started');
        };

        xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                console.log(`[Photo Upload] Upload progress: ${percentComplete}%`);
            } else {
                console.log(`[Photo Upload] Upload progress: ${event.loaded} bytes uploaded`);
            }
        };

        xhr.onloadend = function() {
            console.log('[Photo Upload] Upload ended');
        };

        // Set up basic event handlers
        xhr.onload = function() {
            console.log(`[Photo Upload] Server responded with status: ${xhr.status}`);
            console.log(`[Photo Upload] Response headers: ${xhr.getAllResponseHeaders()}`);
            console.log(`[Photo Upload] Response text: ${xhr.responseText.substring(0, 200)}${xhr.responseText.length > 200 ? '...' : ''}`);

            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('[Photo Upload] Upload successful');
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('[Photo Upload] Parsed response:', response);
                    resolve(response);
                } catch (e) {
                    console.error('[Photo Upload] Error parsing response:', e);
                    resolve({ success: true, message: 'Upload successful' });
                }
            } else {
                console.error(`[Photo Upload] Upload failed with status: ${xhr.status}`);
                console.error(`[Photo Upload] Error response: ${xhr.responseText}`);
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        };

        xhr.onerror = function(e) {
            console.error('[Photo Upload] Network error:', e);
            reject(new Error('Network error. Please check your connection.'));
        };

        xhr.ontimeout = function() {
            console.error('[Photo Upload] Request timed out');
            reject(new Error('Request timed out. Please try again.'));
        };

        // Open and send the request
        console.log('[Photo Upload] Opening connection...');
        xhr.open('POST', '/api/workouts/progress-photos', true);

        // Set a longer timeout
        xhr.timeout = 60000; // 1 minute

        console.log('[Photo Upload] Sending request...');
        xhr.send(formData);
        console.log('[Photo Upload] Request sent');
    });
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
