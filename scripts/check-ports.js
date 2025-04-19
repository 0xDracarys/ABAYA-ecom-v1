#!/usr/bin/env node

/**
 * Script to check for port conflicts before starting the server
 * Run with: node scripts/check-ports.js
 */

const detect = require('detect-port');
const { spawn } = require('child_process');

// Default ports to check
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

async function checkAndStartServer() {
  try {
    // Check if default port is available
    const port = await detect(DEFAULT_PORT);
    
    if (port !== DEFAULT_PORT) {
      process.stdout.write(`⚠️ Port ${DEFAULT_PORT} is in use, switching to port ${port}\n`);
      // Set environment variable for the new port
      process.env.PORT = port.toString();
    } else {
      process.stdout.write(`✅ Port ${DEFAULT_PORT} is available\n`);
    }
    
    // Start the server with the available port
    const command = process.argv[2] || 'start:custom';
    const serverProcess = spawn('npm', ['run', command], { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Handle server process events
    serverProcess.on('error', (error) => {
      console.error(`Error starting server: ${error.message}`);
      process.exit(1);
    });
    
    serverProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Server process exited with code ${code}`);
      }
      process.exit(code);
    });
    
  } catch (error) {
    console.error(`Error checking ports: ${error.message}`);
    process.exit(1);
  }
}

// Run the check
checkAndStartServer(); 