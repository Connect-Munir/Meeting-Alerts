const express = require('express');
const cors = require('cors');
const path = require('path');
const Meeting = require('./models/Meeting');
const meetingsRouter = require('./routes/meetings');
const startScheduler = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store SSE clients for broadcasting
const sseClients = new Set();

// SSE endpoint - clients connect here to receive real-time events
app.get('/api/events', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write('data: {"type":"connected","message":"Connected to meeting alerts"}\n\n');

  // Add client to the set
  sseClients.add(res);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(res);
  });
});

// Function to broadcast SSE event to all connected clients
function broadcastEvent(event) {
  const message = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (err) {
      // Client disconnected, will be cleaned up by close handler
      sseClients.delete(client);
    }
  });
}

// Export broadcast function for scheduler
app.broadcastEvent = broadcastEvent;

// API Routes
app.use('/api/meetings', meetingsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (HTML, CSS, JS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n✓ Meeting Alerts server running at http://localhost:${PORT}`);
  console.log('✓ Open http://localhost:3000 in your browser\n');

  // Start the scheduler service
  startScheduler(broadcastEvent);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
