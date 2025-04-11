/**
 * Absolute Minimal Photo Upload Module
 */

function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log(`Photo upload starting: ${photoFile.name}, size: ${photoFile.size}, type: ${photoFile.type}`);

        // Check if the file is a JPEG
        const isJpeg = photoFile.type === 'image/jpeg' ||
                      photoFile.type === 'image/jpg' ||
                      photoFile.name.toLowerCase().endsWith('.jpg') ||
                      photoFile.name.toLowerCase().endsWith('.jpeg');

        if (isJpeg) {
            console.log('Detected JPEG image, ensuring proper handling');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date);

        // For JPEG files, ensure we're using the right field name and MIME type
        if (isJpeg) {
            // Create a new File object with explicit MIME type
            const jpegFile = new File(
                [photoFile],
                // Ensure filename ends with .jpg
                photoFile.name.toLowerCase().endsWith('.jpg') || photoFile.name.toLowerCase().endsWith('.jpeg')
                    ? photoFile.name
                    : photoFile.name + '.jpg',
                { type: 'image/jpeg' }
            );
            formData.append('photos', jpegFile);
            console.log(`Created new file object with explicit MIME type: ${jpegFile.type}`);
        } else {
            // For non-JPEG files, use the original file
            formData.append('photos', photoFile);
        }

        // Use fetch API with better error handling
        console.log('Sending fetch request to /api/workouts/progress-photos');
        fetch('/api/workouts/progress-photos', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log(`Server responded with status: ${response.status}`);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error(`Server error response: ${text}`);
                    throw new Error(`Server error: ${response.status} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful:', data);
            resolve(data);
        })
        .catch(error => {
            console.error('Upload failed:', error);
            reject(error);
        });
    });
}

// Export the function
window.photoUploader = {
    uploadPhoto: uploadPhoto
};
