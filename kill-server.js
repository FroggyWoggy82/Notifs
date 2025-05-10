/**
 * Script to kill the server process running on port 3000
 */

const { exec } = require('child_process');

const PORT = 3000;

console.log(`Attempting to kill process using port ${PORT}...`);

// Command to find and kill the process using port 3000
const command = process.platform === 'win32'
  ? `FOR /F "tokens=5" %a in ('netstat -ano ^| find "LISTENING" ^| find ":${PORT}"') do taskkill /F /PID %a`
  : `lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    console.log('No process found using port 3000 or failed to kill process.');
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(`Process using port ${PORT} has been terminated.`);
  console.log(stdout);
});
