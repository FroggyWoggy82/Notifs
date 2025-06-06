/**
 * Progress Photo Loader
 * Handles loading and error recovery for progress photos
 * Uses browser storage as a backup when server images are unavailable
 */

const PhotoLoader = {
    // Cache for preloaded images
    imageCache: {},

    // Track loading status of images
    loadingStatus: {},

    // Maximum number of images to keep in cache
    MAX_CACHE_SIZE: 10,

    // Track cache usage order (for LRU eviction)
    cacheOrder: [],

    // Default placeholder image (base64 encoded small gray image)
    placeholderImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDUtMDJUMTI6MzQ6MTAtMDU6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA1LTAyVDEyOjM0OjM3LTA1OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTA1LTAyVDEyOjM0OjM3LTA1OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRkYTBmZjEwLTU5MDEtNDZiYi05NWE0LTliZDQ3YTUxZDVkYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRkYTBmZjEwLTU5MDEtNDZiYi05NWE0LTliZDQ3YTUxZDVkYiIgc3RFdnQ6d2hlbj0iMjAyNC0wNS0wMlQxMjozNDoxMC0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Gy6OrQAABFVJREFUeJzt3U9oHGUcx/HPb2aTbJJNUkHQg4IHD4IHC1J78GDRXrwUehARPAiCeBHEkyAIHjwUehMUwYsXL4J48OJBELRIQRBEqCAIYv9omm6S3ezu/Hx4pnQJu9nZzTPPk+z3DYFuZpP5zXee+c3sbCYyMwIQR9F1AYDrCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAgjkCAOAIB4ggEiCMQII5AgDgCAeIIBIgjECCOQIA4AgHiCASIIxAg7m9U+1fAX3o3WAAAAABJRU5ErkJggg==',

    // Solid color fallback for failed images (gray image with visible borders)
    fallbackImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAMAAABOo35HAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRkYTBmZjEwLTU5MDEtNDZiYi05NWE0LTliZDQ3YTUxZDVkYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ZGEwZmYxMC01OTAxLTQ2YmItOTVhNC05YmQ0N2E1MWQ1ZGIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NGRhMGZmMTAtNTkwMS00NmJiLTk1YTQtOWJkNDdhNTFkNWRiIi8+IDwveG1wTU06RGVyaXZlZEZyb20+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAQABAAAACVJSPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5LL5jE6r1+y2+w2PywUAOw==',

    /**
     * Load an image with fallbacks and error recovery
     * Uses cache if available
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

        // Check if image is already in cache
        if (this.imageCache[photoId]) {
            console.log(`[PhotoLoader] Using cached image for ID: ${photoId}`);
            // Hide the image until it's fully loaded from cache
            imgElement.style.opacity = '0';
            imgElement.src = this.imageCache[photoId];

            // Apply any cached styles (for fallback images)
            if (this.imageCache[photoId + '_style']) {
                const styles = this.imageCache[photoId + '_style'];
                Object.keys(styles).forEach(key => {
                    imgElement.style[key] = styles[key];
                });
            }

            // Use a timeout to ensure the browser has time to process the new src
            setTimeout(() => {
                imgElement.style.opacity = '1';
                if (onSuccess) onSuccess();
            }, 50);
            return;
        }

        // Check if image is currently loading
        if (this.loadingStatus[photoId] === 'loading') {
            console.log(`[PhotoLoader] Image ${photoId} is already loading, waiting...`);
            // Set placeholder but keep it invisible
            imgElement.style.opacity = '0';
            imgElement.src = this.placeholderImage;

            // Set up a polling interval to check when the image is loaded
            const checkInterval = setInterval(() => {
                if (this.loadingStatus[photoId] === 'loaded' && this.imageCache[photoId]) {
                    clearInterval(checkInterval);
                    imgElement.src = this.imageCache[photoId];
                    setTimeout(() => {
                        imgElement.style.opacity = '1';
                        if (onSuccess) onSuccess();
                    }, 50);
                } else if (this.loadingStatus[photoId] === 'failed') {
                    clearInterval(checkInterval);
                    imgElement.src = this.placeholderImage;
                    imgElement.style.opacity = '1';
                    if (onError) onError('Image failed to load');
                }
            }, 100);
            return;
        }

        console.log(`[PhotoLoader] Loading image: ${src} (ID: ${photoId})`);
        this.loadingStatus[photoId] = 'loading';

        // Always add cache busting parameter to force fresh load
        const cacheBustSrc = this.addCacheBustingParam(src);

        // Set placeholder while loading but keep it invisible
        imgElement.style.opacity = '0';
        imgElement.src = this.placeholderImage;

        // Create a new Image object for preloading
        const tempImg = new Image();

        // Set up success handler
        tempImg.onload = () => {
            console.log(`[PhotoLoader] Successfully loaded: ${cacheBustSrc}`);
            // Store in cache with LRU tracking
            this.addToCache(photoId, cacheBustSrc);
            this.loadingStatus[photoId] = 'loaded';
            // Set the image source directly with cache busting
            imgElement.src = cacheBustSrc;
            // Use a timeout to ensure the browser has time to process the new src
            setTimeout(() => {
                imgElement.style.opacity = '1';
                if (onSuccess) onSuccess();
            }, 50);
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
                // Store in cache with LRU tracking
                this.addToCache(photoId, secondAttemptSrc);
                this.loadingStatus[photoId] = 'loaded';
                imgElement.src = secondAttemptSrc;
                // Use a timeout to ensure the browser has time to process the new src
                setTimeout(() => {
                    imgElement.style.opacity = '1';
                    if (onSuccess) onSuccess();
                }, 50);
            };

            secondTempImg.onerror = () => {
                console.error(`[PhotoLoader] Second attempt failed: ${secondAttemptSrc}`);

                // Final fallback - try the original URL without cache busting
                console.log(`[PhotoLoader] Trying original URL as last resort: ${src}`);

                const finalTempImg = new Image();
                finalTempImg.onload = () => {
                    console.log(`[PhotoLoader] Original URL succeeded: ${src}`);
                    // Store in cache with LRU tracking
                    this.addToCache(photoId, src);
                    this.loadingStatus[photoId] = 'loaded';
                    imgElement.src = src;
                    // Use a timeout to ensure the browser has time to process the new src
                    setTimeout(() => {
                        imgElement.style.opacity = '1';
                        if (onSuccess) onSuccess();
                    }, 50);
                };

                finalTempImg.onerror = () => {
                    console.error(`[PhotoLoader] All attempts failed for: ${src}`);
                    this.loadingStatus[photoId] = 'failed';
                    // Use the solid color fallback image instead of placeholder
                    imgElement.src = this.fallbackImage;
                    imgElement.style.opacity = '1';
                    imgElement.style.backgroundColor = '#555'; // Ensure background is visible
                    imgElement.style.border = '1px solid #777'; // Add border for visibility
                    // Store the fallback in cache to prevent future attempts
                    this.addToCache(photoId, this.fallbackImage);
                    // Store the style information in the cache
                    this.addToCache(photoId + '_style', {
                        backgroundColor: '#555',
                        border: '1px solid #777'
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
     * Preload all images in the photo data array
     * @param {Array} photoData - Array of photo objects with file_path and photo_id
     * @param {Function} onComplete - Callback when all images are preloaded
     */
    preloadAllImages: function(photoData, onComplete) {
        if (!photoData || photoData.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        console.log(`[PhotoLoader] Preloading ${photoData.length} images...`);
        let loadedCount = 0;

        // Limit the number of concurrent image loads to prevent memory issues
        const MAX_CONCURRENT_LOADS = 3;
        let activeLoads = 0;
        let queue = [...photoData]; // Create a copy of the array to use as a queue

        // Function to load the next image in the queue
        const loadNextImage = () => {
            if (queue.length === 0) return;
            if (activeLoads >= MAX_CONCURRENT_LOADS) return;

            activeLoads++;
            const photo = queue.shift();
            this.preloadSingleImage(photo, () => {
                activeLoads--;
                loadedCount++;

                // Check if all images are loaded
                if (loadedCount === photoData.length) {
                    console.log('[PhotoLoader] All images preloaded successfully');
                    if (onComplete) onComplete();
                } else {
                    // Load the next image
                    loadNextImage();
                }
            });

            // Start loading more images if we haven't reached the limit
            if (activeLoads < MAX_CONCURRENT_LOADS) {
                loadNextImage();
            }
        };

        // Start the initial batch of image loads
        for (let i = 0; i < Math.min(MAX_CONCURRENT_LOADS, photoData.length); i++) {
            loadNextImage();
        }
    },

    /**
     * Preload a single image
     * @param {Object} photo - Photo object with file_path and photo_id
     * @param {Function} onComplete - Callback when image is loaded or failed
     */
    preloadSingleImage: function(photo, onComplete) {
        // Mark this image as currently loading
        this.loadingStatus[photo.photo_id] = 'loading';

        // Skip if already in cache
        if (this.imageCache[photo.photo_id]) {
            console.log(`[PhotoLoader] Image ${photo.photo_id} already in cache`);
            this.loadingStatus[photo.photo_id] = 'loaded';
            if (onComplete) onComplete();
            return;
        }

        const img = new Image();
        const cacheBustSrc = this.addCacheBustingParam(photo.file_path);

        img.onload = () => {
            // Store in cache with LRU tracking
            this.addToCache(photo.photo_id, cacheBustSrc);
            this.loadingStatus[photo.photo_id] = 'loaded';
            console.log(`[PhotoLoader] Preloaded image ${photo.photo_id}`);
            if (onComplete) onComplete();
        };

        img.onerror = () => {
            // Try with a different cache busting parameter
            const secondAttemptSrc = this.addCacheBustingParam(photo.file_path, true);
            const secondImg = new Image();

            secondImg.onload = () => {
                this.addToCache(photo.photo_id, secondAttemptSrc);
                this.loadingStatus[photo.photo_id] = 'loaded';
                console.log(`[PhotoLoader] Preloaded image ${photo.photo_id} on second attempt`);
                if (onComplete) onComplete();
            };

            secondImg.onerror = () => {
                // Final attempt with original URL
                const finalImg = new Image();

                finalImg.onload = () => {
                    this.addToCache(photo.photo_id, photo.file_path);
                    this.loadingStatus[photo.photo_id] = 'loaded';
                    console.log(`[PhotoLoader] Preloaded image ${photo.photo_id} on final attempt`);
                    if (onComplete) onComplete();
                };

                finalImg.onerror = () => {
                    console.error(`[PhotoLoader] Failed to preload image ${photo.photo_id}`);
                    this.loadingStatus[photo.photo_id] = 'failed';
                    // Store the fallback in cache to prevent future attempts
                    this.addToCache(photo.photo_id, this.fallbackImage);
                    // Add styling information to the cache entry
                    this.addToCache(photo.photo_id + '_style', {
                        backgroundColor: '#555',
                        border: '1px solid #777'
                    });
                    if (onComplete) onComplete();
                };

                finalImg.src = photo.file_path;
            };

            secondImg.src = secondAttemptSrc;
        };

        img.src = cacheBustSrc;
    },

    /**
     * Add an item to the cache with LRU tracking
     * @param {string} key - The cache key
     * @param {*} value - The value to store
     */
    addToCache: function(key, value) {
        // Add or update the cache entry
        this.imageCache[key] = value;

        // Update the LRU tracking
        // Remove the key if it already exists in the order array
        const existingIndex = this.cacheOrder.indexOf(key);
        if (existingIndex !== -1) {
            this.cacheOrder.splice(existingIndex, 1);
        }

        // Add the key to the end of the order array (most recently used)
        this.cacheOrder.push(key);

        // Check if we need to evict items from the cache
        this.enforceCacheLimit();
    },

    /**
     * Enforce the cache size limit by removing least recently used items
     */
    enforceCacheLimit: function() {
        // If we're under the limit, do nothing
        if (this.cacheOrder.length <= this.MAX_CACHE_SIZE) {
            return;
        }

        // Remove items until we're at the limit
        while (this.cacheOrder.length > this.MAX_CACHE_SIZE) {
            const keyToRemove = this.cacheOrder.shift(); // Remove the oldest item

            // Don't remove style entries for images that are still in the cache
            if (keyToRemove.endsWith('_style')) {
                const imageKey = keyToRemove.replace('_style', '');
                if (this.cacheOrder.includes(imageKey)) {
                    // Keep the style entry and put it back at the end
                    this.cacheOrder.push(keyToRemove);
                    continue;
                }
            }

            // Remove the item from the cache
            delete this.imageCache[keyToRemove];
            console.log(`[PhotoLoader] Removed ${keyToRemove} from cache (LRU eviction)`);
        }
    }
};
