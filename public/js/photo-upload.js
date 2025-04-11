/**
 * Absolute Minimal Photo Upload Module
 */

function uploadPhoto(photoFile, date) {
    return new Promise((resolve, reject) => {
        console.log(`Photo upload starting: ${photoFile.name}, size: ${photoFile.size}`);

        // Create FormData
        const formData = new FormData();
        formData.append('photo-date', date);
        formData.append('date', date);
        formData.append('photos', photoFile);

        // Use fetch API with no frills
        fetch('/api/workouts/progress-photos', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful');
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
