// Theme Management System
class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'meeting-alerts-theme';
    this.THEME_LIGHT = 'light';
    this.THEME_DARK = 'dark';
    this.root = document.documentElement;
    this.themeToggleBtn = null;

    this.init();
  }

  init() {
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? this.THEME_DARK : this.THEME_LIGHT);

    this.setTheme(initialTheme);

    // Set up event listeners
    this.setupEventListeners();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? this.THEME_DARK : this.THEME_LIGHT);
      }
    });
  }

  setupEventListeners() {
    this.themeToggleBtn = document.getElementById('theme-toggle');
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  setTheme(theme) {
    // Validate theme
    if (![this.THEME_LIGHT, this.THEME_DARK].includes(theme)) {
      theme = this.THEME_LIGHT;
    }

    // Add flicker animation
    document.body.classList.add('theme-switching');
    setTimeout(() => {
      document.body.classList.remove('theme-switching');
    }, 150);

    // Apply theme
    this.root.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);

    // Update button appearance if it exists
    if (this.themeToggleBtn) {
      this.themeToggleBtn.title = `Switch to ${theme === this.THEME_LIGHT ? 'dark' : 'light'} mode`;
      const icon = this.themeToggleBtn.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === this.THEME_LIGHT ? '🌙' : '☀️';
      }
    }
  }

  toggle() {
    const currentTheme = this.root.getAttribute('data-theme') || this.THEME_LIGHT;
    const newTheme = currentTheme === this.THEME_LIGHT ? this.THEME_DARK : this.THEME_LIGHT;
    this.setTheme(newTheme);
  }

  getCurrentTheme() {
    return this.root.getAttribute('data-theme') || this.THEME_LIGHT;
  }

  isDarkMode() {
    return this.getCurrentTheme() === this.THEME_DARK;
  }
}

// Initialize theme on page load
const themeManager = new ThemeManager();
