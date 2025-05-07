/**
 * Identify Unused Functions
 * 
 * This script analyzes JavaScript files to identify functions that are defined
 * but never called within the codebase.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('acorn');
const { simple } = require('acorn-walk');

// Configuration
const config = {
    // Directories to scan for JavaScript files
    directories: [
        path.join(__dirname, 'public', 'js'),
        path.join(__dirname, 'public', 'js', 'food')
    ],
    
    // Files to exclude from the analysis
    excludeFiles: [
        'console-log-suppressor.js',
        'console-log-helper.js',
        'remove-deprecated-code.js',
        'clean-food-html.js',
        'identify-unused-files.js',
        'identify-unused-functions.js'
    ],
    
    // Output file for the list of unused functions
    outputFile: path.join(__dirname, 'unused-functions.txt'),
    
    // Whether to include the function body in the output
    includeFunctionBody: true,
    
    // Maximum number of lines to include from each function
    maxLines: 10
};

// Maps to store function definitions and calls
const functionDefinitions = new Map(); // Map of function name to file path and line number
const functionCalls = new Set(); // Set of function names that are called
const globalVariables = new Set(); // Set of global variables

/**
 * Scan JavaScript files to find function definitions and calls
 */
function scanJavaScriptFiles() {
    console.log('Scanning JavaScript files for function definitions and calls...');
    
    let jsFilesScanned = 0;
    
    // Process each directory
    for (const dir of config.directories) {
        const files = findFiles(dir, ['.js']);
        
        for (const file of files) {
            try {
                // Skip excluded files
                const fileName = path.basename(file);
                if (config.excludeFiles.includes(fileName)) {
                    continue;
                }
                
                const content = fs.readFileSync(file, 'utf8');
                jsFilesScanned++;
                
                // Parse the JavaScript file
                try {
                    const ast = parse(content, {
                        ecmaVersion: 2020,
                        sourceType: 'script'
                    });
                    
                    // Find function definitions and calls
                    analyzeFunctions(ast, file, content);
                } catch (parseError) {
                    console.error(`Error parsing file ${file}: ${parseError.message}`);
                }
            } catch (error) {
                console.error(`Error reading file ${file}: ${error.message}`);
            }
        }
    }
    
    console.log(`Scanned ${jsFilesScanned} JavaScript files.`);
    console.log(`Found ${functionDefinitions.size} function definitions and ${functionCalls.size} function calls.`);
}

/**
 * Find files with specific extensions in a directory (recursively)
 */
