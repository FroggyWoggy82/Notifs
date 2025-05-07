/**
 * Fix Dumbbell Icon
 * This script specifically targets and replaces the dumbbell icon in the workouts tab
 */

function fixDumbbellIcon() {
    console.log('Fixing dumbbell icon...');

    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);


            iconContainer.innerHTML = '';

            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-dumbbell';
            newIcon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            newIcon.style.fontWeight = '900';
            newIcon.style.fontStyle = 'normal';
            newIcon.style.display = 'inline-block';
            newIcon.style.fontSize = '20px';

            iconContainer.appendChild(newIcon);
            console.log('Replaced icon container content with new element');
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    fixDumbbellIcon();

    setTimeout(fixDumbbellIcon, 100);
    setTimeout(fixDumbbellIcon, 500);
    setTimeout(fixDumbbellIcon, 1000);
});

window.addEventListener('load', function() {

    fixDumbbellIcon();

    setTimeout(fixDumbbellIcon, 100);
    setTimeout(fixDumbbellIcon, 500);
    setTimeout(fixDumbbellIcon, 1000);
    setTimeout(fixDumbbellIcon, 2000);
});

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {

        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, fixing dumbbell icon...');
                    fixDumbbellIcon();
                }
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

for (let i = 1; i <= 10; i++) {
    setTimeout(fixDumbbellIcon, i * 1000);
}
