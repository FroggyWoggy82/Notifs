


document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar button style fix loaded');

    function overrideButtonStyles() {

        const editButtons = document.querySelectorAll('#selectedTaskList .edit-task-btn');
        const deleteButtons = document.querySelectorAll('#selectedTaskList .delete-btn');

        editButtons.forEach(button => {

            button.style.removeProperty('background');
            button.style.removeProperty('border');
            button.style.removeProperty('box-shadow');
        });

        deleteButtons.forEach(button => {

            button.style.removeProperty('background');
            button.style.removeProperty('border');
            button.style.removeProperty('box-shadow');
        });
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {

            if (mutation.addedNodes.length) {

                mutation.addedNodes.forEach(node => {

                    if (node.nodeType === 1) {

                        if ((node.classList && (node.classList.contains('edit-task-btn') || node.classList.contains('delete-btn')))) {
                            overrideButtonStyles();
                        }

                        else if (node.querySelectorAll) {
                            const buttons = node.querySelectorAll('.edit-task-btn, .delete-btn');
                            if (buttons.length) {
                                overrideButtonStyles();
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    overrideButtonStyles();
});
