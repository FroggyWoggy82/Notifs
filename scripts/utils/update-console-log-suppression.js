/**
 * Update Console Log Suppression
 * 
 * This script updates all HTML files to include the console log suppression system.
 * It adds the console-log-suppressor.js and console-log-helper.js scripts to the head
 * of each HTML file.
 */

const fs = require('fs');
const path = require('path');

// Directories to search for HTML files
const directories = [
    path.join(__dirname, 'public'),
    path.join(__dirname, 'public', 'pages')
];

// Files to update
const htmlFiles = [];

// Find all HTML files
directories.forEach(dir => {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                htmlFiles.push(path.join(dir, file));
            }
        });
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
});

console.log(`Found ${htmlFiles.length} HTML files to update`);

// Update each HTML file
htmlFiles.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if the file already has the console log suppressor
        if (content.includes('console-log-suppressor.js')) {
            console.log(`${filePath} already has console log suppressor`);
            
            // Update to use the new version if it's using the old one
            if (content.includes('food/console-log-suppressor.js')) {
                content = content.replace(
                    /<script src=".*?food\/console-log-suppressor.js"><\/script>/,
                    '<script src="../js/console-log-suppressor.js"></script>\n    <script src="../js/console-log-helper.js"></script>'
                );
                console.log(`Updated ${filePath} to use new console log suppressor`);
            }
        } else {
            // Add the console log suppressor to the head
            const headEndIndex = content.indexOf('</head>');
            if (headEndIndex !== -1) {
                // Determine the correct path based on the file location
                let scriptPath = '';
                if (filePath.includes('public\\pages')) {
                    scriptPath = '../js/';
                } else {
                    scriptPath = 'js/';
                }
                
                const suppressorScript = `
    <!-- Console log suppressor - load this first to suppress console logs -->
    <script src="${scriptPath}console-log-suppressor.js"></script>
    <script src="${scriptPath}console-log-helper.js"></script>
`;
                
                content = content.slice(0, headEndIndex) + suppressorScript + content.slice(headEndIndex);
                console.log(`Added console log suppressor to ${filePath}`);
            } else {
                console.warn(`Could not find </head> in ${filePath}`);
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
});

console.log('Update complete');
