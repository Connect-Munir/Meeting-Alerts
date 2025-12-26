# ⚡ Meeting Alerts

A real-time meeting alert system that monitors your meetings and sends live notifications when they're about to start or are currently happening.

## Features

✅ **Real-time Alerts** - Get instant notifications when meetings are about to start or are live
✅ **Browser Notifications** - Native browser notifications with one-click meeting link opening
✅ **Sound Alerts** - Toggleable audio alerts (🔊 icon in header)
✅ **Configurable Alert Timing** - Choose to be alerted 5, 10, or 15 minutes before your meeting
✅ **Recurring Meetings** - Support for daily, weekly, and monthly recurring meetings
✅ **Dark/Light Mode** - Beautiful "Command Center" themed interface with theme toggle
✅ **Live Dashboard** - See what's happening now, today's schedule, and all your meetings
✅ **Full CRUD Operations** - Add, edit, delete, and manage meetings
✅ **Responsive Design** - Works great on desktop browsers

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite
- **Real-time Communication**: Server-Sent Events (SSE)
- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Styling**: CSS with custom properties (variables) for theming

## Project Structure

```
Meeting Alerts/
├── backend/
│   ├── config/database.js           # SQLite database initialization
│   ├── models/Meeting.js            # Data access layer & business logic
│   ├── services/scheduler.js        # Background meeting checker (runs every minute)
│   ├── routes/meetings.js           # REST API endpoints
│   └── server.js                    # Express server with SSE setup
├── public/
│   ├── index.html                   # Main HTML structure
│   ├── css/
│   │   ├── variables.css            # Theme system (light/dark modes)
│   │   ├── base.css                 # Reset & typography
│   │   ├── components.css           # UI component styles
│   │   └── animations.css           # Animations & effects
│   ├── js/
│   │   ├── app.js                   # Main app orchestrator
│   │   ├── theme.js                 # Theme toggle & persistence
│   │   ├── meetings.js              # CRUD & rendering
│   │   ├── alerts.js                # SSE & real-time alerts
│   │   └── notifications.js         # Browser notifications
│   └── assets/sounds/
│       └── alert.mp3                # Alert sound (optional)
├── database/
│   └── meetings.db                  # SQLite database (auto-created)
├── package.json
└── README.md                        # This file
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

**Clone or download the project:**
   ```bash
   git clone https://github.com/Connect-Munir/Meeting-Alerts.git
   cd "Meeting Alerts"
   ```

1. **Clone or navigate to the project directory**:
```bash
cd "Meeting Alerts"
```

2. **Install dependencies** (if not already done):
```bash
npm install
```

3. **Start the application**:
```bash
npm start
```

The server will start at `http://localhost:3000`

4. **Open in your browser**:
Navigate to `http://localhost:3000`

### Development Mode (with auto-restart)

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Usage

### Adding a Meeting

1. Click the **"+ Add Meeting"** button
2. Fill in the form:
   - **Meeting Title** - Name of your meeting (e.g., "Team Standup")
   - **Meeting Link** - URL to the meeting (e.g., Google Meet, Zoom)
   - **Date & Time** - When the meeting happens
   - **Duration** - How long the meeting lasts (in minutes)
   - **Alert Timing** - When to notify you (5, 10, or 15 minutes before)
   - **Recurring** - Enable for recurring meetings
3. If recurring:
   - Choose type: Daily, Weekly, or Monthly
   - For weekly, select which days it repeats
4. Click **"Save Meeting"**

### Managing Meetings

- **Edit** - Click the ✎ button to modify a meeting
- **Delete** - Click the ✕ button to remove a meeting
- **Open Link** - Click the → button to open the meeting link in a new tab

### Notifications

- **Browser Notifications** - Pop-up notifications appear when meetings start
  - Click the notification to open the meeting link in a new tab
  - Dismiss the notification if you prefer
- **Sound Alerts** - Toggle sound on/off using the 🔊/🔇 button in the header
- **Toast Messages** - In-app notifications appear in the bottom-right corner

### Dark/Light Mode

Click the 🌙/☀️ button in the header to toggle between:
- **Light Mode** - Terminal Green theme (clean, professional)
- **Dark Mode** - Retro CRT theme (bold, neon accents)

Your preference is saved automatically.

## API Endpoints

### Get All Meetings
```
GET /api/meetings
```
Returns all active meetings.

### Get Currently Live Meetings
```
GET /api/meetings/active
```
Returns meetings that are currently happening.

### Get Today's Upcoming Meetings
```
GET /api/meetings/today
```
Returns meetings happening later today.

### Get Single Meeting
```
GET /api/meetings/:id
```
Returns a specific meeting by ID.

