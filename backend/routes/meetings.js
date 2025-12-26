const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// Get all meetings
router.get('/', (req, res) => {
  try {
    const meetings = Meeting.findAll();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get meetings that are currently live
router.get('/active', (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 19);
    const activeMeetings = Meeting.findActive(now);
    res.json(activeMeetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's upcoming meetings
router.get('/today', (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 19);
    const upcomingMeetings = Meeting.findUpcomingToday(now);
    res.json(upcomingMeetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific meeting by ID
router.get('/:id', (req, res) => {
  try {
    const meeting = Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new meeting
router.post('/', (req, res) => {
  try {
    const { title, link, scheduled_time, duration, is_recurring, recurrence_pattern, alert_timing } = req.body;

    // Validation
    if (!title || !link || !scheduled_time || !duration) {
      return res.status(400).json({ error: 'Missing required fields: title, link, scheduled_time, duration' });
    }

    // Validate URL format (basic check)
    try {
      new URL(link);
    } catch {
      return res.status(400).json({ error: 'Invalid link format' });
    }

    // Validate duration is positive
    if (duration <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0' });
    }

    // Validate alert_timing
    const validAlertTimings = [5, 10, 15];
    const finalAlertTiming = alert_timing && validAlertTimings.includes(alert_timing) ? alert_timing : 5;

    const meeting = Meeting.create({
      title: title.trim(),
      link: link.trim(),
      scheduled_time,
      duration: parseInt(duration),
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      alert_timing: finalAlertTiming,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a meeting
router.put('/:id', (req, res) => {
  try {
    const { title, link, scheduled_time, duration, is_recurring, recurrence_pattern, alert_timing } = req.body;

    // Check if meeting exists
    const existing = Meeting.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Validation
    if (!title || !link || !scheduled_time || !duration) {
      return res.status(400).json({ error: 'Missing required fields: title, link, scheduled_time, duration' });
    }

    // Validate URL format
    try {
      new URL(link);
    } catch {
      return res.status(400).json({ error: 'Invalid link format' });
    }

    // Validate duration is positive
    if (duration <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0' });
    }

    // Validate alert_timing
    const validAlertTimings = [5, 10, 15];
    const finalAlertTiming = alert_timing && validAlertTimings.includes(alert_timing) ? alert_timing : 5;

    const updatedMeeting = Meeting.update(req.params.id, {
      title: title.trim(),
      link: link.trim(),
      scheduled_time,
      duration: parseInt(duration),
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      alert_timing: finalAlertTiming,
    });

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a meeting
router.delete('/:id', (req, res) => {
  try {
    const meeting = Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    Meeting.delete(req.params.id);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
