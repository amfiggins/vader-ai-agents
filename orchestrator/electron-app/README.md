# Vader AI Orchestrator Desktop App

A native macOS desktop application for the Vader AI Orchestrator, built with Electron.

## Features

- 🖥️ **Native macOS App** - Runs in its own window, not a browser
- 🎨 **Beautiful UI** - Full web interface in a dedicated app window
- 🚀 **Auto-start Server** - Automatically starts the orchestrator server if needed
- 📱 **Dock Integration** - Proper dock icon and app behavior
- 🔄 **Auto-reload** - Handles server startup and connection

## Running the App

### Development Mode
```bash
cd electron-app
npm start
```

### Build for Production
```bash
cd electron-app
npm run package
```

The built app will be in `dist/Vader AI Orchestrator-darwin-arm64/Vader AI Orchestrator.app`

### Install to Applications
```bash
cp -R dist/Vader AI Orchestrator-darwin-arm64/Vader AI Orchestrator.app ~/Applications/
```

## How It Works

1. **App Launches** - Opens a window
2. **Checks Server** - Sees if orchestrator is running on port 3002
3. **Starts Server** - If not running, starts it automatically
4. **Loads Interface** - Opens the web interface in the app window
5. **Stays Open** - App window stays open like any macOS app

## Customization

- **Icon**: Edit `assets/icon.icns`
- **Window Size**: Edit `main.js` - `width` and `height` in `createWindow()`
- **Server Port**: Edit `main.js` - `PORT` constant
- **Orchestrator Path**: Edit `main.js` - `ORCHESTRATOR_DIR` constant

## Troubleshooting

**App won't open:**
- Check that Electron is installed: `npm install`
- Check server logs: `/tmp/orchestrator.log`

**Server won't start:**
- Make sure orchestrator dependencies are installed
- Check that port 3002 is available

**Icon doesn't show:**
- Rebuild the app: `npm run package`
- Copy to Applications again
