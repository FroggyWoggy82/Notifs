// run-exercise-migration.js
require('dotenv').config();
const { createExerciseTables } = require('./migrations/create_exercise_tables');

console.log('Starting exercise tables migration script...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL is set');
} else {
  console.log('WARNING: DATABASE_URL is not set, using default connection string');
}

createExerciseTables()
  .then(() => {
    console.log('Exercise tables migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Exercise tables migration failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  });
