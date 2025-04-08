const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add Swagger dependencies if they don't exist
if (!packageJson.dependencies['swagger-jsdoc']) {
  packageJson.dependencies['swagger-jsdoc'] = '^6.2.8';
}

if (!packageJson.dependencies['swagger-ui-express']) {
  packageJson.dependencies['swagger-ui-express'] = '^5.0.0';
}

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Package.json updated with Swagger dependencies.');
console.log('Run "npm install" to install the new dependencies.');
