/**
 * Exact Icon Replacement
 * This script replaces the workouts icon with the exact same icon used in the other pages
 */

function replaceWorkoutsIcon() {
    console.log('Replacing workouts icon with exact match...');

    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);

            iconContainer.innerHTML = '<i class="fas fa-dumbbell"></i>';

            const iconElement = iconContainer.querySelector('i');
            if (iconElement) {

                iconElement.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                iconElement.style.fontWeight = '900';
                iconElement.style.fontStyle = 'normal';
                iconElement.style.display = 'inline-block';
                iconElement.style.fontSize = '20px';

                iconElement.setAttribute('data-icon', 'f44b');
                
                console.log('Replaced workouts icon with exact match');
            }
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    replaceWorkoutsIcon();

    setTimeout(replaceWorkoutsIcon, 100);
    setTimeout(replaceWorkoutsIcon, 500);
    setTimeout(replaceWorkoutsIcon, 1000);
});

window.addEventListener('load', function() {

    replaceWorkoutsIcon();

    setTimeout(replaceWorkoutsIcon, 100);
    setTimeout(replaceWorkoutsIcon, 500);
    setTimeout(replaceWorkoutsIcon, 1000);
    setTimeout(replaceWorkoutsIcon, 2000);
});

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {

        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, replacing workouts icon...');
                    replaceWorkoutsIcon();
                }
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

for (let i = 1; i <= 10; i++) {
    setTimeout(replaceWorkoutsIcon, i * 1000);
}
