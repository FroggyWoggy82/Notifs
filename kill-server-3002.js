const { exec } = require('child_process');

console.log('Attempting to find and kill process using port 3002...');

// For Windows
exec('netstat -ano | findstr :3002', (error, stdout, stderr) => {
  if (error) {
    console.error('Error finding process:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('Error:', stderr);
    return;
  }
  
  // Parse the output to get the PID
  const lines = stdout.trim().split('\n');
  if (lines.length === 0) {
    console.log('No process found using port 3002');
    return;
  }
  
  // The PID is the last column in the output
  const pid = lines[0].trim().split(/\s+/).pop();
  
  if (!pid) {
    console.log('Could not determine PID');
    return;
  }
  
  console.log(`Found process with PID: ${pid}`);
  
  // Kill the process
  exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error('Error killing process:', killError.message);
      return;
    }
    
    if (killStderr) {
      console.error('Error:', killStderr);
      return;
    }
    
    console.log(`Process with PID ${pid} killed successfully`);
  });
});
