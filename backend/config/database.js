const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'meetings.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Create meetings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      is_recurring BOOLEAN DEFAULT 0,
      recurrence_pattern TEXT,
      alert_timing INTEGER DEFAULT 5,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_scheduled_time ON meetings(scheduled_time);
    CREATE INDEX IF NOT EXISTS idx_is_active ON meetings(is_active);
  `);

  console.log('✓ Database initialized successfully');
}

// Initialize on load
initializeDatabase();

module.exports = db;
