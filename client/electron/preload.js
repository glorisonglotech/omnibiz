const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => {
    ipcRenderer.send('app-version');
    return new Promise((resolve) => {
      ipcRenderer.once('app-version', (event, version) => {
        resolve(version);
      });
    });
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Navigation
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, route) => callback(route));
  },

  // Updates
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },

  // Platform info
  platform: process.platform,
  isElectron: true
});

// Notify renderer that preload script has finished
console.log('OmniBiz Electron preload script loaded');
