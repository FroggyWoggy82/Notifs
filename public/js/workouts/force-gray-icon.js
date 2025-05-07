/**
 * Workouts Icon Styling
 * This script ensures the workouts icon has the same styling as other pages
 */

function styleWorkoutsIcon() {
    console.log('Styling workouts icon...');

    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        const isActive = workoutsTab.classList.contains('active');

        workoutsTab.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

        const icon = workoutsTab.querySelector('.nav-icon i');
        if (icon) {
            console.log('Found icon:', icon);

            icon.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

            icon.className = 'fas fa-dumbbell';

            icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            icon.style.fontWeight = '900';
            icon.style.fontStyle = 'normal';

            console.log('Styled workouts icon');
        }

        const text = workoutsTab.querySelector('span');
        if (text) {
            console.log('Found text:', text);

            text.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

            text.textContent = 'Workouts';

            text.style.textTransform = 'none';

            console.log('Styled workouts text');
        }

        if (isActive) {

            let highlightLine = workoutsTab.querySelector('.highlight-line');
            if (!highlightLine) {
                highlightLine = document.createElement('div');
                highlightLine.className = 'highlight-line';
                highlightLine.style.position = 'absolute';
                highlightLine.style.bottom = '0';
                highlightLine.style.left = '0';
                highlightLine.style.width = '100%';
                highlightLine.style.height = '2px';
                highlightLine.style.backgroundColor = '#FFFFFF';
                highlightLine.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
                workoutsTab.appendChild(highlightLine);
            }
        }
    } else {
        console.log('Workouts tab not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    styleWorkoutsIcon();

    setTimeout(styleWorkoutsIcon, 100);
    setTimeout(styleWorkoutsIcon, 500);
    setTimeout(styleWorkoutsIcon, 1000);
});

window.addEventListener('load', function() {

    styleWorkoutsIcon();

    setTimeout(styleWorkoutsIcon, 100);
    setTimeout(styleWorkoutsIcon, 500);
    setTimeout(styleWorkoutsIcon, 1000);
});

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {

        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (
                    (node.classList && node.classList.contains('bottom-nav')) ||
                    (node.querySelector && node.querySelector('.bottom-nav'))
                )) {
                    console.log('Bottom navigation was added to the DOM, styling workouts icon...');
                    styleWorkoutsIcon();
                }
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('Workouts icon styling script loaded');
