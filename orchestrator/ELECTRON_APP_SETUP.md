# Electron Desktop App Setup

You now have a **dedicated desktop app** for the Vader AI Orchestrator, just like ChatGPT's desktop app!

## ✅ What You Have

- **Native macOS App** - Runs in its own window (not a browser)
- **Auto-start Server** - Automatically starts the orchestrator server
- **Dock Integration** - Proper app icon and behavior
- **Full Web Interface** - All features accessible in the app window

## 🚀 Using the App

1. **Open the App**
   - Find "Vader AI Orchestrator" in Applications
   - Double-click to open
   - Or search for "Vader" in Spotlight

2. **First Launch**
   - App checks if server is running
   - If not, automatically starts it
   - Shows loading screen while server starts
   - Opens the web interface in the app window

3. **Using the Interface**
   - All features work the same as in browser
   - Workflows, Projects, Tasks - everything is there
   - App stays open like any macOS app

## 📍 App Location

The app is installed at:
```
~/Applications/Vader AI Orchestrator.app
```

## 🔧 Rebuilding the App

If you need to rebuild (after code changes):

```bash
cd vader-ai-agents/orchestrator/electron-app
npm run package
cp -R dist/Vader\ AI\ Orchestrator-darwin-arm64/Vader\ AI\ Orchestrator.app ~/Applications/
```

## 🎨 Customizing

### Change Window Size
Edit `electron-app/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,  // Change these
  height: 900,  // Change these
  ...
});
```

### Change Server Port
Edit `electron-app/main.js`:
```javascript
const PORT = 3002;  // Change this
```

## 🐛 Troubleshooting

**App won't open:**
- Check Console.app for errors
- Make sure Electron dependencies are installed: `cd electron-app && npm install`

**Server won't start:**
- Check `/tmp/orchestrator.log` for errors
- Make sure orchestrator dependencies are installed
- Check that port 3002 is available

**Icon doesn't show:**
- The icon should be set automatically
- If not, manually set it: Right-click app → Get Info → drag icon onto it

**Window is blank:**
- Check if server is running: `lsof -i :3002`
- Check server logs: `/tmp/orchestrator.log`
- Try reloading: Cmd+R in the app

## ✨ Features

- **Native macOS Experience** - Feels like a real app
- **Auto Server Management** - No need to start server manually
- **Dock Integration** - Icon stays in dock when running
- **Window Management** - Minimize, maximize, full screen
- **Menu Bar** - Standard macOS menu with reload, dev tools, etc.

Enjoy your dedicated orchestrator app! 🎉
