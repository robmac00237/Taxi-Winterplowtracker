# ❄️ WinterPlow GPS Tracker

A real-time GPS tracking system for snow plow drivers with live public viewing. This system allows plow drivers to track their routes using their mobile phones while residents can watch their progress on an interactive map.

## Features

### Driver App (Mobile PWA)
- 📱 Works on any Android phone through the browser
- 🗺️ Real-time GPS tracking
- 🛣️ Route selection and management
- ⏯️ Start/pause/stop tracking controls
- 📊 Live speed and location display
- 💾 Auto-saves driver session
- 🏠 Can be installed to home screen (Progressive Web App)

### Public Viewer (Website)
- 🗺️ Interactive map with live plow locations
- 🔴 Real-time updates via WebSocket
- 📋 Sidebar showing all active plows
- 🎨 Color-coded routes
- 📍 Click plows to see details
- 📱 Responsive design (works on phones and desktops)

### Backend Server
- ⚡ Fast Node.js/Express server
- 🔌 WebSocket support for real-time updates
- 📡 RESTful API for GPS data
- 💾 In-memory storage (easy to upgrade to database)
- 🚀 Simple deployment

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Start the Server

```bash
npm start
```

You should see:
```
🚜 WinterPlow GPS Tracker Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Driver App:     http://localhost:3000/driver
🌐 Public Viewer:  http://localhost:3000/
🔧 API Server:     http://localhost:3000/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Using the System

#### For Plow Drivers:

1. **Open the driver app** on your phone: `http://YOUR-SERVER-IP:3000/driver`
   - Replace YOUR-SERVER-IP with your computer's IP address (find it with `ip addr` or `ifconfig`)
   - Example: `http://192.168.1.100:3000/driver`

2. **Register:**
   - Enter your name
   - Select your route (5 pre-configured routes available)
   - Click "Start Tracking"

3. **Start Plowing:**
   - Click "Start Plowing" button
   - Grant GPS permissions when prompted
   - Your location will now be tracked and shared live
   - Use Pause/Stop buttons as needed

4. **Install to Home Screen** (Optional):
   - On Android Chrome: Menu → "Add to Home screen"
   - On Android Firefox: Menu → "Install"
   - Now you can launch it like a native app!

#### For Residents (Public Viewing):

1. **Open the viewer** in any browser: `http://YOUR-SERVER-IP:3000/`
2. You'll see:
   - Interactive map with all active plows
   - Sidebar listing active plows
   - Color-coded routes
   - Real-time updates as plows move

## System Architecture

```
┌─────────────────┐
│  Driver Phone   │
│   (Browser)     │
│                 │
│  GPS Location   │
└────────┬────────┘
         │
         │ HTTPS POST
         │ /api/driver/:id/location
         │
         ▼
┌─────────────────────┐      WebSocket      ┌──────────────────┐
│                     │◄─────────────────────►│                  │
│   Backend Server    │                       │  Public Viewers  │
│   (Node.js)         │                       │  (Browsers)      │
│                     │                       │                  │
│  • API Endpoints    │                       │  • Live Map      │
│  • WebSocket        │                       │  • Plow List     │
│  • Data Storage     │                       │  • Real-time     │
└─────────────────────┘                       └──────────────────┘
```

## API Endpoints

### Routes
- `GET /api/routes` - Get all available routes

### Driver Management
- `POST /api/driver/register` - Register a new driver
  ```json
  {
    "driverName": "John Doe",
    "routeId": "route-1"
  }
  ```

- `POST /api/driver/:driverId/location` - Update driver location
  ```json
  {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 25.5,
    "heading": 180
  }
  ```

- `POST /api/driver/:driverId/status` - Update driver status
  ```json
  {
    "status": "active" | "paused" | "inactive"
  }
  ```

- `GET /api/driver/:driverId` - Get driver information

### Public Data
- `GET /api/plows` - Get all active plows with locations

