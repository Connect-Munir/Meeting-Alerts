// Browser Notifications Management
class NotificationManager {
  constructor() {
    this.permission = null;
    this.init();
  }

  init() {
    // Check notification permission on first user interaction
    document.addEventListener('click', () => this.requestPermission(), { once: true });
    document.addEventListener('keydown', () => this.requestPermission(), { once: true });

    // Check current permission status
    this.updatePermissionStatus();
  }

  updatePermissionStatus() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  showNotification(meeting, type = 'meeting-starting') {
    if (!this.canNotify()) {
      return;
    }

    let title = '';
    let options = {};

    switch (type) {
      case 'meeting-starting':
        title = `Meeting Starting Soon: ${meeting.title}`;
        options = {
          body: `Starting in ${meeting.alert_timing} minutes`,
          icon: '⚡',
          tag: `meeting-${meeting.id}`,
          requireInteraction: true,
          actions: [
            { action: 'open', title: 'Join Meeting' },
            { action: 'close', title: 'Dismiss' },
          ],
        };
        break;

      case 'meeting-live':
        title = `Meeting Live: ${meeting.title}`;
        options = {
          body: 'Your meeting is now live',
          icon: '🔴',
          tag: `meeting-${meeting.id}`,
          requireInteraction: true,
          actions: [
            { action: 'open', title: 'Join Now' },
            { action: 'close', title: 'Dismiss' },
          ],
        };
        break;

      case 'meeting-ended':
        title = `Meeting Ended: ${meeting.title}`;
        options = {
          body: 'Your meeting has ended',
          icon: '✓',
          tag: `meeting-${meeting.id}`,
        };
        break;

      default:
        return;
    }

    try {
      const notification = new Notification(title, options);

      // Handle notification click
      notification.addEventListener('click', () => {
        window.focus();
        window.open(meeting.link, '_blank');
        notification.close();
      });

      // Handle action buttons
      notification.addEventListener('close', () => {
        // Notification dismissed
      });

      // For browsers that support actions
      if (notification.onclick === undefined && options.actions) {
        notification.addEventListener('click', (event) => {
          if (event.action === 'open') {
            window.focus();
            window.open(meeting.link, '_blank');
          }
          notification.close();
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  canNotify() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  closeNotification(meetingId) {
    // This would require tracking notification objects
    // For now, we rely on browser's tag-based notification replacement
  }
}

// Initialize notification manager
const notificationManager = new NotificationManager();
