const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Calculate orchestrator directory dynamically (relative to electron-app)
// In development: __dirname = .../orchestrator/electron-app, so ../ = orchestrator
// In packaged app: __dirname = .../app.asar/electron-app, so ../ = app.asar/orchestrator
const ORCHESTRATOR_DIR_RELATIVE = path.join(__dirname, '..');
const ORCHESTRATOR_DIR_ABSOLUTE = '/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator';

// Use relative path if it exists and has package.json, otherwise fallback to absolute
function getOrchestratorDir() {
  const relativePath = ORCHESTRATOR_DIR_RELATIVE;
  const packageJsonPath = path.join(relativePath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('Using relative orchestrator path:', relativePath);
    return relativePath;
  } else {
    console.log('Relative path not found, using absolute path:', ORCHESTRATOR_DIR_ABSOLUTE);
    return ORCHESTRATOR_DIR_ABSOLUTE;
  }
}

const ORCHESTRATOR_DIR = getOrchestratorDir();
const PORT = 3002;
const URL = `http://localhost:${PORT}`;
const LOG_FILE = '/tmp/orchestrator-server.log';

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
    const extendedPath = `${process.env.PATH || ''}:/usr/local/bin:/opt/homebrew/bin`;
    console.log('Using PATH for npm spawn:', extendedPath);
    console.log('Orchestrator directory:', ORCHESTRATOR_DIR);

    // Open log file for writing
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    logStream.write(`\n=== Server startup at ${new Date().toISOString()} ===\n`);
    logStream.write(`Orchestrator dir: ${ORCHESTRATOR_DIR}\n`);
    logStream.write(`PATH: ${extendedPath}\n`);

    // Start the server directly with npm
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: ORCHESTRATOR_DIR,
      stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
      detached: false, // Keep attached so we can kill it
      shell: true,
      env: { ...process.env, PORT: PORT.toString(), PATH: extendedPath },
    });

    let serverError = '';
    let serverOutput = '';

    // Capture stdout
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      logStream.write(`[STDOUT] ${output}`);
      console.log('[Server]', output.trim());
    });

    // Capture stderr
    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      serverError += output;
      logStream.write(`[STDERR] ${output}`);
      console.error('[Server Error]', output.trim());
    });

    // Handle server process errors
    serverProcess.on('error', (error) => {
      const errorMsg = `Server process error: ${error.message}\nStack: ${error.stack}`;
      console.error(errorMsg);
      logStream.write(`[ERROR] ${errorMsg}\n`);
      logStream.end();
      serverProcess = null;
      reject(new Error(`Failed to start server: ${error.message}\nCheck ${LOG_FILE} for details.`));
    });

    // Handle server process exit
    serverProcess.on('exit', (code, signal) => {
      const exitMsg = `Server process exited with code ${code} and signal ${signal}`;
      console.log(exitMsg);
      logStream.write(`[EXIT] ${exitMsg}\n`);
      
      if (code !== 0 && code !== null) {
        const errorDetails = serverError || serverOutput || 'No output captured';
        logStream.write(`[ERROR DETAILS] ${errorDetails}\n`);
        logStream.end();
        serverProcess = null;
        
        // Don't auto-restart on initial startup failure - let user see the error
        if (code !== null) {
          reject(new Error(`Server exited with code ${code}\nError output: ${errorDetails}\nCheck ${LOG_FILE} for full details.`));
        }
      } else {
        logStream.end();
        serverProcess = null;
      }
    });

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
    icon: path.join(__dirname, '../assets/icon_dock.icns'),
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
          // Read log file for error details
          let errorDetails = 'No error details available';
          try {
            if (fs.existsSync(LOG_FILE)) {
              const logContent = fs.readFileSync(LOG_FILE, 'utf8');
              const recentErrors = logContent.split('\n').slice(-20).join('\n');
              errorDetails = recentErrors || 'Log file is empty';
            }
          } catch (err) {
            errorDetails = `Could not read log file: ${err.message}`;
          }
          
          mainWindow.loadURL(`data:text/html,
            <!DOCTYPE html>
            <html>
            <head><title>Error</title></head>
            <body style="font-family: -apple-system; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
              <h1 style="color: #ff4444;">Server Not Available</h1>
              <p>Could not connect to orchestrator server on port ${PORT}.</p>
              <div style="text-align: left; max-width: 800px; margin: 20px auto; background: #2a2a2a; padding: 20px; border-radius: 5px;">
                <h3 style="color: #ffaa00;">Error Details:</h3>
                <pre style="color: #aaa; font-size: 12px; overflow-x: auto;">${errorDetails.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Full log available at: ${LOG_FILE}</p>
              </div>
              <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer; background: #00ff00; color: #000; border: none; border-radius: 3px; font-weight: bold;">Retry</button>
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
      
      // Read log file for error details
      let errorDetails = error.message;
      try {
        if (fs.existsSync(LOG_FILE)) {
          const logContent = fs.readFileSync(LOG_FILE, 'utf8');
          const recentErrors = logContent.split('\n').slice(-30).join('\n');
          errorDetails = recentErrors || error.message;
        }
      } catch (err) {
        errorDetails = `${error.message}\nCould not read log file: ${err.message}`;
      }
      
      // Show error in window
      createWindow();
      mainWindow.loadURL(`data:text/html,
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body style="font-family: -apple-system; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
          <h1 style="color: #ff4444;">Server Failed to Start</h1>
          <p style="color: #ffaa00;">${error.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <div style="text-align: left; max-width: 800px; margin: 20px auto; background: #2a2a2a; padding: 20px; border-radius: 5px;">
            <h3 style="color: #ffaa00;">Error Details:</h3>
            <pre style="color: #aaa; font-size: 12px; overflow-x: auto;">${errorDetails.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <p style="font-size: 12px; color: #888; margin-top: 10px;">Full log available at: ${LOG_FILE}</p>
            <p style="font-size: 12px; color: #888;">Orchestrator directory: ${ORCHESTRATOR_DIR}</p>
          </div>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer; background: #00ff00; color: #000; border: none; border-radius: 3px; font-weight: bold;">Retry</button>
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
  // Kill server process when app quits
  if (serverProcess) {
    console.log('Killing server process...');
    try {
      // Kill the process directly (since detached is false, we can kill it)
      serverProcess.kill('SIGTERM');
      
      // Wait a bit, then force kill if still running
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          try {
            serverProcess.kill('SIGKILL');
          } catch (error) {
            console.error('Error force killing server process:', error);
          }
        }
      }, 2000);
    } catch (error) {
      console.error('Error killing server process:', error);
    }
    serverProcess = null;
  }
});