### Create Meeting
```
POST /api/meetings
Content-Type: application/json

{
  "title": "Team Standup",
  "link": "https://meet.google.com/abc-defg-hij",
  "scheduled_time": "2024-12-26T09:00:00",
  "duration": 30,
  "alert_timing": 5,
  "is_recurring": true,
  "recurrence_pattern": {
    "type": "daily",
    "interval": 1
  }
}
```

### Update Meeting
```
PUT /api/meetings/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "link": "https://zoom.us/...",
  "scheduled_time": "2024-12-26T10:00:00",
  "duration": 45,
  "alert_timing": 10,
  "is_recurring": false,
  "recurrence_pattern": null
}
```

### Delete Meeting
```
DELETE /api/meetings/:id
```
Soft deletes a meeting (marks as inactive).

### Health Check
```
GET /api/health
```
Returns server status.

### Real-time Events (SSE)
```
GET /api/events
```
Server-Sent Events stream for real-time alerts. Events include:
- `meeting-starting` - Meeting is about to start
- `meeting-live` - Meeting is currently happening
- `meeting-ended` - Meeting has ended

## Recurring Meeting Patterns

### Daily
```json
{
  "type": "daily",
  "interval": 1
}
```
Repeats every day.

### Weekly
```json
{
  "type": "weekly",
  "interval": 1,
  "daysOfWeek": [1, 3, 5]
}
```
Repeats on specified days (0=Sunday, 1=Monday, ..., 6=Saturday).

### Monthly
```json
{
  "type": "monthly",
  "interval": 1,
  "dayOfMonth": 15
}
```
Repeats on the same day of each month.

## Database Schema

### Meetings Table
```sql
CREATE TABLE meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,      -- ISO 8601 format
  duration INTEGER NOT NULL,          -- Minutes
  is_recurring BOOLEAN DEFAULT 0,
  recurrence_pattern TEXT,            -- JSON
  alert_timing INTEGER DEFAULT 5,     -- Minutes before alert
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Keyboard Shortcuts

- **Escape** - Close modal/form
- **Tab** - Navigate form fields
- **Enter** - Submit form

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

*Notifications require HTTPS in production (but work on localhost for development).*

## Configuration

Optional environment variables (create `.env` file):

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/meetings.db
```

## Troubleshooting

### Notifications not showing?
1. Check if you granted notification permission
2. Ensure your browser supports notifications
3. For HTTP on non-localhost, enable insecure contexts in settings
4. Check browser console for error messages

### Sound not playing?
1. Ensure `assets/sounds/alert.mp3` exists
2. Check if sound is toggled on (🔊 button in header)
3. Check browser console volume/mute settings

### Meetings not updating?
1. Ensure SSE connection is active (check browser DevTools > Network)
2. Check if scheduler is running (should log to console)
3. Refresh the page and reload meetings

### Database errors?
1. Ensure `database/` directory exists (auto-created on startup)
2. Check file permissions for `database/meetings.db`
3. Delete `database/meetings.db` and restart to reset database

## Performance Tips

- Use shorter intervals between checks (default is every minute)
- The scheduler is optimized to only emit alerts when state changes
- Large datasets (100+ meetings) perform well with SQLite
- Browser notifications are native and lightweight

## Known Limitations

- Meetings are stored locally in SQLite (single-user)
- No built-in user authentication
- Timezone handling uses browser's local time
- Recurring meetings calculate next occurrence dynamically

## Future Enhancements

- User authentication & multi-user support
- Google Calendar integration
- Timezone support
- Meeting notes/agenda
- Attendance tracking
- Mobile app (PWA)
- Email reminders
- Multiple calendar sources

## License

ISC

## Support

For issues or questions:
1. Check the browser console (F12 → Console tab)
2. Check application logs in terminal
3. Verify all dependencies are installed: `npm install`
4. Try clearing browser cache and localStorage
5. Restart the server: `npm start`

## Development

The application uses:
- **Backend**: Express.js for HTTP + SSE
- **Database**: SQLite with better-sqlite3
- **Scheduling**: node-cron for background jobs
- **Frontend**: Vanilla JS (no frameworks)
- **Styling**: CSS with custom properties

### Debug Mode

In browser console, you can access:
```javascript
app.getStatus()          // Get app status
app.getDebugInfo()       // Full debug info
alertManager             // Real-time alerts
meetingsManager          // Meetings CRUD
themeManager             // Theme system
notificationManager      // Notifications
```

## Command Center Aesthetic

The UI is designed with a **Command Center / Mission Control** theme:
- **Light Mode**: Terminal green with clean design
- **Dark Mode**: Retro CRT with neon accents
- **Typography**: JetBrains Mono for precision
- **Effects**: Glowing borders, pulsing animations, scanlines
- **Interactions**: Smooth transitions and hover effects

---

**Made with ⚡ for powerful meeting management**
