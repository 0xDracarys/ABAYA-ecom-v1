#!/usr/bin/env node

/**
 * Custom server script that auto-detects free ports
 * This avoids the EADDRINUSE error when port 3000 is already in use
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const detect = require('detect-port');

// Set default port
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Create Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    // Find available port
    const port = await detect(DEFAULT_PORT);
    
    if (port !== DEFAULT_PORT) {
      process.stdout.write(`⚠️ Port ${DEFAULT_PORT} is in use, switching to port ${port}\n`);
    }
    
    await app.prepare();
    
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
    
    server.listen(port, (err) => {
      if (err) throw err;
      process.stdout.write(`✅ Server started on http://localhost:${port}\n`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer(); 