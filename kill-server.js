const { exec } = require('child_process');

// Function to find and kill processes using port 3000
function killProcessOnPort(port) {
  console.log(`Attempting to find and kill process using port ${port}...`);
  
  // For Windows
  if (process.platform === 'win32') {
    // Find the process ID using the port
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error finding process: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      
      // Parse the output to get the PID
      const lines = stdout.trim().split('\n');
      if (lines.length === 0) {
        console.log(`No process found using port ${port}`);
        return;
      }
      
      // Extract PID from the last column
      const pidMatch = lines[0].match(/\s+(\d+)$/);
      if (!pidMatch) {
        console.log(`Could not extract PID from output: ${lines[0]}`);
        return;
      }
      
      const pid = pidMatch[1];
      console.log(`Found process with PID ${pid} using port ${port}`);
      
      // Kill the process
      exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing process: ${killError.message}`);
          return;
        }
        
        if (killStderr) {
          console.error(`Error: ${killStderr}`);
          return;
        }
        
        console.log(`Successfully killed process with PID ${pid}`);
        console.log(`Port ${port} should now be available`);
      });
    });
  } else {
    // For Unix-like systems
    exec(`lsof -i :${port} | grep LISTEN`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error finding process: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      
      // Parse the output to get the PID
      const lines = stdout.trim().split('\n');
      if (lines.length === 0) {
        console.log(`No process found using port ${port}`);
        return;
      }
      
      // Extract PID from the second column
      const pidMatch = lines[0].match(/^\S+\s+(\d+)/);
      if (!pidMatch) {
        console.log(`Could not extract PID from output: ${lines[0]}`);
        return;
      }
      
      const pid = pidMatch[1];
      console.log(`Found process with PID ${pid} using port ${port}`);
      
      // Kill the process
      exec(`kill -9 ${pid}`, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing process: ${killError.message}`);
          return;
        }
        
        if (killStderr) {
          console.error(`Error: ${killStderr}`);
          return;
        }
        
        console.log(`Successfully killed process with PID ${pid}`);
        console.log(`Port ${port} should now be available`);
      });
    });
  }
}

// Kill process on port 3000
killProcessOnPort(3000);
