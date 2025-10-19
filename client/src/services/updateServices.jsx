import { toast } from 'sonner';
import packageJson from '../../package.json';

// Update Service for managing app updates and notifications
class UpdateService {
  constructor() {
    this.isInitialized = false;
    this.updateCheckInterval = null;
    this.currentVersion = packageJson.version || '2.0.0';
    this.updateCheckUrl = import.meta.env.VITE_UPDATE_CHECK_URL || null;
    this.checkInterval = parseInt(import.meta.env.VITE_UPDATE_CHECK_INTERVAL) || 1800000; // 30 minutes default
    this.autoUpdate = import.meta.env.VITE_AUTO_UPDATE === 'true';
    this.enableUpdateNotifications = import.meta.env.VITE_ENABLE_UPDATE_NOTIFICATIONS !== 'false'; // Default true
  }

  // Start the update service
  start() {
    console.log('Update service started');
    this.isInitialized = true;
    return this;
  }

  // Stop the update service
  stop() {
    console.log('Update service stopped');
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
    this.isInitialized = false;
    return this;
  }

  // Initialize automatic updates
  initialize() {
    if (!this.isInitialized) {
      console.warn('Update service not started. Call start() first.');
      return this;
    }

    console.log(' Initializing automatic updates...');
    console.log(` Current version: ${this.currentVersion}`);
    console.log(` Check interval: ${this.checkInterval / 1000 / 60} minutes`);

    // Check for updates at configured interval
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);

    // Initial update check (delayed by 5 seconds to let app settle)
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000);

    // Register service worker update listener for PWA
    this.registerServiceWorkerListener();

    return this;
  }

  // Check for application updates
  async checkForUpdates() {
    if (!this.enableUpdateNotifications) {
      console.log(' Update notifications disabled');
      return this;
    }

    console.log(' Checking for updates...');

    try {
      // Check if we have a custom update URL
      if (this.updateCheckUrl) {
        const response = await fetch(this.updateCheckUrl);
        const data = await response.json();
        
        if (data.latestVersion && this.isNewerVersion(data.latestVersion, this.currentVersion)) {
          this.notifyUpdate(data);
        } else {
          console.log(' App is up to date');
        }
      } else {
        // Check service worker for updates (PWA)
        this.checkServiceWorkerUpdate();
      }
    } catch (error) {
      console.error(' Update check failed:', error);
      // Silently fail - don't bother user with update check errors
    }

    return this;
  }

  // Compare version strings (semver-like)
  isNewerVersion(latestVersion, currentVersion) {
    const latest = latestVersion.split('.').map(Number);
    const current = currentVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(latest.length, current.length); i++) {
      const latestPart = latest[i] || 0;
      const currentPart = current[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    return false;
  }

  // Check service worker for updates
  checkServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    }
  }

  // Register service worker update listener
  registerServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken control
        this.notifyUpdate({
          latestVersion: 'New version',
          message: 'A new version of the app is available.',
          updateType: 'service-worker'
        });
      });
    }
  }

  // Show welcome message for new features
  showWelcomeMessage() {
    if (!this.enableUpdateNotifications) {
      return this;
    }

    console.log(' Checking for welcome message...');

    // Check if this is a first-time user or returning user
    const lastVersion = localStorage.getItem('app_version');

    if (!lastVersion) {
      // First time user
      toast.success('Welcome to ominbiz!', {
        description: 'Your all-in-one business management platform is ready!',
        duration: 5000,
        action: {
          label: 'Get Started',
          onClick: () => console.log('Welcome acknowledged')
        }
      });
    } else if (lastVersion !== this.currentVersion) {
      // Returning user with new version
      toast.info(`Updated to v${this.currentVersion}`, {
        description: 'Check out the new features and improvements!',
        duration: 5000,
        action: {
          label: 'See What\'s New',
          onClick: () => this.showChangelogModal()
        }
      });
    }

    localStorage.setItem('app_version', this.currentVersion);
    return this;
  }

  // Show changelog modal (can be customized)
  showChangelogModal() {
    const changes = this.getChangelog();
    console.log(' Changelog:', changes);
    // This could open a modal or navigate to a changelog page
    toast.info('Changelog', {
      description: changes.slice(0, 2).join('\n'),
      duration: 8000
    });
  }

  // Get changelog based on version
  getChangelog() {
    return [
      ' Enhanced AI chat with dashboard-specific responses',
      ' Added voice input support',
      ' New settings panel with AI personality options',
      ' Real-time data integration',
      ' Conversation history with search & export',
      ' Improved UI with maximizable interface'
    ];
  }

  // Notify about available updates
  notifyUpdate(updateData = {}) {
    const { latestVersion, message, updateType } = updateData;
    
    console.log(' Update available:', latestVersion || 'New version');

    if (this.autoUpdate) {
      // Auto-update after short delay
      toast.info('Auto-updating...', {
        description: 'The app will refresh in 3 seconds',
        duration: 3000
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      // Show update notification with manual action
      const versionText = latestVersion ? `v${latestVersion}` : 'New version';
      
      toast.success('Update Available!', {
        description: message || `${versionText} is ready. Refresh to update.`,
        duration: 0, // Persistent until action
        action: {
          label: 'Update Now',
          onClick: () => window.location.reload()
        },
        cancel: {
          label: 'Later',
          onClick: () => {
            console.log('Update postponed');
            // Set reminder to show again in 1 hour
            setTimeout(() => {
              this.notifyUpdate(updateData);
            }, 3600000);
          }
        }
      });
    }

    return this;
  }

  // Manual update trigger
  triggerUpdate() {
    toast.loading('Updating app...', { duration: 1000 });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return this;
  }

  // Check network status
  checkNetworkStatus() {
    if (!navigator.onLine) {
      toast.error('No internet connection', {
        description: 'Updates require an internet connection',
        duration: 5000
      });
      return false;
    }
    return true;
  }

  // Force update check (manual)
  forceUpdateCheck() {
    if (!this.checkNetworkStatus()) {
      return this;
    }

    toast.info('Checking for updates...', { duration: 2000 });
    this.checkForUpdates();
    return this;
  }

  // Destroy the service and cleanup
  destroy() {
    console.log(' Destroying update service...');
    this.stop();
    this.isInitialized = false;
    return this;
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasActiveInterval: !!this.updateCheckInterval,
      currentVersion: this.currentVersion,
      checkInterval: this.checkInterval,
      autoUpdate: this.autoUpdate,
      notificationsEnabled: this.enableUpdateNotifications,
      hasUpdateUrl: !!this.updateCheckUrl
    };
  }

  // Get current version
  getVersion() {
    return this.currentVersion;
  }

  // Enable/disable notifications
  setNotificationsEnabled(enabled) {
    this.enableUpdateNotifications = enabled;
    console.log(` Update notifications ${enabled ? 'enabled' : 'disabled'}`);
    return this;
  }
}

// Create and export a singleton instance
const updateService = new UpdateService();

// Log service configuration on module load
if (import.meta.env.DEV) {
  console.log(' Update Service Configuration:', {
    version: updateService.currentVersion,
    checkInterval: `${updateService.checkInterval / 1000 / 60} minutes`,
    autoUpdate: updateService.autoUpdate,
    notificationsEnabled: updateService.enableUpdateNotifications,
    updateCheckUrl: updateService.updateCheckUrl || 'Service Worker (PWA)'
  });
}

export default updateService;