// Server monitoring script
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let restartCount = 0;
const maxRestarts = 10;
const logFile = path.join(__dirname, 'crash.log');

function logCrash(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

function startServer() {
  console.log(`🚀 Starting server (attempt ${restartCount + 1})`);
  
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  server.on('close', (code) => {
    restartCount++;
    logCrash(`Server exited with code ${code}. Restart count: ${restartCount}`);
    
    if (code !== 0 && restartCount < maxRestarts) {
      console.log(`🔄 Restarting server in 2 seconds...`);
      setTimeout(startServer, 2000);
    } else if (restartCount >= maxRestarts) {
      logCrash(`Max restart attempts (${maxRestarts}) reached. Stopping.`);
      process.exit(1);
    } else {
      console.log('✅ Server stopped gracefully');
    }
  });

  server.on('error', (err) => {
    logCrash(`Server spawn error: ${err.message}`);
  });

  // Reset restart count on successful run (after 30 seconds)
  setTimeout(() => {
    if (restartCount > 0) {
      console.log('✅ Server running stable, resetting restart count');
      restartCount = 0;
    }
  }, 30000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Monitor received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Monitor received SIGTERM, shutting down...');
  process.exit(0);
});

console.log('🔍 Starting server monitor...');
startServer();
