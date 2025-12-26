const cron = require('node-cron');
const Meeting = require('../models/Meeting');

// Track the state of meetings to avoid duplicate alerts
const meetingState = new Map();

// State constants
const MEETING_STATE = {
  UPCOMING: 'upcoming',
  STARTING: 'starting',
  LIVE: 'live',
  ENDED: 'ended',
};

function startScheduler(broadcastEvent) {
  // Run every minute at the start of the minute
  cron.schedule('* * * * *', () => {
    const now = new Date();
    const currentTime = now.toISOString().slice(0, 19);

    try {
      // Get all active meetings
      const meetings = Meeting.findAllForScheduler();

      // Check each meeting
      meetings.forEach((meeting) => {
        const meetingId = meeting.id;
        const meetingStart = new Date(meeting.scheduled_time);
        const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

        let currentState = MEETING_STATE.UPCOMING;
        let shouldAlert = false;
        let alertType = null;
        let alertMessage = null;

        // Calculate next occurrence if recurring
        let nextOccurrence = meeting.scheduled_time;
        if (meeting.is_recurring && meeting.recurrence_pattern) {
          nextOccurrence = Meeting.calculateNextOccurrence(meeting);
        }

        const nextStart = new Date(nextOccurrence);
        const nextEnd = new Date(nextStart.getTime() + meeting.duration * 60000);
        const timeUntilStart = Math.floor((nextStart - now) / 1000 / 60); // minutes

        // Determine current state
        if (now >= nextStart && now <= nextEnd) {
          // Meeting is currently live
          currentState = MEETING_STATE.LIVE;
        } else if (now > nextEnd) {
          // Meeting has ended
          currentState = MEETING_STATE.ENDED;
        } else if (timeUntilStart <= meeting.alert_timing && timeUntilStart > 0) {
          // Meeting is starting within alert timing window
          currentState = MEETING_STATE.STARTING;
        }

        // Get previous state
        const previousState = meetingState.get(meetingId);

        // Determine if we should send an alert
        if (previousState !== currentState) {
          meetingState.set(meetingId, currentState);

          if (currentState === MEETING_STATE.STARTING) {
            shouldAlert = true;
            alertType = 'meeting-starting';
            alertMessage = `Meeting "${meeting.title}" is starting in ${timeUntilStart} minute(s)`;
          } else if (currentState === MEETING_STATE.LIVE && previousState !== MEETING_STATE.LIVE) {
            shouldAlert = true;
            alertType = 'meeting-live';
            alertMessage = `Meeting "${meeting.title}" is now live`;
          } else if (currentState === MEETING_STATE.ENDED && previousState === MEETING_STATE.LIVE) {
            shouldAlert = true;
            alertType = 'meeting-ended';
            alertMessage = `Meeting "${meeting.title}" has ended`;
          }
        }

        // Broadcast alert if needed
        if (shouldAlert) {
          broadcastEvent({
            type: alertType,
            meeting: {
              id: meeting.id,
              title: meeting.title,
              link: meeting.link,
              scheduled_time: nextOccurrence,
              duration: meeting.duration,
              alert_timing: meeting.alert_timing,
            },
            message: alertMessage,
            timestamp: currentTime,
          });

          console.log(`[${currentTime}] 🔔 ${alertMessage}`);
        }
      });

      // Clean up state for meetings that no longer exist
      const existingIds = new Set(meetings.map((m) => m.id));
      for (const [meetingId] of meetingState.entries()) {
        if (!existingIds.has(meetingId)) {
          meetingState.delete(meetingId);
        }
      }
    } catch (error) {
      console.error('Error in scheduler:', error);
    }
  });

  console.log('✓ Scheduler started - checking meetings every minute');
}

module.exports = startScheduler;
