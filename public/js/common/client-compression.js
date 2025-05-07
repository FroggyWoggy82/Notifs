
async function handleClientCompression(event) {
    event.preventDefault();
    console.log('[Client Compression] Starting client-side compression');

    const form = event.target;
    const dateInput = form.querySelector('input[name="date"]');
    const fileInput = form.querySelector('input[type="file"]');
    const statusElement = document.getElementById('upload-status');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!dateInput || !dateInput.value) {
        statusElement.innerHTML = '<div style="color: red;">Please select a date.</div>';
        statusElement.style.display = 'block';
        return;
    }
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        statusElement.innerHTML = '<div style="color: red;">Please select at least one photo.</div>';
        statusElement.style.display = 'block';
        return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`[Client Compression] Detected device type: ${isMobile ? 'mobile' : 'desktop'}`);

    statusElement.style.display = 'block';
    statusElement.innerHTML = `
        <div style="color: #03dac6;">Processing ${fileInput.files.length} file(s)...</div>
        <div style="font-size: 0.8em; margin-top: 5px;">
            Compressing images client-side before upload...
        </div>
    `;
    submitButton.disabled = true;
    
    try {

        const formData = new FormData();
        formData.append('date', dateInput.value);
        formData.append('isMobile', isMobile);

        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const fileSize = (file.size / 1024).toFixed(2); // KB

            statusElement.innerHTML = `
                <div style="color: #03dac6;">Processing file ${i+1} of ${fileInput.files.length}...</div>
                <div style="font-size: 0.8em; margin-top: 5px;">
                    Compressing ${file.name} (${fileSize} KB)
                </div>
            `;

            const compressedBlob = await compressImage(file);
            const compressedSize = (compressedBlob.size / 1024).toFixed(2); // KB
            
            console.log(`[Client Compression] Compressed ${file.name} from ${fileSize}KB to ${compressedSize}KB`);

            const compressedFile = new File([compressedBlob], file.name, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
            });

            formData.append('photos', compressedFile);
        }

        statusElement.innerHTML = `
            <div style="color: #03dac6;">Uploading ${fileInput.files.length} compressed file(s)...</div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                All files compressed to under 800KB. Uploading now...
            </div>
        `;

        const uploadEndpoint = '/api/photos/upload';

        const uploadTimeout = setTimeout(() => {
            statusElement.innerHTML = `
                <div style="color: #f44336;">Upload timed out. Please try again.</div>
                <div style="font-size: 0.8em; margin-top: 5px;">
                    The images were compressed successfully but the upload failed.
                </div>
            `;
            submitButton.disabled = false;
        }, 30000);

        const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData
        });

        clearTimeout(uploadTimeout);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            statusElement.innerHTML = `<div style="color: #03dac6;">Successfully uploaded ${result.photos.length} photo(s)!</div>`;
            console.log('[Client Compression] Upload successful:', result);

            form.reset();

            if (typeof loadPhotos === 'function') {
                loadPhotos();
            }

            setTimeout(() => {
                document.getElementById('photo-upload-modal').style.display = 'none';
                statusElement.textContent = '';
            }, 1500);
        } else {
            statusElement.innerHTML = `<div style="color: #f44336;">Error: ${result.message || 'Unknown error'}</div>`;
        }
    } catch (error) {
        console.error('[Client Compression] Error:', error);
        statusElement.innerHTML = `
            <div style="color: #f44336;">Error: ${error.message || 'Unknown error'}</div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                Please try again with a smaller image.
            </div>
        `;
    } finally {
        submitButton.disabled = false;
    }
}

async function compressImage(file) {
    return new Promise((resolve, reject) => {
        console.log(`[Photo Upload Client] Starting compression for ${file.name}`);

        const reader = new FileReader();
        
        reader.onload = function(event) {

            const img = new Image();
            
            img.onload = function() {

                let maxWidth = 1200;
                let maxHeight = 1200;
                let quality = 0.7; // Default quality (0-1)
                
                const fileSizeKB = file.size / 1024;

                if (fileSizeKB > 3000) { // > 3MB
                    maxWidth = 800;
                    maxHeight = 800;
                    quality = 0.5;
                } else if (fileSizeKB > 1000) { // > 1MB
                    maxWidth = 1000;
                    maxHeight = 1000;
                    quality = 0.6;
                }

                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white'; // Set background to white
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(function(blob) {
                    console.log(`[Photo Upload Client] Compressed ${file.name} from ${(file.size/1024).toFixed(2)}KB to ${(blob.size/1024).toFixed(2)}KB`);

                    if (blob.size > 800 * 1024) {
                        console.log(`[Photo Upload Client] Still too large, applying second-stage compression`);

                        const canvas2 = document.createElement('canvas');
                        canvas2.width = Math.min(600, width);
                        canvas2.height = Math.min(600, height);

                        const ctx2 = canvas2.getContext('2d');
                        ctx2.fillStyle = 'white';
                        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
                        ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);

                        canvas2.toBlob(function(blob2) {
                            console.log(`[Photo Upload Client] Second compression: ${(blob2.size/1024).toFixed(2)}KB`);
                            resolve(blob2);
                        }, 'image/jpeg', 0.3); // Very low quality for second attempt
                    } else {
                        resolve(blob);
                    }
                }, 'image/jpeg', quality);
            };
            
            img.onerror = function() {
                console.error(`[Photo Upload Client] Failed to load image: ${file.name}`);
                reject(new Error('Failed to load image'));
            };

            img.src = event.target.result;
        };
        
        reader.onerror = function() {
            console.error(`[Photo Upload Client] Failed to read file: ${file.name}`);
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}
