/**
 * Icon Diagnostic Script
 * This script logs detailed information about the bottom navigation icons
 */

function diagnoseIcons() {
    console.log('Running icon diagnostic...');

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    console.log('Found', navItems.length, 'navigation items');

    navItems.forEach((navItem, index) => {

        const href = navItem.getAttribute('href');
        console.log(`Nav item ${index + 1} href:`, href);

        const iconContainer = navItem.querySelector('.nav-icon');
        if (iconContainer) {
            console.log(`Nav item ${index + 1} icon container:`, iconContainer);
            console.log(`Nav item ${index + 1} icon container HTML:`, iconContainer.innerHTML);
            console.log(`Nav item ${index + 1} icon container outerHTML:`, iconContainer.outerHTML);

            const iconElement = iconContainer.querySelector('i');
            if (iconElement) {
                console.log(`Nav item ${index + 1} icon element:`, iconElement);
                console.log(`Nav item ${index + 1} icon element class:`, iconElement.className);
                console.log(`Nav item ${index + 1} icon element outerHTML:`, iconElement.outerHTML);

                const computedStyle = window.getComputedStyle(iconElement);
                console.log(`Nav item ${index + 1} icon element computed font-family:`, computedStyle.fontFamily);
                console.log(`Nav item ${index + 1} icon element computed font-weight:`, computedStyle.fontWeight);
                console.log(`Nav item ${index + 1} icon element computed content:`, computedStyle.content);

                console.log(`Nav item ${index + 1} icon element textContent:`, iconElement.textContent);

                const testElement = document.createElement('i');
                testElement.className = iconElement.className;
                testElement.style.visibility = 'hidden';
                document.body.appendChild(testElement);
                console.log(`Nav item ${index + 1} test element computed content:`, window.getComputedStyle(testElement).content);
                document.body.removeChild(testElement);
            } else {
                console.log(`Nav item ${index + 1} icon element not found`);
            }
        } else {
            console.log(`Nav item ${index + 1} icon container not found`);
        }

        const textElement = navItem.querySelector('span');
        if (textElement) {
            console.log(`Nav item ${index + 1} text:`, textElement.textContent);
        } else {
            console.log(`Nav item ${index + 1} text element not found`);
        }

        console.log('-----------------------------------');
    });

    const fontAwesomeTest = document.createElement('i');
    fontAwesomeTest.className = 'fas fa-dumbbell';
    fontAwesomeTest.style.visibility = 'hidden';
    document.body.appendChild(fontAwesomeTest);
    console.log('Font Awesome dumbbell test computed content:', window.getComputedStyle(fontAwesomeTest).content);
    document.body.removeChild(fontAwesomeTest);

    const styleSheets = document.styleSheets;
    console.log('Number of style sheets:', styleSheets.length);

    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const sheet = styleSheets[i];
            console.log(`Style sheet ${i + 1} href:`, sheet.href);

            if (sheet.href && sheet.href.includes('font-awesome')) {
                console.log(`Found Font Awesome style sheet: ${sheet.href}`);
            }
        } catch (e) {
            console.log(`Error accessing style sheet ${i + 1}:`, e);
        }
    }
}

window.addEventListener('load', function() {

    setTimeout(diagnoseIcons, 1000);
});




