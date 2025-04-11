/**
 * Photo Upload Module - Simplified Version
 * Handles photo uploads for the workout tracker using fetch API
 */

// Function to handle photo uploads
async function uploadPhoto(photoFile, date) {
    try {
        // Log the start of the upload process
        console.log('[Photo Upload] Starting upload process');
        console.log(`[Photo Upload] Photo details: name=${photoFile.name}, size=${photoFile.size}, type=${photoFile.type}`);

        // Create a simple FormData object
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date); // Add a fallback field
        formData.append('photos', photoFile);

        // Log the FormData
        console.log(`[Photo Upload] FormData created with date: ${date}`);

        // Notify that upload is starting
        document.dispatchEvent(new CustomEvent('photo-upload-progress', {
            detail: { message: 'Starting upload...' }
        }));

        // Use fetch API with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

        // Make the fetch request
        console.log('[Photo Upload] Sending fetch request');
        const response = await fetch('/api/workouts/progress-photos', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            // Disable caching
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        // Check if the response is ok
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Photo Upload] Server error: ${response.status} ${response.statusText}`);
            console.error(`[Photo Upload] Error response: ${errorText}`);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // Parse the response
        const result = await response.json();
        console.log('[Photo Upload] Upload successful:', result);

        // Notify that upload is complete
        document.dispatchEvent(new CustomEvent('photo-upload-complete', {
            detail: { success: true }
        }));

        return result;
    } catch (error) {
        console.error('[Photo Upload] Error:', error);

        // Notify that upload failed
        document.dispatchEvent(new CustomEvent('photo-upload-error', {
            detail: { error: error.message || 'Unknown error' }
        }));

        throw error;
    }
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
