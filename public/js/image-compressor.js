/**
 * Simple image compression utility for mobile uploads
 * This script automatically compresses images before upload to reduce file size
 */

// Mobile Image Compressor
const MobileImageCompressor = {
    // Maximum dimensions for compressed images
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    
    // Quality setting for JPEG compression (0.0 to 1.0)
    QUALITY: 0.85,
    
    // Maximum file size in bytes (800KB)
    MAX_FILE_SIZE: 800 * 1024,
    
    /**
     * Detects if the current device is mobile
     * @returns {boolean} True if the device is mobile
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Compresses an image file
     * @param {File} file - The image file to compress
     * @returns {Promise<File>} A promise that resolves with the compressed file
     */
    async compressImage(file) {
        // Skip compression for non-image files
        if (!file.type.startsWith('image/')) {
            console.log('[Image Compressor] Not an image file, skipping compression');
            return file;
        }
        
        // Skip compression for small files
        if (file.size <= this.MAX_FILE_SIZE) {
            console.log(`[Image Compressor] File already small enough (${(file.size / 1024).toFixed(1)}KB), skipping compression`);
            return file;
        }
        
        console.log(`[Image Compressor] Starting compression for ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > this.MAX_WIDTH) {
                        height = Math.round(height * (this.MAX_WIDTH / width));
                        width = this.MAX_WIDTH;
                    }
                    
                    if (height > this.MAX_HEIGHT) {
                        width = Math.round(width * (this.MAX_HEIGHT / height));
                        height = this.MAX_HEIGHT;
                    }
                    
                    // Create canvas for resizing
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image on canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with specified quality
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error('[Image Compressor] Failed to compress image');
                            resolve(file); // Return original file on error
                            return;
                        }
                        
                        // Create new file from blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: file.lastModified
                        });
                        
                        console.log(`[Image Compressor] Compression complete: ${file.name}
                            Original: ${(file.size / 1024).toFixed(1)}KB
                            Compressed: ${(compressedFile.size / 1024).toFixed(1)}KB
                            Reduction: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);
                        
                        resolve(compressedFile);
                    }, 'image/jpeg', this.QUALITY);
                };
                
                img.onerror = () => {
                    console.error('[Image Compressor] Failed to load image');
                    resolve(file); // Return original file on error
                };
                
                img.src = event.target.result;
            };
            
            reader.onerror = () => {
                console.error('[Image Compressor] Failed to read file');
                resolve(file); // Return original file on error
            };
            
            reader.readAsDataURL(file);
        });
    }
};

console.log('[Image Compressor] Loaded - Mobile detection:', MobileImageCompressor.isMobileDevice() ? 'Mobile device detected' : 'Desktop device detected');