### WebSocket
- Connect to `/` with WebSocket protocol
- Receives real-time updates when plows move

## Configuration

### Default Routes

The system comes with 5 pre-configured routes:

1. **Downtown District** (Red)
2. **North Residential** (Green)
3. **South Industrial** (Blue)
4. **East Highway** (Purple)
5. **West Suburbs** (Orange)

To modify routes, edit the `routes` array in `server.js`:

```javascript
const routes = [
  { id: 'route-1', name: 'Your Route Name', color: '#HEX-COLOR' },
  // Add more routes...
];
```

### Server Port

Change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Map Center

Change the default map center in `public-viewer/index.html`:

```javascript
map = L.map('map').setView([YOUR_LAT, YOUR_LON], 12);
```

## Deployment

### Local Network (Testing)

1. Start the server on your computer
2. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ip addr show
   # or
   ifconfig
   ```

3. Share the URLs with drivers:
   - Driver app: `http://YOUR-IP:3000/driver`
   - Public viewer: `http://YOUR-IP:3000/`

### Production Deployment

For production use, you'll want to:

1. **Use a real database** (PostgreSQL, MongoDB, etc.)
   - Currently uses in-memory storage (data lost on restart)

2. **Deploy to a cloud service:**
   - Heroku, DigitalOcean, AWS, Google Cloud, etc.
   - Make sure to use HTTPS for GPS to work properly

3. **Add authentication** for drivers (optional)

4. **Use environment variables** for configuration

5. **Set up proper domain names:**
   - Example: `drivers.yoursnowplow.com`
   - Example: `tracker.yoursnowplow.com`

## Technology Stack

- **Backend:** Node.js, Express, WebSocket
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Maps:** Leaflet.js with OpenStreetMap
- **GPS:** HTML5 Geolocation API
- **Real-time:** WebSocket (ws library)

## Browser Compatibility

### Driver App (Mobile)
- ✅ Chrome for Android (Recommended)
- ✅ Firefox for Android
- ✅ Samsung Internet
- ✅ Any modern mobile browser with GPS support

### Public Viewer
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Any modern desktop or mobile browser

## GPS Permissions

The driver app requires GPS permissions. On first use:

1. Browser will ask "Allow location access?"
2. Click "Allow" or "While using the app"
3. For best accuracy, ensure "High accuracy" mode is enabled in phone settings

## Troubleshooting

### GPS Not Working

1. **Check permissions:**
   - Go to phone Settings → Apps → Chrome/Firefox → Permissions → Location → Allow

2. **Enable high accuracy:**
   - Settings → Location → Mode → High accuracy

3. **Check browser:**
   - GPS only works on HTTPS or localhost
   - Some older browsers don't support it

### Driver App Not Updating

1. Check internet connection
2. Look at "Last Update" time in the app
3. Try pausing and restarting tracking
4. Check browser console for errors (Chrome: Menu → More tools → Developer tools)

### Public Map Not Showing Plows

1. Check if drivers have started tracking
2. Refresh the page
3. Check browser console for WebSocket connection errors
4. Ensure server is running

### Can't Connect from Phone

1. Make sure phone and computer are on same WiFi network
2. Check firewall isn't blocking port 3000
3. Use correct IP address (not localhost)
4. Try accessing from phone's browser

## Future Enhancements

Potential features to add:

- [ ] Historical route playback
- [ ] Driver authentication system
- [ ] Admin dashboard
- [ ] Push notifications for residents
- [ ] Route planning and optimization
- [ ] Weather integration
- [ ] Driver-to-dispatch messaging
- [ ] Mobile app versions (native iOS/Android)
- [ ] Database persistence
- [ ] Analytics and reporting
- [ ] Multiple cities/regions support

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check server logs for API errors
4. Ensure all dependencies are installed

## License

MIT License - Feel free to use and modify for your needs!

---

Built with ❄️ for winter road safety