function findFiles(dir, extensions) {
    const results = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                results.push(...findFiles(fullPath, extensions));
            } else if (entry.isFile()) {
                // Check if the file has a supported extension
                const ext = path.extname(entry.name).toLowerCase();
                if (extensions.includes(ext)) {
                    results.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}: ${error.message}`);
    }
    
    return results;
}

/**
 * Analyze an AST to find function definitions and calls
 */
function analyzeFunctions(ast, filePath, content) {
    // Find function declarations
    simple(ast, {
        FunctionDeclaration(node) {
            if (node.id && node.id.name) {
                const functionName = node.id.name;
                const lineNumber = getLineNumber(content, node.start);
                
                functionDefinitions.set(functionName, {
                    filePath,
                    lineNumber,
                    start: node.start,
                    end: node.end
                });
            }
        },
        
        VariableDeclarator(node) {
            // Check for function expressions assigned to variables
            if (node.init && (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) {
                if (node.id && node.id.name) {
                    const functionName = node.id.name;
                    const lineNumber = getLineNumber(content, node.start);
                    
                    functionDefinitions.set(functionName, {
                        filePath,
                        lineNumber,
                        start: node.init.start,
                        end: node.init.end
                    });
                }
            }
        },
        
        AssignmentExpression(node) {
            // Check for function expressions assigned to properties
            if (node.right && (node.right.type === 'FunctionExpression' || node.right.type === 'ArrowFunctionExpression')) {
                if (node.left.type === 'MemberExpression') {
                    // Handle assignments to object properties
                    if (node.left.property && node.left.property.name) {
                        const objectName = getObjectName(node.left.object);
                        const propertyName = node.left.property.name;
                        const functionName = `${objectName}.${propertyName}`;
                        const lineNumber = getLineNumber(content, node.start);
                        
                        functionDefinitions.set(functionName, {
                            filePath,
                            lineNumber,
                            start: node.right.start,
                            end: node.right.end
                        });
                    }
                } else if (node.left.type === 'Identifier') {
                    // Handle assignments to variables
                    const functionName = node.left.name;
                    const lineNumber = getLineNumber(content, node.start);
                    
                    functionDefinitions.set(functionName, {
                        filePath,
                        lineNumber,
                        start: node.right.start,
                        end: node.right.end
                    });
                }
            }
        },
        
        CallExpression(node) {
            // Find function calls
            if (node.callee.type === 'Identifier') {
                // Direct function calls
                functionCalls.add(node.callee.name);
            } else if (node.callee.type === 'MemberExpression') {
                // Method calls
                if (node.callee.property && node.callee.property.name) {
                    const objectName = getObjectName(node.callee.object);
                    const propertyName = node.callee.property.name;
                    const functionName = `${objectName}.${propertyName}`;
                    
                    functionCalls.add(functionName);
                }
            }
        },
        
        AssignmentExpression(node) {
            // Find global variable assignments
            if (node.left.type === 'MemberExpression' && 
                node.left.object.type === 'Identifier' && 
                node.left.object.name === 'window') {
                
                if (node.left.property && node.left.property.name) {
                    globalVariables.add(node.left.property.name);
                }
            }
        }
    });
}

/**
 * Get the name of an object from its AST node
 */
function getObjectName(objectNode) {
    if (objectNode.type === 'Identifier') {
        return objectNode.name;
    } else if (objectNode.type === 'MemberExpression') {
        const objectName = getObjectName(objectNode.object);
        const propertyName = objectNode.property.name;
        return `${objectName}.${propertyName}`;
    } else {
        return 'unknown';
    }
}

/**
 * Get the line number for a position in the content
 */
function getLineNumber(content, position) {
    const lines = content.substring(0, position).split('\n');
    return lines.length;
}

/**
 * Get the function body from the content
 */
function getFunctionBody(content, start, end) {
    return content.substring(start, end);
}

/**
 * Identify unused functions by comparing function definitions with function calls
 */
function identifyUnusedFunctions() {
    console.log('Identifying unused functions...');
    
    const unusedFunctions = [];
    
    // Find functions that are defined but never called
    for (const [functionName, functionInfo] of functionDefinitions.entries()) {
        // Skip functions that are called
        if (functionCalls.has(functionName)) {
            continue;
        }
        
        // Skip functions that are exported to the global scope
        if (globalVariables.has(functionName)) {
            continue;
        }
        
        // Skip event handlers (common naming patterns)
        if (functionName.startsWith('on') || 
            functionName.includes('Handler') || 
            functionName.includes('Listener') ||
            functionName.includes('Callback')) {
            continue;
        }
        
        // Add the function to the list of unused functions
        unusedFunctions.push({
            name: functionName,
            ...functionInfo
        });
    }
    
    // Sort unused functions by file path and line number
    unusedFunctions.sort((a, b) => {
        if (a.filePath !== b.filePath) {
            return a.filePath.localeCompare(b.filePath);
        } else {
            return a.lineNumber - b.lineNumber;
        }
    });
    
    console.log(`Found ${unusedFunctions.length} unused functions.`);
    
    return unusedFunctions;
}

/**
 * Write the list of unused functions to a file
 */
function writeUnusedFunctionsToFile(unusedFunctions) {
    console.log(`Writing list of unused functions to ${config.outputFile}...`);
    
    try {
        let content = `# Unused Functions\n\n`;
        content += `Found ${unusedFunctions.length} unused functions.\n\n`;
        
        let currentFile = '';
        
        for (const func of unusedFunctions) {
            // Add a header for each file
            if (func.filePath !== currentFile) {
                currentFile = func.filePath;
                content += `## ${path.relative(__dirname, currentFile)}\n\n`;
            }
            
            content += `### ${func.name}\n\n`;
            content += `Line: ${func.lineNumber}\n\n`;
            
            if (config.includeFunctionBody) {
                try {
                    const fileContent = fs.readFileSync(func.filePath, 'utf8');
                    const functionBody = getFunctionBody(fileContent, func.start, func.end);
                    
                    // Truncate the function body if it's too long
                    const lines = functionBody.split('\n');
                    const truncatedBody = lines.slice(0, config.maxLines).join('\n');
                    
                    content += '```javascript\n';
                    content += truncatedBody;
                    if (lines.length > config.maxLines) {
                        content += '\n// ... (truncated)';
                    }
                    content += '\n```\n\n';
                } catch (error) {
                    content += `Error reading function body: ${error.message}\n\n`;
                }
            }
        }
        
        fs.writeFileSync(config.outputFile, content, 'utf8');
        console.log(`Wrote list of unused functions to ${config.outputFile}.`);
    } catch (error) {
        console.error(`Error writing to ${config.outputFile}: ${error.message}`);
    }
}

/**
 * Main function to run the script
 */
function main() {
    console.log('\n=== Identify Unused Functions ===\n');
    
    // Scan JavaScript files to find function definitions and calls
    scanJavaScriptFiles();
    
    // Identify unused functions
    const unusedFunctions = identifyUnusedFunctions();
    
    // Write the list of unused functions to a file
    writeUnusedFunctionsToFile(unusedFunctions);
    
    console.log('\n=== Done ===\n');
}

// Run the script
main();
