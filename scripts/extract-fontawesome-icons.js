#!/usr/bin/env node

/**
 * Font Awesome Icon Extractor
 * 
 * This script extracts only the Font Awesome icons actually used in the application
 * and creates a minimal CSS file to self-host them, eliminating the external CDN dependency.
 */

const fs = require('fs');
const path = require('path');

// List of all Font Awesome icons used in the application (extracted from HTML analysis)
const usedIcons = [
    // Navigation icons
    'fa-bars',
    'fa-check',
    'fa-star', 
    'fa-calendar-alt',
    'fa-stopwatch',
    'fa-utensils',
    'fa-book',
    'fa-flask',
    'fa-cog',
    'fa-dumbbell',
    
    // UI icons
    'fa-bell',
    'fa-chevron-down',
    'fa-chevron-left',
    'fa-chevron-right',
    'fa-plus',
    'fa-plus-circle',
    'fa-times',
    'fa-save',
    'fa-edit',
    'fa-trash',
    'fa-share',
    'fa-heart',
    'fa-camera',
    'fa-undo',
    
    // Dashboard icons
    'fa-bolt',
    'fa-temperature-high',
    'fa-route',
    'fa-tachometer-alt',
    
    // Journal specific icons
    'fa-tasks',
    'fa-sync-alt',
    'fa-bullseye',
    'fa-calendar-day',
    'fa-chart-line',
    'fa-chart-bar',
    'fa-rocket',
    
    // Weekly recap icons
    'fa-calendar-check'
];

// Font Awesome icon Unicode mappings (Font Awesome 6 Free Solid)
const iconUnicodes = {
    'fa-bars': '\\f0c9',
    'fa-check': '\\f00c',
    'fa-star': '\\f005',
    'fa-calendar-alt': '\\f073',
    'fa-stopwatch': '\\f2f2',
    'fa-utensils': '\\f2e7',
    'fa-book': '\\f02d',
    'fa-flask': '\\f0c3',
    'fa-cog': '\\f013',
    'fa-dumbbell': '\\f44b',
    'fa-bell': '\\f0f3',
    'fa-chevron-down': '\\f078',
    'fa-chevron-left': '\\f053',
    'fa-chevron-right': '\\f054',
    'fa-plus': '\\f067',
    'fa-plus-circle': '\\f055',
    'fa-times': '\\f00d',
    'fa-save': '\\f0c7',
    'fa-edit': '\\f044',
    'fa-trash': '\\f1f8',
    'fa-share': '\\f064',
    'fa-heart': '\\f004',
    'fa-camera': '\\f030',
    'fa-undo': '\\f0e2',
    'fa-bolt': '\\f0e7',
    'fa-temperature-high': '\\f769',
    'fa-route': '\\f4d7',
    'fa-tachometer-alt': '\\f3fd',
    'fa-tasks': '\\f0ae',
    'fa-sync-alt': '\\f2f1',
    'fa-bullseye': '\\f140',
    'fa-calendar-day': '\\f783',
    'fa-chart-line': '\\f201',
    'fa-chart-bar': '\\f080',
    'fa-rocket': '\\f135',
    'fa-calendar-check': '\\f274'
};

// Generate minimal Font Awesome CSS
function generateMinimalFontAwesome() {
    let css = `/**
 * Minimal Font Awesome CSS for PWA Performance Optimization
 * Generated on: ${new Date().toISOString()}
 * 
 * This file contains only the Font Awesome icons actually used in the application
 * to eliminate external CDN dependency and improve loading performance.
 * 
 * Icons included: ${usedIcons.length} out of 2000+ available icons
 */

/* Font Awesome Base Styles */
.fa, .fas, .far, .fal, .fab {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    line-height: 1;
}

/* Font Awesome Solid Weight */
.fas {
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
}

/* Individual Icon Styles */
`;

    // Add CSS rules for each used icon
    usedIcons.forEach(icon => {
        const unicode = iconUnicodes[icon];
        if (unicode) {
            css += `.fa-${icon.replace('fa-', '')}::before {\n    content: "${unicode}";\n}\n\n`;
        } else {
            console.warn(`Warning: Unicode not found for icon ${icon}`);
        }
    });

    return css;
}

// Create the minimal Font Awesome CSS file
function createMinimalFontAwesome() {
    const css = generateMinimalFontAwesome();
    const outputPath = path.join(__dirname, 'public', 'css', 'fontawesome-minimal.css');
    
    fs.writeFileSync(outputPath, css, 'utf8');
    
    console.log(`\nMinimal Font Awesome CSS created successfully!`);
    console.log(`Output: ${outputPath}`);
    console.log(`Icons included: ${usedIcons.length}`);
    console.log(`File size: ${(css.length / 1024).toFixed(2)} KB`);
    console.log(`\nIcons included:`);
    usedIcons.forEach(icon => console.log(`  - ${icon}`));
    
    return outputPath;
}

// Main execution
if (require.main === module) {
    try {
        createMinimalFontAwesome();
        console.log('\n✅ Font Awesome icon extraction completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Replace the external Font Awesome CDN link with the local CSS file');
        console.log('2. Test that all icons display correctly');
        console.log('3. Remove the external CDN dependency');
    } catch (error) {
        console.error('\n❌ Font Awesome icon extraction failed:', error.message);
        process.exit(1);
    }
}

module.exports = { createMinimalFontAwesome, usedIcons, iconUnicodes };
