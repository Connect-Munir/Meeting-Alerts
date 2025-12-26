// Real-time Alerts Management via Server-Sent Events
class AlertManager {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.soundEnabled = this.getSoundPreference();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.soundElement = null;

    this.init();
  }

  init() {
    this.soundElement = document.getElementById('alert-sound');
    this.setupSoundToggle();
    this.connect();
  }

  connect() {
    console.log('Connecting to alerts...');

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.addEventListener('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('✓ Connected to alerts');
      });

      // Listen for different event types
      this.eventSource.addEventListener('meeting-starting', (event) => {
        const data = JSON.parse(event.data);
        this.handleMeetingStarting(data);
      });

      this.eventSource.addEventListener('meeting-live', (event) => {
        const data = JSON.parse(event.data);
        this.handleMeetingLive(data);
      });

      this.eventSource.addEventListener('meeting-ended', (event) => {
        const data = JSON.parse(event.data);
        this.handleMeetingEnded(data);
      });

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.eventSource.close();
        this.handleConnectionError();
      };
    } catch (error) {
      console.error('Error connecting to alerts:', error);
      this.handleConnectionError();
    }
  }

  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Failed to connect to alerts after multiple attempts');
      this.showToast('Connection lost. Please refresh the page.', 'error');
    }
  }

  handleMeetingStarting(eventData) {
    const meeting = eventData.meeting;

    console.log(`🔔 Meeting starting: ${meeting.title}`);

    // Show toast notification
    this.showToast(`${meeting.title} is starting in ${meeting.alert_timing} minutes!`, 'info');

    // Show browser notification
    notificationManager.showNotification(meeting, 'meeting-starting');

    // Play sound
    this.playSound();

    // Update UI
    if (window.meetingsManager) {
      window.meetingsManager.updateMeetingStatus(meeting.id, 'starting');
      window.meetingsManager.loadMeetings();
    }
  }

  handleMeetingLive(eventData) {
    const meeting = eventData.meeting;

    console.log(`🔴 Meeting live: ${meeting.title}`);

    // Show toast notification
    this.showToast(`${meeting.title} is now LIVE!`, 'success');

    // Show browser notification
    notificationManager.showNotification(meeting, 'meeting-live');

    // Play sound
    this.playSound();

    // Update UI
    if (window.meetingsManager) {
      window.meetingsManager.updateMeetingStatus(meeting.id, 'live');
      window.meetingsManager.loadMeetings();
    }
  }

  handleMeetingEnded(eventData) {
    const meeting = eventData.meeting;

    console.log(`✓ Meeting ended: ${meeting.title}`);

    // Show toast notification
    this.showToast(`${meeting.title} has ended`, 'info');

    // Show browser notification
    notificationManager.showNotification(meeting, 'meeting-ended');

    // Update UI
    if (window.meetingsManager) {
      window.meetingsManager.updateMeetingStatus(meeting.id, 'ended');
      window.meetingsManager.loadMeetings();
    }
  }

  playSound() {
    if (!this.soundEnabled || !this.soundElement) {
      return;
    }

    try {
      // Reset and play
      this.soundElement.currentTime = 0;
      this.soundElement.play().catch((error) => {
        console.log('Could not play sound:', error);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  setupSoundToggle() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (!soundToggleBtn) return;

    soundToggleBtn.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      this.saveSoundPreference();
      this.updateSoundToggleUI();
    });

    // Update UI on page load
    this.updateSoundToggleUI();
  }

  updateSoundToggleUI() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    if (!soundToggleBtn) return;

    const icon = soundToggleBtn.querySelector('.sound-icon');
    const status = soundToggleBtn.querySelector('.status');

    if (this.soundEnabled) {
      icon.textContent = '🔊';
      status.textContent = 'On';
      soundToggleBtn.style.borderColor = 'var(--accent-primary)';
      soundToggleBtn.style.color = 'var(--accent-primary)';
    } else {
      icon.textContent = '🔇';
      status.textContent = 'Off';
      soundToggleBtn.style.borderColor = 'var(--border-color)';
      soundToggleBtn.style.color = 'var(--text-secondary)';
    }
  }

  getSoundPreference() {
    const saved = localStorage.getItem('meeting-alerts-sound');
    return saved === null ? true : saved === 'true';
  }

  saveSoundPreference() {
    localStorage.setItem('meeting-alerts-sound', this.soundEnabled.toString());
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Color the toast based on type
    switch (type) {
      case 'success':
        toast.style.borderColor = 'var(--accent-success)';
        break;
      case 'error':
        toast.style.borderColor = 'var(--accent-danger)';
        break;
      case 'warning':
        toast.style.borderColor = 'var(--accent-warning)';
        break;
      default:
        toast.style.borderColor = 'var(--border-color)';
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 5000);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
      console.log('Disconnected from alerts');
    }
  }
}

// Initialize alert manager
const alertManager = new AlertManager();

// Expose to window for meeting manager to access
window.alertManager = alertManager;
