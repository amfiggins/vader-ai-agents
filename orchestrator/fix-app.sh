#!/bin/bash

# Fix the Vader AI Orchestrator app to stay open and work properly

APP_DIR=~/Applications/"Vader AI Orchestrator.app"
ORCHESTRATOR_DIR="/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"

# Create a better executable that shows output
cat > "${APP_DIR}/Contents/MacOS/Vader AI Orchestrator" << 'EXECEOF'
#!/bin/bash

# Get the orchestrator directory
ORCHESTRATOR_DIR="/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
PORT=3002
URL="http://localhost:${PORT}"

# Change to orchestrator directory
cd "$ORCHESTRATOR_DIR" || {
    osascript -e 'display dialog "Error: Could not find orchestrator directory" buttons {"OK"} default button "OK" with icon stop'
    exit 1
}

# Check if server is running
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Server is already running"
else
    echo "Starting server..."
    PORT=${PORT} npm run dev > /tmp/orchestrator.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    for i in {1..30}; do
        sleep 1
        if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo "Server started successfully!"
            break
        fi
    done
fi

# Open browser
sleep 1
open "${URL}"

# Show notification
osascript -e "display notification \"Orchestrator is running at ${URL}\" with title \"Vader AI Orchestrator\""

# Keep open briefly
sleep 2
EXECEOF

chmod +x "${APP_DIR}/Contents/MacOS/Vader AI Orchestrator"

# Ensure icon is set
if [ -f "${APP_DIR}/Contents/Resources/icon.icns" ]; then
    plutil -replace CFBundleIconFile -string "icon.icns" "${APP_DIR}/Contents/Info.plist"
fi

# Refresh icon cache
touch "${APP_DIR}"
killall Finder 2>/dev/null
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${APP_DIR}" 2>/dev/null

echo "✅ App fixed! Try opening it now."
echo "If the icon still doesn't show:"
echo "1. Remove it from Dock (if there)"
echo "2. Right-click the app in Finder → Get Info"
echo "3. Drag the icon.icns file onto the app icon in the Info window"
