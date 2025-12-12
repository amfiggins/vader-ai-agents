// Preload script for security
const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the APIs we need
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the web interface here
  platform: process.platform,
});
