// Main Application Orchestrator
class MeetingAlertsApp {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    console.log('🚀 Meeting Alerts Application starting...');

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    try {
      // Theme system (should already be initialized by theme.js)
      console.log('✓ Theme system loaded');

      // Notifications (should already be initialized by notifications.js)
      console.log('✓ Notification system loaded');

      // Alerts/SSE (should already be initialized by alerts.js)
      console.log('✓ Real-time alerts system loaded');

      // Meetings manager (should already be initialized by meetings.js)
      console.log('✓ Meetings manager loaded');

      // Set up digital clock
      this.setupDigitalClock();

      // Request notification permission on first interaction
      this.setupNotificationPermission();

      // Mark as initialized
      this.initialized = true;

      console.log('✅ Application ready!');
      this.showAppReadyMessage();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showErrorMessage(error.message);
    }
  }

  setupDigitalClock() {
    const clockElement = document.getElementById('digital-clock');
    if (!clockElement) return;

    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    };

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);

    console.log('✓ Digital clock initialized');
  }

  setupNotificationPermission() {
    // Request permission on first user interaction
    const requestPermission = async () => {
      if (notificationManager && typeof notificationManager.requestPermission === 'function') {
        await notificationManager.requestPermission();
      }
      // Remove listener after first interaction
      document.removeEventListener('click', requestPermission);
      document.removeEventListener('keydown', requestPermission);
    };

    document.addEventListener('click', requestPermission);
    document.addEventListener('keydown', requestPermission);
  }

  showAppReadyMessage() {
    if (window.alertManager) {
      window.alertManager.showToast('Meeting Alerts connected and ready! 🎯', 'success');
    }
  }

  showErrorMessage(message) {
    if (window.alertManager) {
      window.alertManager.showToast(`Error: ${message}`, 'error');
    }
  }

  // Public API for debugging
  getStatus() {
    return {
      initialized: this.initialized,
      alertsConnected: alertManager ? alertManager.isConnected : false,
      soundEnabled: alertManager ? alertManager.soundEnabled : null,
      theme: themeManager ? themeManager.getCurrentTheme() : null,
      meetingsLoaded: meetingsManager ? meetingsManager.meetings.length : 0,
    };
  }

  // Debug helper
  getDebugInfo() {
    console.log('=== Meeting Alerts Debug Info ===');
    console.log(this.getStatus());
    console.log('Theme Manager:', themeManager);
    console.log('Alert Manager:', alertManager);
    console.log('Notification Manager:', notificationManager);
    console.log('Meetings Manager:', meetingsManager);
    console.log('==================================');
  }
}

// Initialize the application
const app = new MeetingAlertsApp();

// Make app available globally for debugging
window.app = app;

// Log version info
console.log(
  '%c📱 Meeting Alerts v1.0.0',
  'color: #CCFF00; font-size: 14px; font-weight: bold;'
);
console.log(
  '%cPowered by Node.js + Express + SQLite',
  'color: #00D9FF; font-size: 12px;'
);
