const db = require('../config/database');

class Meeting {
  // Create a new meeting
  static create(meeting) {
    const {
      title,
      link,
      scheduled_time,
      duration,
      is_recurring,
      recurrence_pattern,
      alert_timing = 5,
    } = meeting;

    const stmt = db.prepare(`
      INSERT INTO meetings (title, link, scheduled_time, duration, is_recurring, recurrence_pattern, alert_timing)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      link,
      scheduled_time,
      duration,
      is_recurring ? 1 : 0,
      recurrence_pattern ? JSON.stringify(recurrence_pattern) : null,
      alert_timing
    );

    return { id: result.lastInsertRowid, ...meeting };
  }

  // Get all active meetings
  static findAll() {
    const stmt = db.prepare(`
      SELECT * FROM meetings WHERE is_active = 1 ORDER BY scheduled_time ASC
    `);

    return stmt.all().map(this.parseRow);
  }

  // Get a meeting by ID
  static findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM meetings WHERE id = ? AND is_active = 1
    `);

    const row = stmt.get(id);
    return row ? this.parseRow(row) : null;
  }

  // Get meetings that are currently live (started but not ended)
  static findActive(currentTime) {
    const stmt = db.prepare(`
      SELECT * FROM meetings
      WHERE is_active = 1
      AND scheduled_time <= ?
      AND datetime(scheduled_time, '+' || duration || ' minutes') > ?
      ORDER BY scheduled_time DESC
    `);

    return stmt.all(currentTime, currentTime).map(this.parseRow);
  }

  // Get meetings happening today
  static findUpcomingToday(currentTime) {
    const todayStart = currentTime.split('T')[0] + 'T00:00:00';
    const todayEnd = currentTime.split('T')[0] + 'T23:59:59';

    const stmt = db.prepare(`
      SELECT * FROM meetings
      WHERE is_active = 1
      AND scheduled_time >= ?
      AND scheduled_time <= ?
      ORDER BY scheduled_time ASC
    `);

    return stmt.all(todayStart, todayEnd).map(this.parseRow);
  }

  // Get meetings starting within the alert timing window
  static findStarting(currentTime, alertTimingMinutes) {
    const alertTime = new Date(currentTime);
    alertTime.setMinutes(alertTime.getMinutes() + alertTimingMinutes);
    const alertTimeStr = alertTime.toISOString().slice(0, 19);

    const stmt = db.prepare(`
      SELECT * FROM meetings
      WHERE is_active = 1
      AND scheduled_time > ?
      AND scheduled_time <= ?
      ORDER BY scheduled_time ASC
    `);

    return stmt.all(currentTime, alertTimeStr).map(this.parseRow);
  }

  // Update a meeting
  static update(id, meeting) {
    const {
      title,
      link,
      scheduled_time,
      duration,
      is_recurring,
      recurrence_pattern,
      alert_timing = 5,
    } = meeting;

    const stmt = db.prepare(`
      UPDATE meetings
      SET title = ?, link = ?, scheduled_time = ?, duration = ?,
          is_recurring = ?, recurrence_pattern = ?, alert_timing = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `);

    stmt.run(
      title,
      link,
      scheduled_time,
      duration,
      is_recurring ? 1 : 0,
      recurrence_pattern ? JSON.stringify(recurrence_pattern) : null,
      alert_timing,
      id
    );

    return this.findById(id);
  }

  // Delete a meeting (soft delete)
  static delete(id) {
    const stmt = db.prepare(`
      UPDATE meetings SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);

    stmt.run(id);
  }

  // Calculate next occurrence for a recurring meeting
  static calculateNextOccurrence(meeting) {
    if (!meeting.is_recurring || !meeting.recurrence_pattern) {
      return meeting.scheduled_time;
    }

    const pattern = meeting.recurrence_pattern;
    const currentTime = new Date();
    let nextTime = new Date(meeting.scheduled_time);

    // If meeting is in the past, calculate next occurrence
    if (nextTime <= currentTime) {
      switch (pattern.type) {
        case 'daily':
          while (nextTime <= currentTime) {
            nextTime.setDate(nextTime.getDate() + pattern.interval);
          }
          break;

        case 'weekly':
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            while (nextTime <= currentTime) {
              nextTime.setDate(nextTime.getDate() + 1);
              // Check if current day is in daysOfWeek (0 = Sunday, 6 = Saturday)
              if (pattern.daysOfWeek.includes(nextTime.getDay())) {
                break;
              }
            }
          } else {
            while (nextTime <= currentTime) {
              nextTime.setDate(nextTime.getDate() + 7 * pattern.interval);
            }
          }
          break;

        case 'monthly':
          if (pattern.dayOfMonth) {
            while (nextTime <= currentTime) {
              nextTime.setMonth(nextTime.getMonth() + pattern.interval);
              nextTime.setDate(Math.min(pattern.dayOfMonth, new Date(nextTime.getFullYear(), nextTime.getMonth() + 1, 0).getDate()));
            }
          }
          break;
      }
    }

    return nextTime.toISOString().slice(0, 19);
  }

  // Parse database row and parse JSON fields
  static parseRow(row) {
    if (!row) return null;

    return {
      ...row,
      is_recurring: Boolean(row.is_recurring),
      recurrence_pattern: row.recurrence_pattern ? JSON.parse(row.recurrence_pattern) : null,
      is_active: Boolean(row.is_active),
    };
  }

  // Get all meetings for scheduler (including inactive)
  static findAllForScheduler() {
    const stmt = db.prepare(`
      SELECT * FROM meetings WHERE is_active = 1 ORDER BY scheduled_time ASC
    `);

    return stmt.all().map(this.parseRow);
  }
}

module.exports = Meeting;
