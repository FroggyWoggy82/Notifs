/**
 * Photo Upload Module
 * Handles photo uploads for the workout tracker
 */

// Function to handle photo uploads
async function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log('[Photo Upload] Starting upload process');
        console.log(`[Photo Upload] Photo details: name=${photoFile.name}, size=${photoFile.size}, type=${photoFile.type}`);
        
        // Create a FormData object
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date); // Add a fallback field
        formData.append('photos', photoFile);
        
        // Log the FormData
        console.log(`[Photo Upload] FormData created with date: ${date}`);
        
        // Create and configure XMLHttpRequest
        const xhr = new XMLHttpRequest();
        
        // Set up event handlers
        xhr.upload.onloadstart = function() {
            console.log('[Photo Upload] Upload started');
        };
        
        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                console.log(`[Photo Upload] Progress: ${percentComplete}%`);
                
                // Dispatch a custom event with the progress
                const progressEvent = new CustomEvent('photo-upload-progress', { 
                    detail: { 
                        loaded: event.loaded,
                        total: event.total,
                        percent: percentComplete
                    } 
                });
                document.dispatchEvent(progressEvent);
            } else {
                // If length is not computable, just show bytes uploaded
                console.log(`[Photo Upload] Progress: ${event.loaded} bytes uploaded`);
                
                // Dispatch a custom event with the bytes uploaded
                const progressEvent = new CustomEvent('photo-upload-progress', { 
                    detail: { 
                        loaded: event.loaded,
                        total: null,
                        bytes: event.loaded
                    } 
                });
                document.dispatchEvent(progressEvent);
            }
        };
        
        xhr.upload.onload = function() {
            console.log('[Photo Upload] Upload completed, waiting for server response');
            
            // Dispatch a custom event
            document.dispatchEvent(new CustomEvent('photo-upload-complete'));
        };
        
        xhr.upload.onerror = function() {
            console.error('[Photo Upload] Upload failed due to error');
            reject(new Error('Upload failed. Please check your connection and try again.'));
        };
        
        xhr.onload = function() {
            console.log(`[Photo Upload] Server responded with status: ${xhr.status}`);
            
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
                let errorMessage = `HTTP error! Status: ${xhr.status}`;
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('[Photo Upload] Error parsing error response:', e);
                }
                reject(new Error(errorMessage));
            }
        };
        
        xhr.onerror = function() {
            console.error('[Photo Upload] Network error during request');
            reject(new Error('Network error during upload. Please check your connection and try again.'));
        };
        
        xhr.ontimeout = function() {
            console.error('[Photo Upload] Request timed out');
            reject(new Error('Request timed out. Please try again with a smaller image or better connection.'));
        };
        
        // Open and send the request
        xhr.open('POST', '/api/workouts/progress-photos', true);
        xhr.timeout = 300000; // 5 minutes timeout
        
        try {
            xhr.send(formData);
            console.log('[Photo Upload] Request sent');
        } catch (error) {
            console.error('[Photo Upload] Error sending request:', error);
            reject(error);
        }
    });
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
