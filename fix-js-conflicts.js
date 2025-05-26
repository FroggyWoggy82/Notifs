#!/usr/bin/env node

/**
 * JavaScript Conflict Fixer
 *
 * This script fixes variable naming conflicts in the bundled JavaScript file
 * by making variable names unique across different file sections.
 */

const fs = require('fs');
const path = require('path');

function fixVariableConflicts() {
    const bundlePath = path.join(__dirname, 'public', 'js', 'bundle.js');
    let bundleContent = fs.readFileSync(bundlePath, 'utf8');

    console.log('Fixing variable conflicts in bundle.js...');

    // Track which file section we're in and make variables unique
    let fileCounter = 0;
    let currentFileSection = '';

    // Split by file headers to process each section separately
    const sections = bundleContent.split(/\/\* ========================================== \*\/\n\/\* File: ([^*]+) \*\/\n\/\* ========================================== \*\//);

    let fixedContent = sections[0]; // Keep the initial header

    for (let i = 1; i < sections.length; i += 2) {
        const fileName = sections[i];
        const fileContent = sections[i + 1];
        fileCounter++;

        console.log(`Processing section ${fileCounter}: ${fileName}`);

        // Make variable names unique by adding file counter suffix
        // Only replace const declarations and their immediate usage within the same scope
        let processedContent = fileContent;

        // Replace const declarations and track what we replaced
        const replacements = [];

        // Find and replace const allElements declarations
        processedContent = processedContent.replace(/\bconst allElements\b/g, (match, offset) => {
            const replacement = `const allElements_${fileCounter}`;
            replacements.push({ original: 'allElements', replacement: `allElements_${fileCounter}`, offset });
            return replacement;
        });

        // Replace usage of allElements only after const declarations
        if (replacements.some(r => r.original === 'allElements')) {
            processedContent = processedContent.replace(/\ballElements\b(?!\w)/g, `allElements_${fileCounter}`);
        }

        // Add the section back
        fixedContent += `/* ========================================== */\n/* File: ${fileName} */\n/* ========================================== */`;
        fixedContent += processedContent;
    }

    // Write the fixed bundle
    fs.writeFileSync(bundlePath, fixedContent, 'utf8');

    console.log(`\nVariable conflicts fixed successfully!`);
    console.log(`Processed ${fileCounter} file sections`);
    console.log(`Fixed bundle size: ${(fixedContent.length / 1024).toFixed(2)} KB`);

    return bundlePath;
}

// Main execution
if (require.main === module) {
    try {
        fixVariableConflicts();
        console.log('\n✅ JavaScript conflict fixing completed successfully!');
    } catch (error) {
        console.error('\n❌ JavaScript conflict fixing failed:', error.message);
        process.exit(1);
    }
}

module.exports = { fixVariableConflicts };
