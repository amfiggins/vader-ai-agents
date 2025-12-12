#!/bin/bash

# Script to create the macOS app bundle

SCRIPT_DIR="/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
APP_NAME="Vader AI Orchestrator"
APP_DIR="$HOME/Applications/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

# Create app bundle structure
echo "Creating app bundle..."
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# Create the main executable script
cat > "${MACOS_DIR}/${APP_NAME}" << 'EXECEOF'
#!/bin/bash
# Change to orchestrator directory
cd "/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"

# Run the launch script
bash launch-orchestrator.sh

# Keep the app process alive briefly to show any errors
# The server runs in the background, so we can exit after a short delay
sleep 2
EXECEOF

chmod +x "${MACOS_DIR}/${APP_NAME}"

# Create Info.plist
cat > "${CONTENTS_DIR}/Info.plist" << 'PLISTEOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Vader AI Orchestrator</string>
    <key>CFBundleIdentifier</key>
    <string>com.vaderai.orchestrator</string>
    <key>CFBundleName</key>
    <string>Vader AI Orchestrator</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLISTEOF

echo "App created at: ${APP_DIR}"
echo ""
echo "Next steps:"
echo "1. Drag '${APP_NAME}.app' from ~/Applications to your Dock"
echo "2. Optionally set a custom icon (right-click → Get Info → drag icon)"
echo ""
echo "To test, double-click the app or click it in your Dock!"
