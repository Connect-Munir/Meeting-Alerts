// Meetings Management and CRUD Operations
class MeetingsManager {
  constructor() {
    this.meetings = [];
    this.editingMeetingId = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadMeetings();
  }

  setupEventListeners() {
    // Add meeting button
    const addBtn = document.getElementById('add-meeting-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openAddModal());
    }

    // Modal controls
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const formCancel = document.getElementById('form-cancel');

    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.closeModal());
    }
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }
    if (formCancel) {
      formCancel.addEventListener('click', () => this.closeModal());
    }

    // Form submission
    const form = document.getElementById('meeting-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Recurring meeting toggle
    const recurringCheckbox = document.getElementById('is-recurring');
    if (recurringCheckbox) {
      recurringCheckbox.addEventListener('change', () => this.toggleRecurrenceOptions());
    }

    // Recurrence type change
    const recurrenceType = document.getElementById('recurrence-type');
    if (recurrenceType) {
      recurrenceType.addEventListener('change', () => this.updateRecurrenceOptions());
    }

    // Toast close
    const toastClose = document.getElementById('toast-close');
    if (toastClose) {
      toastClose.addEventListener('click', () => {
        document.getElementById('toast').classList.add('hidden');
      });
    }
  }

  async loadMeetings() {
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to load meetings');

      this.meetings = await response.json();
      this.renderMeetings();
    } catch (error) {
      console.error('Error loading meetings:', error);
      this.showToast('Failed to load meetings', 'error');
    }
  }

  renderMeetings() {
    const now = new Date();

    // Separate meetings into categories
    const liveMeetings = this.meetings.filter((m) => this.isMeetingLive(m));
    const upcomingMeetings = this.meetings.filter((m) => this.isMeetingUpcomingToday(m));
    const allMeetings = this.meetings;

    // Render sections
    this.renderMeetingList(liveMeetings, 'live-container', 'live');
    this.renderMeetingList(upcomingMeetings, 'upcoming-container', 'upcoming');
    this.renderMeetingList(allMeetings, 'all-container', 'all');

    // Update counts
    document.getElementById('live-count').textContent = liveMeetings.length;
    document.getElementById('upcoming-count').textContent = upcomingMeetings.length;
  }

  renderMeetingList(meetings, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (meetings.length === 0) {
      container.innerHTML = '<div class="empty-state">No meetings in this category</div>';
      return;
    }

    container.innerHTML = meetings.map((m) => this.createMeetingCard(m, type)).join('');

    // Add event listeners to action buttons
    container.querySelectorAll('.meeting-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const meetingId = parseInt(btn.dataset.meetingId);
        const action = btn.dataset.action;
        this.handleMeetingAction(meetingId, action);
      });
    });
  }

  createMeetingCard(meeting, type) {
    const isLive = this.isMeetingLive(meeting);
    const statusClass = isLive ? 'live' : this.isMeetingStarting(meeting) ? 'starting' : '';
    const statusText = isLive ? 'LIVE' : this.isMeetingStarting(meeting) ? 'STARTING' : 'UPCOMING';

    const meetingDate = new Date(meeting.scheduled_time);
    const dateStr = meetingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="meeting-card ${isLive ? 'live' : ''}">
        <div class="meeting-card-header">
          <h3 class="meeting-title">${this.escapeHtml(meeting.title)}</h3>
          <div class="meeting-status ${statusClass}">
            <span class="status-dot"></span>
            ${statusText}
          </div>
        </div>

        <div class="meeting-details">
          <div class="meeting-detail">
            <div class="meeting-detail-label">📅 Date & Time</div>
            <div class="meeting-detail-value">${dateStr} @ ${timeStr}</div>
          </div>
          <div class="meeting-detail">
            <div class="meeting-detail-label">⏱️ Duration</div>
            <div class="meeting-detail-value">${meeting.duration} minutes</div>
          </div>
          <div class="meeting-detail">
            <div class="meeting-detail-label">🔔 Alert</div>
            <div class="meeting-detail-value">${meeting.alert_timing} min before</div>
          </div>
          <div class="meeting-detail">
            <div class="meeting-detail-label">🔄 Recurring</div>
            <div class="meeting-detail-value">${meeting.is_recurring ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div class="meeting-detail" style="margin-bottom: var(--spacing-md);">
          <div class="meeting-detail-label">🔗 Link</div>
          <a href="${meeting.link}" target="_blank" class="meeting-link">${meeting.link}</a>
        </div>

        <div class="meeting-actions">
          <button class="meeting-action-btn join" data-meeting-id="${meeting.id}" data-action="join">
            → Open Link
          </button>
          <button class="meeting-action-btn" data-meeting-id="${meeting.id}" data-action="edit">
            ✎ Edit
          </button>
          <button class="meeting-action-btn delete" data-meeting-id="${meeting.id}" data-action="delete">
            ✕ Delete
          </button>
        </div>
      </div>
    `;
  }

  openAddModal() {
    this.editingMeetingId = null;
    document.getElementById('modal-title').textContent = 'Add New Meeting';
    document.getElementById('meeting-form').reset();
    this.toggleRecurrenceOptions();

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('meeting-date').min = today;
    document.getElementById('meeting-date').value = today;

    // Set default time to current time
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('meeting-time').value = `${hours}:${minutes}`;

    this.showModal();
  }

  openEditModal(meeting) {
    this.editingMeetingId = meeting.id;
    document.getElementById('modal-title').textContent = 'Edit Meeting';

    // Populate form
    document.getElementById('meeting-title').value = meeting.title;
    document.getElementById('meeting-link').value = meeting.link;
    document.getElementById('meeting-duration').value = meeting.duration;
    document.getElementById('alert-timing').value = meeting.alert_timing;

    // Set date and time
    const meetingDate = new Date(meeting.scheduled_time);
    const dateStr = meetingDate.toISOString().split('T')[0];
    const timeStr = String(meetingDate.getHours()).padStart(2, '0') + ':' + String(meetingDate.getMinutes()).padStart(2, '0');

    document.getElementById('meeting-date').value = dateStr;
    document.getElementById('meeting-time').value = timeStr;

    // Set recurring options
    document.getElementById('is-recurring').checked = meeting.is_recurring;
    if (meeting.is_recurring && meeting.recurrence_pattern) {
      const pattern = meeting.recurrence_pattern;
      document.getElementById('recurrence-type').value = pattern.type;

      if (pattern.type === 'weekly' && pattern.daysOfWeek) {
        document.querySelectorAll('[name="day"]').forEach((checkbox) => {
          checkbox.checked = pattern.daysOfWeek.includes(parseInt(checkbox.value));
        });
      }
    }

    this.toggleRecurrenceOptions();
    this.showModal();
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('meeting-title').value.trim();
    const link = document.getElementById('meeting-link').value.trim();
    const date = document.getElementById('meeting-date').value;
    const time = document.getElementById('meeting-time').value;
    const duration = parseInt(document.getElementById('meeting-duration').value);
    const alertTiming = parseInt(document.getElementById('alert-timing').value);
    const isRecurring = document.getElementById('is-recurring').checked;

    // Validation
    if (!title || !link || !date || !time || !duration) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    // Combine date and time
    const scheduled_time = `${date}T${time}:00`;

    // Build recurrence pattern if recurring
    let recurrence_pattern = null;
    if (isRecurring) {
      const recurrenceType = document.getElementById('recurrence-type').value;
      recurrence_pattern = { type: recurrenceType, interval: 1 };

      if (recurrenceType === 'weekly') {
        const selectedDays = Array.from(document.querySelectorAll('[name="day"]:checked')).map((cb) => parseInt(cb.value));
        if (selectedDays.length === 0) {
          this.showToast('Please select at least one day for weekly recurrence', 'error');
          return;
        }
        recurrence_pattern.daysOfWeek = selectedDays;
      }
    }

    const meeting = {
      title,
      link,
      scheduled_time,
      duration,
      is_recurring: isRecurring,
      recurrence_pattern,
      alert_timing: alertTiming,
    };

    try {
      let response;
      if (this.editingMeetingId) {
        // Update existing meeting
        response = await fetch(`/api/meetings/${this.editingMeetingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meeting),
        });
        this.showToast('Meeting updated successfully!', 'success');
      } else {
        // Create new meeting
        response = await fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meeting),
        });
        this.showToast('Meeting created successfully!', 'success');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save meeting');
      }

      this.closeModal();
      await this.loadMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async handleMeetingAction(meetingId, action) {
    const meeting = this.meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    switch (action) {
      case 'join':
        window.open(meeting.link, '_blank');
        break;

      case 'edit':
        this.openEditModal(meeting);
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
          await this.deleteMeeting(meetingId);
        }
        break;
    }
  }

  async deleteMeeting(meetingId) {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });

      if (!response.ok) throw new Error('Failed to delete meeting');

      this.showToast('Meeting deleted successfully!', 'success');
      await this.loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      this.showToast('Failed to delete meeting', 'error');
    }
  }

  toggleRecurrenceOptions() {
    const isRecurring = document.getElementById('is-recurring').checked;
    const options = document.getElementById('recurrence-options');

    if (isRecurring) {
      options.classList.remove('hidden');
      this.updateRecurrenceOptions();
    } else {
      options.classList.add('hidden');
    }
  }

  updateRecurrenceOptions() {
    const recurrenceType = document.getElementById('recurrence-type').value;
    const weeklyOptions = document.getElementById('weekly-options');

    if (recurrenceType === 'weekly') {
      weeklyOptions.classList.remove('hidden');
    } else {
      weeklyOptions.classList.add('hidden');
    }
  }

  showModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    this.editingMeetingId = null;
  }

  showToast(message, type = 'info') {
    if (window.alertManager) {
      window.alertManager.showToast(message, type);
    }
  }

  // Helper methods
  isMeetingLive(meeting) {
    const now = new Date();
    const start = new Date(meeting.scheduled_time);
    const end = new Date(start.getTime() + meeting.duration * 60000);
    return now >= start && now <= end;
  }

  isMeetingStarting(meeting) {
    const now = new Date();
    const start = new Date(meeting.scheduled_time);
    const minutesUntilStart = (start - now) / 1000 / 60;
    return minutesUntilStart <= meeting.alert_timing && minutesUntilStart > 0;
  }

  isMeetingUpcomingToday(meeting) {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_time);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());

    return meetingDay.getTime() === today.getTime() && meetingDate > now;
  }

  updateMeetingStatus(meetingId, status) {
    // Status can be 'live', 'starting', 'ended'
    const card = document.querySelector(`[data-meeting-id="${meetingId}"]`);
    if (card) {
      const meetingCard = card.closest('.meeting-card');
      if (meetingCard && status === 'live') {
        meetingCard.classList.add('live');
      } else if (meetingCard) {
        meetingCard.classList.remove('live');
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize meetings manager
const meetingsManager = new MeetingsManager();
window.meetingsManager = meetingsManager;
