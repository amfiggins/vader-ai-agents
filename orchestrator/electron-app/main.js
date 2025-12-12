const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

const ORCHESTRATOR_DIR = '/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator';
const PORT = 3002;
const URL = `http://localhost:${PORT}`;

function checkServerRunning() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`lsof -Pi :${PORT} -sTCP:LISTEN -t`, (error) => {
      resolve(!error);
    });
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    // Start the server directly with npm
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: ORCHESTRATOR_DIR,
      stdio: 'ignore',
      detached: true,
      env: { ...process.env, PORT: PORT.toString() },
    });

    serverProcess.unref();

    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 60; // Give it more time
    
    const checkInterval = setInterval(() => {
      attempts++;
      checkServerRunning().then((running) => {
        if (running) {
          clearInterval(checkInterval);
          // Give it an extra second to fully initialize
          setTimeout(() => resolve(), 1000);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('Server failed to start within 60 seconds'));
        }
      });
    }, 1000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#1a1a1a', // Dark background
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon_final.icns'),
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready
    frame: true, // Keep frame for macOS controls
    titleBarOverlay: false, // Don't overlay content on title bar
  });

  // Load the orchestrator web interface
  // Wait a bit for server to be fully ready
  setTimeout(() => {
    mainWindow.loadURL(URL);
  }, 2000);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorCode, errorDescription);
    
    // Show loading page and retry
    mainWindow.loadURL(`data:text/html,
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vader AI Orchestrator</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loading {
            text-align: center;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"></div>
          <h2>Starting Orchestrator Server...</h2>
          <p>Please wait while the server starts up.</p>
          <p style="font-size: 12px; margin-top: 20px;">Error: ${errorDescription || errorCode}</p>
        </div>
      </body>
      </html>
    `);
    
    // Retry loading after a delay
    let retries = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
      retries++;
      checkServerRunning().then((running) => {
        if (running) {
          clearInterval(retryInterval);
          mainWindow.loadURL(URL);
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          mainWindow.loadURL(`data:text/html,
            <!DOCTYPE html>
            <html>
            <head><title>Error</title></head>
            <body style="font-family: -apple-system; padding: 40px; text-align: center;">
              <h1>Server Not Available</h1>
              <p>Could not connect to orchestrator server.</p>
              <p>Please check that the server is running on port ${PORT}</p>
              <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">Retry</button>
            </body>
            </html>
          `);
        }
      });
    }, 2000);
  });
}

function createMenu() {
  const template = [
    {
      label: 'Vader AI Orchestrator',
      submenu: [
        { role: 'about', label: 'About Vader AI Orchestrator' },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: 'Hide Vader AI Orchestrator' },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit Vader AI Orchestrator' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'selectAll', label: 'Select All' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  createMenu();

  // Check if server is running, start if not
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.log('Server not running, starting it...');
    try {
      await startServer();
      console.log('Server started successfully');
    } catch (error) {
      console.error('Failed to start server:', error);
      // Show error in window
      createWindow();
      mainWindow.loadURL(`data:text/html,
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body style="font-family: -apple-system; padding: 40px; text-align: center;">
          <h1>Server Failed to Start</h1>
          <p>${error.message}</p>
          <p>Please check the orchestrator directory and try again.</p>
        </body>
        </html>
      `);
      return;
    }
  } else {
    console.log('Server is already running');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Optionally kill server process when app quits
  // For now, we'll leave it running in the background
});
