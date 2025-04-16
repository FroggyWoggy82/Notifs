const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting migration to MVC architecture...');

// Check if the required directories exist
const dirs = ['models', 'controllers', 'routes', 'docs'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dir);
  }
});

// Check if the required files exist
const requiredFiles = [
  'models/weightModel.js',
  'models/taskModel.js',
  'controllers/weightController.js',
  'controllers/taskController.js',
  'routes/weightRoutes.js',
  'routes/taskRoutes.js',
  'docs/swagger.js',
  'server.new.js',
  'update-dependencies.js',
  'MVC-README.md'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.error('The following required files are missing:');
  missingFiles.forEach(file => console.error(`- ${file}`));
  console.error('Please make sure all required files are in place before running this script.');
  process.exit(1);
}

// Backup the current server.js
console.log('Backing up current server.js...');
fs.copyFileSync('server.js', 'server.old.js');

// Replace server.js with the new version
console.log('Replacing server.js with the new modular version...');
fs.copyFileSync('server.new.js', 'server.js');

// Update dependencies
console.log('Updating dependencies...');
try {
  execSync('node update-dependencies.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to update dependencies:', error);
  process.exit(1);
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
}

console.log('\nMigration completed successfully!');
console.log('\nNext steps:');
console.log('1. Review the MVC-README.md file for information about the new architecture');
console.log('2. Start the server with "npm start"');
console.log('3. Access the API documentation at http://localhost:3000/api-docs');
console.log('\nIf you encounter any issues, you can restore the original server.js with:');
console.log('   mv server.old.js server.js');
