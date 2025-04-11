/**
 * Photo Upload Module - Ultra Simple Version with Detailed Logging
 * Handles photo uploads for the workout tracker using XMLHttpRequest
 */

// Function to handle photo uploads
async function uploadPhoto(photoFile, date) {
    return new Promise(async (resolve, reject) => {
        console.log('==========================================');
        console.log('[Photo Upload] Starting upload process');
        console.log(`[Photo Upload] Photo details: name=${photoFile.name}, size=${photoFile.size}, type=${photoFile.type}`);
        console.log(`[Photo Upload] Date: ${date}`);
        console.log('==========================================');

        // Check if file is too large (over 5MB) and needs compression
        const MAX_SIZE_BEFORE_COMPRESSION = 5 * 1024 * 1024; // 5MB
        let fileToUpload = photoFile;

        if (photoFile.size > MAX_SIZE_BEFORE_COMPRESSION && photoFile.type.startsWith('image/')) {
            console.log(`[Photo Upload] File is large (${(photoFile.size / (1024 * 1024)).toFixed(2)}MB), attempting compression...`);
            try {
                fileToUpload = await compressImage(photoFile);
                console.log(`[Photo Upload] Compression successful. New size: ${(fileToUpload.size / (1024 * 1024)).toFixed(2)}MB`);
            } catch (err) {
                console.warn('[Photo Upload] Compression failed, using original file:', err);
                fileToUpload = photoFile; // Fall back to original file
            }
        }

        // Create a FormData object
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date); // Add a fallback field
        formData.append('photos', fileToUpload);

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

        // Set a much longer timeout for large files
        xhr.timeout = 300000; // 5 minutes

        console.log('[Photo Upload] Sending request...');
        xhr.send(formData);
        console.log('[Photo Upload] Request sent');
    });
}

/**
 * Compress an image file to reduce its size
 * @param {File} file - The image file to compress
 * @returns {Promise<File>} - A promise that resolves to the compressed file
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        console.log('[Photo Upload] Starting image compression...');

        // Create an image element to load the file
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function(e) {
            img.src = e.target.result;

            img.onload = function() {
                console.log(`[Photo Upload] Image loaded: ${img.width}x${img.height}`);

                // Create a canvas to draw the image
                const canvas = document.createElement('canvas');

                // Calculate new dimensions (max 1200px on longest side)
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1200;

                if (width > height && width > MAX_DIMENSION) {
                    height = Math.round(height * (MAX_DIMENSION / width));
                    width = MAX_DIMENSION;
                } else if (height > MAX_DIMENSION) {
                    width = Math.round(width * (MAX_DIMENSION / height));
                    height = MAX_DIMENSION;
                }

                console.log(`[Photo Upload] Resizing to: ${width}x${height}`);

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with reduced quality
                const quality = 0.7; // 70% quality
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            console.error('[Photo Upload] Compression failed - no blob generated');
                            reject(new Error('Compression failed'));
                            return;
                        }

                        console.log(`[Photo Upload] Compressed size: ${blob.size} bytes`);

                        // Create a new file from the blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = function() {
                console.error('[Photo Upload] Error loading image for compression');
                reject(new Error('Error loading image for compression'));
            };
        };

        reader.onerror = function() {
            console.error('[Photo Upload] Error reading file for compression');
            reject(new Error('Error reading file for compression'));
        };

        reader.readAsDataURL(file);
    });
}

// Export the functions
window.photoUploader = {
    uploadPhoto: uploadPhoto,
    compressImage: compressImage
};
