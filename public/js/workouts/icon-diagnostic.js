/**
 * Icon Diagnostic Script
 * This script logs detailed information about the bottom navigation icons
 */

// Function to diagnose the icons
function diagnoseIcons() {
    console.log('Running icon diagnostic...');

    // Find all navigation items
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    console.log('Found', navItems.length, 'navigation items');

    // Loop through each navigation item
    navItems.forEach((navItem, index) => {
        // Get the href attribute
        const href = navItem.getAttribute('href');
        console.log(`Nav item ${index + 1} href:`, href);

        // Find the icon container
        const iconContainer = navItem.querySelector('.nav-icon');
        if (iconContainer) {
            console.log(`Nav item ${index + 1} icon container:`, iconContainer);
            console.log(`Nav item ${index + 1} icon container HTML:`, iconContainer.innerHTML);
            console.log(`Nav item ${index + 1} icon container outerHTML:`, iconContainer.outerHTML);

            // Find the icon element
            const iconElement = iconContainer.querySelector('i');
            if (iconElement) {
                console.log(`Nav item ${index + 1} icon element:`, iconElement);
                console.log(`Nav item ${index + 1} icon element class:`, iconElement.className);
                console.log(`Nav item ${index + 1} icon element outerHTML:`, iconElement.outerHTML);

                // Get computed styles
                const computedStyle = window.getComputedStyle(iconElement);
                console.log(`Nav item ${index + 1} icon element computed font-family:`, computedStyle.fontFamily);
                console.log(`Nav item ${index + 1} icon element computed font-weight:`, computedStyle.fontWeight);
                console.log(`Nav item ${index + 1} icon element computed content:`, computedStyle.content);

                // Check if the icon is using a different Unicode character
                console.log(`Nav item ${index + 1} icon element textContent:`, iconElement.textContent);

                // Create a test element to see what character is rendered
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

        // Find the text element
        const textElement = navItem.querySelector('span');
        if (textElement) {
            console.log(`Nav item ${index + 1} text:`, textElement.textContent);
        } else {
            console.log(`Nav item ${index + 1} text element not found`);
        }

        console.log('-----------------------------------');
    });

    // Check if Font Awesome is loaded correctly
    const fontAwesomeTest = document.createElement('i');
    fontAwesomeTest.className = 'fas fa-dumbbell';
    fontAwesomeTest.style.visibility = 'hidden';
    document.body.appendChild(fontAwesomeTest);
    console.log('Font Awesome dumbbell test computed content:', window.getComputedStyle(fontAwesomeTest).content);
    document.body.removeChild(fontAwesomeTest);

    // Check if there are any other Font Awesome versions loaded
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

// Run the diagnostic when the page is fully loaded
window.addEventListener('load', function() {
    // Wait a bit to ensure everything is loaded
    setTimeout(diagnoseIcons, 1000);
});

// Diagnostic button removed as requested
// The diagnostic function is still available for console use if needed
// To run the diagnostic manually, open the browser console and type:
// diagnoseIcons();
