// JavaScript for custom form elements

// Update file name display when files are selected
document.addEventListener('DOMContentLoaded', function() {
    // Find all file inputs with custom styling
    const fileInputs = document.querySelectorAll('.custom-file-input input[type="file"]');

    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileNameDisplay = this.parentElement.querySelector('.file-name-display');

            if (fileNameDisplay) {
                if (this.files.length === 0) {
                    fileNameDisplay.textContent = 'No file chosen';
                } else if (this.files.length === 1) {
                    fileNameDisplay.textContent = this.files[0].name;
                } else {
                    fileNameDisplay.textContent = `${this.files.length} files selected`;
                }
            }

            // Also update the file size display if it exists
            if (typeof displayFileSize === 'function') {
                displayFileSize(this);
            }
        });
    });
});

// Function to display file size - make it globally available
window.displayFileSize = function(fileInput) {
    const fileSizeInfo = document.getElementById('file-size-info');
    const fileSizeDisplay = document.getElementById('file-size-display');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (!fileSizeInfo || !fileSizeDisplay) return;

    // Update file name display if it exists
    if (fileNameDisplay) {
        if (fileInput.files.length === 0) {
            fileNameDisplay.textContent = 'No file chosen';
        } else if (fileInput.files.length === 1) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = `${fileInput.files.length} files selected`;
        }
    }

    if (fileInput.files.length === 0) {
        fileSizeInfo.style.display = 'none';
        return;
    }

    let totalSize = 0;
    let sizeDetails = '';

    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const sizeKB = (file.size / 1024).toFixed(2);
        totalSize += file.size;

        if (fileInput.files.length <= 3) {
            sizeDetails += `<div>${file.name}: ${sizeKB} KB</div>`;
        }
    }

    const totalSizeKB = (totalSize / 1024).toFixed(2);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    let sizeHTML = '';

    if (fileInput.files.length === 1) {
        sizeHTML = `<div>${fileInput.files[0].name}: ${totalSizeKB} KB</div>`;
    } else {
        sizeHTML = `<div>Total size: ${totalSizeMB} MB (${fileInput.files.length} files)</div>`;
        if (sizeDetails) {
            sizeHTML += sizeDetails;
        }
    }

    // Add warning for large files
    if (totalSize > 5 * 1024 * 1024) { // > 5MB
        sizeHTML += `<div style="color: #ff9800; margin-top: 5px;">
            <strong>Note:</strong> Large files will be automatically compressed before upload.
        </div>`;
    }

    fileSizeDisplay.innerHTML = sizeHTML;
    fileSizeInfo.style.display = 'block';
};
