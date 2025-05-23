/**
 * Image Compressor
 * Handles image compression for product photos
 */

class ImageCompressor {
    /**
     * Compress an image to a specified size
     * @param {File} file - The image file to compress
     * @param {number} maxSizeKB - The maximum size in KB
     * @returns {Promise<Blob>} - A promise that resolves with the compressed image blob
     */
    static async compressImage(file, maxSizeKB = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = () => {
                    // Create a canvas element
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate the width and height to maintain aspect ratio
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw the image on the canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Start with high quality
                    let quality = 0.9;
                    const maxSize = maxSizeKB * 1024; // Convert to bytes
                    
                    // Function to compress with a specific quality
                    const compressWithQuality = (q) => {
                        return canvas.toDataURL('image/jpeg', q);
                    };
                    
                    // Binary search to find the right quality
                    const findRightQuality = () => {
                        let dataUrl = compressWithQuality(quality);
                        let size = this.getDataUrlSize(dataUrl);
                        
                        // If the size is close enough to the target, return the result
                        if (Math.abs(size - maxSize) / maxSize < 0.05 || quality <= 0.1) {
                            console.log(`Compressed image to ${Math.round(size / 1024)}KB with quality ${quality.toFixed(2)}`);
                            return dataUrl;
                        }
                        
                        // Adjust quality based on size
                        if (size > maxSize) {
                            quality -= 0.1;
                            if (quality < 0.1) quality = 0.1;
                        } else {
                            quality += 0.05;
                            if (quality > 0.9) quality = 0.9;
                        }
                        
                        return findRightQuality();
                    };
                    
                    // Get the compressed data URL
                    const compressedDataUrl = findRightQuality();
                    
                    // Convert data URL to Blob
                    fetch(compressedDataUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            resolve(blob);
                        })
                        .catch(err => {
                            reject(err);
                        });
                };
                
                img.onerror = (error) => {
                    reject(error);
                };
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }
    
    /**
     * Get the size of a data URL in bytes
     * @param {string} dataUrl - The data URL
     * @returns {number} - The size in bytes
     */
    static getDataUrlSize(dataUrl) {
        // Remove the data URL prefix to get the base64 string
        const base64 = dataUrl.split(',')[1];
        // Calculate the size in bytes
        return (base64.length * 3) / 4;
    }
    
    /**
     * Create a preview element for an image
     * @param {File|Blob} file - The image file or blob
     * @param {Function} onRemove - Callback function when the image is removed
     * @returns {Promise<HTMLElement>} - A promise that resolves with the preview element
     */
    static async createPreviewElement(file, onRemove) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                // Create the preview container
                const previewElement = document.createElement('div');
                previewElement.className = 'photo-preview';
                
                // Create the image element
                const img = document.createElement('img');
                img.src = event.target.result;
                previewElement.appendChild(img);
                
                // Create the remove button
                const removeButton = document.createElement('div');
                removeButton.className = 'photo-remove';
                removeButton.innerHTML = '<i class="fas fa-times"></i>';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    previewElement.remove();
                    if (typeof onRemove === 'function') {
                        onRemove();
                    }
                });
                
                previewElement.appendChild(removeButton);
                resolve(previewElement);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }
}
