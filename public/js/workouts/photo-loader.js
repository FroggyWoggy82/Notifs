/**
 * Progress Photo Loader
 * Handles loading, caching, and error recovery for progress photos
 */

const PhotoLoader = {
    // Cache for photo data
    photoCache: new Map(),
    
    // Default placeholder image (base64 encoded small gray image)
    placeholderImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDUtMDJUMTI6MzQ6MTAtMDU6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA1LTAyVDEyOjM0OjM3LTA1OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTA1LTAyVDEyOjM0OjM3LTA1OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRkYTBmZjEwLTU5MDEtNDZiYi05NWE0LTliZDQ3YTUxZDVkYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRkYTBmZjEwLTU5MDEtNDZiYi05NWE0LTliZDQ3YTUxZDVkYiIgc3RFdnQ6d2hlbj0iMjAyNC0wNS0wMlQxMjozNDoxMC0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Gy6OrQAABFVJREFUeJzt3U9oHGUcx/HPb2aTbJJNUkHQg4IHD4IHC1J78GDRXrwUehARPAiCeBHEkyAIHjwUehMUwYsXL4J48OJBELRIQRBEqCAIYv9omm6S3ezu/Hx4pnQJu9nZzTPPk+z3DYFuZpP5zXee+c3sbCYyMwIQR9F1AYDrCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAg7m9U+1fAX3o3WAAAAABJRU5ErkJggg==',
    
    /**
     * Load an image with fallbacks and error recovery
     * @param {string} src - The image source URL
     * @param {HTMLImageElement} imgElement - The image element to load into
     * @param {string} photoId - Unique identifier for the photo
     * @param {function} onSuccess - Callback when image loads successfully
     * @param {function} onError - Callback when image fails to load after all attempts
     */
    loadImage: function(src, imgElement, photoId, onSuccess, onError) {
        // Skip if no source or element
        if (!src || !imgElement) {
            console.error('[PhotoLoader] Missing source or image element');
            if (onError) onError('Missing source or image element');
            return;
        }
        
        console.log(`[PhotoLoader] Loading image: ${src} (ID: ${photoId})`);
        
        // Check if we have a cached version
        if (this.photoCache.has(photoId)) {
            const cachedData = this.photoCache.get(photoId);
            console.log(`[PhotoLoader] Using cached data for photo ID: ${photoId}`);
            
            // If we have a cached blob URL, use it
            if (cachedData.blobUrl) {
                imgElement.src = cachedData.blobUrl;
                if (onSuccess) onSuccess();
                return;
            }
        }
        
        // Add cache busting parameter
        const cacheBustSrc = this.addCacheBustingParam(src);
        
        // Set placeholder while loading
        imgElement.src = this.placeholderImage;
        
        // Create a new Image object for preloading
        const tempImg = new Image();
        
        // Set up success handler
        tempImg.onload = () => {
            console.log(`[PhotoLoader] Successfully loaded: ${cacheBustSrc}`);
            
            // Try to create a blob URL for better caching
            this.createBlobUrl(tempImg, photoId).then(blobUrl => {
                // Use the blob URL if created successfully
                if (blobUrl) {
                    imgElement.src = blobUrl;
                    console.log(`[PhotoLoader] Using blob URL for photo ID: ${photoId}`);
                } else {
                    // Fall back to the original URL with cache busting
                    imgElement.src = cacheBustSrc;
                    console.log(`[PhotoLoader] Using direct URL for photo ID: ${photoId}`);
                }
                
                if (onSuccess) onSuccess();
            });
        };
        
        // Set up error handler with multiple fallback attempts
        tempImg.onerror = () => {
            console.error(`[PhotoLoader] Failed to load image: ${cacheBustSrc}`);
            
            // Try with a different cache busting parameter
            const secondAttemptSrc = this.addCacheBustingParam(src, true);
            console.log(`[PhotoLoader] Trying second attempt: ${secondAttemptSrc}`);
            
            const secondTempImg = new Image();
            secondTempImg.onload = () => {
                console.log(`[PhotoLoader] Second attempt succeeded: ${secondAttemptSrc}`);
                imgElement.src = secondAttemptSrc;
                
                // Cache this successful URL
                this.photoCache.set(photoId, { 
                    src: secondAttemptSrc,
                    timestamp: Date.now()
                });
                
                if (onSuccess) onSuccess();
            };
            
            secondTempImg.onerror = () => {
                console.error(`[PhotoLoader] Second attempt failed: ${secondAttemptSrc}`);
                
                // Final fallback - try the original URL without cache busting
                console.log(`[PhotoLoader] Trying original URL as last resort: ${src}`);
                
                const finalTempImg = new Image();
                finalTempImg.onload = () => {
                    console.log(`[PhotoLoader] Original URL succeeded: ${src}`);
                    imgElement.src = src;
                    
                    // Cache this successful URL
                    this.photoCache.set(photoId, { 
                        src: src,
                        timestamp: Date.now()
                    });
                    
                    if (onSuccess) onSuccess();
                };
                
                finalTempImg.onerror = () => {
                    console.error(`[PhotoLoader] All attempts failed for: ${src}`);
                    
                    // Keep the placeholder image
                    imgElement.src = this.placeholderImage;
                    
                    // Store failure in cache to avoid repeated attempts
                    this.photoCache.set(photoId, { 
                        failed: true,
                        timestamp: Date.now()
                    });
                    
                    if (onError) onError('Failed to load image after multiple attempts');
                };
                
                finalTempImg.src = src;
            };
            
            secondTempImg.src = secondAttemptSrc;
        };
        
        // Start loading the image
        tempImg.src = cacheBustSrc;
    },
    
    /**
     * Add a cache busting parameter to a URL
     * @param {string} url - The URL to modify
     * @param {boolean} useRandom - Whether to use a random value instead of timestamp
     * @returns {string} The URL with cache busting parameter
     */
    addCacheBustingParam: function(url, useRandom = false) {
        if (!url) return url;
        
        const separator = url.includes('?') ? '&' : '?';
        const param = useRandom ? 
            `nocache=${Math.random().toString(36).substring(2, 15)}` : 
            `t=${Date.now()}`;
            
        return `${url}${separator}${param}`;
    },
    
    /**
     * Create a blob URL from an image for better caching
     * @param {HTMLImageElement} img - The loaded image
     * @param {string} photoId - Unique identifier for the photo
     * @returns {Promise<string|null>} A promise that resolves to the blob URL or null if failed
     */
    createBlobUrl: function(img, photoId) {
        return new Promise(resolve => {
            try {
                // Create a canvas to draw the image
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw the image on the canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Convert to blob
                canvas.toBlob(blob => {
                    if (blob) {
                        // Create a blob URL
                        const blobUrl = URL.createObjectURL(blob);
                        
                        // Cache the blob URL
                        this.photoCache.set(photoId, {
                            blobUrl: blobUrl,
                            timestamp: Date.now()
                        });
                        
                        resolve(blobUrl);
                    } else {
                        console.error('[PhotoLoader] Failed to create blob');
                        resolve(null);
                    }
                }, 'image/jpeg', 0.9);
            } catch (error) {
                console.error('[PhotoLoader] Error creating blob URL:', error);
                resolve(null);
            }
        });
    },
    
    /**
     * Clear old items from the cache
     * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
     */
    cleanCache: function(maxAgeMs = 3600000) {
        const now = Date.now();
        
        for (const [photoId, data] of this.photoCache.entries()) {
            if (data.timestamp && (now - data.timestamp > maxAgeMs)) {
                // Release blob URL if it exists
                if (data.blobUrl) {
                    URL.revokeObjectURL(data.blobUrl);
                }
                
                // Remove from cache
                this.photoCache.delete(photoId);
                console.log(`[PhotoLoader] Removed stale cache entry for photo ID: ${photoId}`);
            }
        }
    }
};

// Clean the cache every 10 minutes
setInterval(() => {
    PhotoLoader.cleanCache();
}, 600000);
