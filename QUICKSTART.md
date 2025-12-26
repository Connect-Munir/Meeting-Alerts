# ⚡ Quick Start Guide

## 30 Second Setup

```bash
cd "Meeting Alerts"
npm start
```

Then open **http://localhost:3000** in your browser.

That's it! ✅

---

## What You'll See

- **Header** with digital clock, dark/light mode toggle (🌙), and sound toggle (🔊)
- **Live Now** section (empty initially)
- **Today's Meetings** section
- **All Meetings** section with "+ Add Meeting" button

---

## Create Your First Meeting

1. Click **"+ Add Meeting"** button
2. Fill in:
   - Title: "Team Standup"
   - Link: `https://meet.google.com/xyz`
   - Date: Today
   - Time: Pick a time 5 min from now
   - Duration: 30 minutes
3. Click **"Save Meeting"**
4. **Wait 3-5 minutes** and you'll see the alert!

---

## Try These Features

### Dark Mode
Click 🌙 button in header → Theme switches instantly

### Sound Alert
Click 🔊 button → Turns sound on/off

### Edit Meeting
Click ✎ button on any meeting → Modify and save

### Delete Meeting
Click ✕ button on any meeting → Confirm deletion

### Recurring Meeting
- Check "Recurring Meeting" checkbox
- Choose type (Daily/Weekly/Monthly)
- For Weekly: Select days
- Save

### Test Notification
1. Grant notification permission when prompted
2. Create a meeting starting in 5 minutes
3. Wait for notification to pop up
4. Click notification to open meeting link

---

## Useful URLs

| Page | URL |
|------|-----|
| Web App | http://localhost:3000 |
| Health Check | http://localhost:3000/api/health |
| All Meetings API | http://localhost:3000/api/meetings |
| Live Meetings API | http://localhost:3000/api/meetings/active |
| Today's Meetings API | http://localhost:3000/api/meetings/today |

---

## Stop the Server

Press **Ctrl+C** in the terminal running the server.

---

## Restart the Server

```bash
npm start
```

Or for development (auto-restart on file changes):
```bash
npm run dev
```

---

## Reset Everything

```bash
# Stop the server (Ctrl+C)
# Delete database
rm database/meetings.db
# Restart
npm start
```

---

## Troubleshooting

### "Port 3000 already in use"
```bash
# Try a different port
PORT=3001 npm start
```

### "Notifications not showing"
1. Check you clicked allow when prompted
2. Ensure sound is on in browser
3. Try refreshing the page

### "Meetings not updating"
Refresh the page with F5

### "Can't connect to localhost:3000"
Check terminal running server shows no errors

---

## Next Steps

1. **Read Full Docs**: Open `README.md`
2. **Setup Guide**: Open `SETUP.md`
3. **All Features**: Open `FEATURES.md`
4. **Try API**: Use curl or Postman to test endpoints

---

## Key Commands

```bash
# Start server
npm start

# Dev mode (auto-restart)
npm run dev

# Test API
curl http://localhost:3000/api/meetings

# Create meeting
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","link":"https://meet.google.com/test","scheduled_time":"2024-12-26T14:00:00","duration":60,"alert_timing":5}'
```

---

## In Your Browser Console (F12)

```javascript
// Check app status
app.getStatus()

// Get debug info
app.getDebugInfo()

// Access managers
alertManager
meetingsManager
themeManager
notificationManager
```

---

## Features at a Glance

✅ Real-time meeting alerts
✅ Dark/Light mode (switch with 🌙)
✅ Sound alerts (toggle with 🔊)
✅ Browser notifications
✅ Recurring meetings
✅ Configurable alert timing
✅ Add/Edit/Delete meetings
✅ Live meeting indicator
✅ Digital clock
✅ Responsive design

---

## Color Guide

| Color | Meaning |
|-------|---------|
| 🟢 Green | Success / Upcoming |
| 🔴 Red | Live / Alert |
| 🟡 Yellow | Warning / Starting Soon |
| 🟦 Blue | Info |

---

## That's It!

You now have a fully functional meeting alert system.

Enjoy! 🚀

For more details, see **README.md**, **SETUP.md**, or **FEATURES.md**.
