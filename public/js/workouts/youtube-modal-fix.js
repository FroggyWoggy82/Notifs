/**
 * YouTube Modal Fix
 * This script ensures the YouTube URL modal is properly styled
 */

(function() {

    function updateYouTubeModalHTML() {

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

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const existingModal = document.getElementById('youtube-url-modal');
        if (existingModal) {
            styleYouTubeModal(existingModal);
        }
    }

    function styleYouTubeModal(modal) {
        console.log('[YouTube Modal Fix] Styling YouTube URL modal');

        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;

        const closeButton = modalContent.querySelector('.close-modal');
        if (closeButton) {

            closeButton.style.position = 'absolute';
            closeButton.style.top = '15px';
            closeButton.style.right = '15px';
            closeButton.style.color = '#ffffff';

            modalContent.insertBefore(closeButton, modalContent.firstChild);
        }

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

        const inputField = modalContent.querySelector('#youtube-url-input');
        if (inputField) {
            inputField.style.backgroundColor = '#333';
            inputField.style.color = '#ffffff';
            inputField.style.border = '1px solid #444';

            inputField.addEventListener('focus', function() {
                this.style.backgroundColor = '#ffffff';
                this.style.color = '#121212';
                this.style.borderColor = '#03dac6';
                this.style.boxShadow = '0 0 0 2px rgba(3, 218, 198, 0.3)';
            });

            inputField.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.backgroundColor = '#333';
                    this.style.color = '#ffffff';
                    this.style.borderColor = '#444';
                    this.style.boxShadow = 'none';
                }
            });
        }

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

    function init() {
        console.log('[YouTube Modal Fix] Initializing...');

        updateYouTubeModalHTML();

        console.log('[YouTube Modal Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
