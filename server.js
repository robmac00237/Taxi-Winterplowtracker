const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demo
const plowDrivers = new Map();
const routes = [
  { id: 'route-1', name: 'Downtown District', color: '#FF5733' },
  { id: 'route-2', name: 'North Residential', color: '#33FF57' },
  { id: 'route-3', name: 'South Industrial', color: '#3357FF' },
  { id: 'route-4', name: 'East Highway', color: '#F333FF' },
  { id: 'route-5', name: 'West Suburbs', color: '#FF8C33' }
];

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Send current plow positions to new connection
  ws.send(JSON.stringify({
    type: 'initial',
    plows: Array.from(plowDrivers.values())
  }));

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes

// Get available routes
app.get('/api/routes', (req, res) => {
  res.json(routes);
});

// Driver registration/login
app.post('/api/driver/register', (req, res) => {
  const { driverName, routeId } = req.body;

  if (!driverName || !routeId) {
    return res.status(400).json({ error: 'Driver name and route ID required' });
  }

  const route = routes.find(r => r.id === routeId);
  if (!route) {
    return res.status(400).json({ error: 'Invalid route ID' });
  }

  const driverId = `driver-${Date.now()}`;
  const driver = {
    id: driverId,
    name: driverName,
    route: route,
    status: 'inactive',
    location: null,
    lastUpdate: null
  };

  plowDrivers.set(driverId, driver);

  res.json({
    success: true,
    driverId,
    driver
  });
});

// Update driver location (GPS tracking)
app.post('/api/driver/:driverId/location', (req, res) => {
  const { driverId } = req.params;
  const { latitude, longitude, speed, heading } = req.body;

  const driver = plowDrivers.get(driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.location = {
    latitude,
    longitude,
    speed: speed || 0,
    heading: heading || 0
  };
  driver.lastUpdate = new Date().toISOString();
  driver.status = 'active';

  plowDrivers.set(driverId, driver);

  // Broadcast update to all viewers
  broadcast({
    type: 'location_update',
    driver: driver
  });

  res.json({ success: true });
});

// Update driver status
app.post('/api/driver/:driverId/status', (req, res) => {
  const { driverId } = req.params;
  const { status } = req.body;

  const driver = plowDrivers.get(driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.status = status;
  driver.lastUpdate = new Date().toISOString();
  plowDrivers.set(driverId, driver);

  broadcast({
    type: 'status_update',
    driver: driver
  });

  res.json({ success: true });
});

// Get all active plows (for public viewer)
app.get('/api/plows', (req, res) => {
  const activePlows = Array.from(plowDrivers.values())
    .filter(driver => driver.status === 'active' && driver.location);

  res.json(activePlows);
});

// Get driver info
app.get('/api/driver/:driverId', (req, res) => {
  const { driverId } = req.params;
  const driver = plowDrivers.get(driverId);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.json(driver);
});

// Serve driver app
app.get('/driver', (req, res) => {
  res.sendFile(path.join(__dirname, 'driver-app', 'index.html'));
});

// Serve public viewer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public-viewer', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚜 WinterPlow GPS Tracker Server Running!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📱 Driver App:     http://localhost:${PORT}/driver`);
  console.log(`🌐 Public Viewer:  http://localhost:${PORT}/`);
  console.log(`🔧 API Server:     http://localhost:${PORT}/api`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

// Upgrade HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
