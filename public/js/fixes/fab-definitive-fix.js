/**
 * FAB Nuclear Fix
 *
 * This script WILL make the FAB work no matter what
 */

(function() {
    'use strict';

    console.log('[FAB Nuclear Fix] Initializing...');

    // Function to set up modal click interceptors - moved to global scope
    function setupModalClickInterceptors() {
        console.log('[FAB Nuclear Fix] Setting up click interceptors');

        const addTaskModal = document.getElementById('addTaskModal');
        if (!addTaskModal) {
            console.error('[FAB Nuclear Fix] Modal not found for click interceptors');
            return;
        }

        // Direct modal click handler
        addTaskModal.onclick = function(e) {
            if (e.target === addTaskModal) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[FAB Nuclear Fix] DIRECT onclick backdrop');
                nuclearCloseModal();
            }
        };

        // Global click interceptor
        const globalClickHandler = function(e) {
            const modalVisible = addTaskModal.style.display !== 'none' &&
                               addTaskModal.style.display !== '' &&
                               addTaskModal.style.visibility !== 'hidden';

            if (modalVisible) {
                const modalContent = addTaskModal.querySelector('.modal-content');
                const closeButton = addTaskModal.querySelector('.close-button');

                // Allow clicks ONLY on modal content and close button
                if (!modalContent.contains(e.target) && !closeButton.contains(e.target)) {
                    // KILL THIS CLICK COMPLETELY
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('[FAB Nuclear Fix] KILLING CLICK - closing modal');

                    // Remove this handler to prevent interference
                    document.removeEventListener('click', globalClickHandler, true);
                    document.body.removeEventListener('click', bodyClickHandler, true);

                    nuclearCloseModal();
                    return false;
                }
            }
        };

        // Body click interceptor
        const bodyClickHandler = function(e) {
            const modalVisible = addTaskModal.style.display !== 'none' &&
                               addTaskModal.style.display !== '' &&
                               addTaskModal.style.visibility !== 'hidden';

            if (modalVisible) {
                const modalContent = addTaskModal.querySelector('.modal-content');
                const closeButton = addTaskModal.querySelector('.close-button');

                // Allow clicks ONLY on modal content and close button
                if (!modalContent.contains(e.target) && !closeButton.contains(e.target)) {
                    // KILL THIS CLICK COMPLETELY
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('[FAB Nuclear Fix] BODY KILLING CLICK - closing modal');

                    // Remove handlers to prevent interference
                    document.removeEventListener('click', globalClickHandler, true);
                    document.body.removeEventListener('click', bodyClickHandler, true);

                    nuclearCloseModal();
                    return false;
                }
            }
        };

        // Add the event listeners
        document.addEventListener('click', globalClickHandler, true);
        document.body.addEventListener('click', bodyClickHandler, true);
    }

    function nuclearOpenModal() {
        console.log('[FAB Nuclear Fix] NUCLEAR MODAL OPENING');

        const addTaskModal = document.getElementById('addTaskModal');
        if (addTaskModal) {
            // NUCLEAR OPTION: Use cssText to override everything
            addTaskModal.style.cssText = `
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background-color: rgba(0, 0, 0, 0.8) !important;
                z-index: 999999 !important;
                align-items: center !important;
                justify-content: center !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            `;

            // Set up click interceptors AFTER modal is opened
            setTimeout(() => {
                setupModalClickInterceptors();
            }, 300);

            // Force modal content visible with cssText
            const modalContent = addTaskModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.cssText = `
                    display: block !important;
                    background-color: #1a1a1a !important;
                    color: #fff !important;
                    padding: 20px !important;
                    border-radius: 8px !important;
                    border: 1px solid #333 !important;
                    max-width: 500px !important;
                    width: 90% !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    z-index: 1000000 !important;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
                `;

                // Force close button to be clickable
                const closeBtn = modalContent.querySelector('.close-button');
                if (closeBtn) {
                    closeBtn.style.cssText = `
                        position: absolute !important;
                        top: 10px !important;
                        right: 15px !important;
                        z-index: 9999999 !important;
                        cursor: pointer !important;
                        font-size: 20px !important;
                        color: #fff !important;
                        background: rgba(255, 0, 0, 0.8) !important;
                        border: 2px solid #fff !important;
                        padding: 8px !important;
                        line-height: 1 !important;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        width: 30px !important;
                        height: 30px !important;
                        border-radius: 50% !important;
                        text-align: center !important;
                        pointer-events: auto !important;
                    `;
                }
            }

            // Add classes
            addTaskModal.classList.add('modal-visible');

            // Prevent background scrolling
            document.body.style.overflow = 'hidden';

            // Reset form if it exists
            const addTaskForm = document.getElementById('addTaskForm');
            if (addTaskForm) {
                addTaskForm.reset();
            }

            // Clear any status messages
            const addTaskStatusDiv = document.getElementById('addTaskStatus');
            if (addTaskStatusDiv) {
                addTaskStatusDiv.textContent = '';
                addTaskStatusDiv.className = 'status';
            }

            console.log('[FAB Nuclear Fix] Modal NUKED open successfully');
            return true;
        }
        return false;
    }

    function nuclearCloseModal() {
        console.log('[FAB Nuclear Fix] NUCLEAR MODAL CLOSING');

        const addTaskModal = document.getElementById('addTaskModal');
        if (addTaskModal) {
            // NUCLEAR CLOSE: Hide the modal completely
            addTaskModal.style.cssText = `
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            `;

            addTaskModal.classList.remove('modal-visible');
            addTaskModal.onclick = null; // Remove direct click handler

            // Restore background scrolling
            document.body.style.overflow = '';

            console.log('[FAB Nuclear Fix] Modal NUKED closed successfully');
            return true;
        }
        return false;
    }

    function setupNuclearCloseHandlers() {
        const addTaskModal = document.getElementById('addTaskModal');
        if (!addTaskModal) return;

        // NUCLEAR Close button handler - multiple approaches
        const closeBtn = addTaskModal.querySelector('.close-button');
        if (closeBtn) {
            // Remove existing listeners by cloning
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

            // Multiple event listeners for close button
            function closeHandler(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[FAB Nuclear Fix] Close button clicked');
                nuclearCloseModal();
            }

            newCloseBtn.addEventListener('click', closeHandler, true);
            newCloseBtn.addEventListener('mousedown', closeHandler, true);
            newCloseBtn.addEventListener('touchstart', closeHandler, true);
            newCloseBtn.addEventListener('pointerdown', closeHandler, true);
        }

        // NUCLEAR Backdrop click handler - prevent task edit modals from opening
        addTaskModal.addEventListener('click', function(e) {
            // If clicking on the modal backdrop (not the content)
            if (e.target === addTaskModal) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[FAB Nuclear Fix] Backdrop clicked');
                nuclearCloseModal();
            }
        }, true);



        // NUCLEAR Global click interceptor for close button
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('close-button')) {
                const modal = e.target.closest('#addTaskModal');
                if (modal) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('[FAB Nuclear Fix] Global close button interceptor');
                    nuclearCloseModal();
                }
            }
        }, true);

        // NUCLEAR Body click interceptor for close button
        document.body.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('close-button')) {
                const modal = e.target.closest('#addTaskModal');
                if (modal) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('[FAB Nuclear Fix] Body close button interceptor');
                    nuclearCloseModal();
                }
            }
        }, true);

        // Escape key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modalVisible = addTaskModal.style.display !== 'none' &&
                                   addTaskModal.style.display !== '' &&
                                   addTaskModal.style.visibility !== 'hidden';
                if (modalVisible) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[FAB Nuclear Fix] Escape key pressed');
                    nuclearCloseModal();
                }
            }
        }, true);

        console.log('[FAB Nuclear Fix] Nuclear close handlers set up');
    }

    function setupFAB() {
        const addTaskFab = document.getElementById('addTaskFab');
        const addTaskModal = document.getElementById('addTaskModal');

        if (!addTaskFab || !addTaskModal) {
            console.log('[FAB Definitive Fix] FAB or modal not found, retrying...');
            setTimeout(setupFAB, 500);
            return;
        }

        console.log('[FAB Nuclear Fix] Found FAB and modal, setting up...');

        // NUCLEAR OPTION: Remove all existing event listeners by cloning
        const newFab = addTaskFab.cloneNode(true);
        addTaskFab.parentNode.replaceChild(newFab, addTaskFab);

        // Add nuclear click handler
        function nuclearHandleFabClick(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            console.log('[FAB Nuclear Fix] FAB clicked - NUKING modal open');
            nuclearOpenModal();
        }

        // Add multiple event listeners
        newFab.addEventListener('click', nuclearHandleFabClick, true);
        newFab.addEventListener('mousedown', nuclearHandleFabClick, true);
        newFab.addEventListener('touchstart', nuclearHandleFabClick, true);
        newFab.addEventListener('pointerdown', nuclearHandleFabClick, true);

        // NUCLEAR global click interceptor
        document.addEventListener('click', function(e) {
            if (e.target && (e.target.id === 'addTaskFab' || e.target.closest('#addTaskFab'))) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[FAB Nuclear Fix] Global interceptor NUKING modal open');
                nuclearOpenModal();
            }
        }, true);

        // BACKUP: Also listen on the document body
        document.body.addEventListener('click', function(e) {
            if (e.target && (e.target.id === 'addTaskFab' || e.target.closest('#addTaskFab'))) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[FAB Nuclear Fix] Body interceptor NUKING modal open');
                nuclearOpenModal();
            }
        }, true);

        // Set up modal close handlers
        const closeBtn = addTaskModal.querySelector('.close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                addTaskModal.style.display = 'none';
                addTaskModal.classList.remove('modal-visible');
                document.body.style.overflow = '';
            });
        }

        // Close on backdrop click
        addTaskModal.addEventListener('click', function(e) {
            if (e.target === addTaskModal) {
                addTaskModal.style.display = 'none';
                addTaskModal.classList.remove('modal-visible');
                document.body.style.overflow = '';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && addTaskModal.style.display === 'flex') {
                addTaskModal.style.display = 'none';
                addTaskModal.classList.remove('modal-visible');
                document.body.style.overflow = '';
            }
        });

        // Set up nuclear modal close handlers
        setupNuclearCloseHandlers();

        console.log('[FAB Nuclear Fix] Setup complete');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(setupFAB, 100);
            setTimeout(setupFAB, 500);
            setTimeout(setupFAB, 1000);
            setTimeout(setupFAB, 2000);
            setTimeout(setupFAB, 3000);
            setTimeout(setupFAB, 5000);
        });
    } else {
        setTimeout(setupFAB, 100);
        setTimeout(setupFAB, 500);
        setTimeout(setupFAB, 1000);
        setTimeout(setupFAB, 2000);
        setTimeout(setupFAB, 3000);
        setTimeout(setupFAB, 5000);
    }

    // Keep trying to override other scripts
    setInterval(setupFAB, 10000);

})();
