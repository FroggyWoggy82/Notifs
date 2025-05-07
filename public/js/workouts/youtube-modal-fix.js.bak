/**
 * YouTube Modal Fix
 * This script ensures the YouTube URL modal is properly styled
 */

(function() {
    // Function to update the YouTube URL modal HTML
    function updateYouTubeModalHTML() {
        // Find the existing modal or wait for it to be created
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.id === 'youtube-url-modal') {
                            styleYouTubeModal(node);
                            observer.disconnect();
                        }
                    });
                }
            });
        });

        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also check if the modal already exists
        const existingModal = document.getElementById('youtube-url-modal');
        if (existingModal) {
            styleYouTubeModal(existingModal);
        }
    }

    // Function to style the YouTube URL modal
    function styleYouTubeModal(modal) {
        console.log('[YouTube Modal Fix] Styling YouTube URL modal');

        // Get the modal content
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;

        // Update the close button position
        const closeButton = modalContent.querySelector('.close-modal');
        if (closeButton) {
            // Move the close button to the top right
            closeButton.style.position = 'absolute';
            closeButton.style.top = '15px';
            closeButton.style.right = '15px';
            closeButton.style.color = '#ffffff';

            // Make sure it's the first child of the modal content
            modalContent.insertBefore(closeButton, modalContent.firstChild);
        }

        // Style the buttons
        const saveButton = modalContent.querySelector('#save-youtube-url');
        if (saveButton) {
            saveButton.style.backgroundColor = '#ffffff';
            saveButton.style.color = '#121212';
        }

        const cancelButton = modalContent.querySelector('#cancel-youtube-url');
        if (cancelButton) {
            cancelButton.style.backgroundColor = '#ffffff';
            cancelButton.style.color = '#121212';
        }

        // Style the input field
        const inputField = modalContent.querySelector('#youtube-url-input');
        if (inputField) {
            inputField.style.backgroundColor = '#333';
            inputField.style.color = '#ffffff';
            inputField.style.border = '1px solid #444';

            // Add focus event listener to change background to white
            inputField.addEventListener('focus', function() {
                this.style.backgroundColor = '#ffffff';
                this.style.color = '#121212';
                this.style.borderColor = '#03dac6';
                this.style.boxShadow = '0 0 0 2px rgba(3, 218, 198, 0.3)';
            });

            // Add blur event listener to revert back if empty
            inputField.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.backgroundColor = '#333';
                    this.style.color = '#ffffff';
                    this.style.borderColor = '#444';
                    this.style.boxShadow = 'none';
                }
            });
        }

        // Style the text
        const title = modalContent.querySelector('h3');
        if (title) {
            title.style.color = '#ffffff';
            title.style.textAlign = 'left';
        }

        const paragraph = modalContent.querySelector('p');
        if (paragraph) {
            paragraph.style.color = '#ffffff';
            paragraph.style.textAlign = 'left';
        }
    }

    // Initialize when the DOM is ready
    function init() {
        console.log('[YouTube Modal Fix] Initializing...');

        // Update the YouTube URL modal HTML
        updateYouTubeModalHTML();

        console.log('[YouTube Modal Fix] Initialized');
    }

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
