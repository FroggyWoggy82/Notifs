/**
 * Use Font Awesome Dumbbell
 * This script ensures the workouts tab uses the Font Awesome dumbbell icon instead of an SVG
 */

function useFontAwesomeDumbbell() {
    console.log('Replacing any SVG with Font Awesome dumbbell icon...');

    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);

            const svg = iconContainer.querySelector('svg');
            if (svg) {

                iconContainer.innerHTML = '<i class="fas fa-dumbbell"></i>';
                console.log('Replaced SVG with Font Awesome icon');
            }

            const icon = iconContainer.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-dumbbell';
                icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                icon.style.fontWeight = '900';
                icon.style.fontStyle = 'normal';
                icon.style.display = 'inline-block';
                icon.style.fontSize = '20px';
                console.log('Styled Font Awesome icon');
            }
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    useFontAwesomeDumbbell();

    setTimeout(useFontAwesomeDumbbell, 100);
    setTimeout(useFontAwesomeDumbbell, 500);
    setTimeout(useFontAwesomeDumbbell, 1000);
});

window.addEventListener('load', function() {

    useFontAwesomeDumbbell();

    setTimeout(useFontAwesomeDumbbell, 100);
    setTimeout(useFontAwesomeDumbbell, 500);
    setTimeout(useFontAwesomeDumbbell, 1000);
    setTimeout(useFontAwesomeDumbbell, 2000);
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
                    console.log('Bottom navigation was added to the DOM, replacing any SVG with Font Awesome icon...');
                    useFontAwesomeDumbbell();
                }
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

for (let i = 1; i <= 10; i++) {
    setTimeout(useFontAwesomeDumbbell, i * 1000);
}

console.log('Use Font Awesome dumbbell script loaded');
